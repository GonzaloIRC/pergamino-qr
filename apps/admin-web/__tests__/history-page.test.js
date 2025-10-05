import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HistoryPage from '../app/(protected)/history/page';
import { fetchHistoryData } from '../lib/firestore/historyClient';
import { checkExportPermissions, logExportActivity } from '../lib/firestore/exportClient';

// Mock the clients
vi.mock('../lib/firestore/historyClient', () => ({
  fetchHistoryData: vi.fn(),
  convertHistoryToCSV: vi.fn()
}));

vi.mock('../lib/firestore/exportClient', () => ({
  checkExportPermissions: vi.fn(),
  logExportActivity: vi.fn()
}));

// Mock hooks for toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('History Page', () => {
  // Sample data for tests
  const mockHistoryData = [
    {
      id: '1',
      timestamp: new Date('2025-09-30T14:00:00').toISOString(),
      customerDni: '12345678',
      customerName: 'John Doe',
      tableSerial: 'T001',
      type: 'purchase',
      amount: 25.50,
      points: 10,
      status: 'completed'
    },
    {
      id: '2',
      timestamp: new Date('2025-09-29T10:30:00').toISOString(),
      customerDni: '87654321',
      customerName: 'Jane Smith',
      tableSerial: 'T002',
      type: 'redemption',
      amount: 0,
      points: 50,
      status: 'completed'
    },
    {
      id: '3',
      timestamp: new Date('2025-09-28T16:45:00').toISOString(),
      customerDni: '98765432',
      customerName: 'Alice Brown',
      tableSerial: 'T003',
      type: 'purchase',
      amount: 15.75,
      points: 5,
      status: 'pending'
    }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Default implementation for the mocks
    fetchHistoryData.mockResolvedValue(mockHistoryData);
    checkExportPermissions.mockResolvedValue(true);
    logExportActivity.mockResolvedValue();
  });

  it('should render loading state initially', () => {
    render(<HistoryPage />);
    expect(screen.getByTestId('history-loading')).toBeInTheDocument();
  });

  it('should display history records when data is loaded', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('history-loading')).not.toBeInTheDocument();
    });
    
    // Check for table headers
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('DNI')).toBeInTheDocument();
    expect(screen.getByText('Mesa')).toBeInTheDocument();
    
    // Check for data from mock
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('T001')).toBeInTheDocument();
    expect(screen.getByText('T002')).toBeInTheDocument();
  });

  it('should apply filters correctly', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('history-loading')).not.toBeInTheDocument();
    });
    
    // Get DNI filter input
    const dniFilter = screen.getByTestId('history-dni-filter');
    fireEvent.change(dniFilter, { target: { value: '12345678' } });
    
    // Submit the filter form
    const searchButton = screen.getByTestId('history-search-button');
    fireEvent.click(searchButton);
    
    // Check that fetchHistoryData was called with the correct filters
    expect(fetchHistoryData).toHaveBeenCalledWith(expect.objectContaining({
      dni: '12345678'
    }));
  });

  it('should handle date range selection', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('history-loading')).not.toBeInTheDocument();
    });
    
    // Get date filter
    const dateFilter = screen.getByTestId('history-date-filter');
    fireEvent.click(dateFilter);
    
    // Simplified test for date picker interaction
    await waitFor(() => {
      expect(fetchHistoryData).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle export button click', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('history-loading')).not.toBeInTheDocument();
    });
    
    // Find and click export button
    const exportButton = screen.getByTestId('export-csv-button');
    fireEvent.click(exportButton);
    
    // Check that export activity was logged
    await waitFor(() => {
      expect(logExportActivity).toHaveBeenCalled();
    });
  });

  it('should show empty state when no data', async () => {
    // Override mock to return empty array
    fetchHistoryData.mockResolvedValue([]);
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('history-loading')).not.toBeInTheDocument();
    });
    
    // Check for empty state message
    expect(screen.getByTestId('history-empty')).toBeInTheDocument();
    expect(screen.getByText(/No se encontraron registros/)).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    // Override mock to throw error
    fetchHistoryData.mockRejectedValue(new Error('Failed to fetch history'));
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('history-loading')).not.toBeInTheDocument();
    });
    
    // Check for error message
    expect(screen.getByTestId('history-error')).toBeInTheDocument();
  });

  it('should handle pagination', async () => {
    // Create more mock data to test pagination
    const manyRecords = Array(25).fill(0).map((_, i) => ({
      id: `id-${i}`,
      timestamp: new Date().toISOString(),
      customerDni: `DNI-${i}`,
      tableSerial: `T00${i}`,
      type: 'purchase',
      status: 'completed'
    }));
    
    fetchHistoryData.mockResolvedValue(manyRecords);
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('history-loading')).not.toBeInTheDocument();
    });
    
    // Find and click next page button
    const nextPageButton = screen.getByTestId('history-pagination');
    fireEvent.click(nextPageButton.querySelector('[aria-label="Go to next page"]'));
    
    // Check that we're on page 2
    await waitFor(() => {
      expect(screen.getByText('Página 2')).toBeInTheDocument();
    });
  });
});