// scripts/createAdminUser.js
// Uso:
//   # Para emulador (configurado con EXPO_PUBLIC_USE_EMULATORS=1)
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 node scripts/createAdminUser.js
//
//   # Para proyecto real (requiere que tengas GOOGLE_APPLICATION_CREDENTIALS apuntando a service account)
//   node scripts/createAdminUser.js --prod

import admin from "firebase-admin";
import { readFileSync } from "fs";

const argv = process.argv.slice(2);
const isProd = argv.includes("--prod");

if (!isProd) {
  // point admin SDK to the emulator only for local dev (no service account needed)
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
if (isProd && !serviceAccountPath) {
  console.error("Para --prod necesitas GOOGLE_APPLICATION_CREDENTIALS apuntando a un service account JSON");
  process.exit(1);
}

const adminConfig = isProd && serviceAccountPath
  ? { credential: admin.credential.cert(require(serviceAccountPath)) }
  : { projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "demo-pergamino" };

admin.initializeApp(adminConfig);

const auth = admin.auth();
const db = admin.firestore();

async function run() {
  const email = process.env.NEW_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.NEW_ADMIN_PW || "Admin123!";
  // 1) Crear usuario (si no existe)
  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log("Usuario ya existe:", user.uid);
  } catch (e) {
    console.log("Creando usuario:", email);
    user = await auth.createUser({ email, password, emailVerified: true });
    console.log("Usuario creado, uid=", user.uid);
  }

  // 2) Asegurar roles/{uid} = { role: 'admin' }
  const rolesRef = db.collection("roles").doc(user.uid);
  await rolesRef.set({ role: "admin" }, { merge: true });
  console.log("roles/{uid} actualizado a admin");

  // 3) (Opcional) imprimir doc de Cliente/Perfil si existe
  const perfil = await db.collection("Perfiles").doc(user.uid).get();
  if (perfil.exists) {
    console.log("Perfil:", perfil.data());
  } else {
    console.log("Perfil no encontrado (puedes crear Perfiles/{uid} si lo necesitas).");
  }

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });