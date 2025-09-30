// apps/admin-web/app/components/ExportCSVButton.tsx
'use client';

import React from 'react';
import { exportToCSV } from '../lib/csv';

interface ExportCSVButtonProps {
  data: any[];
  filename: string;
  label?: string;
  disabled?: boolean;
}

export default function ExportCSVButton({ 
  data, 
  filename, 
  label = 'Exportar CSV',
  disabled = false
}: ExportCSVButtonProps) {
  
  const handleExport = () => {
    if (!data.length) {
      alert('No hay datos para exportar');
      return;
    }
    
    try {
      exportToCSV(data, filename);
    } catch (error) {
      console.error('Error exporting data to CSV:', error);
      alert('Error al exportar datos. Por favor, inténtalo de nuevo.');
    }
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={disabled || !data.length}
      className={`px-4 py-2 rounded ${
        disabled || !data.length
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {label}
    </button>
  );
}