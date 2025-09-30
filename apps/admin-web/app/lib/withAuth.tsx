'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';

/**
 * Higher Order Component (HOC) que protege rutas para solo usuarios autenticados
 * y con el rol adecuado.
 * 
 * @param Component Componente a proteger
 * @param requiredRole Rol requerido (opcional, por defecto 'admin')
 * @returns Componente protegido
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string = 'admin'
) {
  return function ProtectedRoute(props: P) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Solo redirigir cuando no está cargando
      if (!loading) {
        // Si no hay usuario o el rol no es el requerido, redirigir al login
        if (!user || (requiredRole && role !== requiredRole)) {
          console.log('Redirigiendo a login - No autorizado');
          router.push('/login');
        }
      }
    }, [user, role, loading, router]);

    // Mostrar loader mientras se verifica la autenticación
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Verificando acceso...</p>
          </div>
        </div>
      );
    }

    // Si el usuario está autenticado y tiene el rol requerido, mostrar el componente
    if (user && (!requiredRole || role === requiredRole)) {
      return <Component {...props} />;
    }

    // Este return es necesario para evitar un error de renderizado,
    // aunque en la práctica la redirección en el useEffect debería ocurrir antes
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500">No autorizado</p>
          <p className="mt-2 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  };
}