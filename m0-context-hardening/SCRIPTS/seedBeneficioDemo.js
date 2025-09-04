/**
 * Script de semillas idempotente para Pergamino‑QR.
 *
 * Este script crea un beneficio de demostración (por ejemplo, "Café de bienvenida")
 * y genera un conjunto de seriales quemables con prefijo y padding configurable.
 * Los documentos se insertan en la colección `BeneficioSeriales` con docId = serial.
 * Si el serial ya existe, se omite, de manera que el script es seguro para
 * ejecutarse múltiples veces sin duplicar registros.
 *
 * Requiere las siguientes variables de entorno:
 *   FIREBASE_SERVICE_ACCOUNT_JSON – contenido JSON de la cuenta de servicio
 *   FIREBASE_PROJECT_ID          – ID del proyecto de Firebase
 *   SERIAL_PREFIX                – prefijo de serial (default "SER-")
 *   SERIAL_PAD                   – número de dígitos de padding (default 4)
 *   SEED_SERIAL_COUNT            – cantidad de seriales a generar (default 20)
 */

const admin = require('firebase-admin');

const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!svcJson || !process.env.FIREBASE_PROJECT_ID) {
  console.error('Faltan FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_PROJECT_ID');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(svcJson)),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

const SERIAL_PREFIX = process.env.SERIAL_PREFIX ?? 'SER-';
const SERIAL_PAD = parseInt(process.env.SERIAL_PAD ?? '4', 10);
const COUNT = parseInt(process.env.SEED_SERIAL_COUNT ?? '20', 10);

async function main() {
  // Crear beneficio demo (id fijo para idempotencia)
  const beneficioRef = db.collection('Beneficios').doc('beneficio_demo_cafe');
  await beneficioRef.set(
    {
      titulo: 'Café de bienvenida',
      descripcion: '1 café de cortesía',
      creado: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Generar seriales
  let created = 0;
  let skipped = 0;
  const batch = db.batch();
  for (let i = 1; i <= COUNT; i++) {
    const serial = SERIAL_PREFIX + String(i).padStart(SERIAL_PAD, '0');
    const ref = db.collection('BeneficioSeriales').doc(serial);
    const snap = await ref.get();
    if (snap.exists) {
      skipped++;
      continue;
    }
    batch.set(ref, {
      serial,
      beneficioId: 'beneficio_demo_cafe',
      estado: 'activo',
      emitidoPor: 'seed',
      creado: admin.firestore.FieldValue.serverTimestamp(),
    });
    created++;
  }
  if (created > 0) {
    await batch.commit();
  }
  console.log(`Seed finalizada: creados ${created}, omitidos ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});