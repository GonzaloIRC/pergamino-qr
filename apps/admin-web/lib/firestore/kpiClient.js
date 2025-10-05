/**
 * @fileoverview Cliente de Firestore para KPIs y métricas del panel administrativo.
 * Implementa funcionalidades de consulta y análisis de datos para dashboard.
 */

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

/**
 * Obtiene las métricas clave de rendimiento para el dashboard
 * @param {Date} startDate - Fecha inicial para filtrado
 * @param {Date} endDate - Fecha final para filtrado
 * @returns {Promise<Object>} - Objeto con métricas KPI
 */
export async function fetchKpiMetrics(startDate = null, endDate = null) {
  try {
    // Convertir fechas a Timestamp de Firestore si están presentes
    const startTimestamp = startDate ? Timestamp.fromDate(startDate) : null;
    const endTimestamp = endDate ? Timestamp.fromDate(endDate) : null;
    
    // Implementar consultas para diferentes KPIs
    const customerKpis = await fetchCustomerMetrics(startTimestamp, endTimestamp);
    const transactionKpis = await fetchTransactionMetrics(startTimestamp, endTimestamp);
    const tableKpis = await fetchTableMetrics(startTimestamp, endTimestamp);
    
    return {
      customers: customerKpis,
      transactions: transactionKpis,
      tables: tableKpis,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching KPI metrics:', error);
    throw new Error('Failed to fetch dashboard KPIs');
  }
}

/**
 * Obtiene métricas relacionadas con clientes
 */
async function fetchCustomerMetrics(startTimestamp, endTimestamp) {
  // Implementar consulta a colección de clientes
  const customersRef = collection(db, 'customers');
  
  let customersQuery = query(customersRef);
  if (startTimestamp && endTimestamp) {
    customersQuery = query(
      customersRef, 
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp)
    );
  }
  
  const customersSnapshot = await getDocs(customersQuery);
  
  return {
    totalCustomers: customersSnapshot.size,
    newCustomers: customersSnapshot.docs.filter(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate() || new Date();
      // Clientes creados en los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt >= thirtyDaysAgo;
    }).length,
    activeCustomers: customersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === 'active';
    }).length,
    // Otros indicadores relevantes
  };
}

/**
 * Obtiene métricas relacionadas con transacciones
 */
async function fetchTransactionMetrics(startTimestamp, endTimestamp) {
  // Implementar consulta a colección de transacciones
  const transactionsRef = collection(db, 'transactions');
  
  let transactionsQuery = query(transactionsRef, orderBy('timestamp', 'desc'));
  if (startTimestamp && endTimestamp) {
    transactionsQuery = query(
      transactionsRef,
      where('timestamp', '>=', startTimestamp),
      where('timestamp', '<=', endTimestamp),
      orderBy('timestamp', 'desc')
    );
  }
  
  const transactionsSnapshot = await getDocs(transactionsQuery);
  
  // Calcular métricas de transacciones
  let totalAmount = 0;
  let totalTransactions = transactionsSnapshot.size;
  
  transactionsSnapshot.forEach(doc => {
    const data = doc.data();
    totalAmount += parseFloat(data.amount || 0);
  });
  
  return {
    totalTransactions,
    totalAmount,
    averageTransactionValue: totalTransactions > 0 ? (totalAmount / totalTransactions).toFixed(2) : 0,
    // Otros indicadores de transacciones
  };
}

/**
 * Obtiene métricas relacionadas con mesas
 */
async function fetchTableMetrics(startTimestamp, endTimestamp) {
  // Implementar consulta a colección de mesas/tracking
  const tablesRef = collection(db, 'tracking-tables');
  
  const tablesSnapshot = await getDocs(query(tablesRef));
  
  // Calcular métricas de mesas
  const totalTables = tablesSnapshot.size;
  let activeTables = 0;
  let tablesWithActivity = 0;
  
  tablesSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.status === 'active') {
      activeTables++;
    }
    if (data.lastActivity) {
      // Verificar si la mesa tiene actividad reciente (últimas 24 horas)
      const lastActivity = data.lastActivity.toDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity >= yesterday) {
        tablesWithActivity++;
      }
    }
  });
  
  return {
    totalTables,
    activeTables,
    tablesWithActivity,
    tableUtilization: totalTables > 0 ? ((tablesWithActivity / totalTables) * 100).toFixed(1) : 0,
  };
}