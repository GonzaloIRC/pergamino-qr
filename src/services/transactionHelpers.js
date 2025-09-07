// src/services/transactionHelpers.js
import { 
  collection, doc, getDoc, runTransaction, serverTimestamp, 
  Timestamp, where, query, getDocs
} from 'firebase/firestore';
import { db } from './firebaseClient';

/**
 * Procesa el canje de un beneficio utilizando una transacción de Firestore
 * @param {string} serialId ID del serial del beneficio
 * @param {string} userId ID del usuario que realiza el canje
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function processSerialTransaction(serialId, userId) {
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
        fecha: serverTimestamp(),
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
 * Procesa la acumulación de puntos para un cliente
 * @param {string} dni DNI del cliente
 * @param {string} nonce Código de verificación único
 * @param {string} operadorId ID del usuario que registra la operación
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function processPointsTransaction(dni, nonce, operadorId) {
  try {
    // 1. Verificar que el nonce no haya sido utilizado antes
    const historialRef = collection(db, 'Historial');
    const nonceQuery = query(historialRef, where('nonce', '==', nonce));
    const nonceSnapshot = await getDocs(nonceQuery);
    
    if (!nonceSnapshot.empty) {
      return {
        success: false,
        message: 'Este código ya ha sido utilizado.'
      };
    }
    
    // 2. Buscar al cliente por DNI
    const clientesRef = collection(db, 'Clientes');
    const dniQuery = query(clientesRef, where('dni', '==', dni));
    const clienteSnapshot = await getDocs(dniQuery);
    
    if (clienteSnapshot.empty) {
      return {
        success: false,
        message: 'No se encontró un cliente con el DNI proporcionado.'
      };
    }
    
    // 3. Obtener referencia al documento del cliente
    const clienteDoc = clienteSnapshot.docs[0];
    const clienteData = clienteDoc.data();
    const clienteId = clienteDoc.id;
    
    // 4. Obtener la configuración de puntos por compra
    const ajustesRef = doc(db, 'Ajustes', 'puntosConfig');
    const ajustesDoc = await getDoc(ajustesRef);
    const puntosPorCompra = ajustesDoc.exists() ? 
      ajustesDoc.data().puntosPorCompra : 10; // Valor predeterminado
    
    // 5. Realizar la transacción
    const result = await runTransaction(db, async (transaction) => {
      // Leer el documento del cliente nuevamente dentro de la transacción
      const clienteRef = doc(db, 'Clientes', clienteId);
      const clienteSnapshot = await transaction.get(clienteRef);
      
      if (!clienteSnapshot.exists()) {
        return {
          success: false,
          message: 'El cliente ya no existe.'
        };
      }
      
      // Actualizar los puntos del cliente
      const puntosActuales = clienteSnapshot.data().puntos || 0;
      const nuevosPuntos = puntosActuales + puntosPorCompra;
      
      transaction.update(clienteRef, {
        puntos: nuevosPuntos,
        ultimaCompra: serverTimestamp()
      });
      
      // Registrar la transacción en el historial
      const historialDoc = doc(collection(db, 'Historial'));
      transaction.set(historialDoc, {
        tipo: 'acumulacion',
        clienteId,
        clienteDni: dni,
        clienteNombre: clienteData.nombre + ' ' + (clienteData.apellido || ''),
        puntos: puntosPorCompra,
        puntosAnteriores: puntosActuales,
        puntosNuevos: nuevosPuntos,
        operadorId,
        nonce,
        fecha: serverTimestamp(),
        estado: 'completado'
      });
      
      return {
        success: true,
        message: `Se han acumulado ${puntosPorCompra} puntos correctamente.`,
        cliente: {
          nombre: clienteData.nombre,
          apellido: clienteData.apellido,
          dni,
          puntosAnteriores: puntosActuales,
          puntosNuevos: nuevosPuntos
        },
        transactionId: historialDoc.id
      };
    });
    
    return result;
  } catch (error) {
    console.error("Error en la transacción de puntos:", error);
    return {
      success: false,
      message: `Error al procesar la acumulación: ${error.message}`,
      error
    };
  }
}
