// Script para registrar un nuevo usuario cliente con validación de DNI único
// Ubicación: scripts/registerUser.js

const { initializeApp, getApps } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, collection, query, where, getDocs } = require('firebase/firestore');
const firebaseConfig = require('../apps/admin-web/firebase/firebaseConfig');

// Función para inicializar Firebase
function initializeFirebase() {
  // Inicializar Firebase solo si no está ya inicializado
  if (getApps().length === 0) {
    try {
      const app = initializeApp(firebaseConfig);
      console.log('✅ Firebase inicializado correctamente');
      return app;
    } catch (error) {
      console.error('❌ Error al inicializar Firebase:', error);
      process.exit(1);
    }
  } else {
    console.log('ℹ️ Firebase ya estaba inicializado');
    return getApps()[0];
  }
}

// Función para validar DNI único
async function isDniUnique(db, dni) {
  try {
    // Verificar si el DNI ya existe en la colección de usuarios
    const usersRef = collection(db, 'clients');
    const q = query(usersRef, where('dni', '==', dni));
    const querySnapshot = await getDocs(q);
    
    // También verificar en la colección registeredDNIs (que funciona como índice)
    const dniRef = collection(db, 'registeredDNIs');
    const dniQuery = query(dniRef, where('dni', '==', dni));
    const dniSnapshot = await getDocs(dniQuery);
    
    return querySnapshot.empty && dniSnapshot.empty;
  } catch (error) {
    console.error('❌ Error al verificar DNI:', error);
    throw error;
  }
}

// Función principal para registrar un nuevo usuario
async function registerUser(userData) {
  console.log(`🔧 Registrando nuevo usuario: ${userData.email}`);
  
  // Validaciones básicas
  if (!userData.dni || !userData.email || !userData.password || !userData.name) {
    console.error('❌ Datos de usuario incompletos. Se requiere dni, email, password y name.');
    return false;
  }
  
  // Inicializar Firebase
  const app = initializeFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  try {
    // 1. Verificar si el DNI es único
    console.log(`🔍 Verificando si el DNI ${userData.dni} es único...`);
    const dniIsUnique = await isDniUnique(db, userData.dni);
    
    if (!dniIsUnique) {
      console.error(`❌ El DNI ${userData.dni} ya está registrado en el sistema.`);
      return false;
    }
    
    // 2. Crear el usuario en Authentication
    console.log('🔑 Creando cuenta de usuario...');
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    
    // 3. Actualizar el perfil del usuario
    await updateProfile(user, { displayName: userData.name });
    
    // 4. Almacenar los datos del usuario en Firestore
    console.log('💾 Guardando información del usuario...');
    await setDoc(doc(db, 'clients', user.uid), {
      name: userData.name,
      email: userData.email,
      dni: userData.dni,
      phone: userData.phone || '',
      address: userData.address || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      points: 0
    });
    
    // 5. Registrar el DNI en la colección de DNIs registrados (para búsqueda rápida)
    await setDoc(doc(db, 'registeredDNIs', userData.dni), {
      dni: userData.dni,
      userId: user.uid,
      registeredAt: new Date()
    });
    
    console.log(`✅ Usuario registrado exitosamente con ID: ${user.uid}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    return false;
  }
}

// Si se ejecuta directamente desde la línea de comandos
if (require.main === module) {
  // Leer argumentos de la línea de comandos o usar valores predeterminados
  const args = process.argv.slice(2);
  const email = args[0] || 'test@example.com';
  const password = args[1] || 'Test123!';
  const name = args[2] || 'Usuario de Prueba';
  const dni = args[3] || '12345678';
  
  // Registrar el usuario
  registerUser({
    email,
    password,
    name,
    dni
  }).then(success => {
    if (success) {
      console.log('✅ Registro completado con éxito');
      process.exit(0);
    } else {
      console.error('❌ No se pudo completar el registro');
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Error durante el registro:', error);
    process.exit(1);
  });
}

// Exportar la función para uso en otros scripts
module.exports = { registerUser, isDniUnique, initializeFirebase };