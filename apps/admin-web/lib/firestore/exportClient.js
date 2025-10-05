/**
 * @fileoverview Cliente de Firebase para la autenticación y exportación de datos
 * Implementa utilidades para exportar reportes y autenticar acciones sensibles.
 */

import { db, auth } from '@/lib/firebase';
import { getDoc, doc, collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getKPIs } from './dashboard';

/**
 * Reautentica al usuario antes de realizar operaciones sensibles
 * @param {string} password - Contraseña del usuario actual
 * @returns {Promise<boolean>} - True si la reautenticación fue exitosa
 */
export async function reauthenticateUser(password) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user is currently signed in');
    }
    
    // Crear credencial con email y contraseña
    const credential = EmailAuthProvider.credential(user.email, password);
    
    // Reautenticar usuario
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (error) {
    console.error('Reauthentication failed:', error);
    return false;
  }
}

/**
 * Verifica si el usuario tiene permisos para exportar datos
 * @returns {Promise<boolean>} - True si el usuario tiene permisos
 */
export async function checkExportPermissions() {
  try {
    const user = auth.currentUser;
    if (!user || !user.uid) {
      return false;
    }
    
    // Obtener el perfil del usuario
    const userProfileDoc = await getDoc(doc(db, 'admin-users', user.uid));
    if (!userProfileDoc.exists()) {
      return false;
    }
    
    const profile = userProfileDoc.data();
    return profile.canExport === true || profile.role === 'superadmin';
  } catch (error) {
    console.error('Error checking export permissions:', error);
    return false;
  }
}

/**
 * Registra una actividad de exportación para auditoría
 * @param {string} dataType - Tipo de datos exportados
 * @param {Object} filters - Filtros aplicados a la exportación
 * @returns {Promise<void>}
 */
export async function logExportActivity(dataType, filters) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return;
    }
    
    // Implementar registro de auditoría
    const auditRef = collection(db, 'audit-logs');
    await addDoc(auditRef, {
      userId: user.uid,
      userEmail: user.email,
      action: 'export',
      dataType,
      filters,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error logging export activity:', error);
    // No lanzar error, solo registrar - no queremos que falle la exportación
  }
}

/**
 * Convierte un objeto a formato CSV
 * @param {Array<Object>} data - Array de objetos con datos
 * @param {Array<string>} headers - Cabeceras para el CSV (opcional)
 * @returns {string} - Cadena en formato CSV
 */
function objectsToCSV(data, headers = null) {
  if (!data || data.length === 0) return '';
  
  // Si no se proporcionan cabeceras, usamos las claves del primer objeto
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Crear la fila de cabeceras
  let csvString = csvHeaders.join(',') + '\n';
  
  // Añadir cada fila de datos
  data.forEach(item => {
    const row = csvHeaders.map(header => {
      // Manejar valores especiales (timestamps, objetos anidados, etc)
      const value = item[header];
      
      // Convertir timestamp a formato legible
      if (value && typeof value === 'object' && value.seconds !== undefined) {
        const date = new Date(value.seconds * 1000);
        return `"${date.toLocaleString()}"`;
      }
      
      // Escapar comillas y convertir a string
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      // Para valores nulos o indefinidos
      if (value === null || value === undefined) {
        return '';
      }
      
      return String(value);
    }).join(',');
    
    csvString += row + '\n';
  });
  
  return csvString;
}

/**
 * Consulta el historial con los filtros proporcionados
 * @param {Object} filters - Filtros para la consulta: desde, hasta, dni, serial, pageSize
 * @returns {Promise<Array>} - Datos del historial
 */
export async function fetchHistoryData(filters = {}) {
  const col = collection(db, "Historial");
  let clauses = [];
  
  if (filters.dni) clauses.push(where("dni", "==", filters.dni));
  if (filters.serial) clauses.push(where("serial", "==", filters.serial));
  if (filters.desde) clauses.push(where("fecha", ">=", Timestamp.fromDate(filters.desde)));
  if (filters.hasta) clauses.push(where("fecha", "<=", Timestamp.fromDate(filters.hasta)));
  
  // Orden y límite
  clauses.push(orderBy("fecha", "desc"));
  clauses.push(limit(filters.pageSize || 1000)); // Para exportación, permitimos más registros
  
  const q = query(col, ...clauses);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Exporta el historial a formato CSV
 * @param {Object} filters - Filtros para la consulta
 * @returns {Promise<string>} - Datos en formato CSV
 */
export async function exportHistoryToCSV(filters = {}) {
  try {
    // Verificar permisos
    const hasPermissions = await checkExportPermissions();
    if (!hasPermissions) {
      throw new Error("No tienes permisos para exportar datos");
    }
    
    // Obtener datos
    const historyData = await fetchHistoryData(filters);
    
    // Registrar actividad
    await logExportActivity('history', filters);
    
    // Definimos las cabeceras que queremos en el CSV
    const headers = ['fecha', 'dni', 'nombre', 'serial', 'tipo', 'monto', 'descripcion', 'id'];
    
    return objectsToCSV(historyData, headers);
  } catch (error) {
    console.error('Error al exportar historial:', error);
    throw new Error('No se pudo exportar el historial: ' + error.message);
  }
}

/**
 * Exporta los KPIs a formato CSV
 * @returns {Promise<string>} - Datos en formato CSV
 */
export async function exportKPIsToCSV() {
  try {
    // Verificar permisos
    const hasPermissions = await checkExportPermissions();
    if (!hasPermissions) {
      throw new Error("No tienes permisos para exportar datos");
    }
    
    const kpisData = await getKPIs();
    
    // Registrar actividad
    await logExportActivity('kpi', {});
    
    // Convertir objeto KPI a array para formato CSV
    const currentDate = new Date();
    const kpisArray = [{
      fecha: currentDate.toLocaleDateString(),
      totalClientes: kpisData.totalClientes,
      visitasHoy: kpisData.visitasHoy,
      canjesHoy: kpisData.canjesHoy,
      codigosUsados: kpisData.codigosUsados,
    }];
    
    // Definimos las cabeceras para el CSV
    const headers = ['fecha', 'totalClientes', 'visitasHoy', 'canjesHoy', 'codigosUsados'];
    
    return objectsToCSV(kpisArray, headers);
  } catch (error) {
    console.error('Error al exportar KPIs:', error);
    throw new Error('No se pudo exportar los KPIs: ' + error.message);
  }
}

/**
 * Guarda string CSV como archivo de descarga
 * @param {string} csvData - String con datos en formato CSV
 * @param {string} filename - Nombre del archivo a descargar
 */
export function downloadCSV(csvData, filename) {
  // Crear un objeto Blob con el CSV
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  // Si estamos en el navegador, usar la API de descarga
  if (typeof window !== 'undefined') {
    // Crear URL para el blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento de enlace invisible
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Añadir al DOM, hacer clic y eliminar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar la URL del objeto
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  }
  
  return csvData;
}