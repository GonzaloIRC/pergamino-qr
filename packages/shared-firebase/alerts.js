// packages/shared-firebase/alerts.js
import { collection, addDoc, Timestamp, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

/**
 * Tipos de alertas soportados por el sistema
 */
export const AlertType = {
  FRAUD_ATTEMPT: 'fraud_attempt',
  SERIAL_REUSE: 'serial_reuse',
  WEEKLY_LIMIT: 'weekly_limit',
  MULTI_ACCOUNT: 'multi_account'
};

/**
 * Estados de las alertas
 */
export const AlertStatus = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved'
};

/**
 * Crea una nueva alerta en el sistema
 * 
 * @param {Object} params - Parámetros para la creación de la alerta
 * @param {string} params.type - Tipo de alerta (usar AlertType)
 * @param {string} params.message - Mensaje descriptivo de la alerta
 * @param {string} params.userId - ID del usuario relacionado con la alerta
 * @param {Object} [params.details] - Detalles específicos de la alerta
 * @param {Object} [params.userInfo] - Información adicional del usuario
 * @returns {Promise<string>} ID de la alerta creada
 */
export async function createAlert(params) {
  const db = getFirestore();
  
  const alertData = {
    type: params.type,
    message: params.message,
    userId: params.userId,
    timestamp: Timestamp.now(),
    status: AlertStatus.NEW,
    details: params.details || {},
    userInfo: params.userInfo || {}
  };
  
  // Verificar si ya existe una alerta similar para evitar duplicados
  if (params.details?.serialNumber) {
    const recentAlerts = await getDocs(
      query(
        collection(db, 'Alerts'),
        where('details.serialNumber', '==', params.details.serialNumber),
        where('type', '==', params.type),
        where('userId', '==', params.userId),
        where('timestamp', '>', Timestamp.fromMillis(Date.now() - 1000 * 60 * 60)), // Última hora
        orderBy('timestamp', 'desc'),
        limit(1)
      )
    );
    
    if (!recentAlerts.empty) {
      return recentAlerts.docs[0].id;
    }
  }
  
  // Crear la alerta
  const result = await addDoc(collection(db, 'Alerts'), alertData);
  return result.id;
}

/**
 * Crea una alerta de intento de fraude
 * 
 * @param {string} userId - ID del usuario
 * @param {string} serialNumber - Número de serial involucrado
 * @param {string} reason - Razón del intento de fraude
 * @param {Object} [userInfo] - Información del usuario
 * @returns {Promise<string>} ID de la alerta creada
 */
export async function createFraudAttemptAlert(userId, serialNumber, reason, userInfo) {
  return createAlert({
    type: AlertType.FRAUD_ATTEMPT,
    message: `Posible intento de fraude detectado para el serial ${serialNumber}`,
    userId,
    details: {
      serialNumber,
      reason
    },
    userInfo
  });
}

/**
 * Crea una alerta de reuso de serial
 * 
 * @param {string} userId - ID del usuario
 * @param {string} serialNumber - Número de serial involucrado
 * @param {number} attempts - Número de intentos realizados
 * @param {Object} [userInfo] - Información del usuario
 * @returns {Promise<string>} ID de la alerta creada
 */
export async function createSerialReuseAlert(userId, serialNumber, attempts, userInfo) {
  return createAlert({
    type: AlertType.SERIAL_REUSE,
    message: `Intento repetido de usar el serial ${serialNumber} (${attempts} intentos)`,
    userId,
    details: {
      serialNumber,
      attempts
    },
    userInfo
  });
}

/**
 * Crea una alerta de límite semanal excedido
 * 
 * @param {string} userId - ID del usuario
 * @param {number} currentCount - Conteo actual de operaciones
 * @param {number} limit - Límite establecido
 * @param {Object} [userInfo] - Información del usuario
 * @returns {Promise<string>} ID de la alerta creada
 */
export async function createWeeklyLimitAlert(userId, currentCount, limit, userInfo) {
  return createAlert({
    type: AlertType.WEEKLY_LIMIT,
    message: `Usuario ha alcanzado el límite semanal (${currentCount}/${limit})`,
    userId,
    details: {
      currentCount,
      limit
    },
    userInfo
  });
}

/**
 * Crea una alerta de múltiples cuentas
 * 
 * @param {string} userId - ID del usuario principal
 * @param {string[]} relatedUserIds - IDs de usuarios relacionados
 * @param {string} reason - Razón de la detección
 * @param {Object} [userInfo] - Información del usuario
 * @returns {Promise<string>} ID de la alerta creada
 */
export async function createMultiAccountAlert(userId, relatedUserIds, reason, userInfo) {
  return createAlert({
    type: AlertType.MULTI_ACCOUNT,
    message: `Posible uso de múltiples cuentas detectado`,
    userId,
    details: {
      reason,
      relatedUserIds
    },
    userInfo
  });
}