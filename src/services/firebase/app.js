// filepath: src/services/firebase/app.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  connectAuthEmulator,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Credenciales de Firebase configuradas desde variables de entorno
// cuando están disponibles, o usando valores de respaldo para desarrollo
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'codigos-pergamino.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'codigos-pergamino',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'codigos-pergamino.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '849867276398',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:849867276398:web:0d9273b3c5130447f3a67f',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-GT982TM94R',
};

// App singleton (sin duplicados)
let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  console.log('Firebase inicializado correctamente con projectId:', firebaseConfig.projectId);
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
  // Intentamos inicializar con una configuración mínima para no bloquear la app
  app = getApps().length ? getApp() : initializeApp({
    apiKey: 'AIzaSyCeQU3rKVlDKhWkyF5mFqDp9NYDMPAfOt4',
    projectId: 'codigos-pergamino',
    authDomain: 'codigos-pergamino.firebaseapp.com',
  });
}

// Auth singleton + persistencia RN
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('Firebase Auth inicializado con persistencia');
} catch (error) {
  console.warn('Error al inicializar Auth con persistencia:', error.message);
  try {
    auth = getAuth(app);
    console.log('Firebase Auth inicializado sin persistencia');
  } catch (fallbackError) {
    console.error('Error crítico al inicializar Auth:', fallbackError);
    // Creamos un objeto mock para evitar errores de aplicación
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback) => callback(null),
      signInWithEmailAndPassword: () => Promise.reject(new Error('Auth no disponible')),
      createUserWithEmailAndPassword: () => Promise.reject(new Error('Auth no disponible')),
      signOut: () => Promise.resolve(),
    };
  }
}

// Firestore
let db;
try {
  db = getFirestore(app);
  console.log('Firestore inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firestore:', error);
  // Objeto mock para evitar errores de aplicación
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error('Firestore no disponible')),
        set: () => Promise.reject(new Error('Firestore no disponible')),
      }),
    }),
  };
}

// Emuladores (opcional, controlado por variable)
if (process.env.EXPO_PUBLIC_USE_EMULATORS === 'true') {
  const authHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1';
  const authPort = Number(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || 9099);
  const fsHost   = process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const fsPort   = Number(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || 8080);

  // Si estás en dispositivo físico, pon aquí la IP LAN de tu PC en las variables .env
  connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });
  connectFirestoreEmulator(db, fsHost, fsPort);
}

export { app, auth, db };
