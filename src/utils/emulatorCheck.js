// src/utils/emulatorCheck.js
import { useEmulators } from '../services/firebaseClient';
import { db, auth } from '../services/firebaseClient';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function checkEmulatorConfig() {
  // Información básica de configuración
  console.log('====== EMULATOR CHECK ======');
  console.log(`useEmulators: ${useEmulators ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}`);
  
  if (useEmulators) {
    console.log(`Firestore Host: ${process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost'}`);
    console.log(`Firestore Port: ${process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080'}`);
    console.log(`Auth Host: ${process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost'}`);
    console.log(`Auth Port: ${process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099'}`);
  }
  
  // Estado de las conexiones
  console.log('\n====== CONEXIONES ======');
  console.log(`Firestore: ${db._databaseId ? '✅' : '❌'}`);
  console.log(`Auth: ${auth ? '✅' : '❌'}`);

  return {
    emulators: useEmulators,
    status: {
      firestore: db._databaseId ? 'ok' : 'error',
      auth: auth ? 'ok' : 'error'
    }
  };
}

export function mockAuthForTesting() {
  if (useEmulators) {
    console.log('🛠 Configurando autenticación mock para testing...');
    
    // Usuario de prueba
    const mockUser = {
      uid: 'mock-user-123',
      email: 'test@example.com',
      displayName: 'Usuario de Prueba',
      role: 'waiter' // Rol para pruebas
    };
    
    // Sobrescribir métodos de autenticación si estamos en emuladores
    auth.currentUser = mockUser;
    auth.onAuthStateChanged = (callback) => {
      if (callback) callback(mockUser);
      return () => {}; // unsubscribe function
    };
    
    console.log('✅ Usuario mock configurado:', mockUser);
    return mockUser;
  }
  
  console.log('❌ No se configuró autenticación mock (emuladores desactivados)');
  return null;
}