/**
 * Script para crear un usuario administrador en Firebase Auth
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

const auth = adminApp.auth();
const db = adminApp.firestore();

async function seedAdminUser() {
  try {
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@local.test';
    const password = process.env.TEST_ADMIN_PASSWORD || 'Admin123!';
    
    // Verificar si el usuario ya existe
    let userRecord;
    
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`Usuario existente encontrado: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Crear un nuevo usuario
        userRecord = await auth.createUser({
          email,
          password,
          emailVerified: true,
        });
        console.log(`Nuevo usuario creado: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }
    
    // Asignar rol de administrador
    const rolesCollection = getTestCollection('roles');
    await db.collection(rolesCollection).doc(userRecord.uid).set({
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Usuario ${email} configurado con rol de administrador en colección ${rolesCollection}`);
    
    return {
      uid: userRecord.uid,
      email,
      rolesCollection
    };
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  seedAdminUser()
    .then((result) => {
      console.log('Script completado con éxito. Resultados:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { seedAdminUser };