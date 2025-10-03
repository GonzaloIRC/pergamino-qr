// scripts/importCustomers.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { createCustomerWithDNI } from '../packages/shared-firebase/customer.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { parse } from 'csv-parse';

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

// Función para importar clientes desde un archivo CSV
async function importCustomersFromCSV(filePath) {
  // Verificar que el usuario esté autenticado
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('Error: No hay usuario autenticado. Inicia sesión primero con el script seedCustomer.js');
    process.exit(1);
  }

  console.log(`Usuario autenticado: ${currentUser.email} (${currentUser.uid})`);
  
  // Verificar que el archivo exista
  if (!fs.existsSync(filePath)) {
    console.error(`Error: El archivo ${filePath} no existe`);
    process.exit(1);
  }

  // Leer y parsear el archivo CSV
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({
      delimiter: ',',
      columns: true,
      trim: true,
      skip_empty_lines: true
    }));

  const records = [];
  let successCount = 0;
  let errorCount = 0;

  console.log('Procesando archivo CSV...');
  
  for await (const record of parser) {
    records.push(record);
  }

  console.log(`Se encontraron ${records.length} registros en el CSV`);

  // Procesar cada registro del CSV
  for (const [index, record] of records.entries()) {
    const { dni, nombre, telefono } = record;
    
    if (!dni) {
      console.error(`Error en fila ${index + 1}: DNI es requerido`);
      errorCount++;
      continue;
    }

    try {
      await createCustomerWithDNI({
        dni: dni.toString(),
        displayName: nombre || undefined,
        phone: telefono || undefined
      });
      
      console.log(`✅ Cliente creado: DNI ${dni}${nombre ? ` - ${nombre}` : ''}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error al crear cliente con DNI ${dni}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\nResumen de importación:');
  console.log(`Total registros procesados: ${records.length}`);
  console.log(`Clientes creados correctamente: ${successCount}`);
  console.log(`Errores: ${errorCount}`);
}

// Ejecutar la importación si se proporciona la ruta del archivo CSV
const filePath = process.argv[2];
if (!filePath) {
  console.error('Error: Debes proporcionar la ruta al archivo CSV como argumento');
  console.log('Uso: node scripts/importCustomers.js <ruta-al-csv>');
  process.exit(1);
}

// Función principal
(async () => {
  try {
    await importCustomersFromCSV(filePath);
    console.log('Proceso de importación completado');
  } catch (error) {
    console.error('Error en el proceso de importación:', error);
  } finally {
    process.exit(0);
  }
})();