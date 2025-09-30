'use client';

import React from 'react';
import { useAuth } from '../../providers';

export default function History() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Historial</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Historial de actividades y transacciones</p>
      </div>
    </div>
  );
}