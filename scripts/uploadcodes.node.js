// Nunca llames initializeApp ni initializeAuth fuera de src/services/firebase/app.js
import { db } from "../src/services/firebase/app";
import { doc, setDoc } from "firebase/firestore";
import codes from "../src/data/codigos.js";

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
