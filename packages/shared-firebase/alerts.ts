// packages/shared-firebase/alerts.ts
import { 
  getFirestore, collection, addDoc, Timestamp, query, where, orderBy, getDocs, limit 
} from 'firebase/firestore';

/**
 * Tipos de alertas soportados por el sistema
 */
export enum AlertType {
  FRAUD_ATTEMPT = 'fraud_attempt',
  SERIAL_REUSE = 'serial_reuse',
  WEEKLY_LIMIT = 'weekly_limit',
  MULTI_ACCOUNT = 'multi_account'
}

/**
 * Estados de las alertas
 */
export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved'
}

/**
 * Interfaz para la creación de alertas
 */
export interface CreateAlertParams {
  type: AlertType;
  message: string;
  userId: string;
  details?: {
    code?: string;
    reason?: string;
    serialNumber?: string;
    attempts?: number;
    limit?: number;
    [key: string]: any;
  };
  userInfo?: {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    dni?: string;
    [key: string]: any;
  };
}

/**
 * Crea una nueva alerta en el sistema
 * 
 * @param params - Parámetros para la creación de la alerta
 * @returns ID de la alerta creada
 */
export async function createAlert(params: CreateAlertParams): Promise<string> {
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
 */
export async function createFraudAttemptAlert(
  userId: string,
  serialNumber: string,
  reason: string,
  userInfo?: CreateAlertParams['userInfo']
): Promise<string> {
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
 */
export async function createSerialReuseAlert(
  userId: string,
  serialNumber: string,
  attempts: number,
  userInfo?: CreateAlertParams['userInfo']
): Promise<string> {
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
 */
export async function createWeeklyLimitAlert(
  userId: string,
  currentCount: number,
  limit: number,
  userInfo?: CreateAlertParams['userInfo']
): Promise<string> {
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
 */
export async function createMultiAccountAlert(
  userId: string,
  relatedUserIds: string[],
  reason: string,
  userInfo?: CreateAlertParams['userInfo']
): Promise<string> {
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