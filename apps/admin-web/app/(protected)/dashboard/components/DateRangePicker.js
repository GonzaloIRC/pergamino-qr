'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from '@/components/icons';

export default function DateRangePicker({ startDate, endDate, onChange, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const handleCalendarSelect = (date) => {
    if (!localStartDate || (localStartDate && localEndDate)) {
      setLocalStartDate(date);
      setLocalEndDate(null);
    } else {
      // Si la fecha seleccionada es anterior a la fecha de inicio, intercambiar
      if (date < localStartDate) {
        setLocalEndDate(localStartDate);
        setLocalStartDate(date);
      } else {
        setLocalEndDate(date);
      }
    }
  };

  const handleApply = () => {
    if (localStartDate && localEndDate) {
      onChange({ startDate: localStartDate, endDate: localEndDate });
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return 'Seleccionar fechas';
    
    const formattedStart = format(startDate, 'dd/MM/yyyy');
    const formattedEnd = format(endDate, 'dd/MM/yyyy');
    return `${formattedStart} - ${formattedEnd}`;
  };

  return (
    <div className="flex items-center space-x-2" {...props}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-[300px] justify-start text-left font-normal"
            data-testid="date-range-button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="space-y-2">
              <Calendar
                mode="range"
                selected={{
                  from: localStartDate,
                  to: localEndDate
                }}
                onSelect={(range) => {
                  if (range?.from) setLocalStartDate(range.from);
                  if (range?.to) setLocalEndDate(range.to);
                }}
                numberOfMonths={2}
                data-testid="date-range-calendar"
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  data-testid="date-range-cancel"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleApply}
                  disabled={!localStartDate || !localEndDate}
                  data-testid="date-range-apply"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}