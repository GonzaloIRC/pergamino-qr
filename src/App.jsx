import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import QrReader from "react-qr-reader";
import CargarTodosLosCodigos from "./CargarTodosLosCodigos";
import "./App.css";

function App() {
  const [scannerActive, setScannerActive] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState("📡 Esperando código...");
  const [validCodes, setValidCodes] = useState([]);
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "codigos"), (snapshot) => {
      const codes = snapshot.docs.map((doc) => doc.id);
      setValidCodes(codes);
    });
    return () => unsubscribe();
  }, []);

  const handleScan = async (value) => {
    if (value && scannerActive) {
      setScannerActive(false); // Detiene el lector
      const scannedCode = value.trim();
      setScanResult(scannedCode);
      setScanStatus("⏳ Procesando...");

      try {
        const ref = doc(db, "codigos", scannedCode);
        const docSnap = await getDoc(ref);

        if (!docSnap.exists()) {
          setScanStatus("❌ Código inválido");
          await setDoc(doc(db, "historial", Date.now().toString()), {
            codigo: scannedCode,
            estado: "inválido",
            fecha: new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })
          });
        } else {
          await setDoc(doc(db, "historial", Date.now().toString()), {
            codigo: scannedCode,
            estado: "válido",
            fecha: new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })
          });
          await deleteDoc(ref);
          setScanStatus("✅ Código válido y registrado");
        }
      } catch (error) {
        setScanStatus("⚠️ Error al procesar el código");
        console.error("Error de escaneo:", error);
      }
    }
  };

  return (
    <div className="App">
      <img src="logo.png" alt="Logo" className="logo" />
      <h1>📷 Validador QR - Pergamino</h1>

      {scannerActive ? (
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              handleScan(result?.text);
            }
          }}
          constraints={{ facingMode: "environment" }}
          containerStyle={{ width: "100%" }}
        />
      ) : (
        <button className="reactivar" onClick={() => {
          setScanResult(null);
          setScanStatus("📡 Esperando código...");
          setScannerActive(true);
        }}>
          🔄 Reactivar escáner
        </button>
      )}

      <div className="status">
        <strong>{scanStatus}</strong>
        {scanResult && <p>📎 Valor escaneado: {scanResult}</p>}
      </div>

      <button className="mostrar-validos" onClick={() => setShowCodes(!showCodes)}>
        {showCodes ? "🔽 Ocultar códigos válidos" : "🔼 Mostrar códigos válidos"}
      </button>

      {showCodes && (
        <div className="codigos-validos">
          <p><strong>Códigos válidos:</strong></p>
          <ul>
            {validCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      )}

      <CargarTodosLosCodigos />
    </div>
  );
}

export default App;
