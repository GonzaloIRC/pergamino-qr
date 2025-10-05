import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Snackbar, Alert, Chip, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { exportHistoryToCSV, downloadCSV } from '@/lib/firestore/exportClient';

/**
 * Componente para exportar el historial a CSV con filtros aplicados
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Filtros actuales (dni, fecha, etc)
 */
export default function HistoryExportButton({ filters = {} }) {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastExport, setLastExport] = useState(null);
  
  // Generar descripción de filtros para mostrar al usuario
  const getFilterDescription = () => {
    const descriptions = [];
    
    if (filters.dni) descriptions.push(`DNI: ${filters.dni}`);
    if (filters.serial) descriptions.push(`Serial: ${filters.serial}`);
    if (filters.desde) descriptions.push(`Desde: ${filters.desde.toLocaleDateString()}`);
    if (filters.hasta) descriptions.push(`Hasta: ${filters.hasta.toLocaleDateString()}`);
    
    return descriptions.length > 0 
      ? descriptions.join(', ')
      : 'Sin filtros (todos los registros)';
  };
  
  const handleExport = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Obtener datos CSV
      const csvData = await exportHistoryToCSV(filters);
      
      // Nombre del archivo con fecha
      const filename = `historial-pergamino-${new Date().toISOString().split('T')[0]}.csv`;
      
      // Descargar el archivo
      downloadCSV(csvData, filename);
      
      // Registrar último export
      setLastExport({
        date: new Date(),
        filters: { ...filters },
        filterDescription: getFilterDescription()
      });
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Historial exportado exitosamente');
    } catch (err) {
      console.error('Error al exportar historial:', err);
      setErrorMessage(err.message || 'Error al exportar el historial');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSuccessMessage = () => {
    setSuccessMessage('');
  };
  
  const handleCloseErrorMessage = () => {
    setErrorMessage('');
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">
          Exportar registros ({getFilterDescription()})
        </Typography>
        
        {lastExport && (
          <Tooltip title={`Último export: ${lastExport.filterDescription}`}>
            <Chip 
              icon={<FileDownloadDoneIcon />}
              label={`Exportado ${lastExport.date.toLocaleTimeString()}`}
              size="small"
              color="success"
              variant="outlined"
            />
          </Tooltip>
        )}
      </Box>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleExport}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        fullWidth
        data-testid="export-csv-button"
      >
        {loading ? 'Exportando historial...' : 'Exportar a CSV'}
      </Button>
      
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={3000} 
        onClose={handleCloseSuccessMessage}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={5000} 
        onClose={handleCloseErrorMessage}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
}