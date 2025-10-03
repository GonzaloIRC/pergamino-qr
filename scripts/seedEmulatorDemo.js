/**
 * Seed de beneficio demo + seriales BNF:SER-0001..N (idempotente) para Firebase Emulators.
 * Esta versión está diseñada para trabajar con los emuladores locales.
 */
import admin from "firebase-admin";

// Configurar para usar emuladores
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
const projectId = "demo-pergamino";

// Inicializar sin credenciales (para emuladores)
const app = admin.initializeApp({
  projectId: projectId,
});

const db = admin.firestore();

const SERIAL_PREFIX = process.env.SERIAL_PREFIX ?? "SER-";
const SERIAL_PAD = parseInt(process.env.SERIAL_PAD ?? "4", 10);
const COUNT = parseInt(process.env.SEED_SERIAL_COUNT ?? "20", 10);

async function main() {
  console.log("Creando datos de prueba en los emuladores locales de Firebase...");
  
  const beneficioRef = db.collection("Beneficios").doc("beneficio_demo_cafe");
  await beneficioRef.set(
    { 
      titulo: "Café de bienvenida", 
      descripcion: "1 café de cortesía", 
      creado: admin.firestore.FieldValue.serverTimestamp() 
    },
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

main().catch(e => { 
  console.error("Error al ejecutar el seed:", e); 
  process.exit(1); 
});