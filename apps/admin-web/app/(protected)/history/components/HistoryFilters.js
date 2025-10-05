'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { SearchIcon, FilterIcon, XIcon } from '@/components/icons';

export default function HistoryFilters({ filters, onFilterChange, ...props }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    dni: filters.dni || '',
    tableSerial: filters.tableSerial || '',
  });

  const handleDateRangeChange = (dateRange) => {
    onFilterChange({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const clearFilters = () => {
    setLocalFilters({ dni: '', tableSerial: '' });
    onFilterChange({
      dni: '',
      tableSerial: '',
    });
  };

  const toggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6" {...props}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FilterIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Filtros</h3>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFilters}
          data-testid="history-toggle-filters"
        >
          {isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="date-range">Rango de fechas</Label>
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={handleDateRangeChange}
              data-testid="history-date-filter"
            />
          </div>
          
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor="dni">DNI Cliente</Label>
                <Input
                  id="dni"
                  name="dni"
                  placeholder="Buscar por DNI..."
                  value={localFilters.dni}
                  onChange={handleInputChange}
                  data-testid="history-dni-filter"
                />
              </div>
              <Button type="submit" size="icon" data-testid="history-search-button">
                <SearchIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        
        {isExpanded && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tableSerial">Número de Mesa</Label>
                <Input
                  id="tableSerial"
                  name="tableSerial"
                  placeholder="Buscar por N° de mesa..."
                  value={localFilters.tableSerial}
                  onChange={handleInputChange}
                  data-testid="history-table-filter"
                />
              </div>
              
              {/* Espacio para más filtros futuros */}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center space-x-1"
                data-testid="history-clear-filters"
              >
                <XIcon className="h-4 w-4" />
                <span>Limpiar filtros</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}