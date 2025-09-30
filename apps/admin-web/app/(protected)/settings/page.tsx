'use client';

import React from 'react';
import { useAuth } from '../../providers';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Configuración del sistema</p>
      </div>
    </div>
  );
}