/**
 * Seed directo con Admin SDK para emuladores
 */
const admin = require('firebase-admin');

// Apuntar al emulador
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Inicializar app con Admin SDK
const app = admin.initializeApp({
  projectId: 'demo-pergamino'
});

const db = admin.firestore();

// Configuración de seed
const SERIAL_PREFIX = "SER-";
const SERIAL_PAD = 4;
const COUNT = 20;

async function main() {
  console.log('🔥 Conectando a emuladores con Admin SDK...');
  
  try {
    // Create beneficio document
    const beneficioId = 'beneficio-demo-cafe';
    await db.collection('beneficios').doc(beneficioId).set({
      nombre: 'Café Gratis',
      descripcion: 'Canjea este código por un café americano gratis',
      validoDesde: admin.firestore.FieldValue.serverTimestamp(),
      validoHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      estado: 'activo',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`✅ Creado beneficio: ${beneficioId}`);
    
    // Create serial codes
    let created = 0, skipped = 0;
    
    for (let i = 1; i <= COUNT; i++) {
      const serialCode = `${SERIAL_PREFIX}${i.toString().padStart(SERIAL_PAD, '0')}`;
      const serialRef = db.collection('seriales').doc(serialCode);
      
      const doc = await serialRef.get();
      if (doc.exists) {
        skipped++;
        continue;
      }
      
      await serialRef.set({
        codigo: serialCode,
        beneficioId,
        estado: 'activo', // activo, usado, cancelado
        prefix: SERIAL_PREFIX,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      created++;
    }
    
    console.log(`✅ Creados: ${created}, saltados: ${skipped} seriales para beneficio ${beneficioId}`);
    console.log('✨ Seed completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
main();