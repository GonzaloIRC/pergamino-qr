// createRealUser.js
// Script para crear un usuario de prueba en Firebase real

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} = require('firebase/auth');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCeQU3rKVlDKhWkyF5mFqDp9NYDMPAfOt4",
  authDomain: "codigos-pergamino.firebaseapp.com",
  projectId: "demo-pergamino",
  storageBucket: "codigos-pergamino.appspot.com",
  messagingSenderId: "849867276398",
  appId: "1:849867276398:web:0d9273b3c5130447f3a67f",
  measurementId: "G-GT982TM94R"
};

async function createAndVerifyUser() {
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log("Conectado a Firebase real");
    
    // Crear usuario
    try {
      console.log("Intentando crear usuario admin@local.test...");
      const userCredential = await createUserWithEmailAndPassword(auth, "admin@local.test", "Admin123!");
      console.log("Usuario creado exitosamente:", userCredential.user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log("El usuario ya existe, intentando iniciar sesión...");
        const signInResult = await signInWithEmailAndPassword(auth, "admin@local.test", "Admin123!");
        console.log("Inicio de sesión exitoso:", signInResult.user.uid);
      } else {
        throw error;
      }
    }
    
    console.log("Proceso completado exitosamente");
  } catch (error) {
    console.error("Error en el proceso:", error);
  }
}

createAndVerifyUser();