/**
 * @file analyticsService.js
 * @description Servicio para obtener datos analíticos del sistema
 */

import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebaseClient';

/**
 * Servicio para obtener métricas y estadísticas del sistema
 */
export const analyticsService = {
  /**
   * Obtiene estadísticas generales del sistema
   * 
   * @param {Date} [startDate] - Fecha de inicio para filtrar
   * @param {Date} [endDate] - Fecha de fin para filtrar
   * @returns {Promise<Object>} - Estadísticas generales
   */
  async getGeneralStats(startDate = null, endDate = null) {
    try {
      // Crear timestamps para las fechas si se proporcionan
      const startTimestamp = startDate ? Timestamp.fromDate(startDate) : null;
      const endTimestamp = endDate ? Timestamp.fromDate(endDate) : null;
      
      // Obtener usuarios
      const usersRef = collection(db, 'users');
      let usersQuery = query(usersRef);
      
      // Aplicar filtros de fecha si existen
      if (startTimestamp) {
        usersQuery = query(usersQuery, where('createdAt', '>=', startTimestamp));
      }
      if (endTimestamp) {
        usersQuery = query(usersQuery, where('createdAt', '<=', endTimestamp));
      }
      
      const usersSnapshot = await getDocs(usersQuery);
      
      // Obtener operaciones
      const operationsRef = collection(db, 'operations');
      let operationsQuery = query(operationsRef);
      
      // Aplicar filtros de fecha si existen
      if (startTimestamp) {
        operationsQuery = query(operationsQuery, where('timestamp', '>=', startTimestamp));
      }
      if (endTimestamp) {
        operationsQuery = query(operationsQuery, where('timestamp', '<=', endTimestamp));
      }
      
      const operationsSnapshot = await getDocs(operationsQuery);
      
      // Obtener alertas
      const alertsRef = collection(db, 'alerts');
      let alertsQuery = query(alertsRef);
      
      // Aplicar filtros de fecha si existen
      if (startTimestamp) {
        alertsQuery = query(alertsQuery, where('timestamp', '>=', startTimestamp));
      }
      if (endTimestamp) {
        alertsQuery = query(alertsQuery, where('timestamp', '<=', endTimestamp));
      }
      
      const alertsSnapshot = await getDocs(alertsQuery);
      const unreviewedAlertsQuery = query(alertsQuery, where('reviewed', '==', false));
      const unreviewedAlertsSnapshot = await getDocs(unreviewedAlertsQuery);
      
      return {
        totalUsers: usersSnapshot.size,
        totalOperations: operationsSnapshot.size,
        totalAlerts: alertsSnapshot.size,
        pendingAlerts: unreviewedAlertsSnapshot.size
      };
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw new Error(`Error al obtener estadísticas generales: ${error.message}`);
    }
  },
  
  /**
   * Obtiene datos para gráficos de usuarios
   * 
   * @param {string} timeFrame - Marco de tiempo ('daily', 'weekly', 'monthly')
   * @param {number} [limit] - Límite de resultados
   * @returns {Promise<Array>} - Datos para gráficos
   */
  async getUsersChartData(timeFrame = 'daily', dataLimit = 30) {
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(500) // Límite inicial para procesamiento
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      
      // Agrupar por fecha según el marco de tiempo
      const groupedData = this._groupDataByTimeFrame(users, 'createdAt', timeFrame);
      
      // Limitar a la cantidad solicitada
      return Object.entries(groupedData)
        .map(([date, users]) => ({
          date,
          count: users.length
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-dataLimit);
    } catch (error) {
      console.error('Error al obtener datos de gráficos de usuarios:', error);
      throw new Error(`Error al obtener datos de gráficos de usuarios: ${error.message}`);
    }
  },
  
  /**
   * Obtiene datos para gráficos de operaciones
   * 
   * @param {string} timeFrame - Marco de tiempo ('daily', 'weekly', 'monthly')
   * @param {number} [limit] - Límite de resultados
   * @returns {Promise<Array>} - Datos para gráficos
   */
  async getOperationsChartData(timeFrame = 'daily', dataLimit = 30) {
    try {
      const operationsRef = collection(db, 'operations');
      const operationsQuery = query(
        operationsRef,
        orderBy('timestamp', 'desc'),
        limit(1000) // Límite inicial para procesamiento
      );
      
      const operationsSnapshot = await getDocs(operationsQuery);
      const operations = operationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));
      
      // Agrupar por fecha según el marco de tiempo
      const groupedData = this._groupDataByTimeFrame(operations, 'timestamp', timeFrame);
      
      // Limitar a la cantidad solicitada
      return Object.entries(groupedData)
        .map(([date, operations]) => ({
          date,
          count: operations.length
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-dataLimit);
    } catch (error) {
      console.error('Error al obtener datos de gráficos de operaciones:', error);
      throw new Error(`Error al obtener datos de gráficos de operaciones: ${error.message}`);
    }
  },
  
  /**
   * Obtiene datos para gráficos de alertas
   * 
   * @param {string} timeFrame - Marco de tiempo ('daily', 'weekly', 'monthly')
   * @param {number} [limit] - Límite de resultados
   * @returns {Promise<Array>} - Datos para gráficos
   */
  async getAlertsChartData(timeFrame = 'daily', dataLimit = 30) {
    try {
      const alertsRef = collection(db, 'alerts');
      const alertsQuery = query(
        alertsRef,
        orderBy('timestamp', 'desc'),
        limit(500) // Límite inicial para procesamiento
      );
      
      const alertsSnapshot = await getDocs(alertsQuery);
      const alerts = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));
      
      // Agrupar por fecha según el marco de tiempo
      const groupedData = this._groupDataByTimeFrame(alerts, 'timestamp', timeFrame);
      
      // Limitar a la cantidad solicitada
      return Object.entries(groupedData)
        .map(([date, alerts]) => ({
          date,
          count: alerts.length
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-dataLimit);
    } catch (error) {
      console.error('Error al obtener datos de gráficos de alertas:', error);
      throw new Error(`Error al obtener datos de gráficos de alertas: ${error.message}`);
    }
  },
  
  /**
   * Obtiene distribución de tipos de alertas
   * 
   * @param {Date} [startDate] - Fecha de inicio para filtrar
   * @param {Date} [endDate] - Fecha de fin para filtrar
   * @returns {Promise<Array>} - Distribución de tipos de alertas
   */
  async getAlertTypeDistribution(startDate = null, endDate = null) {
    try {
      // Crear timestamps para las fechas si se proporcionan
      const startTimestamp = startDate ? Timestamp.fromDate(startDate) : null;
      const endTimestamp = endDate ? Timestamp.fromDate(endDate) : null;
      
      // Obtener alertas
      const alertsRef = collection(db, 'alerts');
      let alertsQuery = query(alertsRef);
      
      // Aplicar filtros de fecha si existen
      if (startTimestamp) {
        alertsQuery = query(alertsQuery, where('timestamp', '>=', startTimestamp));
      }
      if (endTimestamp) {
        alertsQuery = query(alertsQuery, where('timestamp', '<=', endTimestamp));
      }
      
      const alertsSnapshot = await getDocs(alertsQuery);
      const alerts = alertsSnapshot.docs.map(doc => doc.data());
      
      // Contar ocurrencias de cada tipo
      const typeCounts = {};
      alerts.forEach(alert => {
        if (!typeCounts[alert.type]) {
          typeCounts[alert.type] = 0;
        }
        typeCounts[alert.type]++;
      });
      
      // Convertir a formato para gráficos
      return Object.entries(typeCounts).map(([type, count]) => ({
        name: type,
        value: count
      }));
    } catch (error) {
      console.error('Error al obtener distribución de tipos de alertas:', error);
      throw new Error(`Error al obtener distribución de tipos de alertas: ${error.message}`);
    }
  },
  
  /**
   * Función auxiliar para agrupar datos por marco de tiempo
   * 
   * @param {Array} data - Datos a agrupar
   * @param {string} dateField - Campo de fecha
   * @param {string} timeFrame - Marco de tiempo
   * @returns {Object} - Datos agrupados
   * @private
   */
  _groupDataByTimeFrame(data, dateField, timeFrame) {
    const groupedData = {};
    
    data.forEach(item => {
      const date = item[dateField];
      let key;
      
      switch (timeFrame) {
        case 'daily':
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly':
          // Obtener el primer día de la semana (lunes)
          const day = date.getDay() || 7; // Convertir 0 (domingo) a 7
          const diff = date.getDate() - day + 1; // Ajustar a lunes
          const monday = new Date(date);
          monday.setDate(diff);
          key = monday.toISOString().split('T')[0]; // YYYY-MM-DD del lunes
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          break;
        default:
          key = date.toISOString().split('T')[0]; // Default a daily
      }
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      
      groupedData[key].push(item);
    });
    
    return groupedData;
  }
};

export default analyticsService;
