'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers';
import { FiHome, FiUsers, FiGift, FiHash, FiClipboard, FiSettings, FiLogOut, FiBarChart2, FiBell } from 'react-icons/fi';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Navigation items with icons
  const navItems = [
    { name: 'Tablero', path: '/dashboard', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Clientes', path: '/clients', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'Beneficios', path: '/benefits', icon: <FiGift className="w-5 h-5" /> },
    { name: 'Seriales', path: '/serials', icon: <FiHash className="w-5 h-5" /> },
    { name: 'Historial', path: '/history', icon: <FiClipboard className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <FiBarChart2 className="w-5 h-5" /> },
    { name: 'Alertas', path: '/alerts', icon: <FiBell className="w-5 h-5" /> },
    { name: 'Configuración', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <aside className="flex flex-col w-64 h-screen px-4 py-8 bg-primary-950 border-r rtl:border-r-0 rtl:border-l">
      {/* Logo */}
      <div className="flex flex-col items-center mt-6 -mx-2">
        <h2 className="mx-2 text-2xl font-bold text-white">Pergamino</h2>
        <p className="mx-2 mt-1 text-sm font-medium text-gray-400">Panel de Administración</p>
      </div>

      {/* User info */}
      <div className="flex flex-col items-center mt-6 -mx-2">
        <div className="w-20 h-20 rounded-full bg-primary-700 flex items-center justify-center text-white text-2xl font-bold">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h4 className="mx-2 mt-2 font-medium text-white">{user?.email}</h4>
        <p className="mx-2 mt-1 text-sm text-gray-400">Administrador</p>
      </div>

      {/* Nav items */}
      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center px-4 py-2 mt-2 rounded-md transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-700 text-white'
                  : 'text-gray-400 hover:bg-primary-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="mx-4 font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="mt-6">
          <button
            onClick={() => logout()}
            className="flex items-center w-full px-4 py-2 mt-5 text-gray-400 rounded-md hover:bg-primary-800 hover:text-white"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="mx-4 font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}