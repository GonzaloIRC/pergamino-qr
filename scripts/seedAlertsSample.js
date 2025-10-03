// scripts/seedAlertsSample.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const { AlertType, AlertStatus } = require('../packages/shared-firebase/alerts');

// Firebase config
const firebaseConfig = require('../firebase/firebaseConfig');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Genera datos de muestra para las alertas
 */
async function seedAlertsSample() {
  console.log('Sembrando datos de muestra para alertas...');
  
  const alertsCollection = collection(db, 'Alerts');
  
  // Muestra de usuarios
  const users = [
    {
      id: 'user1',
      displayName: 'Juan Pérez',
      email: 'juan@example.com',
      dni: '12345678'
    },
    {
      id: 'user2',
      displayName: 'María López',
      email: 'maria@example.com',
      dni: '87654321'
    },
    {
      id: 'user3',
      displayName: 'Pedro Gómez',
      email: 'pedro@example.com',
      dni: '11223344'
    }
  ];
  
  // Muestra de seriales
  const serials = ['SER123456', 'SER789012', 'SER345678', 'SER901234', 'SER567890'];
  
  // Tipos de alertas y mensajes
  const alertTypes = [
    {
      type: AlertType.FRAUD_ATTEMPT,
      messageTemplate: 'Posible intento de fraude detectado para el serial {serial}',
      detailsTemplate: { reason: 'Uso sospechoso de serial', code: 'F001', serialNumber: '{serial}' }
    },
    {
      type: AlertType.SERIAL_REUSE,
      messageTemplate: 'Intento repetido de usar el serial {serial} ({attempts} intentos)',
      detailsTemplate: { attempts: 3, serialNumber: '{serial}' }
    },
    {
      type: AlertType.WEEKLY_LIMIT,
      messageTemplate: 'Usuario ha alcanzado el límite semanal ({count}/{limit})',
      detailsTemplate: { currentCount: '{count}', limit: 5 }
    },
    {
      type: AlertType.MULTI_ACCOUNT,
      messageTemplate: 'Posible uso de múltiples cuentas detectado',
      detailsTemplate: { reason: 'Múltiples DNIs en el mismo dispositivo', relatedUserIds: ['user1', 'user2'] }
    }
  ];
  
  // Estados de las alertas
  const statuses = [
    AlertStatus.NEW,
    AlertStatus.ACKNOWLEDGED,
    AlertStatus.RESOLVED
  ];
  
  // Crear 20 alertas aleatorias
  for (let i = 0; i < 20; i++) {
    // Seleccionar valores aleatorios
    const user = users[Math.floor(Math.random() * users.length)];
    const serial = serials[Math.floor(Math.random() * serials.length)];
    const alertTypeData = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const count = Math.floor(Math.random() * 10);
    
    // Preparar mensaje y detalles
    let message = alertTypeData.messageTemplate.replace('{serial}', serial).replace('{attempts}', count).replace('{count}', count);
    let details = JSON.parse(JSON.stringify(alertTypeData.detailsTemplate));
    
    // Reemplazar placeholders en los detalles
    if (details.serialNumber === '{serial}') {
      details.serialNumber = serial;
    }
    if (details.currentCount === '{count}') {
      details.currentCount = count;
    }
    
    // Calcular timestamp aleatorio en los últimos 30 días
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));
    
    // Crear alerta
    const alertData = {
      type: alertTypeData.type,
      message: message,
      userId: user.id,
      timestamp: Timestamp.fromDate(timestamp),
      status: status,
      details: details,
      userInfo: {
        displayName: user.displayName,
        email: user.email,
        dni: user.dni
      }
    };
    
    try {
      const docRef = await addDoc(alertsCollection, alertData);
      console.log(`Alerta creada con ID: ${docRef.id}`);
    } catch (error) {
      console.error('Error al crear alerta:', error);
    }
  }
  
  console.log('¡Proceso de siembra de alertas completado!');
}

// Ejecutar el script
seedAlertsSample()
  .then(() => {
    console.log('Siembra completada exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en el proceso de siembra:', error);
    process.exit(1);
  });