import { collection, query, where, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { db } from './firebaseClient';
import { getSettings } from './settings';

/**
 * Tipos de alertas que el sistema puede generar
 */
export const ALERT_TYPES = {
  WEEKLY_LIMIT_EXCEEDED: 'WEEKLY_LIMIT_EXCEEDED',
  COOLDOWN_VIOLATION: 'COOLDOWN_VIOLATION',
  INVALID_SERIAL: 'INVALID_SERIAL',
  SERIAL_MISMATCH: 'SERIAL_MISMATCH',
  MULTI_ACCOUNT: 'MULTI_ACCOUNT',
};

/**
 * Verifica si se han superado los límites semanales de operaciones para un DNI
 * @param {string} dni - DNI del cliente
 * @param {string} operationType - Tipo de operación ('canje' o 'acumulacion')
 * @returns {Promise<{valid: boolean, alert: Object|null}>} - Resultado de la validación
 */
export async function checkWeeklyLimits(dni, operationType) {
  if (!dni) return { valid: true, alert: null }; // Si no hay DNI, no podemos verificar
  
  try {
    const settings = getSettings();
    const limitsPerWeek = settings.LIMITS_PER_WEEK || 2;
    
    // Calcular fecha de hace una semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo);
    
    // Consultar operaciones del mismo tipo en la última semana
    const historialRef = collection(db, 'Historial');
    const q = query(
      historialRef,
      where('dni', '==', dni),
      where('tipo', '==', operationType),
      where('ts', '>=', oneWeekAgoTimestamp)
    );
    
    const snapshot = await getDocs(q);
    const count = snapshot.docs.length;
    
    // Verificar si ha superado el límite semanal
    if (count >= limitsPerWeek) {
      // Crear una alerta de límite excedido
      const alert = {
        type: ALERT_TYPES.WEEKLY_LIMIT_EXCEEDED,
        dni,
        details: `DNI ${dni} ha intentado realizar más de ${limitsPerWeek} ${operationType === 'canje' ? 'canjes' : 'acumulaciones'} en una semana (actual: ${count})`,
        timestamp: Timestamp.now(),
        reviewed: false,
      };
      
      return { valid: false, alert };
    }
    
    return { valid: true, alert: null };
  } catch (error) {
    console.error('Error al verificar límites semanales:', error);
    return { valid: true, alert: null }; // En caso de error, permitimos la operación
  }
}

/**
 * Verifica que haya pasado el tiempo mínimo entre operaciones (cooldown)
 * @param {string} dni - DNI del cliente
 * @param {string} operationType - Tipo de operación ('canje' o 'acumulacion')
 * @returns {Promise<{valid: boolean, alert: Object|null}>} - Resultado de la validación
 */
export async function checkCooldown(dni, operationType) {
  if (!dni) return { valid: true, alert: null }; // Si no hay DNI, no podemos verificar
  
  try {
    const settings = getSettings();
    const cooldownMinutes = settings.COOLDOWN_MIN || 60;
    
    // Calcular fecha hace X minutos
    const cooldownDate = new Date();
    cooldownDate.setMinutes(cooldownDate.getMinutes() - cooldownMinutes);
    const cooldownTimestamp = Timestamp.fromDate(cooldownDate);
    
    // Consultar operaciones recientes del mismo tipo
    const historialRef = collection(db, 'Historial');
    const q = query(
      historialRef,
      where('dni', '==', dni),
      where('tipo', '==', operationType),
      where('ts', '>=', cooldownTimestamp)
    );
    
    const snapshot = await getDocs(q);
    
    // Si hay operaciones recientes, es una violación de cooldown
    if (!snapshot.empty) {
      const lastOperation = snapshot.docs[0].data();
      const lastOperationTime = lastOperation.ts.toDate();
      const minutesSinceLastOperation = Math.floor(
        (new Date() - lastOperationTime) / (1000 * 60)
      );
      
      // Crear una alerta de violación de cooldown
      const alert = {
        type: ALERT_TYPES.COOLDOWN_VIOLATION,
        dni,
        details: `DNI ${dni} intentó realizar una operación ${minutesSinceLastOperation} minutos después de la última (mínimo requerido: ${cooldownMinutes})`,
        timestamp: Timestamp.now(),
        reviewed: false,
      };
      
      return { valid: false, alert };
    }
    
    return { valid: true, alert: null };
  } catch (error) {
    console.error('Error al verificar cooldown:', error);
    return { valid: true, alert: null }; // En caso de error, permitimos la operación
  }
}

/**
 * Verifica si un serial está asignado al DNI correcto
 * @param {string} serial - ID del serial
 * @param {string} dni - DNI del cliente
 * @param {Object} serialData - Datos del serial ya obtenidos
 * @returns {Object} - Objeto con el resultado de la validación y alerta si existe
 */
export function checkSerialAssignment(serial, dni, serialData) {
  // Si el serial no tiene asignación o coincide con el DNI proporcionado
  if (!serialData.emitidoA || serialData.emitidoA === dni) {
    return { valid: true, alert: null };
  }
  
  // Si el serial está asignado a otro DNI
  const alert = {
    type: ALERT_TYPES.SERIAL_MISMATCH,
    dni,
    assignedTo: serialData.emitidoA,
    serialCode: serial,
    details: `DNI ${dni} intentó utilizar un código serial asignado a ${serialData.emitidoA}`,
    timestamp: Timestamp.now(),
    reviewed: false,
  };
  
  return { valid: false, alert };
}

/**
 * Detecta posible uso de múltiples cuentas desde un mismo dispositivo
 * @param {string} userId - ID del usuario actual
 * @param {string} deviceId - ID del dispositivo
 * @returns {Promise<{valid: boolean, alert: Object|null}>} - Resultado de la validación
 */
export async function detectMultiAccount(userId, deviceId) {
  try {
    if (!deviceId) {
      // Si no hay deviceId, no podemos realizar la verificación
      return { valid: true, alert: null };
    }
    
    // Consultar usuarios que han usado este dispositivo
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('devices', 'array-contains', deviceId));
    const querySnapshot = await getDocs(q);
    
    // Recopilar IDs de usuarios que han usado este dispositivo
    const userIds = querySnapshot.docs.map(doc => doc.id);
    
    // Si hay más de un usuario y uno de ellos es el actual
    if (userIds.length > 1 && userIds.includes(userId)) {
      const otherUsers = userIds.filter(id => id !== userId);
      
      // Crear alerta de posible multi-cuenta
      const alert = {
        type: ALERT_TYPES.MULTI_ACCOUNT,
        userId,
        deviceId,
        otherUsers,
        details: `Usuario ${userId} utiliza el mismo dispositivo (${deviceId}) que ${otherUsers.length} usuarios más: ${otherUsers.join(', ')}`,
        timestamp: Timestamp.now(),
        reviewed: false,
      };
      
      // No bloqueamos la operación, pero registramos la alerta
      return { valid: true, alert };
    }
    
    return { valid: true, alert: null };
  } catch (error) {
    console.error('Error al detectar multi-cuenta:', error);
    // En caso de error, permitimos la operación
    return { valid: true, alert: null };
  }
}

/**
 * Registra una alerta en la base de datos
 * @param {Object} alert - Objeto de alerta a registrar
 * @returns {Promise<string>} - ID del documento creado
 */
export async function registerAlert(alert) {
  try {
    const alertsRef = collection(db, 'alerts');
    const docRef = await addDoc(alertsRef, alert);
    console.log(`Alerta registrada: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error al registrar alerta:', error);
    throw error;
  }
}

/**
 * Función principal para validar una operación de acumulación o canje
 * Aplica todas las reglas de validación correspondientes
 * 
 * @param {Object} params - Parámetros de la operación
 * @param {string} params.dni - DNI del usuario
 * @param {string} params.userId - ID del usuario
 * @param {string} params.deviceId - ID del dispositivo
 * @param {string} params.operationType - Tipo de operación ('canje' o 'acumulacion')
 * @param {string} [params.serialCode] - Código serial (solo para canjes)
 * @param {Object} [params.serialData] - Datos del serial (si ya se obtuvieron)
 * @returns {Promise<{valid: boolean, alerts: Array<Object>}>}
 */
export async function validateOperation({
  dni,
  userId,
  deviceId,
  operationType,
  serialCode,
  serialData
}) {
  const alerts = [];
  let isValid = true;
  
  // Verificar cooldown en cualquier operación
  const cooldownCheck = await checkCooldown(dni, operationType);
  if (!cooldownCheck.valid) {
    isValid = false;
    alerts.push(cooldownCheck.alert);
  }
  
  // Para canjes, verificar límite semanal y serial
  if (operationType === 'canje') {
    // Verificar límite semanal
    const weeklyCheck = await checkWeeklyLimits(dni, operationType);
    if (!weeklyCheck.valid) {
      isValid = false;
      alerts.push(weeklyCheck.alert);
    }
    
    // Verificar serial si se proporcionaron los datos
    if (serialCode && serialData) {
      const serialCheck = checkSerialAssignment(serialCode, dni, serialData);
      if (!serialCheck.valid) {
        isValid = false;
        alerts.push(serialCheck.alert);
      }
    }
  }
  
  // Detectar posible multi-cuenta (no bloquea la operación)
  const multiAccountCheck = await detectMultiAccount(userId, deviceId);
  if (multiAccountCheck.alert) {
    alerts.push(multiAccountCheck.alert);
  }
  
  // Registrar todas las alertas encontradas
  for (const alert of alerts) {
    await registerAlert(alert);
  }
  
  return {
    valid: isValid,
    alerts
  };
}
