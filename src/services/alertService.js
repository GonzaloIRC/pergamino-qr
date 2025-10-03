/**
 * @file alertService.js
 * @description Servicio para administrar las alertas del sistema
 */

import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseClient';
import { Alert } from '../models/Alert';

/**
 * Servicio para gestionar alertas de seguridad y fraude
 */
export const alertService = {
  /**
   * Registra una nueva alerta en el sistema
   * 
   * @param {Object} alertData - Datos de la alerta
   * @param {string} alertData.type - Tipo de alerta (de ALERT_TYPES)
   * @param {string} alertData.details - Descripción detallada
   * @param {string} alertData.dni - DNI del usuario relacionado
   * @param {string} alertData.userId - ID de usuario relacionado
   * @param {string} alertData.deviceId - ID del dispositivo
   * @param {Object} [additionalData] - Datos adicionales específicos del tipo de alerta
   * @returns {Promise<string>} - ID de la alerta creada
   */
  async registerAlert(alertData, additionalData = {}) {
    try {
      const alertToSave = {
        ...alertData,
        ...additionalData,
        timestamp: Timestamp.now(),
        reviewed: false
      };
      
      const docRef = await addDoc(collection(db, 'alerts'), alertToSave);
      console.log('Alerta registrada:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error al registrar alerta:', error);
      throw new Error(`Error al registrar alerta: ${error.message}`);
    }
  },
  
  /**
   * Obtiene todas las alertas según los filtros especificados
   * 
   * @param {Object} filters - Filtros para las alertas
   * @returns {Promise<Array<Alert>>} - Lista de alertas
   */
  async getAlerts(filters = {}) {
    try {
      return await Alert.getAlerts(filters);
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      throw new Error(`Error al obtener alertas: ${error.message}`);
    }
  },
  
  /**
   * Marca una alerta como revisada
   * 
   * @param {string} alertId - ID de la alerta
   * @param {string} reviewerId - ID del revisor
   * @returns {Promise<void>}
   */
  async markAsReviewed(alertId, reviewerId) {
    try {
      const alertsRef = collection(db, 'alerts');
      const q = query(alertsRef, where('__name__', '==', alertId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error(`No se encontró la alerta con ID: ${alertId}`);
      }
      
      const alertDoc = snapshot.docs[0];
      const alert = new Alert(alertDoc.data(), alertDoc.id);
      
      await alert.markAsReviewed(reviewerId);
      return alert;
    } catch (error) {
      console.error('Error al marcar alerta como revisada:', error);
      throw new Error(`Error al marcar alerta como revisada: ${error.message}`);
    }
  },
  
  /**
   * Obtiene alertas para un usuario específico
   * 
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array<Alert>>} - Alertas del usuario
   */
  async getAlertsByUserId(userId) {
    try {
      const alertsRef = collection(db, 'alerts');
      const q = query(alertsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => new Alert(doc.data(), doc.id));
    } catch (error) {
      console.error('Error al obtener alertas por usuario:', error);
      throw new Error(`Error al obtener alertas por usuario: ${error.message}`);
    }
  },
  
  /**
   * Exporta alertas a formato CSV
   * 
   * @param {Array<Alert>} alerts - Alertas a exportar
   * @returns {string} - Contenido CSV
   */
  exportToCSV(alerts) {
    if (!alerts || alerts.length === 0) {
      return 'No hay alertas para exportar';
    }
    
    // Convertir todas las alertas a formato CSV
    const csvObjects = alerts.map(alert => alert.toCSV());
    
    // Obtener todas las cabeceras posibles
    const headers = Array.from(
      new Set(
        csvObjects.flatMap(obj => Object.keys(obj))
      )
    );
    
    // Crear el contenido CSV
    const csvContent = [
      headers.join(','),
      ...csvObjects.map(obj => 
        headers.map(header => {
          const value = obj[header] !== undefined ? obj[header] : '';
          // Escapar comas y comillas en valores
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
};

export default alertService;