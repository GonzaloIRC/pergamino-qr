// apps/mobile-expo/utils/sentry.ts
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Inicializar Sentry solo en entornos que no son de desarrollo
const SENTRY_DSN = Constants.expoConfig?.extra?.EXPO_PUBLIC_SENTRY_DSN;
const APP_ENV = Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_ENV || 'development';
const SENTRY_ENABLED = Constants.expoConfig?.extra?.EXPO_PUBLIC_SENTRY_ENABLED === 'true';

if (SENTRY_DSN && SENTRY_ENABLED) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    debug: APP_ENV !== 'production',
    tracesSampleRate: APP_ENV === 'production' ? 0.1 : 0.5,
    enableAutoSessionTracking: true,
    
    // No enviar errores si estamos en modo mantenimiento
    beforeSend(event) {
      if (Constants.expoConfig?.extra?.EXPO_PUBLIC_MAINTENANCE_MODE === 'true') {
        return null;
      }
      return event;
    },
  });
}

// Función helper para reportar errores
export const reportError = (error: Error, context?: Record<string, any>): void => {
  if (SENTRY_ENABLED) {
    if (context) {
      Sentry.setContext('additional', context);
    }
    Sentry.captureException(error);
  } else {
    // En desarrollo solo mostrar en consola
    console.error('Error capturado:', error);
    if (context) {
      console.error('Contexto:', context);
    }
  }
};

export { Sentry };