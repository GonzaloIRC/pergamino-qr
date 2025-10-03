/**
 * @file firebaseClient.js
 * @description Cliente de Firebase para la aplicación
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from './firebaseConfig';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Funciones de autenticación
 */
export const firebaseAuth = {
  /**
   * Iniciar sesión con email y contraseña
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<UserCredential>} - Credencial del usuario
   */
  login: (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  
  /**
   * Registrar un nuevo usuario
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<UserCredential>} - Credencial del usuario
   */
  register: (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  
  /**
   * Cerrar sesión
   * @returns {Promise<void>}
   */
  logout: () => {
    return signOut(auth);
  },
  
  /**
   * Observador de cambios en el estado de autenticación
   * @param {function} callback - Función a llamar cuando cambie el estado
   * @returns {function} - Función para dejar de observar
   */
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

export default { auth, db, storage, firebaseAuth };