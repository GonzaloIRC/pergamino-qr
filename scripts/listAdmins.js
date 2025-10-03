// scripts/listAdmins.js
import admin from "firebase-admin";

const isProd = process.argv.includes("--prod");
if (!isProd) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
const adminConfig = isProd && serviceAccountPath
  ? { credential: admin.credential.cert(require(serviceAccountPath)) }
  : { projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "demo-pergamino" };

admin.initializeApp(adminConfig);
const db = admin.firestore();

async function run(){
  const snap = await db.collection("roles").get();
  console.log("roles collection:");
  snap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });