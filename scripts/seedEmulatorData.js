// scripts/seedBeneficioDemo.js - Seed script for demo data
// Esta versión está adaptada para usar con emuladores de Firebase

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, query, where, deleteDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase para emuladores
const firebaseConfig = {
  projectId: 'pergamino-app',
  // No se necesitan más credenciales para emuladores
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configure emulators
const { connectFirestoreEmulator } = require('firebase/firestore');
connectFirestoreEmulator(db, 'localhost', 8080);

// Configuración de seed
const SERIAL_PREFIX = "SER-";
const SERIAL_PAD = 4;
const COUNT = 20;

// Seed data - 20 demo benefit tickets
async function seedBenefits() {
  console.log('🔥 Conectando a emuladores de Firebase...');
  
  try {
    console.log('✅ Conectado a emuladores de Firebase');
    
    // Clean existing seriales if any
    const existingQuery = query(collection(db, 'seriales'), where('prefix', '==', 'SER-'));
    const existingDocs = await getDocs(existingQuery);
    
    const deletePromises = [];
    existingDocs.forEach(docRef => {
      console.log(`🗑️ Eliminando serial existente: ${docRef.id}`);
      deletePromises.push(deleteDoc(doc(db, 'seriales', docRef.id)));
    });
    
    await Promise.all(deletePromises);
    console.log(`✅ Eliminados ${deletePromises.length} seriales existentes`);
    
    // Create beneficio document
    const beneficioId = 'beneficio-demo-' + Date.now();
    await setDoc(doc(db, 'beneficios', beneficioId), {
      nombre: 'Café Gratis',
      descripcion: 'Canjea este código por un café americano gratis',
      validoDesde: new Date(),
      validoHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      estado: 'activo',
      createdAt: new Date(),
    });
    
    console.log(`✅ Creado beneficio: ${beneficioId}`);
    
    // Create 20 serial codes
    const serialPromises = [];
    
    for (let i = 1; i <= COUNT; i++) {
      const serialCode = `${SERIAL_PREFIX}${i.toString().padStart(SERIAL_PAD, '0')}`;
      const serialId = serialCode;
      
      serialPromises.push(
        setDoc(doc(db, 'seriales', serialId), {
          codigo: serialCode,
          beneficioId,
          estado: 'activo', // activo, usado, cancelado
          prefix: SERIAL_PREFIX,
          createdAt: new Date(),
        })
      );
    }
    
    await Promise.all(serialPromises);
    console.log(`✅ Creados ${COUNT} seriales para beneficio ${beneficioId}`);
    
    console.log('✨ Seed completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
  }
}

// Run the seed function
seedBenefits();
