// scripts/seedFraudScenario.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, connectFirestoreEmulator, collection, addDoc, 
  serverTimestamp, doc, setDoc, getDoc
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Cargar variables de entorno si hay un archivo .env disponible
try {
  dotenv.config({ path: '.env.local' });
  console.log('Variables de entorno cargadas desde .env.local');
} catch (error) {
  console.log('No se pudo cargar .env.local, usando variables de entorno del sistema');
}

// Configuración de Firebase - se toma de las variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "demo-pergamino",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
console.log('Inicializando Firebase con projectId:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);

// Configuración de emuladores si las variables de entorno están presentes
const auth = getAuth(app);
const db = getFirestore(app);

// Detectar si estamos en modo emulador
const isUsingEmulator = !!process.env.FIREBASE_AUTH_EMULATOR_HOST || !!process.env.FIRESTORE_EMULATOR_HOST;

if (isUsingEmulator) {
  console.log('Modo emulador detectado, conectando a emuladores...');
  
  // Conectar a Auth Emulator si la variable está definida
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    const [host, port] = process.env.FIREBASE_AUTH_EMULATOR_HOST.split(':');
    console.log(`Conectando a Auth Emulator en ${host}:${port}`);
    connectAuthEmulator(auth, `http://${host}:${port}`, { disableWarnings: true });
  }
  
  // Conectar a Firestore Emulator si la variable está definida
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
    console.log(`Conectando a Firestore Emulator en ${host}:${port}`);
    connectFirestoreEmulator(db, host, parseInt(port));
  }
} else {
  console.log('Usando servicios de Firebase en la nube');
}

// Crear configuración global de límites si no existe
async function createDefaultLimits() {
  try {
    const configRef = doc(db, 'Ajustes', 'global');
    const configSnap = await getDoc(configRef);
    
    if (!configSnap.exists()) {
      await setDoc(configRef, {
        LIMITS_PER_WEEK: 1,
        COOLDOWN_MIN: 1, // Para pruebas, solo 1 minuto de cooldown
        updated: serverTimestamp()
      });
      console.log('Configuración global creada con valores por defecto');
    } else {
      await setDoc(configRef, {
        LIMITS_PER_WEEK: 1,
        COOLDOWN_MIN: 1, // Para pruebas, solo 1 minuto de cooldown
        updated: serverTimestamp()
      }, { merge: true });
      console.log('Configuración global actualizada');
    }
  } catch (error) {
    console.error('Error al crear configuración global:', error);
  }
}

// Crear usuario de prueba
async function createTestUser(email, password, dni, displayName) {
  try {
    // Crear o iniciar sesión con el usuario
    let userCredential;
    try {
      console.log(`Creando usuario ${email}...`);
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(`El usuario ${email} ya existe, iniciando sesión...`);
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }
    
    const uid = userCredential.user.uid;
    console.log(`Usuario autenticado: ${email} (${uid})`);
    
    // Crear registro de cliente
    const clienteRef = doc(db, 'Clientes', dni);
    await setDoc(clienteRef, {
      dni,
      uid,
      displayName,
      createdAt: Date.now(),
      updatedAt: serverTimestamp()
    });
    console.log(`Cliente creado para DNI ${dni}`);
    
    // Crear perfil
    const perfilRef = doc(db, 'Perfiles', uid);
    await setDoc(perfilRef, {
      dni,
      displayName,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log(`Perfil actualizado para ${displayName}`);
    
    return { uid, email, dni, displayName };
  } catch (error) {
    console.error(`Error al crear usuario ${email}:`, error);
    throw error;
  }
}

// Generar ID de dispositivo simulado
function generateDeviceId() {
  return crypto.randomBytes(8).toString('hex');
}

// Crear registros en historial para simular escenarios de fraude
async function createFraudScenarios() {
  try {
    // Establecer configuración de límites
    await createDefaultLimits();
    
    // 1. Crear usuario de prueba 1
    const user1 = await createTestUser('fraud1@test.com', 'Test123!', '11223344', 'Usuario Prueba 1');
    
    // 2. Crear usuario de prueba 2 (para escenario multi-cuenta)
    const user2 = await createTestUser('fraud2@test.com', 'Test123!', '55667788', 'Usuario Prueba 2');
    
    // Generar deviceId para escenario multi-cuenta
    const sharedDeviceId = generateDeviceId();
    console.log(`DeviceId compartido para escenario multi-cuenta: ${sharedDeviceId}`);
    
    const historialRef = collection(db, 'Historial');
    
    // Escenario 1: Límite semanal excedido
    // Primero creamos una operación de canje para el usuario 1
    await addDoc(historialRef, {
      tipo: 'redemption',
      dni: user1.dni,
      uid: user1.uid,
      beneficioId: 'bnf001',
      deviceId: generateDeviceId(),
      ts: serverTimestamp(),
      nonce: crypto.randomBytes(8).toString('hex')
    });
    console.log(`Escenario 1: Primera operación de canje creada para ${user1.dni}`);
    
    // Esperamos 2 segundos para que se registre la primera operación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Escenario 2: Violación de cooldown
    // Intentamos crear otra operación rápidamente para el mismo usuario (debe ser bloqueada por cooldown)
    await addDoc(historialRef, {
      tipo: 'redemption',
      dni: user1.dni,
      uid: user1.uid,
      beneficioId: 'bnf002',
      deviceId: generateDeviceId(),
      ts: serverTimestamp(),
      nonce: crypto.randomBytes(8).toString('hex')
    });
    console.log(`Escenario 2: Segunda operación rápida (cooldown) creada para ${user1.dni}`);
    
    // Esperamos 2 segundos más
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Escenario 3: Multi-cuenta (mismo deviceId, diferentes DNIs)
    // Crear operación para usuario 1 con el deviceId compartido
    await addDoc(historialRef, {
      tipo: 'accumulation',
      dni: user1.dni,
      uid: user1.uid,
      valor: 100,
      deviceId: sharedDeviceId,
      ts: serverTimestamp(),
      nonce: crypto.randomBytes(8).toString('hex')
    });
    console.log(`Escenario 3a: Operación desde dispositivo compartido para ${user1.dni}`);
    
    // Esperamos 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Crear operación para usuario 2 con el mismo deviceId compartido
    await addDoc(historialRef, {
      tipo: 'accumulation',
      dni: user2.dni,
      uid: user2.uid,
      valor: 150,
      deviceId: sharedDeviceId,
      ts: serverTimestamp(),
      nonce: crypto.randomBytes(8).toString('hex')
    });
    console.log(`Escenario 3b: Operación desde dispositivo compartido para ${user2.dni}`);
    
    // Escenario 4: Crear un serial para el escenario de emitidoA
    const serialRef = doc(db, 'BeneficioSeriales', 'SRL' + crypto.randomBytes(4).toString('hex'));
    await setDoc(serialRef, {
      beneficioId: 'bnf003',
      estado: 'activo',
      emitidoA: user1.dni, // Asignado específicamente a user1
      creado: serverTimestamp()
    });
    console.log(`Escenario 4: Serial creado asignado a ${user1.dni}`);
    
    console.log('\nEscenarios de fraude generados exitosamente.');
    console.log('Usa estos usuarios para probar los guardrails:');
    console.log(`- Usuario 1: ${user1.email} / Test123! (DNI: ${user1.dni})`);
    console.log(`- Usuario 2: ${user2.email} / Test123! (DNI: ${user2.dni})`);
    console.log('\nPara probar los guardrails:');
    console.log('1. Intenta canjear con el usuario 1 (debería ser bloqueado por límite semanal)');
    console.log('2. Intenta canjear con el usuario 1 (debería ser bloqueado por cooldown)');
    console.log('3. Usa el mismo dispositivo con ambos usuarios (debería generar alerta de multi-cuenta)');
    
    return { user1, user2, sharedDeviceId };
  } catch (error) {
    console.error('Error al crear escenarios de fraude:', error);
    throw error;
  }
}

// Ejecutar el script
(async () => {
  try {
    await createFraudScenarios();
    console.log('Script completado exitosamente');
  } catch (error) {
    console.error('Error en el script:', error);
  } finally {
    process.exit(0);
  }
})();