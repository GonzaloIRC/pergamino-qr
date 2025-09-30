/**
 * Script para crear un cliente de prueba en Firestore
 * para pruebas con Firebase real.
 */
const admin = require('firebase-admin');
const { TEST_NS, getTestCollection } = require('./testNamespace');

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

/**
 * Crea un cliente de prueba en Firestore
 */
async function seedOneClient() {
  try {
    const clientsCollection = getTestCollection('clients');
    
    // Generar un cliente con datos mínimos
    const clientData = {
      nombre: `Cliente Prueba ${TEST_NS}`,
      email: 'cliente.prueba@example.com',
      estado: 'activo',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Crear el cliente en Firestore
    const docRef = await db.collection(clientsCollection).add(clientData);
    
    console.log(`Cliente creado en ${clientsCollection} con ID: ${docRef.id}`);
    
    return {
      clientId: docRef.id,
      collection: clientsCollection,
      ...clientData
    };
  } catch (error) {
    console.error('Error al crear cliente de prueba:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  seedOneClient()
    .then((result) => {
      console.log('Script completado con éxito. Resultados:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { seedOneClient };