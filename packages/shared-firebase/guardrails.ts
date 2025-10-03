// packages/shared-firebase/guardrails.ts
import {
  getFirestore,
  doc,
  getDoc,
  query,
  collection,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  createWeeklyLimitAlert, 
  createFraudAttemptAlert,
  createSerialReuseAlert,
  createMultiAccountAlert,
  AlertType 
} from './alerts';

/**
 * Tipos de alertas de fraude (obsoleto, usar AlertType de alerts.ts)
 * @deprecated Use AlertType from './alerts.ts'
 */
export enum FraudAlertType {
  WEEKLY_LIMIT_EXCEEDED = 'weekly_limit',
  COOLDOWN_VIOLATION = 'fraud_attempt',
  SERIAL_MISMATCH = 'serial_reuse',
  MULTI_ACCOUNT = 'multi_account',
}

/**
 * Estructura de configuración de límites para los guardrails
 */
export interface LimitsConfig {
  LIMITS_PER_WEEK: number;
  COOLDOWN_MIN: number;
}

/**
 * Resultado de la verificación de guardrails
 */
export interface GuardrailCheckResult {
  allowed: boolean;
  reason?: string;
  alertType?: FraudAlertType;
  details?: any;
}

/**
 * Datos necesarios para verificar guardrails
 */
export interface GuardrailCheckData {
  dni: string;
  deviceId: string;
  serialId?: string; // Opcional, solo para canjes de beneficios
  operationType: 'redemption' | 'accumulation'; // Tipo de operación: canje o acumulación
  nonce?: string; // Identificador único para garantizar idempotencia
}

/**
 * Obtiene la configuración global de límites desde Firestore
 */
async function getLimitsConfig(): Promise<LimitsConfig> {
  const db = getFirestore();
  const configRef = doc(db, 'Ajustes', 'global');
  const configSnap = await getDoc(configRef);
  
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
async function checkWeeklyLimit(dni: string, operationType: string): Promise<GuardrailCheckResult> {
  const db = getFirestore();
  const config = await getLimitsConfig();
  
  // Calcular fecha de hace una semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Consultar historial de los últimos 7 días para este DNI y tipo de operación
  const historialRef = collection(db, 'Historial');
  const q = query(
    historialRef,
    where('dni', '==', dni),
    where('tipo', '==', operationType),
    where('ts', '>=', Timestamp.fromDate(oneWeekAgo)),
    orderBy('ts', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
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
async function checkCooldown(dni: string, operationType: string): Promise<GuardrailCheckResult> {
  const db = getFirestore();
  const config = await getLimitsConfig();
  
  // Consultar la operación más reciente para este DNI y tipo
  const historialRef = collection(db, 'Historial');
  const q = query(
    historialRef,
    where('dni', '==', dni),
    where('tipo', '==', operationType),
    orderBy('ts', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
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
async function checkSerialMatch(dni: string, serialId: string): Promise<GuardrailCheckResult> {
  if (!serialId) {
    return { allowed: true }; // No hay serial para verificar
  }
  
  const db = getFirestore();
  const serialRef = doc(db, 'BeneficioSeriales', serialId);
  const serialSnap = await getDoc(serialRef);
  
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
async function checkMultiAccount(dni: string, deviceId: string): Promise<GuardrailCheckResult> {
  if (!deviceId) {
    return { allowed: true }; // No hay deviceId para verificar
  }
  
  const db = getFirestore();
  
  // Calcular fecha de hace una semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Consultar historial del mismo dispositivo en los últimos 7 días
  const historialRef = collection(db, 'Historial');
  const q = query(
    historialRef,
    where('deviceId', '==', deviceId),
    where('ts', '>=', Timestamp.fromDate(oneWeekAgo))
  );
  
  const querySnapshot = await getDocs(q);
  
  // Recopilar DNIs únicos usados con este dispositivo
  const uniqueDnis = new Set<string>();
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
 * Crea una alerta en Firestore usando el nuevo sistema de alertas
 */
async function createAlert(alertType: FraudAlertType, details: any): Promise<string> {
  // Obtenemos información del usuario si está disponible
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  const userId = currentUser?.uid || details.userId || 'unknown-user';
  const userInfo = {
    displayName: currentUser?.displayName || undefined,
    email: currentUser?.email || undefined,
    dni: details.dni || undefined,
    deviceId: details.deviceId || undefined
  };
  
  switch (alertType) {
    case FraudAlertType.WEEKLY_LIMIT_EXCEEDED:
      return createWeeklyLimitAlert(
        userId, 
        details.currentCount || 0, 
        details.limit || 5,
        userInfo
      );
    
    case FraudAlertType.COOLDOWN_VIOLATION:
      return createFraudAttemptAlert(
        userId,
        details.serialId || 'unknown',
        'Violación de período de enfriamiento',
        userInfo
      );
    
    case FraudAlertType.SERIAL_MISMATCH:
      return createSerialReuseAlert(
        userId,
        details.serialId || 'unknown',
        details.attempts || 1,
        userInfo
      );
    
    case FraudAlertType.MULTI_ACCOUNT:
      return createMultiAccountAlert(
        userId,
        details.uniqueDnis || [],
        'Uso de múltiples DNIs con el mismo dispositivo',
        userInfo
      );
    
    default:
      // Compatibilidad con la colección antigua
      const db = getFirestore();
      const alertsRef = collection(db, 'Alertas');
      
      const alertData = {
        tipo: alertType,
        detalle: JSON.stringify(details),
        dni: details.dni,
        deviceId: details.deviceId,
        ts: serverTimestamp(),
        uids: details.uniqueDnis ? details.uniqueDnis : undefined
      };
      
      const docRef = await addDoc(alertsRef, alertData);
      return docRef.id;
  }
}

/**
 * Verifica si una operación ya fue procesada (idempotencia)
 */
async function checkIdempotence(nonce: string): Promise<boolean> {
  if (!nonce) return false;
  
  const db = getFirestore();
  const historialRef = collection(db, 'Historial');
  const q = query(
    historialRef,
    where('nonce', '==', nonce),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

/**
 * Función principal para verificar todos los guardrails
 * @param checkData Datos para verificar guardrails
 * @returns Resultado de la verificación
 */
export async function checkGuardrails(checkData: GuardrailCheckData): Promise<GuardrailCheckResult> {
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
    await createAlert(weeklyLimitResult.alertType!, weeklyLimitResult.details);
    return weeklyLimitResult;
  }
  
  // 2. Verificar cooldown
  const cooldownResult = await checkCooldown(dni, operationType);
  if (!cooldownResult.allowed) {
    await createAlert(cooldownResult.alertType!, cooldownResult.details);
    return cooldownResult;
  }
  
  // 3. Verificar coincidencia de serial (solo para canjes)
  if (serialId) {
    const serialMatchResult = await checkSerialMatch(dni, serialId);
    if (!serialMatchResult.allowed) {
      await createAlert(serialMatchResult.alertType!, serialMatchResult.details);
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