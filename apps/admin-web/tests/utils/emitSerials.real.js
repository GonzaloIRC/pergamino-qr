/**
 * Script para generar códigos seriales en Firestore
 * para pruebas con Firebase real.
 */
const admin = require('firebase-admin');
const { TEST_NS, getTestCollection } = require('./testNamespace');
const { seedOneClient } = require('./seedOneClient.real');

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
 * Genera una serie de códigos seriales para las pruebas
 * @param {number} count - Número de seriales a generar
 * @param {string} clientId - ID del cliente asociado (opcional)
 */
async function emitSerials(count = 3, clientId = null) {
  try {
    // Si no se proporciona un clientId, crear un cliente nuevo
    let client;
    if (!clientId) {
      client = await seedOneClient();
      clientId = client.clientId;
    }
    
    const serialsCollection = getTestCollection('serials');
    const batch = db.batch();
    const serials = [];
    
    // Generar códigos seriales
    for (let i = 0; i < count; i++) {
      const code = `${TEST_NS}-${generateRandomCode(8)}`;
      const serialRef = db.collection(serialsCollection).doc(code);
      
      const serialData = {
        code,
        clientId,
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(serialRef, serialData);
      serials.push(code);
    }
    
    // Guardar todos los seriales de una vez
    await batch.commit();
    
    console.log(`${count} códigos seriales creados en ${serialsCollection}`);
    console.log('Ejemplos:', serials.slice(0, 3));
    
    return {
      serialsCollection,
      clientId,
      count,
      serials
    };
  } catch (error) {
    console.error('Error al generar seriales:', error);
    throw error;
  }
}

/**
 * Genera un código aleatorio de la longitud especificada
 * @param {number} length - Longitud del código
 * @returns {string} - Código aleatorio
 */
function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

// Procesar argumentos de línea de comandos
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--count=')) {
      params.count = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--client=')) {
      params.clientId = arg.split('=')[1];
    }
  });
  
  return params;
}

// Si se ejecuta directamente
if (require.main === module) {
  const params = parseArgs();
  
  emitSerials(params.count || 3, params.clientId)
    .then((result) => {
      console.log('Script completado con éxito. Resultados:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { emitSerials };