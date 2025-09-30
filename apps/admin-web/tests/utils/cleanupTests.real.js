/**
 * Script para limpiar los datos de prueba después de la ejecución
 */
const admin = require('firebase-admin');
const { TEST_NS, cleanupTestData } = require('./testNamespace');

// Inicializar Firebase Admin si aún no se ha inicializado
let adminApp;
try {
  adminApp = admin.app();
} catch (e) {
  // Cargar credenciales desde archivo o variables de entorno
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : require('../../firebase/serviceAccount.json');
    
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = adminApp.firestore();

// Si se ejecuta directamente
if (require.main === module) {
  console.log(`Iniciando limpieza de datos de prueba para namespace ${TEST_NS}...`);
  
  cleanupTestData(db)
    .then(() => {
      console.log('Limpieza completada con éxito');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en la limpieza:', error);
      process.exit(1);
    });
}