// scripts/seedCustomer.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { createCustomerWithDNI } from '../packages/shared-firebase/customer.js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno si hay un archivo .env disponible
try {
  dotenv.config({ path: '.env.local' });
  console.log('Variables de entorno cargadas desde .env.local');
} catch (error) {
  console.log('No se pudo cargar .env.local, usando variables de entorno del sistema');
}

// Configuración de Firebase - se toma de las variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "demo-pergamino",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
console.log('Inicializando Firebase con projectId:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);

// Configuración de emuladores si las variables de entorno están presentes
const auth = getAuth(app);
const db = getFirestore(app);

// Detectar si estamos en modo emulador
const isUsingEmulator = !!process.env.FIREBASE_AUTH_EMULATOR_HOST || !!process.env.FIRESTORE_EMULATOR_HOST;

if (isUsingEmulator) {
  console.log('Modo emulador detectado, conectando a emuladores...');
  
  // Conectar a Auth Emulator si la variable está definida
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    const [host, port] = process.env.FIREBASE_AUTH_EMULATOR_HOST.split(':');
    console.log(`Conectando a Auth Emulator en ${host}:${port}`);
    connectAuthEmulator(auth, `http://${host}:${port}`, { disableWarnings: true });
  }
  
  // Conectar a Firestore Emulator si la variable está definida
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
    console.log(`Conectando a Firestore Emulator en ${host}:${port}`);
    connectFirestoreEmulator(db, host, parseInt(port));
  }
} else {
  console.log('Usando servicios de Firebase en la nube');
}

// Función principal para crear cliente demo
(async () => {
  const auth = getAuth(app);
  
  try {
    console.log('Intentando crear usuario cliente@test.com...');
    await createUserWithEmailAndPassword(auth, 'cliente@test.com', 'Cliente123!');
    console.log('Usuario creado exitosamente');
  } catch (error) {
    console.log('El usuario ya existe, iniciando sesión...');
    await signInWithEmailAndPassword(auth, 'cliente@test.com', 'Cliente123!');
    console.log('Sesión iniciada');
  }
  
  try {
    console.log('Creando cliente con DNI...');
    await createCustomerWithDNI({ dni: '12345678', displayName: 'Cliente Demo' });
    console.log('Cliente 12345678 creado exitosamente');
  } catch (error) {
    console.error('Error al crear cliente:', error.message);
  }
  
  // Cerrar la conexión
  process.exit(0);
})().catch(error => {
  console.error('Error en el proceso:', error);
  process.exit(1);
});