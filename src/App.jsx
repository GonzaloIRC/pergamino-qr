
import { useEffect, useState } from "react";
import AdminCodes from "./AdminCodes";
import { Html5QrcodeScanner } from "html5-qrcode";
import logo from "./assets/LOGO.png";
import "./App.css";
import CargarTodosLosCodigos from "./CargarTodosLosCodigos";

// Firebase
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

function App() {
  const [validCodes, setValidCodes] = useState([]);
  const [result, setResult] = useState("📡 Esperando código...");
  const [scanned, setScanned] = useState("");
  const [lastScanTime, setLastScanTime] = useState(0);
  const [lastCode, setLastCode] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "codigos"), (querySnapshot) => {
      const codes = querySnapshot.docs.map((doc) => doc.data().codigo);
      setValidCodes(codes);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (validCodes.length === 0) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    });

    scanner.render(
      async (text) => {
        const now = Date.now();
        if (text === lastCode && now - lastScanTime < 5000) {
          return;
        }
        setLastCode(text);
        setLastScanTime(now);

        setScanned(text);
        const codigo = text.trim();

        const snapshot = await getDocs(query(collection(db, "codigos"), where("codigo", "==", codigo)));

        if (!snapshot.empty) {
          const docToDelete = snapshot.docs[0];
          const docId = docToDelete.id;

          const historialSnap = await getDocs(
            query(
              collection(db, "historial"),
              where("codigo", "==", codigo),
              where("estado", "==", "válido")
            )
          );

          if (historialSnap.empty) {
            setResult(`✅ Código válido: ${codigo}`);
            document.getElementById("result").style.backgroundColor = "#e4f6e1";
            document.getElementById("result").style.borderColor = "#5eac5e";
            document.getElementById("result").style.color = "#235f23";

            await addDoc(collection(db, "historial"), {
              codigo,
              fecha: serverTimestamp(),
              estado: "válido"
            });

            await deleteDoc(doc(db, "codigos", docId));
            setValidCodes(validCodes.filter((c) => c !== codigo));
          } else {
            setResult(`❌ Este código ya fue usado: ${codigo}`);
            document.getElementById("result").style.backgroundColor = "#ffe6e6";
            document.getElementById("result").style.borderColor = "#e76c6c";
            document.getElementById("result").style.color = "#922222";

            await addDoc(collection(db, "historial"), {
              codigo,
              fecha: serverTimestamp(),
              estado: "inválido"
            });

            await deleteDoc(doc(db, "codigos", docId));
            setValidCodes(validCodes.filter((c) => c !== codigo));
          }
        } else {
          setResult(`❌ Código inválido: ${codigo}`);
          document.getElementById("result").style.backgroundColor = "#ffe6e6";
          document.getElementById("result").style.borderColor = "#e76c6c";
          document.getElementById("result").style.color = "#922222";

          await addDoc(collection(db, "historial"), {
            codigo,
            fecha: serverTimestamp(),
            estado: "inválido"
          });
        }
      },
      (error) => {}
    );

    return () => {
      document.getElementById("reader").innerHTML = "";
    };
  }, [validCodes]);

  const isLocalhost = window.location.hostname === "localhost";

  return (
    <div className="App">
      <AdminCodes />
      <img src={logo} alt="Logo Pergamino" className="logo" />
      <h1>📷 Validador QR - Pergamino</h1>
      <div id="reader"></div>
      <p id="result">{result}</p>
      <details style={{
        marginTop: "2em",
        background: "#f9f9f9",
        color: "#222",
        padding: "1em",
        borderRadius: "8px",
        maxWidth: "95vw",
        textAlign: "left"
      }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", fontSize: "1em" }}>
          🔍 Ver códigos válidos restantes
        </summary>
        <ul style={{ marginTop: "1em" }}>
          {validCodes.map((code, index) => (
            <li key={index}>{code}</li>
          ))}
        </ul>
      </details>

      {isLocalhost && <CargarTodosLosCodigos />}
    </div>
  );
}

export default App;
