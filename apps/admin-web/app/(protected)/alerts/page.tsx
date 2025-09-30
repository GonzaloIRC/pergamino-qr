'use client';

import React from 'react';
import { useAuth } from '../../providers';

export default function Alerts() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Alertas</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-4">Administración de alertas del sistema</p>
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Intento de acceso no autorizado</h3>
              <p className="text-red-700">Usuario: rosa@example.com - Hace 32 minutos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
          <div className="flex items-center">
            <div className="text-yellow-500 mr-3">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-yellow-800 font-semibold">Puntos de acumulación anormales</h3>
              <p className="text-yellow-700">Cliente: juan@example.com - Ayer</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <div className="flex items-center">
            <div className="text-green-500 mr-3">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-green-800 font-semibold">Sistema de redenciones restaurado</h3>
              <p className="text-green-700">Operación automática - Hace 2 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}