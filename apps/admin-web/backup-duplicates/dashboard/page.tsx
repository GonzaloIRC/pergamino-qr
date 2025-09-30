'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../providers';
import { getClientCount, getRedemptionCount, getRecentHistory } from '../../lib/firestore';

export default function Dashboard() {
  const { user } = useAuth();
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [redemptionCount, setRedemptionCount] = useState<number | null>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Cargar el contador de clientes
        const clients = await getClientCount();
        setClientCount(clients);
        
        // Cargar el contador de redenciones
        const redemptions = await getRedemptionCount();
        setRedemptionCount(redemptions);

        // Cargar historial reciente
        const history = await getRecentHistory(5); // Obtenemos los 5 registros más recientes
        setRecentHistory(history);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" data-testid="dashboard-title">Panel de Control</h1>
      
      {/* KPI Grid Section - Always render this container */}
      <section data-testid="kpi-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Clientes */}
        <article data-testid="kpi-card" className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
              </svg>
            </div>
            <div className="ml-4" data-testid="client-count-card">
              <h2 className="text-gray-600 text-sm">Total Clientes</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900" data-testid="kpi-clientes">
                  {loading ? "…" : (clientCount ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* KPI Seriales activos */}
        <article data-testid="kpi-card" className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z"/>
                <path d="M15 11h-2V9h2v2zm-4 0H9V9h2v2zm0 4H9v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
            </div>
            <div className="ml-4" data-testid="redemption-count-card">
              <h2 className="text-gray-600 text-sm">Redenciones</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900" data-testid="kpi-seriales-activos">
                  {loading ? "…" : (redemptionCount ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* KPI Seriales usados */}
        <article data-testid="kpi-card" className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
                <path d="M13 7h-2v6h6v-2h-4z"/>
              </svg>
            </div>
            <div className="ml-4" data-testid="alerts-card">
              <h2 className="text-gray-600 text-sm">Alertas</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900" data-testid="kpi-seriales-usados">3</span>
                <span className="text-red-500 text-sm ml-2">+2</span>
              </div>
            </div>
          </div>
        </article>
      </section>
      
      {/* Recent History */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Historial Reciente</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden" data-testid="recent-history-table">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Cargando historial...
                  </td>
                </tr>
              ) : recentHistory.length > 0 ? (
                recentHistory.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                          {item.clientName ? item.clientName.charAt(0) : '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.clientName || 'Cliente'}</div>
                          <div className="text-sm text-gray-500">{item.clientEmail || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.action || 'Acción'}</div>
                      <div className="text-sm text-gray-500">{item.points ? `${item.points > 0 ? '+' : ''}${item.points} puntos` : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleDateString() : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'Completado' ? 'bg-green-100 text-green-800' : 
                        item.status === 'Alerta' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status || 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay registros de historial reciente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recent Activity */}
      <h2 className="text-2xl font-bold mt-8 mb-4">Actividad Reciente</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    M
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">María López</div>
                    <div className="text-sm text-gray-500">maria@example.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Redención de beneficio</div>
                <div className="text-sm text-gray-500">Café gratis</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Hace 5 minutos</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completado
                </span>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                    J
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Juan Pérez</div>
                    <div className="text-sm text-gray-500">juan@example.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Acumulación de puntos</div>
                <div className="text-sm text-gray-500">Compra en tienda</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Hace 15 minutos</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completado
                </span>
              </td>
            </tr>
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    R
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Rosa García</div>
                    <div className="text-sm text-gray-500">rosa@example.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Intento de acceso</div>
                <div className="text-sm text-gray-500">Código QR inválido</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Hace 32 minutos</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Alerta
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}