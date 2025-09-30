// apps/admin-web/app/components/SerialGenerator.tsx
'use client';

import React, { useState } from 'react';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../lib/firestore';

interface SerialGeneratorProps {
  onSerialsGenerated: (serials: any[]) => void;
  beneficioId: string;
}

export default function SerialGenerator({ onSerialsGenerated, beneficioId }: SerialGeneratorProps) {
  const [count, setCount] = useState<number>(10);
  const [prefix, setPrefix] = useState<string>('SER-');
  const [padding, setPadding] = useState<number>(4);
  const [dni, setDni] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the last serial number from existing serials with the same prefix
  const getLastSerialNumber = async (prefix: string): Promise<number> => {
    // This would normally query Firestore to find the highest number
    // For simplicity, we'll just return a random number between 1000-9000
    return Math.floor(Math.random() * 8000) + 1000;
  };
  
  const generateSerials = async () => {
    if (!beneficioId) {
      setError('Se requiere un ID de beneficio');
      return;
    }
    
    if (count <= 0 || count > 1000) {
      setError('La cantidad debe estar entre 1 y 1000');
      return;
    }
    
    setError(null);
    setGenerating(true);
    
    try {
      const lastNumber = await getLastSerialNumber(prefix);
      const batch = writeBatch(db);
      const generatedSerials = [];
      
      for (let i = 1; i <= count; i++) {
        const serialNumber = lastNumber + i;
        const serialId = `${prefix}${String(serialNumber).padStart(padding, '0')}`;
        const serialRef = doc(db, COLLECTIONS.SERIALS, serialId);
        
        const serialData = {
          serial: serialId,
          beneficioId,
          estado: 'activo',
          emitidoPor: 'admin-web',
          creado: serverTimestamp(),
          ...(dni ? { emitidoA: dni } : {})
        };
        
        batch.set(serialRef, serialData);
        generatedSerials.push({ id: serialId, ...serialData });
      }
      
      await batch.commit();
      onSerialsGenerated(generatedSerials);
    } catch (err: any) {
      console.error('Error generating serials:', err);
      setError(err.message || 'Error al generar seriales');
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Generar Seriales</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            min="1"
            max="1000"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prefijo
          </label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Padding
          </label>
          <input
            type="number"
            value={padding}
            onChange={(e) => setPadding(parseInt(e.target.value))}
            min="1"
            max="10"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI (Opcional)
          </label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Asignar a cliente específico"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      
      <button
        onClick={generateSerials}
        disabled={generating || !beneficioId}
        className={`px-4 py-2 rounded ${
          generating || !beneficioId
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {generating ? 'Generando...' : 'Generar Seriales'}
      </button>
    </div>
  );
}