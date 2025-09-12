/**
 * Script para asignar rol de administrador a un usuario por su UID
 * 
 * Uso: node scripts/seedAdminRole.js <UID>
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Configuración de Firebase desde variables de entorno
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'demo'
};

// Inicializar Firebase
const app = initializeApp(config);
const db = getFirestore(app);

async function assignAdminRole(uid) {
  if (!uid) {
    console.error('Error: Debe proporcionar un UID de usuario');
    console.log('Uso: node scripts/seedAdminRole.js <UID>');
    process.exit(1);
  }

  try {
    // Verificar si el documento de roles ya existe
    const roleRef = doc(db, 'roles', uid);
    const roleDoc = await getDoc(roleRef);
    
    if (roleDoc.exists()) {
      const currentData = roleDoc.data();
      console.log(`El usuario ya tiene asignado el rol: ${currentData.role}`);
      
      // Actualizar solo si no es admin
      if (currentData.role !== 'admin') {
        await setDoc(roleRef, { role: 'admin' }, { merge: true });
        console.log(`✅ Rol actualizado a 'admin' para UID: ${uid}`);
      }
    } else {
      // Crear nuevo documento de roles
      await setDoc(roleRef, { role: 'admin' });
      console.log(`✅ Rol 'admin' asignado a UID: ${uid}`);
    }
  } catch (error) {
    console.error('Error al asignar rol de admin:', error);
    process.exit(1);
  }
}

// Obtener el UID del argumento de línea de comandos
const uid = process.argv[2];
assignAdminRole(uid);
