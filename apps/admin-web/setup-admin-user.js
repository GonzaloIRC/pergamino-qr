const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, doc, getDoc, setDoc } = require('firebase/firestore');

// Configuration from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyCeQU3rKVlDKhWkyF5mFqDp9NYDMPAfOt4",
  authDomain: "codigos-pergamino.firebaseapp.com",
  projectId: "codigos-pergamino",
  storageBucket: "codigos-pergamino.firebasestorage.app",
  messagingSenderId: "849867276398",
  appId: "1:849867276398:web:0d9273b3c5130447f3a67f",
  measurementId: "G-GT982TM94R"
};

// Admin user credentials
const adminEmail = "admin@local.test";
const adminPassword = "Admin123!";

async function setupAdminUser() {
  console.log("Inicializando Firebase...");
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // First try to sign in with the admin account
    console.log(`Intentando iniciar sesión con ${adminEmail}...`);
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log("✅ El usuario admin ya existe y las credenciales son válidas.");
    } catch (error) {
      // If login fails, try to create the account
      console.log("Usuario no encontrado o credenciales incorrectas, creando nueva cuenta...");
      
      try {
        await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("✅ Usuario admin creado exitosamente.");
      } catch (createError) {
        console.log(`Error al crear usuario: ${createError.message}`);
        throw createError;
      }
    }

    // Set admin role regardless of whether we created or signed in
    const userRef = doc(db, "users", adminEmail);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.role === "admin") {
        console.log("✅ El usuario ya tiene rol de administrador.");
      } else {
        await setDoc(userRef, { role: "admin" }, { merge: true });
        console.log("✅ Rol de administrador asignado al usuario.");
      }
    } else {
      await setDoc(userRef, { 
        email: adminEmail,
        role: "admin",
        createdAt: new Date().toISOString()
      });
      console.log("✅ Documento de usuario creado con rol de administrador.");
    }

    console.log("\n🎉 CONFIGURACIÓN COMPLETADA:");
    console.log(`- Email: ${adminEmail}`);
    console.log(`- Password: ${adminPassword}`);
    console.log(`- Role: admin`);
    
  } catch (error) {
    console.error("❌ Error durante la configuración:", error);
  }
}

setupAdminUser().finally(() => {
  console.log("Proceso finalizado.");
});