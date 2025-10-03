/**
 * @file constants.js
 * @description Constantes usadas en la aplicación
 */

// Tipos de alerta para el sistema antifraude
export const ALERT_TYPES = {
  WEEKLY_LIMIT_EXCEEDED: 'WEEKLY_LIMIT_EXCEEDED', // Límite semanal excedido
  COOLDOWN_VIOLATION: 'COOLDOWN_VIOLATION',       // Violación del tiempo de espera
  MULTI_ACCOUNT: 'MULTI_ACCOUNT',                 // Múltiples cuentas detectadas
  SERIAL_REUSE: 'SERIAL_REUSE',                   // Reutilización de código serial
  SUSPICIOUS_PATTERN: 'SUSPICIOUS_PATTERN',       // Patrón sospechoso
  LOCATION_MISMATCH: 'LOCATION_MISMATCH',         // Discrepancia de ubicación
};

// Nombres descriptivos para los tipos de alerta
export const ALERT_TYPE_NAMES = {
  [ALERT_TYPES.WEEKLY_LIMIT_EXCEEDED]: 'Límite semanal excedido',
  [ALERT_TYPES.COOLDOWN_VIOLATION]: 'Violación de tiempo de espera',
  [ALERT_TYPES.MULTI_ACCOUNT]: 'Múltiples cuentas detectadas',
  [ALERT_TYPES.SERIAL_REUSE]: 'Reutilización de código serial',
  [ALERT_TYPES.SUSPICIOUS_PATTERN]: 'Patrón sospechoso',
  [ALERT_TYPES.LOCATION_MISMATCH]: 'Discrepancia de ubicación',
};

// Gravedad de alertas
export const ALERT_SEVERITY = {
  LOW: 'LOW',           // Baja - Informativa
  MEDIUM: 'MEDIUM',     // Media - Requiere atención
  HIGH: 'HIGH',         // Alta - Potencial fraude
  CRITICAL: 'CRITICAL', // Crítica - Fraude confirmado
};

// Mapeo de tipos de alerta a niveles de gravedad
export const ALERT_TYPE_SEVERITY = {
  [ALERT_TYPES.WEEKLY_LIMIT_EXCEEDED]: ALERT_SEVERITY.MEDIUM,
  [ALERT_TYPES.COOLDOWN_VIOLATION]: ALERT_SEVERITY.MEDIUM,
  [ALERT_TYPES.MULTI_ACCOUNT]: ALERT_SEVERITY.HIGH,
  [ALERT_TYPES.SERIAL_REUSE]: ALERT_SEVERITY.CRITICAL,
  [ALERT_TYPES.SUSPICIOUS_PATTERN]: ALERT_SEVERITY.HIGH,
  [ALERT_TYPES.LOCATION_MISMATCH]: ALERT_SEVERITY.MEDIUM,
};