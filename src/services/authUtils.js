/**
 * Utilidades para pruebas del sistema de autenticación
 */

import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from './firebaseClient';

/**
 * Inicia sesión para pruebas con un usuario predeterminado
 * @returns {Promise<Object>} El resultado de la autenticación
 */
export async function testLogin() {
  try {
    const auth = getAuth(app);
    const email = process.env.EXPO_PUBLIC_TEST_USER_EMAIL || 'test@pergamino.app';
    const password = process.env.EXPO_PUBLIC_TEST_USER_PASSWORD || 'testPassword123';
    
    // Intenta iniciar sesión con las credenciales de prueba
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Error en testLogin:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cierra la sesión actual
 * @returns {Promise<Object>} El resultado del cierre de sesión
 */
export async function testLogout() {
  try {
    const auth = getAuth(app);
    await signOut(auth);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error en testLogout:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
