// src/services/transactions.js
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebaseClient';

/**
 * Registra una transacción de canje de beneficio con un serial
 * @param {string} serialId - ID del serial a canjear (ej: SER-0001)
 * @param {string} userId - ID del usuario que realiza el canje
 * @returns {Promise<Object>} - Resultado de la transacción
 */
export async function processBenefitRedemption(serialId, userId) {
  try {
    // 1. Verificar que el serial existe y está activo
    const serialRef = doc(db, 'seriales', serialId);
    const serialSnap = await getDoc(serialRef);

    if (!serialSnap.exists()) {
      return {
        success: false,
        message: `El serial ${serialId} no existe.`
      };
    }

    const serialData = serialSnap.data();
    if (serialData.estado !== 'activo') {
      return {
        success: false,
        message: `El serial ${serialId} ya ha sido utilizado o está cancelado.`
      };
    }

    // 2. Obtener datos del beneficio
    const beneficioRef = doc(db, 'beneficios', serialData.beneficioId);
    const beneficioSnap = await getDoc(beneficioRef);
    
    if (!beneficioSnap.exists()) {
      return {
        success: false,
        message: 'El beneficio asociado no existe.'
      };
    }

    const beneficioData = beneficioSnap.data();
    
    // 3. Verificar validez de fechas
    const now = new Date();
    const validoDesde = beneficioData.validoDesde?.toDate() || now;
    const validoHasta = beneficioData.validoHasta?.toDate() || now;
    
    if (now < validoDesde || now > validoHasta) {
      return {
        success: false,
        message: 'El beneficio no está vigente en la fecha actual.'
      };
    }

    // 4. Marcar el serial como usado
    await updateDoc(serialRef, {
      estado: 'usado',
      usadoPor: userId,
      usadoEn: serverTimestamp()
    });

    // 5. Registrar la transacción
    const transactionData = {
      tipo: 'canje',
      serialId,
      beneficioId: serialData.beneficioId,
      userId,
      timestamp: serverTimestamp(),
      detalles: {
        nombreBeneficio: beneficioData.nombre,
        descripcion: beneficioData.descripcion
      }
    };

    const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);

    return {
      success: true,
      message: `Beneficio "${beneficioData.nombre}" canjeado exitosamente.`,
      transactionId: transactionRef.id,
      beneficio: {
        ...beneficioData,
        id: beneficioData.id
      }
    };
  } catch (error) {
    console.error('Error en processBenefitRedemption:', error);
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
    // 1. Buscar cliente por DNI
    const clientesRef = collection(db, 'clientes');
    const q = query(clientesRef, where('dni', '==', dni));
    const querySnapshot = await getDocs(q);
    
    let clienteId;
    let clienteData;
    
    // Si no existe el cliente, lo creamos
    if (querySnapshot.empty) {
      const nuevoCliente = {
        dni,
        createdAt: serverTimestamp(),
        puntos: 0,
        visits: 0,
        lastVisit: serverTimestamp()
      };
      
      const nuevoClienteRef = await addDoc(clientesRef, nuevoCliente);
      clienteId = nuevoClienteRef.id;
      clienteData = nuevoCliente;
    } else {
      const clienteDoc = querySnapshot.docs[0];
      clienteId = clienteDoc.id;
      clienteData = clienteDoc.data();
    }
    
    // 2. Verificar que no sea un nonce duplicado
    const transactionsRef = collection(db, 'transactions');
    const nonceQuery = query(
      transactionsRef, 
      where('tipo', '==', 'acumulacion'),
      where('detalles.nonce', '==', nonce)
    );
    
    const nonceSnapshot = await getDocs(nonceQuery);
    if (!nonceSnapshot.empty) {
      return {
        success: false,
        message: 'Esta transacción ya fue procesada anteriormente.'
      };
    }
    
    // 3. Calcular puntos a otorgar (en un sistema real esto vendría de un cálculo basado en el consumo)
    const puntosOtorgados = 10; // Valor fijo para este ejemplo
    
    // 4. Actualizar puntos del cliente
    const clienteRef = doc(db, 'clientes', clienteId);
    await updateDoc(clienteRef, {
      puntos: (clienteData.puntos || 0) + puntosOtorgados,
      visits: (clienteData.visits || 0) + 1,
      lastVisit: serverTimestamp()
    });
    
    // 5. Registrar la transacción
    const transactionData = {
      tipo: 'acumulacion',
      clienteId,
      staffId,
      timestamp: serverTimestamp(),
      detalles: {
        dni,
        nonce,
        puntosOtorgados
      }
    };
    
    const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
    
    return {
      success: true,
      message: `${puntosOtorgados} puntos acumulados para el cliente con DNI ${dni}.`,
      transactionId: transactionRef.id,
      clienteId,
      puntosOtorgados,
      totalPuntos: (clienteData.puntos || 0) + puntosOtorgados
    };
  } catch (error) {
    console.error('Error en processPointAccumulation:', error);
    return {
      success: false,
      message: `Error al procesar la acumulación de puntos: ${error.message}`,
      error
    };
  }
}

/**
 * Obtiene el historial de transacciones para un usuario
 * @param {string} userId - ID del usuario
 * @param {number} limit - Límite de transacciones a obtener
 * @returns {Promise<Array>} - Historial de transacciones
 */
export async function getUserTransactionHistory(userId, limit = 10) {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error obteniendo historial de transacciones:', error);
    throw error;
  }
}
