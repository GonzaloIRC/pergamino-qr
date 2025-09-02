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

// ⚠️ Tus credenciales reales (producción) — ya me las diste:


// --- CONFIG REAL (la tuya) ---
const firebaseConfig = {
  apiKey: 'AIzaSyCeQU3rKVlDKhWkyF5mFqDp9NYDMPAfOt4',
  authDomain: 'codigos-pergamino.firebaseapp.com',
  projectId: 'codigos-pergamino',
  storageBucket: 'codigos-pergamino.firebasestorage.app',
  messagingSenderId: '849867276398',
  appId: '1:849867276398:web:0d9273b3c5130447f3a67f',
  measurementId: 'G-GT982TM94R',
};

// App singleton (sin duplicados)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth singleton + persistencia RN
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

// Firestore
const db = getFirestore(app);

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
