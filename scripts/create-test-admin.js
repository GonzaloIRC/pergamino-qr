// Script para crear un usuario admin de prueba en los emuladores de Firebase
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json');

// Inicializar con credenciales de administrador
try {
  admin.initializeApp({
    projectId: 'demo-pergamino',
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  // Si ya está inicializado, usar la app existente
  console.log('Firebase admin ya está inicializado o hubo un error:', error.message);
}

// Configurar para usar emuladores
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

async function createTestUser() {
  try {
    // Crear usuario de prueba
    const userRecord = await admin.auth().createUser({
      email: 'admin@local.test',
      password: 'Admin123!',
      displayName: 'Admin Test User',
      emailVerified: true,
    });
    
    console.log('Usuario de prueba creado:', userRecord.uid);
    
    // Asignar claims de admin
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log('Claims de administrador asignados correctamente');
    
    // Crear documento de usuario en Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: 'admin@local.test',
      displayName: 'Admin Test User',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('Documento de usuario creado en Firestore');
    
    return userRecord.uid;
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
    if (error.code === 'auth/email-already-exists') {
      console.log('El usuario ya existe, intentando recuperar...');
      try {
        const user = await admin.auth().getUserByEmail('admin@local.test');
        console.log('Usuario existente encontrado:', user.uid);
        return user.uid;
      } catch (e) {
        console.error('Error al recuperar usuario:', e);
      }
    }
    throw error;
  }
}

createTestUser()
  .then((uid) => {
    console.log('Proceso completado. UID:', uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el proceso:', error);
    process.exit(1);
  });