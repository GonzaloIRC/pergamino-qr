// apps/admin-web/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

// Inicializar Sentry solo en entornos que no son de desarrollo
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';

if (SENTRY_DSN && APP_ENV !== 'development') {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    tracesSampleRate: APP_ENV === 'production' ? 0.1 : 0.5,
    debug: APP_ENV !== 'production',
    
    // Configuraciones adicionales para mejorar captura de errores
    integrations: [
      new Sentry.BrowserTracing({
        // Configuración de trazado para transacciones y navegación
      }),
    ],
    
    // No enviar errores si estamos en modo mantenimiento
    beforeSend(event) {
      if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
        return null;
      }
      return event;
    },
  });
}

export { Sentry };