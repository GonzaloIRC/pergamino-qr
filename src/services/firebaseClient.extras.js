/**
 * Utilidades adicionales para diagnóstico de emuladores
 * 
 * Estas funciones complementan la inicialización principal de Firebase
 * y solo se usan para debugging de la configuración de emuladores
 */

/**
 * Verifica el estado de conexión de los emuladores
 * @returns {Object} Estado de conexión de cada servicio
 */
export function getEmulatorStatus() {
  return {
    isUsingEmulators: useEmulators,
    authEmulator: {
      host: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost',
      port: parseInt(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099', 10),
      active: useEmulators
    },
    firestoreEmulator: {
      host: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost',
      port: parseInt(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080', 10),
      active: useEmulators
    }
  };
}

/**
 * Verifica la configuración de los emuladores y reporta problemas comunes
 * @returns {Object} Resultado de la verificación con posibles problemas
 */
export function checkEmulatorConfig() {
  const status = getEmulatorStatus();
  const issues = [];
  
  if (!status.isUsingEmulators) {
    issues.push('Los emuladores están desactivados (EXPO_PUBLIC_USE_EMULATORS != true)');
    return { success: false, issues };
  }
  
  // Verificar puertos comunes
  if (status.authEmulator.port !== 9099) {
    issues.push(`Puerto Auth inusual: ${status.authEmulator.port} (esperado: 9099)`);
  }
  
  if (status.firestoreEmulator.port !== 8080) {
    issues.push(`Puerto Firestore inusual: ${status.firestoreEmulator.port} (esperado: 8080)`);
  }
  
  // Verificar hosts
  if (!['localhost', '127.0.0.1'].includes(status.authEmulator.host)) {
    issues.push(`Host Auth inusual: ${status.authEmulator.host} (esperado: localhost o 127.0.0.1)`);
  }
  
  if (!['localhost', '127.0.0.1'].includes(status.firestoreEmulator.host)) {
    issues.push(`Host Firestore inusual: ${status.firestoreEmulator.host} (esperado: localhost o 127.0.0.1)`);
  }
  
  return { 
    success: issues.length === 0,
    issues,
    status
  };
}
