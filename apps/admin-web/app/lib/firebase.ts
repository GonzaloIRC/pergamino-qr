// apps/admin-web/app/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { 
  getAuth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable emulators if configured in environment
const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

// Avoid connecting twice during HMR (Hot Module Replacement)
let isEmulatorConnected = false;

// Debug message to confirm values
console.log('Configuración de Firebase:', {
  useEmulators,
  isDevMode: process.env.NODE_ENV === 'development',
  usingRealFirebase: !useEmulators,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

if (useEmulators && !isEmulatorConnected) {
  const authHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost';
  const authPort = parseInt(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099', 10);
  const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost';
  const firestorePort = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080', 10);
  
  console.log('Conectando a emuladores:', { authHost, authPort, firestoreHost, firestorePort });

  try {
    connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });
    connectFirestoreEmulator(db, firestoreHost, firestorePort);
    isEmulatorConnected = true;
    console.log('Firebase emulators connected successfully');
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}

// Auth functions
export const signIn = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);

export const signOut = () => firebaseSignOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) => 
  onAuthStateChanged(auth, callback);

export { app, auth, db };