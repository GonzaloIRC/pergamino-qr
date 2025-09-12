import { db } from './firebaseClient';
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getSettings } from './settings';

/**
 * Sistema anti-fraude para la aplicación Pergamino
 * Implementa diferentes mecanismos de detección y prevención de fraudes
 */

/**
 * Verifica si una transacción podría ser fraudulenta
 * @param {Object} transactionData - Datos de la transacción a verificar
 * @param {string} transactionData.userId - ID del usuario que realiza la transacción
 * @param {string} transactionData.type - Tipo de transacción ('canje', 'acumulacion', etc.)
 * @param {Object} transactionData.payload - Datos específicos de la transacción
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export async function validateTransaction(transactionData) {
  if (!transactionData || !transactionData.userId || !transactionData.type) {
    return { valid: false, reason: 'Datos de transacción incompletos' };
  }

  try {
    // Obtener configuración de seguridad
    const settings = getSettings();
    
    // Verificar límites de velocidad
    const rateResult = await checkRateLimit(transactionData.userId, transactionData.type);
    if (!rateResult.valid) {
      await logSuspiciousActivity({
        userId: transactionData.userId,
        type: 'rate_limit',
        details: `Demasiadas transacciones de tipo: ${transactionData.type}`,
        transaction: transactionData
      });
      return rateResult;
    }

    // Verificar patrones geográficos anómalos si hay datos de ubicación
    if (transactionData.location) {
      const geoResult = await checkGeographicAnomaly(transactionData.userId, transactionData.location);
      if (!geoResult.valid) {
        await logSuspiciousActivity({
          userId: transactionData.userId,
          type: 'geo_anomaly',
          details: geoResult.reason,
          transaction: transactionData
        });
        return geoResult;
      }
    }

    // Verificar operaciones fuera de horario de negocio
    const businessHoursResult = checkBusinessHours(settings);
    if (!businessHoursResult.valid && transactionData.type === 'canje') {
      await logSuspiciousActivity({
        userId: transactionData.userId,
        type: 'out_of_hours',
        details: businessHoursResult.reason,
        transaction: transactionData
      });
      
      // Si es fuera de horario, solo registramos pero podemos permitir la operación
      // según la política de negocio
      if (settings.STRICT_BUSINESS_HOURS) {
        return businessHoursResult;
      }
    }

    // Verificar múltiples dispositivos
    const deviceResult = await checkMultipleDevices(transactionData.userId, transactionData.deviceId);
    if (!deviceResult.valid) {
      await logSuspiciousActivity({
        userId: transactionData.userId,
        type: 'multiple_devices',
        details: deviceResult.reason,
        transaction: transactionData
      });
      
      // Dependiendo de la política, podemos bloquear o solo advertir
      if (settings.BLOCK_MULTIPLE_DEVICES) {
        return deviceResult;
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Error en validación anti-fraude:', error);
    // En caso de error, permitimos la transacción pero la registramos
    await logSuspiciousActivity({
      userId: transactionData.userId,
      type: 'validation_error',
      details: `Error en sistema anti-fraude: ${error.message}`,
      transaction: transactionData
    });
    return { valid: true, warning: 'Error en validación de seguridad' };
  }
}

/**
 * Verifica límites de velocidad para transacciones
 * @param {string} userId - ID del usuario
 * @param {string} transactionType - Tipo de transacción
 * @returns {Promise<Object>} - Resultado de la verificación
 */
async function checkRateLimit(userId, transactionType) {
  const settings = getSettings();
  const cooldownMinutes = settings.COOLDOWN_MIN || 1;
  const maxTransactionsPerHour = settings.MAX_TRANSACTIONS_PER_HOUR || 10;
  
  try {
    // Verificar cooldown
    const cooldownLimit = new Date();
    cooldownLimit.setMinutes(cooldownLimit.getMinutes() - cooldownMinutes);
    
    const recentTransactionsQuery = query(
      collection(db, 'Historial'),
      where('userId', '==', userId),
      where('tipo', '==', transactionType),
      where('ts', '>=', Timestamp.fromDate(cooldownLimit))
    );
    
    const recentSnapshot = await getDocs(recentTransactionsQuery);
    if (!recentSnapshot.empty) {
      return { 
        valid: false, 
        reason: `Debes esperar ${cooldownMinutes} minutos entre operaciones` 
      };
    }
    
    // Verificar límite por hora
    const hourLimit = new Date();
    hourLimit.setHours(hourLimit.getHours() - 1);
    
    const hourlyTransactionsQuery = query(
      collection(db, 'Historial'),
      where('userId', '==', userId),
      where('tipo', '==', transactionType),
      where('ts', '>=', Timestamp.fromDate(hourLimit))
    );
    
    const hourlySnapshot = await getDocs(hourlyTransactionsQuery);
    if (hourlySnapshot.size >= maxTransactionsPerHour) {
      return { 
        valid: false, 
        reason: `Has excedido el límite de ${maxTransactionsPerHour} operaciones por hora` 
      };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error verificando límites de velocidad:', error);
    return { valid: true }; // En caso de error, permitimos la transacción
  }
}

/**
 * Verifica anomalías geográficas en las transacciones
 * @param {string} userId - ID del usuario
 * @param {Object} location - Datos de ubicación actual
 * @returns {Promise<Object>} - Resultado de la verificación
 */
async function checkGeographicAnomaly(userId, location) {
  if (!location || !location.latitude || !location.longitude) {
    return { valid: true }; // Sin datos de ubicación, no podemos verificar
  }
  
  const settings = getSettings();
  const maxDistanceKm = settings.MAX_LOCATION_CHANGE_KM || 500;
  const maxSpeedKmh = settings.MAX_SPEED_KMH || 200;
  
  try {
    // Obtener última ubicación conocida del usuario
    const lastHourLimit = new Date();
    lastHourLimit.setHours(lastHourLimit.getHours() - 1);
    
    const locationQuery = query(
      collection(db, 'Historial'),
      where('userId', '==', userId),
      where('ts', '>=', Timestamp.fromDate(lastHourLimit))
    );
    
    const locationSnapshot = await getDocs(locationQuery);
    
    if (locationSnapshot.empty) {
      return { valid: true }; // No hay ubicaciones previas para comparar
    }
    
    // Buscar la transacción más reciente con ubicación
    let lastLocation = null;
    let lastTimestamp = null;
    
    locationSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.location && data.ts && (!lastTimestamp || data.ts.toDate() > lastTimestamp)) {
        lastLocation = data.location;
        lastTimestamp = data.ts.toDate();
      }
    });
    
    if (!lastLocation) {
      return { valid: true }; // No hay ubicaciones previas para comparar
    }
    
    // Calcular distancia y velocidad
    const distance = calculateDistance(
      lastLocation.latitude,
      lastLocation.longitude,
      location.latitude,
      location.longitude
    );
    
    if (distance > maxDistanceKm) {
      // Calcular velocidad si tenemos timestamp
      if (lastTimestamp) {
        const hoursDiff = (new Date() - lastTimestamp) / (1000 * 60 * 60);
        const speedKmh = distance / hoursDiff;
        
        if (speedKmh > maxSpeedKmh) {
          return {
            valid: false,
            reason: `Velocidad anómala detectada: ${Math.round(speedKmh)} km/h`
          };
        }
      }
      
      return {
        valid: false,
        reason: `Cambio de ubicación sospechoso: ${Math.round(distance)} km`
      };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error verificando anomalías geográficas:', error);
    return { valid: true }; // En caso de error, permitimos la transacción
  }
}

/**
 * Calcula la distancia entre dos puntos geográficos en km
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} - Distancia en kilómetros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convierte grados a radianes
 * @param {number} deg - Grados
 * @returns {number} - Radianes
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Verifica si la operación se realiza dentro del horario de negocio
 * @param {Object} settings - Configuración del sistema
 * @returns {Object} - Resultado de la verificación
 */
function checkBusinessHours(settings) {
  if (!settings.ENFORCE_BUSINESS_HOURS) {
    return { valid: true };
  }
  
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ...
  const hour = now.getHours();
  
  // Verificar si es día laborable
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      valid: false,
      reason: 'Operación fuera de días laborables (lunes a viernes)'
    };
  }
  
  // Verificar horario (por defecto 9-18h)
  const openingHour = settings.BUSINESS_HOURS_START || 9;
  const closingHour = settings.BUSINESS_HOURS_END || 18;
  
  if (hour < openingHour || hour >= closingHour) {
    return {
      valid: false,
      reason: `Operación fuera de horario comercial (${openingHour}:00-${closingHour}:00)`
    };
  }
  
  return { valid: true };
}

/**
 * Verifica si el usuario está usando múltiples dispositivos
 * @param {string} userId - ID del usuario
 * @param {string} deviceId - ID del dispositivo actual
 * @returns {Promise<Object>} - Resultado de la verificación
 */
async function checkMultipleDevices(userId, deviceId) {
  if (!deviceId) {
    return { valid: true }; // Sin ID de dispositivo, no podemos verificar
  }
  
  const settings = getSettings();
  const maxDevices = settings.MAX_DEVICES_PER_USER || 3;
  
  try {
    // Buscar últimos dispositivos usados en el último mes
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const devicesQuery = query(
      collection(db, 'UserDevices'),
      where('userId', '==', userId),
      where('lastUsed', '>=', Timestamp.fromDate(monthAgo))
    );
    
    const devicesSnapshot = await getDocs(devicesQuery);
    
    // Si no hay registro, añadimos este dispositivo
    if (devicesSnapshot.empty) {
      await addDoc(collection(db, 'UserDevices'), {
        userId,
        deviceId,
        firstUsed: serverTimestamp(),
        lastUsed: serverTimestamp()
      });
      return { valid: true };
    }
    
    // Comprobar si este dispositivo ya está registrado
    let deviceExists = false;
    const uniqueDevices = new Set();
    
    devicesSnapshot.forEach(doc => {
      const data = doc.data();
      uniqueDevices.add(data.deviceId);
      if (data.deviceId === deviceId) {
        deviceExists = true;
      }
    });
    
    // Si el dispositivo ya está registrado, todo bien
    if (deviceExists) {
      return { valid: true };
    }
    
    // Si hay demasiados dispositivos diferentes, alertar
    if (uniqueDevices.size >= maxDevices) {
      return {
        valid: false,
        reason: `Demasiados dispositivos diferentes (${uniqueDevices.size}/${maxDevices})`
      };
    }
    
    // Registrar este nuevo dispositivo
    await addDoc(collection(db, 'UserDevices'), {
      userId,
      deviceId,
      firstUsed: serverTimestamp(),
      lastUsed: serverTimestamp()
    });
    
    return { valid: true };
  } catch (error) {
    console.error('Error verificando múltiples dispositivos:', error);
    return { valid: true }; // En caso de error, permitimos la transacción
  }
}

/**
 * Registra actividad sospechosa para análisis posterior
 * @param {Object} data - Datos de la actividad sospechosa
 */
async function logSuspiciousActivity(data) {
  try {
    await addDoc(collection(db, 'ActividadSospechosa'), {
      ...data,
      timestamp: serverTimestamp()
    });
    console.warn('Actividad sospechosa registrada:', data);
  } catch (error) {
    console.error('Error registrando actividad sospechosa:', error);
  }
}
