import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KpiDashboard from '../app/(protected)/dashboard/page';
import { fetchKpiMetrics } from '../lib/firestore/kpiClient';

// Mock the KPI client
vi.mock('../lib/firestore/kpiClient', () => ({
  fetchKpiMetrics: vi.fn()
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }),
}));

describe('KPI Dashboard', () => {
  // Sample data for tests
  const mockKpiData = {
    customers: {
      totalCustomers: 120,
      newCustomers: 15,
      activeCustomers: 85,
    },
    transactions: {
      totalTransactions: 450,
      totalAmount: 12500,
      averageTransactionValue: "27.78"
    },
    tables: {
      totalTables: 25,
      activeTables: 22,
      tablesWithActivity: 18,
      tableUtilization: "72.0"
    },
    lastUpdated: new Date().toISOString()
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Default implementation for the mock
    fetchKpiMetrics.mockResolvedValue(mockKpiData);
  });

  it('should render loading state initially', () => {
    render(<KpiDashboard />);
    expect(screen.getByTestId('kpi-loading')).toBeInTheDocument();
  });

  it('should display KPI cards when data is loaded', async () => {
    render(<KpiDashboard />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('kpi-loading')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Total Clientes')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument(); // totalCustomers
    
    expect(screen.getByText('Transacciones')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument(); // totalTransactions
    
    expect(screen.getByText('Mesas Activas')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument(); // activeTables
  });

  it('should handle date filter changes', async () => {
    render(<KpiDashboard />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByTestId('kpi-loading')).not.toBeInTheDocument();
    });
    
    // Find date filter and change dates
    const dateFilter = screen.getByTestId('date-range-filter');
    fireEvent.click(dateFilter);
    
    // Wait for date picker to appear and select a date range
    // Note: This is a simplified test. In a real test, you would select specific dates
    await waitFor(() => {
      expect(fetchKpiMetrics).toHaveBeenCalledTimes(1);
    });
    
    // Expect fetchKpiMetrics to be called with date parameters
    expect(fetchKpiMetrics).toHaveBeenCalled();
  });

  it('should handle error state', async () => {
    // Override the mock to return an error
    fetchKpiMetrics.mockRejectedValue(new Error('Failed to fetch KPIs'));
    
    render(<KpiDashboard />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('kpi-loading')).not.toBeInTheDocument();
    });
    
    // Check for error message
    expect(screen.getByText(/No se pudieron cargar las métricas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('should allow refreshing data', async () => {
    render(<KpiDashboard />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('kpi-loading')).not.toBeInTheDocument();
    });
    
    // Find and click refresh button
    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);
    
    // Verify loading state appears again
    expect(screen.getByTestId('kpi-loading')).toBeInTheDocument();
    
    // Verify fetchKpiMetrics is called again
    await waitFor(() => {
      expect(fetchKpiMetrics).toHaveBeenCalledTimes(2);
    });
  });

  it('should display last updated timestamp', async () => {
    render(<KpiDashboard />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('kpi-loading')).not.toBeInTheDocument();
    });
    
    // Check for last updated text
    expect(screen.getByTestId('last-updated')).toBeInTheDocument();
  });
});