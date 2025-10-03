/**
 * Script de inicialización de tablas de seguimiento para Pergamino-app
 * Este script crea las colecciones y documentos necesarios para la funcionalidad
 * de seguimiento de mesas en el restaurante
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos iniciales para las mesas
const initialTables = [
  { number: 1, capacity: 4, status: 'available', location: 'interior' },
  { number: 2, capacity: 2, status: 'available', location: 'interior' },
  { number: 3, capacity: 6, status: 'available', location: 'interior' },
  { number: 4, capacity: 4, status: 'available', location: 'terraza' },
  { number: 5, capacity: 8, status: 'available', location: 'terraza' }
];

/**
 * Verifica si ya existen mesas en la colección
 */
async function checkExistingTables() {
  try {
    const tablesRef = collection(db, 'tables');
    const snapshot = await getDocs(tablesRef);
    return snapshot.size > 0;
  } catch (error) {
    console.error('Error verificando tablas existentes:', error);
    return false;
  }
}

/**
 * Crea tablas iniciales en la colección de Firestore
 */
async function createInitialTables() {
  try {
    const tablesRef = collection(db, 'tables');
    
    console.log('Creando mesas iniciales...');
    let createdCount = 0;
    
    for (const table of initialTables) {
      // Verificar si ya existe una mesa con ese número
      const existingQuery = query(
        tablesRef, 
        where('number', '==', table.number)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        // Agregar timestamp y datos adicionales
        const tableData = {
          ...table,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        await addDoc(tablesRef, tableData);
        createdCount++;
      }
    }
    
    console.log(`Tablas inicializadas: ${createdCount} mesas creadas`);
  } catch (error) {
    console.error('Error al crear tablas iniciales:', error);
  }
}

/**
 * Crea los estados iniciales para las mesas
 */
async function createTableStatusCollection() {
  try {
    const statusCollection = collection(db, 'tableStatus');
    
    const statusValues = [
      { value: 'available', label: 'Disponible', color: '#4CAF50' },
      { value: 'occupied', label: 'Ocupada', color: '#F44336' },
      { value: 'reserved', label: 'Reservada', color: '#FFC107' },
      { value: 'cleaning', label: 'Limpieza', color: '#2196F3' },
      { value: 'maintenance', label: 'Mantenimiento', color: '#9E9E9E' }
    ];
    
    for (const status of statusValues) {
      const existingQuery = query(
        statusCollection,
        where('value', '==', status.value)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        await addDoc(statusCollection, status);
      }
    }
    
    console.log('Estados de mesa inicializados correctamente');
  } catch (error) {
    console.error('Error al crear estados de mesa:', error);
  }
}

/**
 * Función principal que ejecuta la inicialización
 */
export async function initializeTrackingTables() {
  try {
    const hasExistingTables = await checkExistingTables();
    
    if (hasExistingTables) {
      console.log('Las tablas ya están inicializadas. No se realizarán cambios.');
      return;
    }
    
    await createInitialTables();
    await createTableStatusCollection();
    
    console.log('Inicialización de tablas de seguimiento completada con éxito');
    return { success: true };
  } catch (error) {
    console.error('Error en la inicialización de tablas de seguimiento:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar la inicialización si este archivo es llamado directamente
if (require.main === module) {
  initializeTrackingTables()
    .then(result => {
      if (result?.success) {
        console.log('Proceso completado exitosamente');
      } else {
        console.log('El proceso falló');
      }
    })
    .catch(error => {
      console.error('Error inesperado:', error);
    });
}
