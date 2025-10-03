// packages/shared-firebase/guardrails.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkGuardrails = checkGuardrails;
exports.FraudAlertType = void 0;

var _firestore = require("firebase/firestore");

var _auth = require("firebase/auth");

/**
 * Tipos de alertas de fraude
 */
const FraudAlertType = {
  WEEKLY_LIMIT_EXCEEDED: 'weekly-limit-exceeded',
  COOLDOWN_VIOLATION: 'cooldown-violation',
  SERIAL_MISMATCH: 'serial-mismatch',
  MULTI_ACCOUNT: 'multi-account'
};
exports.FraudAlertType = FraudAlertType;

/**
 * Obtiene la configuración global de límites desde Firestore
 */
async function getLimitsConfig() {
  const db = (0, _firestore.getFirestore)();
  const configRef = (0, _firestore.doc)(db, 'Ajustes', 'global');
  const configSnap = await (0, _firestore.getDoc)(configRef);
  
  if (!configSnap.exists()) {
    // Valores por defecto si no existe la configuración
    return {
      LIMITS_PER_WEEK: 1,
      COOLDOWN_MIN: 60 // 1 hora
    };
  }
  
  const data = configSnap.data();
  return {
    LIMITS_PER_WEEK: data.LIMITS_PER_WEEK || 1,
    COOLDOWN_MIN: data.COOLDOWN_MIN || 60
  };
}

/**
 * Verifica si se ha excedido el límite semanal de canjes/acumulaciones
 */
async function checkWeeklyLimit(dni, operationType) {
  const db = (0, _firestore.getFirestore)();
  const config = await getLimitsConfig();
  
  // Calcular fecha de hace una semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Consultar historial de los últimos 7 días para este DNI y tipo de operación
  const historialRef = (0, _firestore.collection)(db, 'Historial');
  const q = (0, _firestore.query)(
    historialRef,
    (0, _firestore.where)('dni', '==', dni),
    (0, _firestore.where)('tipo', '==', operationType),
    (0, _firestore.where)('ts', '>=', (0, _firestore.Timestamp).fromDate(oneWeekAgo)),
    (0, _firestore.orderBy)('ts', 'desc')
  );
  
  const querySnapshot = await (0, _firestore.getDocs)(q);
  
  // Contar las operaciones en la última semana
  const operationsCount = querySnapshot.size;
  
  if (operationsCount >= config.LIMITS_PER_WEEK) {
    return {
      allowed: false,
      reason: `Límite semanal excedido (${operationsCount}/${config.LIMITS_PER_WEEK})`,
      alertType: FraudAlertType.WEEKLY_LIMIT_EXCEEDED,
      details: {
        dni,
        count: operationsCount,
        limit: config.LIMITS_PER_WEEK
      }
    };
  }
  
  return { allowed: true };
}

/**
 * Verifica si se respeta el tiempo de enfriamiento entre operaciones
 */
async function checkCooldown(dni, operationType) {
  const db = (0, _firestore.getFirestore)();
  const config = await getLimitsConfig();
  
  // Consultar la operación más reciente para este DNI y tipo
  const historialRef = (0, _firestore.collection)(db, 'Historial');
  const q = (0, _firestore.query)(
    historialRef,
    (0, _firestore.where)('dni', '==', dni),
    (0, _firestore.where)('tipo', '==', operationType),
    (0, _firestore.orderBy)('ts', 'desc'),
    (0, _firestore.limit)(1)
  );
  
  const querySnapshot = await (0, _firestore.getDocs)(q);
  
  if (!querySnapshot.empty) {
    const lastOperation = querySnapshot.docs[0].data();
    const lastOperationTime = lastOperation.ts.toDate();
    const cooldownTimeMs = config.COOLDOWN_MIN * 60 * 1000; // Convertir minutos a milisegundos
    const timeElapsedMs = Date.now() - lastOperationTime.getTime();
    
    if (timeElapsedMs < cooldownTimeMs) {
      const remainingMinutes = Math.ceil((cooldownTimeMs - timeElapsedMs) / (60 * 1000));
      
      return {
        allowed: false,
        reason: `Tiempo de espera no cumplido. Intente nuevamente en ${remainingMinutes} minutos.`,
        alertType: FraudAlertType.COOLDOWN_VIOLATION,
        details: {
          dni,
          lastOperationTime: lastOperationTime.toISOString(),
          cooldownMin: config.COOLDOWN_MIN,
          remainingMinutes
        }
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Verifica que el serial de beneficio coincida con el DNI del usuario
 */
async function checkSerialMatch(dni, serialId) {
  if (!serialId) {
    return { allowed: true }; // No hay serial para verificar
  }
  
  const db = (0, _firestore.getFirestore)();
  const serialRef = (0, _firestore.doc)(db, 'BeneficioSeriales', serialId);
  const serialSnap = await (0, _firestore.getDoc)(serialRef);
  
  if (!serialSnap.exists()) {
    return {
      allowed: false,
      reason: 'Serial no encontrado',
      alertType: FraudAlertType.SERIAL_MISMATCH,
      details: { dni, serialId }
    };
  }
  
  const serialData = serialSnap.data();
  
  // Si el serial tiene un DNI asignado, debe coincidir con el usuario actual
  if (serialData.emitidoA && serialData.emitidoA !== dni) {
    return {
      allowed: false,
      reason: 'Este beneficio fue emitido para otro usuario',
      alertType: FraudAlertType.SERIAL_MISMATCH,
      details: {
        dni,
        serialId,
        emitidoA: serialData.emitidoA
      }
    };
  }
  
  return { allowed: true };
}

/**
 * Verifica si hay múltiples cuentas usando el mismo dispositivo
 */
async function checkMultiAccount(dni, deviceId) {
  if (!deviceId) {
    return { allowed: true }; // No hay deviceId para verificar
  }
  
  const db = (0, _firestore.getFirestore)();
  
  // Calcular fecha de hace una semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Consultar historial del mismo dispositivo en los últimos 7 días
  const historialRef = (0, _firestore.collection)(db, 'Historial');
  const q = (0, _firestore.query)(
    historialRef,
    (0, _firestore.where)('deviceId', '==', deviceId),
    (0, _firestore.where)('ts', '>=', (0, _firestore.Timestamp).fromDate(oneWeekAgo))
  );
  
  const querySnapshot = await (0, _firestore.getDocs)(q);
  
  // Recopilar DNIs únicos usados con este dispositivo
  const uniqueDnis = new Set();
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.dni) {
      uniqueDnis.add(data.dni);
    }
  });
  
  // Si este dispositivo ha sido usado con múltiples DNIs, crear alerta
  // pero permitir la operación (es solo para monitoreo)
  if (uniqueDnis.size > 1 && uniqueDnis.has(dni)) {
    // Crear alerta pero no bloquear la operación
    return {
      allowed: true, // No bloqueamos, solo generamos alerta
      reason: 'Posible uso de múltiples cuentas',
      alertType: FraudAlertType.MULTI_ACCOUNT,
      details: {
        dni,
        deviceId,
        uniqueDnis: Array.from(uniqueDnis)
      }
    };
  }
  
  return { allowed: true };
}

/**
 * Crea una alerta en Firestore
 */
async function createAlert(alertType, details) {
  const db = (0, _firestore.getFirestore)();
  const alertsRef = (0, _firestore.collection)(db, 'Alertas');
  
  const alertData = {
    tipo: alertType,
    detalle: JSON.stringify(details),
    dni: details.dni,
    deviceId: details.deviceId,
    ts: (0, _firestore.serverTimestamp)(),
    uids: details.uniqueDnis ? details.uniqueDnis : undefined
  };
  
  const docRef = await (0, _firestore.addDoc)(alertsRef, alertData);
  return docRef.id;
}

/**
 * Verifica si una operación ya fue procesada (idempotencia)
 */
async function checkIdempotence(nonce) {
  if (!nonce) return false;
  
  const db = (0, _firestore.getFirestore)();
  const historialRef = (0, _firestore.collection)(db, 'Historial');
  const q = (0, _firestore.query)(
    historialRef,
    (0, _firestore.where)('nonce', '==', nonce),
    (0, _firestore.limit)(1)
  );
  
  const querySnapshot = await (0, _firestore.getDocs)(q);
  return !querySnapshot.empty;
}

/**
 * Función principal para verificar todos los guardrails
 * @param {Object} checkData Datos para verificar guardrails
 * @param {string} checkData.dni DNI del usuario
 * @param {string} checkData.deviceId ID del dispositivo
 * @param {string=} checkData.serialId ID del serial (opcional, solo para canjes)
 * @param {string} checkData.operationType Tipo de operación: 'redemption' o 'accumulation'
 * @param {string=} checkData.nonce Identificador único para idempotencia (opcional)
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function checkGuardrails(checkData) {
  const { dni, deviceId, serialId, operationType, nonce } = checkData;
  
  // Verificar idempotencia si se proporciona un nonce
  if (nonce && await checkIdempotence(nonce)) {
    return { 
      allowed: false,
      reason: 'Operación ya procesada',
      details: { nonce }
    };
  }

  // 1. Verificar límite semanal
  const weeklyLimitResult = await checkWeeklyLimit(dni, operationType);
  if (!weeklyLimitResult.allowed) {
    await createAlert(weeklyLimitResult.alertType, weeklyLimitResult.details);
    return weeklyLimitResult;
  }
  
  // 2. Verificar cooldown
  const cooldownResult = await checkCooldown(dni, operationType);
  if (!cooldownResult.allowed) {
    await createAlert(cooldownResult.alertType, cooldownResult.details);
    return cooldownResult;
  }
  
  // 3. Verificar coincidencia de serial (solo para canjes)
  if (serialId) {
    const serialMatchResult = await checkSerialMatch(dni, serialId);
    if (!serialMatchResult.allowed) {
      await createAlert(serialMatchResult.alertType, serialMatchResult.details);
      return serialMatchResult;
    }
  }
  
  // 4. Verificar múltiples cuentas (crea alerta pero no bloquea)
  const multiAccountResult = await checkMultiAccount(dni, deviceId);
  if (multiAccountResult.alertType) {
    await createAlert(multiAccountResult.alertType, multiAccountResult.details);
    // Continuamos aunque se haya detectado multi-cuenta
  }
  
  return { allowed: true };
}