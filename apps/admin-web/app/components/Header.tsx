'use client';

import React from 'react';
import { useAuth } from '../providers';

export default function Header() {
  const { user, role } = useAuth();
  
  return (
    <header className="bg-white shadow">
      <div className="px-4 py-6 mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">Panel de Administración</h1>
            <p className="text-sm text-gray-500">Gestión centralizada de Pergamino</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Sesión activa</p>
              <p className="text-xs text-gray-500">
                {user?.email || 'Usuario'} {role === 'admin' ? '(Administrador)' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}