/**
 * @file Alert.js
 * @description Modelo para las alertas de fraude en el sistema
 */

import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseClient';

export class Alert {
  /**
   * Constructor para la clase Alert
   * @param {Object} data - Datos de la alerta
   * @param {string} id - ID del documento en Firestore
   */
  constructor(data, id = null) {
    this.id = id;
    this.type = data.type;
    this.details = data.details;
    this.timestamp = data.timestamp;
    this.dni = data.dni;
    this.userId = data.userId;
    this.deviceId = data.deviceId;
    this.reviewed = data.reviewed || false;
    this.reviewedAt = data.reviewedAt || null;
    this.reviewedBy = data.reviewedBy || null;
    
    // Campos opcionales dependiendo del tipo de alerta
    if (data.serialCode) this.serialCode = data.serialCode;
    if (data.assignedTo) this.assignedTo = data.assignedTo;
    if (data.otherUsers) this.otherUsers = data.otherUsers;
  }

  /**
   * Marca una alerta como revisada
   * @param {string} reviewerId - ID del usuario que revisa
   * @returns {Promise<void>}
   */
  async markAsReviewed(reviewerId) {
    if (!this.id) throw new Error('No se puede actualizar una alerta sin ID');
    
    const alertRef = doc(db, 'alerts', this.id);
    const reviewData = {
      reviewed: true,
      reviewedAt: new Date(),
      reviewedBy: reviewerId
    };
    
    await updateDoc(alertRef, reviewData);
    
    // Actualizar objeto local
    this.reviewed = true;
    this.reviewedAt = reviewData.reviewedAt;
    this.reviewedBy = reviewerId;
  }
  
  /**
   * Obtiene alertas filtradas por tipo, dni, y/o fechas
   * @param {Object} filters - Filtros a aplicar
   * @param {string} [filters.type] - Tipo de alerta
   * @param {string} [filters.dni] - DNI asociado
   * @param {Date} [filters.startDate] - Fecha de inicio
   * @param {Date} [filters.endDate] - Fecha de fin
   * @param {boolean} [filters.onlyUnreviewed] - Solo no revisadas
   * @returns {Promise<Array<Alert>>} - Array de alertas
   */
  static async getAlerts(filters = {}) {
    const alertsRef = collection(db, 'alerts');
    let q = query(alertsRef);
    
    // Construir la consulta según los filtros proporcionados
    const queryFilters = [];
    
    if (filters.type) {
      queryFilters.push(where('type', '==', filters.type));
    }
    
    if (filters.dni) {
      queryFilters.push(where('dni', '==', filters.dni));
    }
    
    if (filters.onlyUnreviewed) {
      queryFilters.push(where('reviewed', '==', false));
    }
    
    if (filters.startDate) {
      queryFilters.push(where('timestamp', '>=', filters.startDate));
    }
    
    if (filters.endDate) {
      queryFilters.push(where('timestamp', '<=', filters.endDate));
    }
    
    // Aplicar filtros si hay alguno
    if (queryFilters.length > 0) {
      q = query(alertsRef, ...queryFilters);
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => new Alert(doc.data(), doc.id));
  }
  
  /**
   * Convierte una alerta a formato CSV
   * @returns {Object} - Objeto plano para CSV
   */
  toCSV() {
    const baseObj = {
      ID: this.id,
      Tipo: this.type,
      Detalles: this.details,
      Fecha: this.timestamp.toDate().toLocaleString(),
      DNI: this.dni || 'N/A',
      UsuarioID: this.userId || 'N/A',
      DispositivoID: this.deviceId || 'N/A',
      Revisado: this.reviewed ? 'Sí' : 'No',
      FechaRevision: this.reviewedAt ? this.reviewedAt.toDate().toLocaleString() : 'N/A',
      RevisadoPor: this.reviewedBy || 'N/A'
    };
    
    // Agregar campos especiales según el tipo
    if (this.serialCode) baseObj.CodigoSerial = this.serialCode;
    if (this.assignedTo) baseObj.AsignadoA = this.assignedTo;
    if (this.otherUsers) baseObj.OtrosUsuarios = this.otherUsers.join(', ');
    
    return baseObj;
  }
}