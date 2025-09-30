// apps/admin-web/app/components/ImportCSVButton.tsx
'use client';

import React, { useState } from 'react';
import { importFromCSV } from '../lib/csv';

interface ImportCSVButtonProps {
  onDataImported: (data: any[]) => void;
  label?: string;
  disabled?: boolean;
}

export default function ImportCSVButton({ 
  onDataImported,
  label = 'Importar CSV', 
  disabled = false 
}: ImportCSVButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImporting(true);
      const data = await importFromCSV(file);
      onDataImported(data);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing data from CSV:', error);
      alert('Error al importar datos. Verifica que el formato del archivo sea correcto.');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={disabled || isImporting}
        className={`px-4 py-2 rounded ${
          disabled || isImporting
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isImporting ? 'Importando...' : label}
      </button>
    </>
  );
}