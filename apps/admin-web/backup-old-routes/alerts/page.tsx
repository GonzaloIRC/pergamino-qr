// apps/admin-web/app/alerts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  getFirestore, collection, query, where, orderBy, limit, 
  getDocs, Timestamp, doc, updateDoc
} from 'firebase/firestore';
import { CSVLink } from 'react-csv';
import { withAuth } from '../lib/auth';

interface Alert {
  id: string;
  type: string;
  message: string;
  timestamp: Timestamp;
  userId: string;
  status: 'new' | 'acknowledged' | 'resolved';
  details?: {
    code?: string;
    reason?: string;
    serialNumber?: string;
    attempts?: number;
    limit?: number;
  };
  userInfo?: {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    dni?: string;
  };
}

function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Construir la consulta base
      let alertsQuery = query(
        collection(db, 'Alerts'),
        orderBy('timestamp', 'desc')
      );
      
      // Aplicar filtros
      if (filters.status !== 'all') {
        alertsQuery = query(
          alertsQuery,
          where('status', '==', filters.status)
        );
      }
      
      if (filters.type !== 'all') {
        alertsQuery = query(
          alertsQuery,
          where('type', '==', filters.type)
        );
      }
      
      // Filtrar por fecha
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      const endTimestamp = Timestamp.fromDate(filters.endDate);
      
      alertsQuery = query(
        alertsQuery,
        where('timestamp', '>=', startTimestamp),
        where('timestamp', '<=', endTimestamp)
      );
      
      // Limitar resultados
      alertsQuery = query(alertsQuery, limit(100));
      
      const alertsSnapshot = await getDocs(alertsQuery);
      const alertsData: Alert[] = [];
      
      alertsSnapshot.forEach((docSnapshot) => {
        alertsData.push({
          id: docSnapshot.id,
          ...docSnapshot.data() as Omit<Alert, 'id'>
        });
      });
      
      setAlerts(alertsData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'endDate') {
      setFilters((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const updateAlertStatus = async (alertId: string, newStatus: 'new' | 'acknowledged' | 'resolved') => {
    try {
      const db = getFirestore();
      const alertRef = doc(db, 'Alerts', alertId);
      
      await updateDoc(alertRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      
      // Actualizar el estado local
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === alertId ? { ...alert, status: newStatus } : alert
        )
      );
      
      if (selectedAlert?.id === alertId) {
        setSelectedAlert({ ...selectedAlert, status: newStatus });
      }
      
    } catch (error) {
      console.error('Error al actualizar estado de alerta:', error);
    }
  };
  
  // Preparar datos para exportación CSV
  const prepareCSVData = () => {
    return alerts.map(alert => ({
      Tipo: alert.type,
      Mensaje: alert.message,
      Fecha: alert.timestamp.toDate().toLocaleString(),
      Usuario: alert.userInfo?.displayName || alert.userId,
      Estado: alert.status,
      DNI: alert.userInfo?.dni || 'N/A',
      'Número Serial': alert.details?.serialNumber || 'N/A',
      Detalles: JSON.stringify(alert.details || {})
    }));
  };
  
  // Obtener los tipos de alertas únicos para el filtro
  const alertTypes = Array.from(new Set(alerts.map(alert => alert.type)));
  
  // Formatear la fecha para mostrar
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obtener el color de la insignia según el tipo de alerta
  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'fraud_attempt':
        return 'bg-red-500';
      case 'serial_reuse':
        return 'bg-orange-500';
      case 'weekly_limit':
        return 'bg-yellow-500';
      case 'multi_account':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Obtener el color de la insignia según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-500';
      case 'acknowledged':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Alertas</h1>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Estado</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border rounded p-2"
            >
              <option value="all">Todos</option>
              <option value="new">Nuevos</option>
              <option value="acknowledged">Reconocidos</option>
              <option value="resolved">Resueltos</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Tipo</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="border rounded p-2"
            >
              <option value="all">Todos</option>
              {alertTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'fraud_attempt' && 'Intento de fraude'}
                  {type === 'serial_reuse' && 'Reuso de serial'}
                  {type === 'weekly_limit' && 'Límite semanal'}
                  {type === 'multi_account' && 'Múltiples cuentas'}
                  {type !== 'fraud_attempt' && type !== 'serial_reuse' && type !== 'weekly_limit' && type !== 'multi_account' && type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Fecha inicial</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate.toISOString().split('T')[0]}
              onChange={handleFilterChange}
              className="border rounded p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Fecha final</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate.toISOString().split('T')[0]}
              onChange={handleFilterChange}
              className="border rounded p-2"
            />
          </div>
          
          <div className="self-end">
            <button
              onClick={fetchAlerts}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Aplicar Filtros
            </button>
          </div>
          
          <div className="self-end ml-auto">
            <CSVLink
              data={prepareCSVData()}
              filename={`alertas_${new Date().toISOString().split('T')[0]}.csv`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              target="_blank"
            >
              Exportar CSV
            </CSVLink>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando alertas...</div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Lista de Alertas */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Alertas ({alerts.length})</h2>
              </div>
              
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron alertas con los filtros actuales.
                </div>
              ) : (
                <div className="divide-y">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedAlert?.id === alert.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded text-xs text-white font-semibold mr-2 ${getAlertTypeColor(alert.type)}`}>
                            {alert.type === 'fraud_attempt' && 'Intento de fraude'}
                            {alert.type === 'serial_reuse' && 'Reuso de serial'}
                            {alert.type === 'weekly_limit' && 'Límite semanal'}
                            {alert.type === 'multi_account' && 'Múltiples cuentas'}
                            {alert.type !== 'fraud_attempt' && alert.type !== 'serial_reuse' && alert.type !== 'weekly_limit' && alert.type !== 'multi_account' && alert.type}
                          </span>
                          <span className={`inline-block px-2 py-1 rounded text-xs text-white font-semibold ${getStatusColor(alert.status)}`}>
                            {alert.status === 'new' && 'Nuevo'}
                            {alert.status === 'acknowledged' && 'Reconocido'}
                            {alert.status === 'resolved' && 'Resuelto'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(alert.timestamp)}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold mt-2">{alert.message}</h3>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        Usuario: {alert.userInfo?.displayName || alert.userId}
                        {alert.userInfo?.dni && ` (DNI: ${alert.userInfo.dni})`}
                      </div>
                      
                      {alert.details?.serialNumber && (
                        <div className="text-sm text-gray-600">
                          Serial: {alert.details.serialNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Detalle de Alerta Seleccionada */}
          <div className="w-full md:w-1/3">
            {selectedAlert ? (
              <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Detalle de Alerta</h2>
                
                <div className="mb-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs text-white font-semibold mr-2 ${getAlertTypeColor(selectedAlert.type)}`}>
                    {selectedAlert.type === 'fraud_attempt' && 'Intento de fraude'}
                    {selectedAlert.type === 'serial_reuse' && 'Reuso de serial'}
                    {selectedAlert.type === 'weekly_limit' && 'Límite semanal'}
                    {selectedAlert.type === 'multi_account' && 'Múltiples cuentas'}
                    {selectedAlert.type !== 'fraud_attempt' && selectedAlert.type !== 'serial_reuse' && selectedAlert.type !== 'weekly_limit' && selectedAlert.type !== 'multi_account' && selectedAlert.type}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded text-xs text-white font-semibold ${getStatusColor(selectedAlert.status)}`}>
                    {selectedAlert.status === 'new' && 'Nuevo'}
                    {selectedAlert.status === 'acknowledged' && 'Reconocido'}
                    {selectedAlert.status === 'resolved' && 'Resuelto'}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{selectedAlert.message}</h3>
                <p className="text-sm text-gray-500 mb-4">{formatDate(selectedAlert.timestamp)}</p>
                
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <h4 className="font-semibold mb-2">Información del usuario</h4>
                  <p><span className="font-medium">ID:</span> {selectedAlert.userId}</p>
                  {selectedAlert.userInfo?.displayName && (
                    <p><span className="font-medium">Nombre:</span> {selectedAlert.userInfo.displayName}</p>
                  )}
                  {selectedAlert.userInfo?.email && (
                    <p><span className="font-medium">Email:</span> {selectedAlert.userInfo.email}</p>
                  )}
                  {selectedAlert.userInfo?.phoneNumber && (
                    <p><span className="font-medium">Teléfono:</span> {selectedAlert.userInfo.phoneNumber}</p>
                  )}
                  {selectedAlert.userInfo?.dni && (
                    <p><span className="font-medium">DNI:</span> {selectedAlert.userInfo.dni}</p>
                  )}
                </div>
                
                {selectedAlert.details && Object.keys(selectedAlert.details).length > 0 && (
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <h4 className="font-semibold mb-2">Detalles</h4>
                    {selectedAlert.details.code && (
                      <p><span className="font-medium">Código:</span> {selectedAlert.details.code}</p>
                    )}
                    {selectedAlert.details.reason && (
                      <p><span className="font-medium">Razón:</span> {selectedAlert.details.reason}</p>
                    )}
                    {selectedAlert.details.serialNumber && (
                      <p><span className="font-medium">Número de serie:</span> {selectedAlert.details.serialNumber}</p>
                    )}
                    {selectedAlert.details.attempts !== undefined && (
                      <p><span className="font-medium">Intentos:</span> {selectedAlert.details.attempts}</p>
                    )}
                    {selectedAlert.details.limit !== undefined && (
                      <p><span className="font-medium">Límite:</span> {selectedAlert.details.limit}</p>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  {selectedAlert.status === 'new' && (
                    <button
                      onClick={() => updateAlertStatus(selectedAlert.id, 'acknowledged')}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Marcar como Reconocida
                    </button>
                  )}
                  {(selectedAlert.status === 'new' || selectedAlert.status === 'acknowledged') && (
                    <button
                      onClick={() => updateAlertStatus(selectedAlert.id, 'resolved')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Marcar como Resuelta
                    </button>
                  )}
                  {selectedAlert.status === 'resolved' && (
                    <button
                      onClick={() => updateAlertStatus(selectedAlert.id, 'new')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reabrir Alerta
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded shadow p-8 text-center text-gray-500">
                Selecciona una alerta para ver sus detalles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(AlertsPage);