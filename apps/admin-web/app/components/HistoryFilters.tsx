// apps/admin-web/app/components/HistoryFilters.tsx
'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface HistoryFiltersProps {
  onApplyFilters: (filters: HistoryFilters) => void;
}

export interface HistoryFilters {
  tipo: string;
  startDate: Date | null;
  endDate: Date | null;
  dni: string;
  serial: string;
}

export default function HistoryFilters({ onApplyFilters }: HistoryFiltersProps) {
  const [filters, setFilters] = useState<HistoryFilters>({
    tipo: '',
    startDate: null,
    endDate: null,
    dni: '',
    serial: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFilters(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      tipo: '',
      startDate: null,
      endDate: null,
      dni: '',
      serial: ''
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-semibold mb-4">Filtros</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipo">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={filters.tipo}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Todos</option>
              <option value="canje">Canje</option>
              <option value="acumulacion">Acumulación</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              Fecha Inicio
            </label>
            <DatePicker
              id="startDate"
              selected={filters.startDate}
              onChange={date => handleDateChange('startDate', date)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholderText="Seleccionar fecha"
              dateFormat="dd/MM/yyyy"
              maxDate={filters.endDate || new Date()}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
              Fecha Fin
            </label>
            <DatePicker
              id="endDate"
              selected={filters.endDate}
              onChange={date => handleDateChange('endDate', date)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholderText="Seleccionar fecha"
              dateFormat="dd/MM/yyyy"
              minDate={filters.startDate}
              maxDate={new Date()}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dni">
              DNI
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              placeholder="Buscar por DNI"
              value={filters.dni}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serial">
              Serial
            </label>
            <input
              id="serial"
              name="serial"
              type="text"
              placeholder="Buscar por Serial"
              value={filters.serial}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Aplicar Filtros
          </button>
        </div>
      </form>
    </div>
  );
}