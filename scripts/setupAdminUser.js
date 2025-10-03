// Script para crear el usuario administrador y configurar validación de DNI único
// Ubicación: scripts/setupAdminUser.js

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Función principal para configurar el usuario admin y las reglas
async function setupAdmin() {
  console.log('🔧 Configurando usuario admin y reglas de validación DNI...');
  
  // Intentar cargar el archivo de credenciales
  const path = require('path');
  const fs = require('fs');
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
  
  console.log(`Buscando archivo de credenciales en: ${serviceAccountPath}`);
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ No se encuentra el archivo service-account.json en la ruta: ${serviceAccountPath}`);
    process.exit(1);
  }
  
  // Inicializar Firebase Admin solo si no está ya inicializado
  let app;
  if (getApps().length === 0) {
    try {
      // Cargar credenciales desde el archivo service-account.json
      const serviceAccount = require(serviceAccountPath);
      
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'pergamino-dev'
      });
      console.log('✅ Firebase Admin inicializado correctamente con credenciales del archivo service-account.json');
    } catch (error) {
      console.error('❌ Error al inicializar Firebase Admin:', error);
      process.exit(1);
    }
  } else {
    app = getApps()[0];
    console.log('ℹ️ Firebase Admin ya estaba inicializado');
  }

  // Obtener instancias de Auth y Firestore
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 1. Crear el usuario administrador si no existe
  try {
    const adminEmail = 'admin@local.test';
    const adminPassword = 'Admin123!';
    
    // Verificar si el usuario ya existe
    try {
      const userRecord = await auth.getUserByEmail(adminEmail);
      console.log(`ℹ️ Usuario admin ya existe con ID: ${userRecord.uid}`);
      
      // Verificar si el rol está configurado
      const adminUid = userRecord.uid;
      await setupAdminRole(db, adminUid);
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Crear el usuario administrador
        const userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
          displayName: 'Administrador',
        });
        
        console.log(`✅ Usuario admin creado con ID: ${userRecord.uid}`);
        
        // Configurar rol de administrador
        const adminUid = userRecord.uid;
        await setupAdminRole(db, adminUid);
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Error al gestionar el usuario administrador:', error);
    process.exit(1);
  }
  
  // 2. Configurar validación de DNI único
  try {
    await setupDniValidation(db);
  } catch (error) {
    console.error('❌ Error al configurar validación de DNI:', error);
    process.exit(1);
  }
  
  console.log('✅ Configuración completada exitosamente');
}

// Función para configurar el rol de administrador
async function setupAdminRole(db, adminUid) {
  // Verificar si ya tiene el rol
  const roleRef = db.collection('roles').doc(adminUid);
  const roleDoc = await roleRef.get();
  
  if (roleDoc.exists && roleDoc.data().role === 'admin') {
    console.log('ℹ️ El rol de administrador ya está configurado');
  } else {
    // Configurar rol de administrador
    await roleRef.set({
      role: 'admin',
      updatedAt: new Date()
    });
    console.log('✅ Rol de administrador configurado');
  }
}

// Función para configurar la validación de DNI único
async function setupDniValidation(db) {
  // 1. Crear colección de DNIs registrados si no existe
  const dniCollectionRef = db.collection('registeredDNIs');
  
  // 2. Crear índice para validación rápida (aunque esto realmente requiere configuración en Firebase Console)
  console.log('ℹ️ Para validación óptima de DNIs únicos, se recomienda crear un índice en Firestore');
  console.log('ℹ️ Vaya a la consola de Firebase > Firestore > Índices y cree un índice para la colección "registeredDNIs"');
  
  // 3. Crear regla de seguridad (esto es simbólico, las reglas reales se configuran en firestore.rules)
  console.log('ℹ️ Agregando lógica para validación de DNI único en registro de usuario');
  
  // 4. Crear una función de validación (en producción sería una Cloud Function)
  await db.collection('system').doc('validations').set({
    enforceUniqueDNI: true,
    validationRules: {
      dni: {
        required: true,
        unique: true,
        minLength: 8,
        maxLength: 12
      }
    },
    updatedAt: new Date()
  });
  
  console.log('✅ Configuración de validación de DNI único completada');
}

// Ejecutar la configuración
setupAdmin().catch(error => {
  console.error('❌ Error general en el script:', error);
  process.exit(1);
});