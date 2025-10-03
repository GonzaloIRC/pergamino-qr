// createTestUser.js
// Script sencillo para crear un usuario de prueba en los emuladores de Firebase Auth

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} = require('firebase/auth');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno manualmente desde .env.local de admin-web
const envPath = path.join(__dirname, '..', 'apps', 'admin-web', '.env.local');
const env = {};

try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    // Ignorar comentarios y líneas vacías
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    }
  });
  console.log('Variables de entorno cargadas correctamente');
} catch (error) {
  console.warn('Error al cargar variables de entorno:', error.message);
}

// Configuración de Firebase usando variables de entorno leídas
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-pergamino.firebaseapp.com",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-pergamino",
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-pergamino.appspot.com",
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456789"
};

async function createAndVerifyUser() {
  try {
    // Comprobar si debemos usar emuladores
    const useEmulators = process.env.USE_FIREBASE_EMULATORS === 'true';
    console.log("¿Usar emuladores?", useEmulators);

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    // Conectar al emulador de autenticación solo si se especifica
    if (useEmulators) {
      connectAuthEmulator(auth, "http://localhost:9099");
      console.log("Conectado al emulador de autenticación");
    } else {
      console.log("Iniciando proceso para Firebase real");
    }
    
    // Crear usuario
    try {
      console.log("Intentando crear usuario admin@local.test...");
      const userCredential = await createUserWithEmailAndPassword(auth, "admin@local.test", "Admin123!");
      console.log("Usuario creado exitosamente:", userCredential.user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log("El usuario ya existe, intentando iniciar sesión...");
        const signInResult = await signInWithEmailAndPassword(auth, "admin@local.test", "Admin123!");
        console.log("Inicio de sesión exitoso:", signInResult.user.uid);
      } else {
        throw error;
      }
    }
    
    console.log("Proceso completado exitosamente");
  } catch (error) {
    console.error("Error en el proceso:", error);
  }
}

createAndVerifyUser();