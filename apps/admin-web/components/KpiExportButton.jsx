import React, { useState } from 'react';
import { Button, IconButton, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { exportKPIsToCSV, downloadCSV } from '@/lib/firestore/exportClient';

/**
 * Botón de exportación rápida para KPIs
 * Se puede integrar directamente en el dashboard
 */
export default function KpiExportButton({ variant = 'icon' }) {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleExportKpis = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Exportar KPIs actuales
      const csvData = await exportKPIsToCSV();
      
      // Generar nombre de archivo con fecha actual
      const filename = `kpis-pergamino-${new Date().toISOString().split('T')[0]}.csv`;
      
      // Descargar el archivo
      downloadCSV(csvData, filename);
      
      // Mostrar mensaje de éxito
      setSuccessMessage('KPIs exportados exitosamente');
    } catch (err) {
      console.error('Error al exportar KPIs:', err);
      setErrorMessage(err.message || 'Error al exportar KPIs');
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
  
  // Renderizar botón según variante
  if (variant === 'icon') {
    return (
      <>
        <Tooltip title="Exportar KPIs a CSV">
          <IconButton 
            onClick={handleExportKpis}
            disabled={loading}
            color="primary"
            data-testid="kpi-export-icon"
          >
            {loading ? <CircularProgress size={24} /> : <DownloadIcon />}
          </IconButton>
        </Tooltip>
        
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
      </>
    );
  }
  
  // Variante de botón completo
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleExportKpis}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        data-testid="export-csv-button"
      >
        {loading ? 'Exportando...' : 'Exportar KPIs'}
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
    </>
  );
}