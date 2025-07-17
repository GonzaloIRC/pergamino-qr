import React from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

function CargarTodosLosCodigos() {
  const isLocalhost = window.location.hostname === "localhost";
  if (!isLocalhost) return null; // Oculta el botón en producción

  const codes = Array.from({ length: 20 }, (_, i) => `Piscosour${String(i + 1).padStart(2, "0")}`);

  const subirTodos = async () => {
    for (const code of codes) {
      try {
        const ref = doc(db, "codigos", code); // Usa el código como ID
        await setDoc(ref, {
          codigo: code,
          categoria: "Piscosour",
          usado: false
        });
        console.log(`✅ Subido: ${code}`);
      } catch (error) {
        console.error(`❌ Error al subir ${code}:`, error);
      }
    }
    alert("Todos los códigos han sido subidos sin duplicación");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2em" }}>
      <button onClick={subirTodos} style={{ fontSize: "1.2em", padding: "1em" }}>
        📤 Subir los 20 códigos a Firebase
      </button>
    </div>
  );
}

export default CargarTodosLosCodigos;
