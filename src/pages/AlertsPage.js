import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';
import { useAuth } from '../contexts/authContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Constantes para tipos de alertas
const ALERT_TYPES = {
  WEEKLY_LIMIT_EXCEEDED: "Límite semanal excedido",
  COOLDOWN_VIOLATION: "Violación de tiempo de espera",
  MULTI_ACCOUNT: "Múltiples cuentas detectadas",
  SERIAL_REUSE: "Reutilización de código serial",
  SUSPICIOUS_PATTERN: "Patrón sospechoso",
  LOCATION_MISMATCH: "Discrepancia de ubicación"
};

// Componente para mostrar una alerta individual
const AlertItem = ({ alert, onMarkReviewed, canReview }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      return timestamp.toDate().toLocaleString();
    } catch (e) {
      return timestamp.toLocaleString();
    }
  };
  
  return (
    <div className={`alert-item ${alert.reviewed ? 'reviewed' : ''}`}>
      <div className="alert-header">
        <h3>{ALERT_TYPES[alert.type] || alert.type}</h3>
        <span className={`alert-status ${alert.reviewed ? 'status-reviewed' : 'status-pending'}`}>
          {alert.reviewed ? 'Revisado' : 'Pendiente'}
        </span>
      </div>
      
      <div className="alert-body">
        <div className="alert-detail">
          <strong>Fecha:</strong> {formatDate(alert.timestamp)}
        </div>
        <div className="alert-detail">
          <strong>DNI:</strong> {alert.dni || 'N/A'}
        </div>
        <div className="alert-detail">
          <strong>ID Usuario:</strong> {alert.userId || 'N/A'}
        </div>
        <div className="alert-detail">
          <strong>Dispositivo:</strong> {alert.deviceId || 'N/A'}
        </div>
        
        {alert.serialCode && (
          <div className="alert-detail">
            <strong>Código Serial:</strong> {alert.serialCode}
          </div>
        )}
        
        {alert.assignedTo && (
          <div className="alert-detail">
            <strong>Asignado a:</strong> {alert.assignedTo}
          </div>
        )}
        
        {alert.otherUsers && (
          <div className="alert-detail">
            <strong>Otros usuarios:</strong> {alert.otherUsers.join(', ')}
          </div>
        )}
        
        <div className="alert-details-box">
          <strong>Detalles:</strong>
          <p>{alert.details}</p>
        </div>
        
        {alert.reviewed && (
          <div className="review-info">
            <div><strong>Revisado por:</strong> {alert.reviewedBy || 'N/A'}</div>
            <div><strong>Fecha de revisión:</strong> {formatDate(alert.reviewedAt)}</div>
          </div>
        )}
      </div>
      
      <div className="alert-actions">
        {!alert.reviewed && canReview && (
          <button 
            className="mark-reviewed-btn"
            onClick={() => onMarkReviewed(alert.id)}
          >
            Marcar como revisado
          </button>
        )}
      </div>
    </div>
  );
};

// Página principal de alertas
const AlertsPage = () => {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [dniFilter, setDniFilter] = useState('');
  const [showOnlyUnreviewed, setShowOnlyUnreviewed] = useState(true);
  
  // Cargar alertas
  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const filters = { onlyUnreviewed: showOnlyUnreviewed };
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (selectedType) filters.type = selectedType;
        if (dniFilter) filters.dni = dniFilter;
        
        const alertsData = await alertService.getAlerts(filters);
        setAlerts(alertsData);
        setFilteredAlerts(alertsData);
      } catch (error) {
        console.error('Error al cargar alertas:', error);
        alert('Error al cargar alertas');
      } finally {
        setLoading(false);
      }
    };
    
    loadAlerts();
  }, [startDate, endDate, selectedType, dniFilter, showOnlyUnreviewed]);
  
  // Marcar una alerta como revisada
  const handleMarkAsReviewed = async (alertId) => {
    if (!currentUser) {
      alert('Debe iniciar sesión para realizar esta acción');
      return;
    }
    
    try {
      await alertService.markAsReviewed(alertId, currentUser.uid);
      
      // Actualizar la lista local
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                reviewed: true, 
                reviewedAt: new Date(), 
                reviewedBy: currentUser.uid 
              } 
            : alert
        )
      );
      
      // Aplicar filtros si está activado "solo no revisados"
      if (showOnlyUnreviewed) {
        setFilteredAlerts(prev => prev.filter(alert => alert.id !== alertId));
      } else {
        setFilteredAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { 
                  ...alert, 
                  reviewed: true, 
                  reviewedAt: new Date(), 
                  reviewedBy: currentUser.uid 
                } 
              : alert
          )
        );
      }
    } catch (error) {
      console.error('Error al marcar alerta como revisada:', error);
      alert('Error al marcar alerta como revisada');
    }
  };
  
  // Exportar alertas a CSV
  const exportToCSV = () => {
    try {
      const csvContent = alertService.exportToCSV(filteredAlerts);
      
      // Crear un blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Crear nombre de archivo con fecha
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `alertas-${date}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar alertas:', error);
      alert('Error al exportar alertas a CSV');
    }
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedType('');
    setDniFilter('');
  };
  
  return (
    <div className="alerts-page-container">
      <h1>Alertas de Seguridad</h1>
      
      {/* Panel de filtros */}
      <div className="filters-panel">
        <h2>Filtros</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Tipo de alerta</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {Object.entries(ALERT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>DNI</label>
            <input
              type="text"
              value={dniFilter}
              onChange={(e) => setDniFilter(e.target.value)}
              placeholder="Filtrar por DNI"
            />
          </div>
          
          <div className="filter-group">
            <label>Desde</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="date-picker"
              placeholderText="Fecha inicio"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          
          <div className="filter-group">
            <label>Hasta</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="date-picker"
              placeholderText="Fecha fin"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          
          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={showOnlyUnreviewed}
                onChange={(e) => setShowOnlyUnreviewed(e.target.checked)}
              />
              Solo mostrar alertas pendientes
            </label>
          </div>
          
          <div className="filter-actions">
            <button 
              onClick={clearFilters} 
              className="clear-filters-btn"
            >
              Limpiar filtros
            </button>
            
            <button
              onClick={exportToCSV}
              className="export-btn"
              disabled={filteredAlerts.length === 0}
            >
              Exportar a CSV
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de alertas */}
      <div className="alerts-list">
        <h2>
          {loading 
            ? 'Cargando alertas...' 
            : `${filteredAlerts.length} alertas encontradas`
          }
        </h2>
        
        {loading ? (
          <div className="loading-spinner">
            Cargando...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            No se encontraron alertas con los filtros seleccionados.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onMarkReviewed={handleMarkAsReviewed}
              canReview={!!currentUser}
            />
          ))
        )}
      </div>
      
      <style jsx>{`
        .alerts-page-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          margin-bottom: 20px;
          color: #333;
        }
        
        h2 {
          margin-bottom: 15px;
          font-size: 1.5rem;
        }
        
        .filters-panel {
          background-color: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-group label {
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .filter-group input,
        .filter-group select,
        .date-picker {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
        }
        
        .checkbox-group {
          flex-direction: row;
          align-items: center;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .checkbox-group input[type="checkbox"] {
          margin-right: 10px;
          width: auto;
        }
        
        .filter-actions {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          grid-column: span 2;
        }
        
        .clear-filters-btn,
        .export-btn {
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .clear-filters-btn {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          color: #333;
        }
        
        .export-btn {
          background-color: #28a745;
          border: none;
          color: white;
        }
        
        .export-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .alerts-list {
          margin-top: 20px;
        }
        
        .alert-item {
          background-color: #fff;
          border-left: 4px solid #dc3545;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          padding: 20px;
        }
        
        .alert-item.reviewed {
          border-left-color: #28a745;
        }
        
        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .alert-header h3 {
          margin: 0;
          color: #333;
        }
        
        .alert-status {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-reviewed {
          background-color: #d4edda;
          color: #155724;
        }
        
        .alert-body {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .alert-details-box {
          grid-column: 1 / -1;
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        
        .alert-details-box p {
          margin: 10px 0 0;
        }
        
        .review-info {
          grid-column: 1 / -1;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px dashed #ddd;
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        .alert-actions {
          margin-top: 20px;
          text-align: right;
        }
        
        .mark-reviewed-btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .loading-spinner {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #6c757d;
        }
        
        .no-alerts {
          text-align: center;
          padding: 30px;
          background-color: #f8f9fa;
          border-radius: 4px;
          color: #6c757d;
        }
        
        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .filter-actions {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AlertsPage;