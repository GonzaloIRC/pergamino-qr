// src/services/transactions.js
import { 
  collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, 
  query, where, getDocs, runTransaction, Timestamp
} from 'firebase/firestore';
import { db } from './firebaseClient';

/**
 * Registra una transacción de canje de beneficio con un serial
 * @param {string} serialId - ID del serial a canjear (ej: SER-0001)
 * @param {string} userId - ID del usuario que realiza el canje
 * @returns {Promise<Object>} - Resultado de la transacción
 */
export async function processBenefitRedemption(serialId, userId) {
  try {
    // Usar una transacción de Firestore para garantizar atomicidad
    const result = await runTransaction(db, async (transaction) => {
      // 1. Obtener el documento del serial
      const serialRef = doc(db, 'BeneficioSeriales', serialId);
      const serialDoc = await transaction.get(serialRef);
      
      if (!serialDoc.exists()) {
        return {
          success: false,
          message: `El serial ${serialId} no existe.`
        };
      }
      
      const serialData = serialDoc.data();
      
      // 2. Verificar que el serial esté activo
      if (serialData.estado !== 'activo') {
        return {
          success: false, 
          message: `El serial ${serialId} ya ha sido utilizado o está cancelado.`,
          estado: serialData.estado
        };
      }
      
      // 3. Obtener información del beneficio
      const beneficioRef = doc(db, 'Beneficios', serialData.beneficioId);
      const beneficioDoc = await transaction.get(beneficioRef);
      
      if (!beneficioDoc.exists()) {
        return {
          success: false,
          message: 'El beneficio asociado no existe.'
        };
      }
      
      const beneficioData = beneficioDoc.data();
      
      // 4. Verificar vigencia del beneficio
      const now = new Date();
      const validoDesde = beneficioData.validoDesde?.toDate() || now;
      const validoHasta = beneficioData.validoHasta?.toDate() || now;
      
      if (now < validoDesde || now > validoHasta) {
        return {
          success: false,
          message: 'El beneficio no está vigente en la fecha actual.'
        };
      }
      
      // 5. Actualizar el estado del serial en la misma transacción
      transaction.update(serialRef, {
        estado: 'usado',
        usadoPor: userId,
        usadoEn: serverTimestamp()
      });
      
      // 6. Registrar el historial en la misma transacción
      const historialRef = doc(collection(db, 'Historial'));
      transaction.set(historialRef, {
        tipo: 'canje',
        serialId,
        beneficioId: serialData.beneficioId,
        beneficioNombre: beneficioData.nombre,
        userId,
        ts: serverTimestamp(),
        estado: 'completado'
      });
      
      // 7. Devolver resultado exitoso con los datos
      return {
        success: true,
        message: `Serial ${serialId} canjeado exitosamente`,
        beneficio: beneficioData,
        serialData: serialData,
        transactionId: historialRef.id
      };
    });
    
    return result;
  } catch (error) {
    console.error("Error en la transacción:", error);
    return {
      success: false,
      message: `Error al procesar el canje: ${error.message}`,
      error
    };
  }
}

/**
 * Registra puntos para un cliente identificado por DNI
 * @param {string} dni - DNI del cliente 
 * @param {string} nonce - Código único de la transacción
 * @param {string} staffId - ID del usuario staff que registra los puntos
 * @returns {Promise<Object>} - Resultado de la transacción
 */
export async function processPointAccumulation(dni, nonce, staffId) {
  try {
    // Verificar si el nonce ya fue usado (previene duplicados)
    const nonceQuery = query(collection(db, 'Historial'), 
      where('nonce', '==', nonce),
      where('tipo', '==', 'acumulacion')
    );
    
    const nonceSnapshot = await getDocs(nonceQuery);
    if (!nonceSnapshot.empty) {
      return {
        success: false,
        message: 'Esta operación ya fue procesada anteriormente.'
      };
    }

    // Buscar al cliente por DNI
    const clientesQuery = query(collection(db, 'Clientes'), where('dni', '==', dni));
    const clientesSnapshot = await getDocs(clientesQuery);
    
    if (clientesSnapshot.empty) {
      return {
        success: false,
        message: `No existe un cliente con DNI ${dni}.`
      };
    }

    // Usar transacción para actualizar puntos y crear historial
    return await runTransaction(db, async (transaction) => {
      // Obtener documento del cliente
      const clienteDoc = clientesSnapshot.docs[0];
      const clienteData = clienteDoc.data();
      const clienteRef = clienteDoc.ref;
      
      // Configuración de puntos (podría venir de settings)
      const puntosAcumular = 10; 
      
      // Actualizar puntos del cliente
      const puntosActuales = clienteData.puntos || 0;
      const nuevosPuntos = puntosActuales + puntosAcumular;
      
      transaction.update(clienteRef, {
        puntos: nuevosPuntos,
        ultimaActualizacion: serverTimestamp()
      });
      
      // Registrar en historial
      const historialRef = doc(collection(db, 'Historial'));
      transaction.set(historialRef, {
        tipo: 'acumulacion',
        dni: dni,
        nonce: nonce,
        puntos: puntosAcumular,
        staffId: staffId,
        clienteId: clienteDoc.id,
        clienteNombre: clienteData.nombre || 'Cliente',
        ts: serverTimestamp(),
        puntosResultantes: nuevosPuntos
      });
      
      return {
        success: true,
        message: `Se han acumulado ${puntosAcumular} puntos para el cliente ${clienteData.nombre || dni}.`,
        puntos: puntosAcumular,
        puntosActuales: nuevosPuntos,
        clienteId: clienteDoc.id,
        historialId: historialRef.id
      };
    });
  } catch (error) {
    console.error("Error en acumulación de puntos:", error);
    return {
      success: false,
      message: `Error al acumular puntos: ${error.message}`,
      error
    };
  }
}

/**
 * Genera un código de nonce aleatorio para QR
 * @returns {string} Un string alfanumérico único de 10 caracteres
 */
export function generateNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const length = 10;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Genera un formato de QR para acumulación de puntos
 * @param {string} dni - DNI del cliente 
 * @returns {string} - El formato QR para acumular puntos
 */
export function generatePointsQR(dni) {
  const nonce = generateNonce();
  return `APP:${dni}:${nonce}`;
}
