import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebaseClient';
import { getSettings } from './settings';

/**
 * Verifica si se han superado los límites semanales de operaciones para un DNI
 * @param {string} dni - DNI del cliente
 * @param {string} operationType - Tipo de operación ('canje' o 'acumulacion')
 * @returns {Promise<boolean>} - true si está dentro de límites, false si los excede
 */
export async function checkWeeklyLimits(dni, operationType) {
  if (!dni) return true; // Si no hay DNI, no podemos verificar
  
  try {
    const settings = getSettings();
    const limitsPerWeek = settings.LIMITS_PER_WEEK || 20;
    
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
    
    return count < limitsPerWeek;
  } catch (error) {
    console.error('Error al verificar límites semanales:', error);
    return true; // En caso de error, permitir la operación
  }
}

/**
 * Verifica que haya pasado el tiempo mínimo entre operaciones (cooldown)
 * @param {string} dni - DNI del cliente
 * @param {string} operationType - Tipo de operación ('canje' o 'acumulacion')
 * @returns {Promise<boolean>} - true si ha pasado el tiempo suficiente, false si no
 */
export async function checkCooldown(dni, operationType) {
  if (!dni) return true; // Si no hay DNI, no podemos verificar
  
  try {
    const settings = getSettings();
    const cooldownMinutes = settings.COOLDOWN_MIN || 1;
    
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
    return snapshot.empty; // Si está vacío, ha pasado suficiente tiempo
  } catch (error) {
    console.error('Error al verificar cooldown:', error);
    return true; // En caso de error, permitir la operación
  }
}

/**
 * Verifica si un serial está asignado al DNI correcto
 * @param {string} serial - ID del serial
 * @param {string} dni - DNI del cliente
 * @param {Object} serialData - Datos del serial ya obtenidos
 * @returns {boolean} - true si el serial puede ser usado por este DNI
 */
export function checkSerialAssignment(serial, dni, serialData) {
  // Si el serial no tiene asignación o coincide con el DNI proporcionado
  if (!serialData.emitidoA || serialData.emitidoA === dni) {
    return true;
  }
  return false;
}
