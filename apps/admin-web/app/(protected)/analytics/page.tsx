'use client';

import React from 'react';
import { useAuth } from '../../providers';

export default function Analytics() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-4">Visualización de datos analíticos</p>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
          Gráficos e informes analíticos
        </div>
      </div>
    </div>
  );
}