// src/utils/firebaseConnectionCheck.js
import { auth, db } from '../services/firebase/app';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

/**
 * Verifica la conexión a Firebase Auth y Firestore
 * @returns {Promise<{auth: boolean, firestore: boolean, error: string|null}>}
 */
export async function checkFirebaseConnection() {
  const result = { auth: false, firestore: false, error: null };

  // Credenciales de prueba
  const testEmail = 'guest@pergamino.test';
  const testPassword = 'pergamino123';

  try {
    // 1. Verificar Auth con login de prueba
    console.log('Verificando conexión a Firebase Auth...');
    try {
      const userCred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      if (userCred && userCred.user) {
        result.auth = true;
        console.log('Conexión a Firebase Auth OK');
      }
    } catch (authError) {
      console.error('Error en conexión a Firebase Auth:', authError);
      result.error = `Error Auth: ${authError.message}`;
    }

    // 2. Verificar Firestore con lectura de documento de sistema
    console.log('Verificando conexión a Firestore...');
    try {
      const systemDoc = doc(db, 'system', 'info');
      await getDoc(systemDoc);
      result.firestore = true;
      console.log('Conexión a Firestore OK');
    } catch (firestoreError) {
      console.error('Error en conexión a Firestore:', firestoreError);
      if (!result.error) {
        result.error = `Error Firestore: ${firestoreError.message}`;
      } else {
        result.error += ` | Error Firestore: ${firestoreError.message}`;
      }
    }

    return result;
  } catch (generalError) {
    console.error('Error general al verificar conexiones:', generalError);
    return {
      auth: false,
      firestore: false,
      error: `Error general: ${generalError.message}`
    };
  }
}
