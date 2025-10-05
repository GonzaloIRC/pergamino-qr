/**
 * @fileoverview Cliente de Firestore para acceso al historial de transacciones y eventos.
 * Proporciona funciones para consultar, filtrar y exportar datos históricos.
 */

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

/**
 * Obtiene datos del historial de transacciones con opciones de filtrado
 * @param {Object} filters - Filtros para aplicar a la consulta
 * @param {Date} filters.startDate - Fecha inicial para filtrado
 * @param {Date} filters.endDate - Fecha final para filtrado
 * @param {String} filters.dni - DNI del cliente para filtrar
 * @param {String} filters.tableSerial - Número de serie de la mesa para filtrar
 * @param {Number} filters.limit - Número máximo de resultados (default: 100)
 * @returns {Promise<Array>} - Arreglo con datos del historial
 */
export async function fetchHistoryData(filters = {}) {
  try {
    const { startDate, endDate, dni, tableSerial, transactionLimit = 100 } = filters;
    
    // Convertir fechas a Timestamp de Firestore si están presentes
    const startTimestamp = startDate ? Timestamp.fromDate(startDate) : null;
    const endTimestamp = endDate ? Timestamp.fromDate(endDate) : null;
    
    // Crear la consulta base a la colección de historial
    const historyRef = collection(db, 'transaction-history');
    
    // Aplicar filtros a la consulta
    let historyQuery = query(historyRef, orderBy('timestamp', 'desc'), limit(transactionLimit));
    
    // Filtro por rango de fechas
    if (startTimestamp && endTimestamp) {
      historyQuery = query(
        historyRef,
        where('timestamp', '>=', startTimestamp),
        where('timestamp', '<=', endTimestamp),
        orderBy('timestamp', 'desc'),
        limit(transactionLimit)
      );
    }
    
    // Ejecutar la consulta
    const historySnapshot = await getDocs(historyQuery);
    
    // Procesar y filtrar los resultados (para filtros que no se pueden aplicar directamente en la consulta)
    let results = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
    }));
    
    // Filtrar por DNI si está especificado
    if (dni) {
      results = results.filter(item => item.customerDni === dni);
    }
    
    // Filtrar por número de serie de mesa si está especificado
    if (tableSerial) {
      results = results.filter(item => item.tableSerial === tableSerial);
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching history data:', error);
    throw new Error('Failed to fetch transaction history');
  }
}

/**
 * Convierte datos del historial al formato CSV
 * @param {Array} data - Datos del historial
 * @returns {String} - Contenido del CSV
 */
export function convertHistoryToCSV(data) {
  if (!data || !data.length) {
    return '';
  }
  
  // Definir las columnas del CSV
  const columns = [
    'ID', 'Fecha', 'DNI Cliente', 'Nombre Cliente', 
    'Mesa', 'Tipo', 'Monto', 'Puntos', 'Estado'
  ];
  
  // Crear la línea de encabezado
  let csvContent = columns.join(',') + '\n';
  
  // Agregar las filas de datos
  data.forEach(item => {
    const row = [
      item.id || '',
      formatDate(item.timestamp),
      item.customerDni || '',
      item.customerName || '',
      item.tableSerial || '',
      item.type || '',
      item.amount || '',
      item.points || '',
      item.status || ''
    ];
    
    // Escapar valores con comas
    const escapedRow = row.map(value => {
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    
    csvContent += escapedRow.join(',') + '\n';
  });
  
  return csvContent;
}

/**
 * Formatea una fecha ISO como string para CSV
 * @param {String} isoDateString - Fecha en formato ISO
 * @returns {String} - Fecha formateada
 */
function formatDate(isoDateString) {
  if (!isoDateString) return '';
  
  try {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');
  } catch (error) {
    return isoDateString;
  }
}