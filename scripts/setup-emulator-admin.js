// Script para crear usuario admin en emuladores de Firebase
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  connectAuthEmulator 
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  connectFirestoreEmulator 
} = require('firebase/firestore');

// Firebase config para emuladores
const firebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test-project.firebaseapp.com",
  projectId: "test-project",
  storageBucket: "test-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
};

async function createAdminUser() {
  // Initialize Firebase con config para emuladores
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Conectar a emuladores
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);

  try {
    console.log("Conectado a emuladores de Firebase");
    
    // Intentar crear o usar usuario admin existente
    try {
      console.log("Intentando crear usuario admin@local.test...");
      const userCredential = await createUserWithEmailAndPassword(auth, "admin@local.test", "Admin123!");
      console.log("Usuario admin creado:", userCredential.user.uid);
      
      // Asignar rol de admin
      await setDoc(doc(db, "roles", userCredential.user.uid), {
        role: "admin",
        email: "admin@local.test",
        createdAt: new Date().toISOString()
      });
      console.log("Rol de admin asignado correctamente");
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log("El usuario admin ya existe, iniciando sesión para obtener el UID");
        const signInResult = await signInWithEmailAndPassword(auth, "admin@local.test", "Admin123!");
        console.log("Sesión iniciada como admin:", signInResult.user.uid);
        
        // Verificar si tiene rol de admin, si no asignarlo
        await setDoc(doc(db, "roles", signInResult.user.uid), {
          role: "admin",
          email: "admin@local.test",
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("Rol de admin actualizado o asignado");
      } else {
        throw err;
      }
    }
    
    console.log("Usuario admin@local.test configurado correctamente en emuladores");
  } catch (error) {
    console.error("Error al configurar usuario admin:", error);
    process.exit(1);
  }
}

// Ejecutar la función
createAdminUser()
  .then(() => {
    console.log("Proceso completado exitosamente");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error en el proceso:", err);
    process.exit(1);
  });