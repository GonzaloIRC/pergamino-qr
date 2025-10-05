import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, 
  Alert, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { exportHistoryToCSV, exportKPIsToCSV, downloadCSV, reauthenticateUser } from '@/lib/firestore/exportClient';

/**
 * Componente para exportar datos a CSV
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Filtros actuales para aplicar a la exportación
 * @param {string} props.type - Tipo de exportación ('history' o 'kpi')
 */
export default function ExportDataButton({ filters = {}, type = 'history' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [exportType, setExportType] = useState(type);
  
  const handleClickOpen = () => {
    setOpen(true);
    setError(null);
    setPassword('');
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleExport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Reautenticar al usuario para operaciones sensibles
      const authSuccess = await reauthenticateUser(password);
      
      if (!authSuccess) {
        setError('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
        setLoading(false);
        return;
      }
      
      // Exportar según el tipo seleccionado
      let csvData;
      let filename;
      
      if (exportType === 'history') {
        csvData = await exportHistoryToCSV(filters);
        filename = `historial-pergamino-${new Date().toISOString().split('T')[0]}.csv`;
      } else if (exportType === 'kpi') {
        csvData = await exportKPIsToCSV();
        filename = `kpis-pergamino-${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      // Descargar el archivo
      downloadCSV(csvData, filename);
      
      // Cerrar el diálogo
      setOpen(false);
      
      // Mostrar mensaje de éxito (puedes implementar un toast aquí)
      console.log('Exportación exitosa');
    } catch (err) {
      setError(err.message || 'Error al exportar datos');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleClickOpen}
        data-testid="export-csv-button"
      >
        Exportar a CSV
      </Button>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Exportar datos</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Para exportar datos sensibles, necesitas confirmar tu identidad.
            Esta acción será registrada para fines de auditoría.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de exportación</InputLabel>
            <Select
              value={exportType}
              label="Tipo de exportación"
              onChange={(e) => setExportType(e.target.value)}
            >
              <MenuItem value="history">Historial completo</MenuItem>
              <MenuItem value="kpi">KPIs actuales</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Los datos exportados pueden contener información sensible.
              Asegúrate de manejarlos según las políticas de privacidad.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            color="primary"
            disabled={loading || !password}
            endIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}