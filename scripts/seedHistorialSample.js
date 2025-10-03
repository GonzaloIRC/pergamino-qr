// scripts/seedHistorialSample.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = require('../firebase/firebaseConfig');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Genera datos de muestra para el historial de operaciones
 */
async function seedHistorialSample() {
  console.log('Sembrando datos de muestra para historial...');
  
  const historialCollection = collection(db, 'Historial');
  
  // Muestra de usuarios
  const users = [
    {
      id: 'user1',
      name: 'Juan Pérez',
      dni: '12345678'
    },
    {
      id: 'user2',
      name: 'María López',
      dni: '87654321'
    },
    {
      id: 'user3',
      name: 'Pedro Gómez',
      dni: '11223344'
    },
    {
      id: 'user4',
      name: 'Ana Rodríguez',
      dni: '55667788'
    },
    {
      id: 'user5',
      name: 'Carlos Fernández',
      dni: '99887766'
    }
  ];
  
  // Muestra de seriales
  const serials = ['SER123456', 'SER789012', 'SER345678', 'SER901234', 'SER567890'];
  
  // Tipos de operaciones
  const operationTypes = ['redemption', 'accumulation'];
  
  // Crear 100 registros aleatorios en el historial
  for (let i = 0; i < 100; i++) {
    // Seleccionar valores aleatorios
    const user = users[Math.floor(Math.random() * users.length)];
    const serial = serials[Math.floor(Math.random() * serials.length)];
    const operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
    const points = operationType === 'accumulation' ? Math.floor(Math.random() * 50) + 1 : Math.floor(Math.random() * 500) + 100;
    
    // Calcular timestamp aleatorio en los últimos 30 días
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now.getTime() - 
      (daysAgo * 24 * 60 * 60 * 1000) - 
      (hoursAgo * 60 * 60 * 1000) - 
      (minutesAgo * 60 * 1000));
    
    // Crear datos del historial
    const historialData = {
      uid: user.id,
      dni: user.dni,
      nombreCliente: user.name,
      tipo: operationType,
      puntos: points,
      ts: Timestamp.fromDate(timestamp),
      serial: serial,
      deviceId: `device-${Math.floor(Math.random() * 5) + 1}`,
      sucursal: `Sucursal ${Math.floor(Math.random() * 3) + 1}`
    };
    
    try {
      const docRef = await addDoc(historialCollection, historialData);
      console.log(`Registro creado con ID: ${docRef.id}`);
    } catch (error) {
      console.error('Error al crear registro:', error);
    }
  }
  
  console.log('¡Proceso de siembra de historial completado!');
}

// Ejecutar el script
seedHistorialSample()
  .then(() => {
    console.log('Siembra completada exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el proceso de siembra:', error);
    process.exit(1);
  });