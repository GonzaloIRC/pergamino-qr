'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { exportToCsv } from '@/lib/firestore/exportClient';

export default function HistoryTable({ data = [], isLoading = false, onExport }) {
  const [page, setPage] = useState(1);
  const [exportInProgress, setExportInProgress] = useState(false);
  
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExport = async () => {
    setExportInProgress(true);
    try {
      await exportToCsv(data, 'historial-pergamino');
      if (onExport) onExport();
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExportInProgress(false);
    }
  };

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Completado', variant: 'success' },
      pending: { label: 'Pendiente', variant: 'warning' },
      failed: { label: 'Fallido', variant: 'destructive' },
    };
    
    const config = statusMap[status] || { label: status, variant: 'secondary' };
    
    return (
      <Badge variant={config.variant}>{config.label}</Badge>
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button disabled className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            <span>Exportar CSV</span>
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No se encontraron registros que coincidan con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleExport}
          disabled={exportInProgress || data.length === 0}
          className="flex items-center gap-2"
          data-testid="export-csv-button"
        >
          <DownloadIcon className="h-4 w-4" />
          <span>{exportInProgress ? 'Exportando...' : 'Exportar CSV'}</span>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell>{record.dni || '-'}</TableCell>
                <TableCell>{record.tableSerial || '-'}</TableCell>
                <TableCell>{record.type || '-'}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            disabled={page === 1}
            data-testid="prev-page-button"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Página {page} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={page === totalPages}
            data-testid="next-page-button"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}