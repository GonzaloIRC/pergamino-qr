import { db } from './firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';

// Valores predeterminados para la configuración
let cache = {
  QR_TTL_SECONDS: 30,
  COOLDOWN_MIN: 1,
  LIMITS_PER_WEEK: 20,
  GEO_RADIUS_M: 200,
  MAINTENANCE_MODE: false,
  AUTO_LOCK_SEC: 2
};

/**
 * Suscribe una función callback a cambios en la configuración global
 * @param {Function} cb - Callback a llamar cuando hay cambios
 * @returns {Function} - Función para cancelar la suscripción
 */
export function subscribeSettings(cb) {
  const ref = doc(db, 'Ajustes', 'global');
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      // Actualizar la caché con los datos de Firestore
      cache = { ...cache, ...snap.data() };
      cb(cache);
    } else {
      // Usar valores predeterminados si no existe el documento
      cb(cache);
    }
  });
}

/**
 * Obtiene los valores actuales de configuración
 * @returns {Object} - Configuración actual
 */
export function getSettings() {
  return cache;
}
