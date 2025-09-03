/**
 * SCRIPTS/seedBeneficioDemo.js
 * Seeds DEMO idempotente para Pergamino.
 * - Crea 1 Beneficio demo (ID fijo).
 * - Emite N seriales con patrón {SERIAL_PREFIX}{pad(SERIAL_PAD)} -> docId = serial.
 * - Campos mínimos: serial, beneficioId, estado="activo", emitidoPor="seed", creado=serverTimestamp().
 * - Idempotente: si el doc ya existe, se salta.
 *
 * Seguridad:
 * - No guarda secretos en el repo.
 * - Contra emulador: usa FIRESTORE_EMULATOR_HOST o EXPO_PUBLIC_USE_EMULATORS=true.
 * - Contra proyecto real: usa ADC (GOOGLE_APPLICATION_CREDENTIALS) o credenciales de entorno locales.
 *
 * Ejecutar:
 *   node SCRIPTS/seedBeneficioDemo.js
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const admin = require('firebase-admin');

// ------- Config de entorno (sin secretos en repo) -------
const PROJECT_ID =
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  '';

const USE_EMULATORS =
  String(process.env.EXPO_PUBLIC_USE_EMULATORS || '').toLowerCase() === 'true' ||
  String(process.env.USE_FIREBASE_EMULATORS || '').toLowerCase() === 'true';

if (USE_EMULATORS && !process.env.FIRESTORE_EMULATOR_HOST) {
  // valor por defecto del emulador
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
}

// Parámetros con defaults (coinciden con el ONE-SHOT)
const SERIAL_PREFIX = process.env.SERIAL_PREFIX || 'SER-';
const SERIAL_PAD = Number(process.env.SERIAL_PAD || 4);
const SEED_SERIAL_COUNT = Number(process.env.SEED_SERIAL_COUNT || 20);

const BENEFICIO_ID = process.env.BENEFICIO_DEMO_ID || 'BENEF_DEMO_CAFE_BIENVENIDA';
const BENEFICIO_DEMO = {
  titulo: 'Café de bienvenida',
  descripcion: 'Un café de cortesía en tu primera visita.',
  tipo: 'demo',
  estado: 'activo',
  costoPuntos: 0,
  // vigencia opcional: { desde: serverTimestamp(), hasta: null }
};

// ------- Inicialización Admin (emulador o proyecto real) -------
function initAdmin() {
  if (USE_EMULATORS) {
    if (!PROJECT_ID) {
      console.warn(
        '[seed] EXPO_PUBLIC_FIREBASE_PROJECT_ID no definido; usando "demo-project".'
      );
    }
    admin.initializeApp({ projectId: PROJECT_ID || 'demo-project' });
    console.log(
      `[seed] Firestore EMULATOR en ${process.env.FIRESTORE_EMULATOR_HOST} (projectId=${PROJECT_ID || 'demo-project'})`
    );
  } else {
    // Producción / entorno real: Application Default Credentials (ADC)
    // Requiere GOOGLE_APPLICATION_CREDENTIALS apuntando a un JSON local (no commitear).
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: PROJECT_ID,
      });
      console.log('[seed] Firestore REAL (ADC). projectId=', PROJECT_ID);
    } catch (err) {
      console.error(
        '[seed] No fue posible inicializar credenciales ADC. Define GOOGLE_APPLICATION_CREDENTIALS o usa emulador.\n',
        err.message
      );
      process.exit(1);
    }
  }
}
initAdmin();

const db = admin.firestore();
const { FieldValue } = admin.firestore;

// ------- Utilidades -------
const pad = (n, width) => String(n).padStart(width, '0');

async function ensureBeneficioDemo() {
  const ref = db.collection('Beneficios').doc(BENEFICIO_ID);
  const snap = await ref.get();

  const base = {
    ...BENEFICIO_DEMO,
    actualizado: FieldValue.serverTimestamp(),
  };

  if (!snap.exists) {
    await ref.set({
      ...base,
      creado: FieldValue.serverTimestamp(),
    });
    console.log(`[seed] Beneficio demo creado: ${BENEFICIO_ID}`);
  } else {
    await ref.set(base, { merge: true });
    console.log(`[seed] Beneficio demo existente actualizado: ${BENEFICIO_ID}`);
  }
  return BENEFICIO_ID;
}

async function seedSeriales(beneficioId) {
  let created = 0;
  let skipped = 0;
  let errors = 0;

  // batch cómodo (20 por defecto). Si aumentas, respeta límite de 500 por batch.
  let batch = db.batch();
  let ops = 0;

  for (let i = 1; i <= SEED_SERIAL_COUNT; i++) {
    const serial = `${SERIAL_PREFIX}${pad(i, SERIAL_PAD)}`;
    const ref = db.collection('BeneficioSeriales').doc(serial);

    const snap = await ref.get();
    if (snap.exists) {
      skipped++;
      continue;
    }

    batch.set(ref, {
      serial,
      beneficioId,
      estado: 'activo', // activo | usado | expirado
      emitidoPor: 'seed',
      creado: FieldValue.serverTimestamp(),
    });

    ops++;
    created++;

    if (ops >= 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
  }

  console.log(
    `[seed] Seriales DEMO -> creados: ${created}, ya existían: ${skipped}, errores: ${errors}`
  );
  if (created > 0) {
    const first = `${SERIAL_PREFIX}${pad(1, SERIAL_PAD)}`;
    const last = `${SERIAL_PREFIX}${pad(SEED_SERIAL_COUNT, SERIAL_PAD)}`;
    console.log(`[seed] Rango: ${first} .. ${last}`);
    console.log(`[seed] Formato de QR de canje: BNF:${first}   (ejemplo)`);
  }
}

(async function main() {
  try {
    if (!PROJECT_ID && !USE_EMULATORS) {
      console.warn(
        '[seed] Aviso: PROJECT_ID no definido. Define EXPO_PUBLIC_FIREBASE_PROJECT_ID o usa emulador.'
      );
    }

    const beneficioId = await ensureBeneficioDemo();
    await seedSeriales(beneficioId);

    console.log('[seed] ✅ Listo.');
    process.exit(0);
  } catch (err) {
    console.error('[seed] ❌ Error al ejecutar seed:', err);
    process.exit(1);
  }
})();
