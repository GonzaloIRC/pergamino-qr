/**
 * Seed de beneficio demo + seriales BNF:SER-0001..N (idempotente).
 * Requiere variables de entorno (NO subir credenciales al repo):
 *  - FIREBASE_SERVICE_ACCOUNT_JSON  (contenido JSON)
 *  - FIREBASE_PROJECT_ID
 *  - (opcionales) SEED_SERIAL_COUNT=20, SERIAL_PREFIX='SER-', SERIAL_PAD=4
 */
import admin from "firebase-admin";

const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!svcJson || !process.env.FIREBASE_PROJECT_ID) {
  console.error("Faltan FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_PROJECT_ID");
  process.exit(1);
}

const app = admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(svcJson)),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const db = admin.firestore();

const SERIAL_PREFIX = process.env.SERIAL_PREFIX ?? "SER-";
const SERIAL_PAD = parseInt(process.env.SERIAL_PAD ?? "4", 10);
const COUNT = parseInt(process.env.SEED_SERIAL_COUNT ?? "20", 10);

async function main() {
  const beneficioRef = db.collection("Beneficios").doc("beneficio_demo_cafe");
  await beneficioRef.set(
    { titulo: "Café de bienvenida", descripcion: "1 café de cortesía", creado: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );

  let created = 0, skipped = 0;
  for (let i = 1; i <= COUNT; i++) {
    const serial = SERIAL_PREFIX + String(i).padStart(SERIAL_PAD, "0");
    const ref = db.collection("BeneficioSeriales").doc(serial);
    const snap = await ref.get();
    if (snap.exists) { skipped++; continue; }
    await ref.set({
      serial,
      beneficioId: "beneficio_demo_cafe",
      estado: "activo",
      emitidoPor: "seed",
      creado: admin.firestore.FieldValue.serverTimestamp(),
    });
    created++;
  }
  console.log(`Seed OK — creados: ${created}, saltados: ${skipped}`);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
