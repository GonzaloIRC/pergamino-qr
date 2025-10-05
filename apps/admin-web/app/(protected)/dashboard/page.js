'use client';

import { useEffect, useState } from 'react';
import { fetchKpiMetrics } from '@/lib/firestore/kpiClient';
import DashboardHeader from './components/DashboardHeader';
import KpiCard from './components/KpiCard';
import DateRangePicker from './components/DateRangePicker';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Últimos 30 días
    endDate: new Date(),
  });

  useEffect(() => {
    async function loadKpiData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchKpiMetrics(dateRange.startDate, dateRange.endDate);
        setKpiData(data);
      } catch (err) {
        console.error('Error loading KPI data:', err);
        setError('No se pudieron cargar los datos del dashboard. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    }

    loadKpiData();
  }, [dateRange]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardHeader 
        title="Dashboard Administrativo" 
        description="Métricas y KPIs del negocio en tiempo real"
        data-testid="dashboard-header"
      />
      
      <DateRangePicker 
        startDate={dateRange.startDate} 
        endDate={dateRange.endDate}
        onChange={handleDateRangeChange}
        data-testid="dashboard-date-picker"
      />
      
      {loading ? (
        <div className="flex justify-center p-12" data-testid="dashboard-loading">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} data-testid="dashboard-error" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8" data-testid="dashboard-kpi-grid">
          {/* KPIs de Clientes */}
          <KpiCard
            title="Clientes Totales"
            value={kpiData?.customers?.totalCustomers || 0}
            icon="users"
            trend={10}
            data-testid="kpi-total-customers"
          />
          <KpiCard
            title="Clientes Nuevos"
            value={kpiData?.customers?.newCustomers || 0}
            icon="user-plus"
            trend={15}
            data-testid="kpi-new-customers"
          />
          <KpiCard
            title="Clientes Activos"
            value={kpiData?.customers?.activeCustomers || 0}
            icon="user-check"
            trend={5}
            data-testid="kpi-active-customers"
          />
          
          {/* KPIs de Transacciones */}
          <KpiCard
            title="Transacciones"
            value={kpiData?.transactions?.totalTransactions || 0}
            icon="repeat"
            trend={8}
            data-testid="kpi-total-transactions"
          />
          <KpiCard
            title="Monto Total"
            value={`$${kpiData?.transactions?.totalAmount || 0}`}
            icon="dollar-sign"
            trend={12}
            data-testid="kpi-total-amount"
          />
          <KpiCard
            title="Valor Promedio"
            value={`$${kpiData?.transactions?.averageTransactionValue || 0}`}
            icon="trending-up"
            trend={-3}
            data-testid="kpi-avg-transaction"
          />
          
          {/* KPIs de Mesas */}
          <KpiCard
            title="Mesas Totales"
            value={kpiData?.tables?.totalTables || 0}
            icon="grid"
            trend={0}
            data-testid="kpi-total-tables"
          />
          <KpiCard
            title="Mesas Activas"
            value={kpiData?.tables?.activeTables || 0}
            icon="check-square"
            trend={5}
            data-testid="kpi-active-tables"
          />
          <KpiCard
            title="Utilización de Mesas"
            value={`${kpiData?.tables?.tableUtilization || 0}%`}
            icon="bar-chart-2"
            trend={7}
            data-testid="kpi-table-utilization"
          />
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500 text-right" data-testid="dashboard-last-updated">
        Última actualización: {kpiData?.lastUpdated ? new Date(kpiData.lastUpdated).toLocaleString() : 'N/A'}
      </div>
    </div>
  );
}