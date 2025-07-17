import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import codes from "./data/codigos.js";

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

// Subir los códigos
const uploadCodes = async () => {
  for (const codigo of codes) {
    if (typeof codigo === "string" && codigo.trim() !== "") {
      const ref = doc(db, "codigos", codigo.trim());
      await setDoc(ref, {
        codigo: codigo.trim(),
        categoria: "Piscosour",
        usado: false
      });
      console.log(`✅ Subido: ${codigo}`);
    }
  }
};

uploadCodes();
