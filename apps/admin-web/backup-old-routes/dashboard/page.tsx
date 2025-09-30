'use client';

import React from 'react';
import { useAuth } from '../lib/auth';
import { withAuth } from '../lib/auth';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tablero</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statistics Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Clientes</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">123</span>
                <span className="text-green-500 text-sm ml-2">+10%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 3H2a2 2 0 00-2 2v14a2 2 0 002 2h20a2 2 0 002-2V5a2 2 0 00-2-2zM2 19V5h20v14H2z"/>
                <path d="M14 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-7 3c-1.66 0-3 1.34-3 3v2h14v-2c0-1.66-1.34-3-3-3H7z"/>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Beneficios Canjeados</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">56</span>
                <span className="text-green-500 text-sm ml-2">+5%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 9h2v11h14V9h2L12 1zm6 16H6v-9h12v9z"/>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Puntos Acumulados</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">3,456</span>
                <span className="text-green-500 text-sm ml-2">+8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nuevas secciones: Analytics y Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <a href="/analytics" className="block transition-transform hover:scale-105">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </h2>
            <p className="text-gray-600 mb-4">Visualiza estadísticas detalladas sobre clientes, canjes y operaciones. Exporta reportes y analiza tendencias para tomar mejores decisiones.</p>
            <div className="flex justify-end">
              <span className="inline-flex items-center text-blue-600 hover:text-blue-800">
                Ver dashboard
                <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </div>
        </a>
        
        <a href="/alerts" className="block transition-transform hover:scale-105">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Alertas
            </h2>
            <p className="text-gray-600 mb-4">Monitorea y gestiona alertas de seguridad y eventos sospechosos. Recibe notificaciones sobre posibles fraudes y actividades inusuales.</p>
            <div className="flex justify-between items-center">
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">3 nuevas</span>
              <span className="inline-flex items-center text-blue-600 hover:text-blue-800">
                Ver alertas
                <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </div>
        </a>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample data - would be replaced by actual data */}
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Cliente {i}</div>
                        <div className="text-sm text-gray-500">cliente{i}@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">Acumulación de puntos</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">+{i * 10}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);