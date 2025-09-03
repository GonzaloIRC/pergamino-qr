// src/utils/firebaseCredentialCheck.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Verifica que las credenciales de Firebase sean válidas
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function checkFirebaseCredentials() {
  // Credenciales actuales para verificar
  const currentCredentials = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCeQU3rKVlDKhWkyF5mFqDp9NYDMPAfOt4',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'codigos-pergamino.firebaseapp.com',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'codigos-pergamino',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'codigos-pergamino.firebasestorage.app',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '849867276398',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:849867276398:web:0d9273b3c5130447f3a67f'
  };

  console.log('Verificando credenciales Firebase:', {
    apiKey: currentCredentials.apiKey ? "Presente" : "Ausente",
    projectId: currentCredentials.projectId,
    authDomain: currentCredentials.authDomain
  });

  try {
    // Inicializar una instancia temporal de Firebase con estas credenciales
    const app = initializeApp(currentCredentials, 'credentialCheck');
    const auth = getAuth(app);
    
    // Si estamos usando emuladores, conectamos a ellos
    const useEmulators = process.env.EXPO_PUBLIC_USE_EMULATORS === 'true';
    if (useEmulators) {
      const authHost = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1';
      const authPort = Number(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || 9099);
      console.log(`Usando emulador Auth: ${authHost}:${authPort}`);
      connectAuthEmulator(auth, `http://${authHost}:${authPort}`);
    }
    
    // Intentar inicio de sesión con email/password para verificar conexión
    // Credenciales de prueba
    const testEmail = 'guest@pergamino.test';
    const testPassword = 'pergamino123';
    
    try {
      try {
        // Primero intentamos iniciar sesión
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('Inicio de sesión exitoso con cuenta de prueba');
      } catch (signInError) {
        if (signInError.code === 'auth/user-not-found') {
          // Si no existe el usuario, intentamos crearlo
          console.log('Creando cuenta de prueba...');
          await createUserWithEmailAndPassword(auth, testEmail, testPassword);
          console.log('Cuenta de prueba creada exitosamente');
        } else {
          throw signInError;
        }
      }
      
      return { 
        success: true, 
        message: `Credenciales válidas para el proyecto: ${currentCredentials.projectId}`
      };
    } catch (authError) {
      console.error('Error en auth:', authError);
      return { 
        success: false, 
        message: `Error de autenticación: ${authError.message}\nCodigo: ${authError.code}`
      };
    }
  } catch (error) {
    console.error('Error al verificar credenciales:', error);
    return { 
      success: false, 
      message: `Error al inicializar Firebase: ${error.message}`
    };
  }
}
