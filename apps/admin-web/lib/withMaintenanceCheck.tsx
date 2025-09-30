// apps/admin-web/lib/withMaintenanceCheck.tsx
'use client';

import React, { useEffect, useState } from 'react';
import MaintenanceMode from '../components/MaintenanceMode';

/**
 * HOC para verificar si la aplicación está en modo de mantenimiento
 * @param Component Componente a renderizar si no estamos en mantenimiento
 * @returns Componente envuelto con verificación de mantenimiento
 */
export default function withMaintenanceCheck(Component: React.ComponentType<any>) {
  return function MaintenanceCheckedComponent(props: any) {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean | null>(null);

    useEffect(() => {
      // Verificar el estado de mantenimiento desde las variables de entorno
      const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
      setIsMaintenanceMode(maintenanceMode);

      // Opcionalmente, podríamos verificar desde Firebase Remote Config
      // para cambiar el estado sin redeploy
    }, []);

    // Mientras cargamos, no mostrar nada
    if (isMaintenanceMode === null) {
      return null;
    }

    // Si estamos en mantenimiento, mostrar pantalla de mantenimiento
    if (isMaintenanceMode) {
      return <MaintenanceMode />;
    }

    // Si no estamos en mantenimiento, mostrar el componente original
    return <Component {...props} />;
  };
}