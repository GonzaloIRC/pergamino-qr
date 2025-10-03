// Verificar que el usuario admin existe en Firebase real
// Para usar este script:
// 1. Instalar firebase-admin: npm install firebase-admin
// 2. Colocar el archivo de credenciales de servicio de Firebase en serviceAccountKey.json
// 3. Ejecutar: node verify-admin-user.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Ruta al archivo de credenciales de servicio
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Verificar si el archivo existe
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Archivo serviceAccountKey.json no encontrado.');
  console.error('Por favor, descarga las credenciales de servicio de la consola de Firebase:');
  console.error('1. Ve a https://console.firebase.google.com/');
  console.error('2. Selecciona tu proyecto');
  console.error('3. Ve a Configuración del proyecto > Cuentas de servicio');
  console.error('4. Genera una nueva clave privada');
  console.error('5. Guarda el archivo como serviceAccountKey.json en este directorio');
  process.exit(1);
}

// Inicializar app de Firebase Admin con credenciales
try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Conexión a Firebase Admin SDK establecida correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin SDK:', error);
  process.exit(1);
}

// Email del usuario admin a verificar
const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@local.test';

async function checkAdminUser() {
  try {
    console.log(`📋 Verificando si existe el usuario con email: ${adminEmail}...`);
    
    // Buscar el usuario por email
    const userRecord = await admin.auth().getUserByEmail(adminEmail);
    console.log('✅ Usuario encontrado:', userRecord.uid);
    
    // Verificar si el usuario tiene rol de admin en Firestore
    const db = admin.firestore();
    const roleDoc = await db.collection('roles').doc(userRecord.uid).get();
    
    if (roleDoc.exists) {
      const userData = roleDoc.data();
      console.log('📊 Datos del usuario:', userData);
      
      if (userData.role === 'admin') {
        console.log('✅ El usuario tiene rol de administrador confirmado');
      } else {
        console.log('⚠️ El usuario existe pero NO tiene rol de administrador.');
        console.log('Rol actual:', userData.role);
        
        // Preguntar si desea actualizar el rol a admin
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question('¿Deseas actualizar el rol a admin? (s/n): ', async (answer) => {
          if (answer.toLowerCase() === 's') {
            await db.collection('roles').doc(userRecord.uid).update({
              role: 'admin',
              updatedAt: new Date().toISOString()
            });
            console.log('✅ Rol actualizado a admin correctamente');
          }
          readline.close();
          process.exit(0);
        });
        
        return; // Salir para esperar respuesta
      }
    } else {
      console.log('⚠️ El usuario existe pero no tiene un documento en la colección "roles"');
      
      // Crear documento de roles para este usuario
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('¿Deseas crear el documento de roles como admin? (s/n): ', async (answer) => {
        if (answer.toLowerCase() === 's') {
          await db.collection('roles').doc(userRecord.uid).set({
            role: 'admin',
            email: adminEmail,
            createdAt: new Date().toISOString()
          });
          console.log('✅ Documento de roles creado correctamente con rol admin');
        }
        readline.close();
        process.exit(0);
      });
      
      return; // Salir para esperar respuesta
    }
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('⚠️ El usuario admin no existe en Firebase Authentication');
      
      // Preguntar si desea crear el usuario
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('¿Deseas crear el usuario admin? (s/n): ', async (answer) => {
        if (answer.toLowerCase() === 's') {
          try {
            // Crear el usuario
            const userRecord = await admin.auth().createUser({
              email: adminEmail,
              password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
              emailVerified: true
            });
            
            console.log('✅ Usuario creado correctamente:', userRecord.uid);
            
            // Crear el documento de roles
            const db = admin.firestore();
            await db.collection('roles').doc(userRecord.uid).set({
              role: 'admin',
              email: adminEmail,
              createdAt: new Date().toISOString()
            });
            
            console.log('✅ Documento de roles creado correctamente');
            
          } catch (createError) {
            console.error('❌ Error al crear el usuario:', createError);
          }
        }
        
        readline.close();
        process.exit(0);
      });
      
    } else {
      console.error('❌ Error al verificar el usuario admin:', error);
      process.exit(1);
    }
  }
}

// Ejecutar la función principal
checkAdminUser();