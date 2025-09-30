'use client';

import React from 'react';
import { useAuth } from '../../providers';

export default function Benefits() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Beneficios</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Gestión de beneficios y promociones</p>
      </div>
    </div>
  );
}