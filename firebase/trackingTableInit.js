/**
 * Inicialización de la estructura de datos para el módulo TrackingTable
 * Este script prepara las colecciones y documentos necesarios para
 * gestionar el seguimiento de mesas en el restaurante.
 */

import { db } from './firebaseConfig';
import { collection, addDoc, writeBatch, doc, serverTimestamp, setDoc } from 'firebase/firestore';

/**
 * Inicializa las colecciones y datos necesarios para el sistema de tracking de mesas
 * @param {boolean} resetData - Si es true, recreará todas las mesas de ejemplo
 */
export const initTrackingTables = async (resetData = false) => {
  try {
    const batch = writeBatch(db);
    
    // Crear colección 'mesas' con datos de ejemplo
    if (resetData) {
      const mesasEjemplo = [
        {
          numero: 1,
          capacidad: 4,
          estado: 'disponible',
          ultimaActualizacion: serverTimestamp(),
          creado: serverTimestamp()
        },
        {
          numero: 2,
          capacidad: 2,
          estado: 'ocupada',
          clienteActual: 'Juan Pérez',
          ultimaActualizacion: serverTimestamp(),
          creado: serverTimestamp()
        },
        {
          numero: 3,
          capacidad: 6,
          estado: 'reservada',
          ultimaActualizacion: serverTimestamp(),
          creado: serverTimestamp()
        },
        {
          numero: 4,
          capacidad: 4,
          estado: 'esperando_servicio',
          clienteActual: 'María López',
          ultimaActualizacion: serverTimestamp(),
          creado: serverTimestamp()
        },
        {
          numero: 5,
          capacidad: 8,
          estado: 'disponible',
          ultimaActualizacion: serverTimestamp(),
          creado: serverTimestamp()
        }
      ];
      
      for (const mesa of mesasEjemplo) {
        const mesaRef = doc(collection(db, 'mesas'));
        batch.set(mesaRef, mesa);
      }
      
      // Historial de ejemplo
      const historialEjemplo = [
        {
          mesaId: '1', // Esto se actualizará después de crear las mesas
          numeroMesa: 1,
          estadoAnterior: 'limpieza',
          estadoNuevo: 'disponible',
          timestamp: serverTimestamp(),
          usuario: 'sistema'
        },
        {
          mesaId: '2', // Esto se actualizará después de crear las mesas
          numeroMesa: 2,
          estadoAnterior: 'disponible',
          estadoNuevo: 'ocupada',
          timestamp: serverTimestamp(),
          usuario: 'mesero1'
        }
      ];
      
      for (const historial of historialEjemplo) {
        const historialRef = doc(collection(db, 'historialMesas'));
        batch.set(historialRef, historial);
      }
      
      // Consumos de ejemplo
      const consumosEjemplo = [
        {
          mesaId: '2', // Esto se actualizará después de crear las mesas
          clienteId: 'cliente1',
          total: 25000,
          puntosGanados: 25,
          fecha: serverTimestamp(),
          mesero: 'mesero1',
          productos: [
            { nombre: 'Café Americano', precio: 5000, cantidad: 2 },
            { nombre: 'Sándwich Especial', precio: 15000, cantidad: 1 }
          ]
        }
      ];
      
      for (const consumo of consumosEjemplo) {
        const consumoRef = doc(collection(db, 'consumos'));
        batch.set(consumoRef, consumo);
      }
    
      // Ejecutar todas las operaciones en lote
      await batch.commit();
    }
    
    return { success: true, message: 'Datos de TrackingTable inicializados correctamente' };
  } catch (error) {
    console.error('Error al inicializar datos de TrackingTable:', error);
    return { success: false, error: error.message };
  }
};
