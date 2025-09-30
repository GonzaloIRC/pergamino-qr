'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '../lib/auth';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  Query,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../lib/firestore';
import HistoryFilters, { HistoryFilters as HistoryFiltersType } from '../components/HistoryFilters';
import ExportCSVButton from '../components/ExportCSVButton';

interface Transaction {
  id: string;
  type: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userDNI?: string;
  points: number;
  description?: string;
  benefitId?: string;
  benefitName?: string;
  serialId?: string;
  timestamp: any; // Firestore timestamp
  [key: string]: any; // For any additional fields
}

function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<HistoryFiltersType>({
    tipo: '',
    startDate: null,
    endDate: null,
    dni: '',
    serial: ''
  });

  // Fetch transaction history from Firestore with filters
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        
        const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc'), limit(100)];
        
        // Apply type filter
        if (activeFilters.tipo) {
          constraints.push(where('type', '==', activeFilters.tipo));
        }
        
        // Apply date filters
        if (activeFilters.startDate) {
          const startTimestamp = Timestamp.fromDate(activeFilters.startDate);
          constraints.push(where('timestamp', '>=', startTimestamp));
        }
        
        if (activeFilters.endDate) {
          // Set the end date to the end of the day
          const endDate = new Date(activeFilters.endDate);
          endDate.setHours(23, 59, 59, 999);
          const endTimestamp = Timestamp.fromDate(endDate);
          constraints.push(where('timestamp', '<=', endTimestamp));
        }
        
        // Apply DNI filter - for performance reasons, this should be indexed in Firestore
        let filteredTransactions: Transaction[] = [];
        
        const transactionsQuery = query(
          collection(db, COLLECTIONS.HISTORY),
          ...constraints
        );
        
        const snapshot = await getDocs(transactionsQuery);
        filteredTransactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
        
        // Additional filtering for DNI and serial (since these may not be efficient as Firestore queries)
        if (activeFilters.dni) {
          filteredTransactions = filteredTransactions.filter(
            transaction => transaction.userDNI?.includes(activeFilters.dni)
          );
        }
        
        if (activeFilters.serial) {
          filteredTransactions = filteredTransactions.filter(
            transaction => transaction.serialId?.includes(activeFilters.serial)
          );
        }
        
        setTransactions(filteredTransactions);
      } catch (err: any) {
        console.error('Error fetching transaction history:', err);
        setError(err.message || 'Error al cargar el historial de transacciones');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [activeFilters]);

  // Get transaction type badge color and text
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'scan':
        return { color: 'bg-green-100 text-green-800', text: 'Escaneo QR' };
      case 'redeem':
        return { color: 'bg-blue-100 text-blue-800', text: 'Canje Beneficio' };
      case 'admin':
        return { color: 'bg-purple-100 text-purple-800', text: 'Ajuste Admin' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: type };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Format data for CSV export
  const getExportData = () => {
    return transactions.map(transaction => ({
      Fecha: transaction.timestamp?.toDate ? transaction.timestamp.toDate().toISOString() : '',
      Usuario: transaction.userName || '',
      Email: transaction.userEmail || '',
      DNI: transaction.userDNI || '',
      Tipo: getTransactionTypeBadge(transaction.type).text,
      Puntos: transaction.points,
      Beneficio: transaction.benefitName || '',
      Serial: transaction.serialId || '',
      Descripcion: transaction.description || ''
    }));
  };

  const handleApplyFilters = (filters: HistoryFiltersType) => {
    setActiveFilters(filters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Historial de Transacciones</h1>
      
      <HistoryFilters onApplyFilters={handleApplyFilters} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm">
          {loading ? 'Cargando...' : `${transactions.length} transacciones encontradas`}
        </div>
        <ExportCSVButton 
          data={getExportData()} 
          filename={`historial-transacciones-${new Date().toISOString().slice(0, 10)}`}
          disabled={!transactions.length || loading}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const typeBadge = getTransactionTypeBadge(transaction.type);
                  
                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.timestamp?.toDate ? 
                          transaction.timestamp.toDate().toLocaleString() : 
                          'Fecha desconocida'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                            {transaction.userName?.charAt(0)?.toUpperCase() || 
                             transaction.userEmail?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.userName || 'Usuario'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.userEmail || ''}
                              {transaction.userDNI ? ` - DNI: ${transaction.userDNI}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeBadge.color}`}>
                          {typeBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {transaction.serialId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.description || transaction.benefitName || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {loading ? 'Cargando transacciones...' : 'No hay transacciones que coincidan con los filtros'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(History);