'use client';

import { useEffect, useState } from 'react';
import { fetchHistoryData, convertHistoryToCSV } from '@/lib/firestore/historyClient';
import { checkExportPermissions, logExportActivity } from '@/lib/firestore/exportClient';

import HistoryHeader from './components/HistoryHeader';
import HistoryFilters from './components/HistoryFilters';
import HistoryTable from './components/HistoryTable';
import ExportButton from './components/ExportButton';
import Pagination from '@/components/ui/Pagination';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Últimos 30 días
    endDate: new Date(),
    dni: '',
    tableSerial: '',
    transactionLimit: 100,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [canExport, setCanExport] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Cargar datos de historial
  useEffect(() => {
    async function loadHistoryData() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchHistoryData(filters);
        setHistoryData(data);
        setFilteredData(data);
        setPagination(prev => ({ ...prev, totalItems: data.length }));
        
        // Verificar permisos de exportación
        const hasExportPermission = await checkExportPermissions();
        setCanExport(hasExportPermission);
      } catch (err) {
        console.error('Error loading history data:', err);
        setError('No se pudieron cargar los datos del historial. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    }

    loadHistoryData();
  }, [filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reiniciar a la primera página
  };

  // Manejar paginación
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Paginación de datos
  const paginatedData = filteredData.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize
  );

  // Exportar a CSV
  const handleExportCSV = async () => {
    if (!canExport) return;
    
    try {
      setExportLoading(true);
      
      // Convertir datos a CSV
      const csvContent = convertHistoryToCSV(filteredData);
      
      // Crear blob y enlace para descarga
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `historial-transacciones-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Registrar actividad de exportación
      await logExportActivity('transaction-history', filters);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Error al exportar datos a CSV. Intente nuevamente más tarde.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-start mb-6">
        <HistoryHeader 
          title="Historial de Transacciones" 
          description="Consulta y exporta el historial de transacciones"
          data-testid="history-header"
        />
        
        {canExport && (
          <ExportButton 
            onClick={handleExportCSV} 
            loading={exportLoading}
            disabled={loading || historyData.length === 0}
            data-testid="export-csv-button"
          />
        )}
      </div>
      
      <HistoryFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        data-testid="history-filters"
      />
      
      {loading ? (
        <div className="flex justify-center p-12" data-testid="history-loading">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Alert variant="destructive" data-testid="history-error">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : historyData.length === 0 ? (
        <div className="text-center py-12 border rounded-md" data-testid="history-empty">
          <p className="text-gray-500">No se encontraron registros para los filtros seleccionados.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => handleFilterChange({
              startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
              endDate: new Date(),
              dni: '',
              tableSerial: '',
            })}
            data-testid="history-reset-filters"
          >
            Restablecer filtros
          </Button>
        </div>
      ) : (
        <>
          <HistoryTable 
            data={paginatedData}
            data-testid="history-table"
          />
          
          <div className="mt-6">
            <Pagination
              currentPage={pagination.currentPage}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
              data-testid="history-pagination"
            />
          </div>
        </>
      )}
    </div>
  );
}