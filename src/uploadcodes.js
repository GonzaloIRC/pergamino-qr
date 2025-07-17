// uploadcodes.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCeQU3rKVlDKhWkyF5mFqDp9NYDMPAfOt4",
  authDomain: "codigos-pergamino.firebaseapp.com",
  projectId: "codigos-pergamino",
  storageBucket: "codigos-pergamino.appspot.com",
  messagingSenderId: "849867276398",
  appId: "1:849867276398:web:0d9273b3c5130447f3a67f",
  measurementId: "G-GT982TM94R"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Resolver ruta al archivo JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "data", "valid-codes.json");

// Leer y parsear JSON
const rawData = fs.readFileSync(filePath, "utf-8");
const data = JSON.parse(rawData);

// Subir los datos
async function subirCodigos() {
  for (const categoria in data) {
    for (const item of data[categoria]) {
      const codigo = item.codigo;
      await setDoc(doc(db, "codigos", codigo), {
        codigo,
        categoria,
        usado: item.usado ?? false
      });
      console.log(`✅ Subido: ${codigo} (${categoria})`);
    }
  }
  console.log("🎉 Todos los códigos fueron subidos a Firestore.");
}

subirCodigos().catch(console.error);
