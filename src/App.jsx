import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import logo from "./assets/LOGO.png";
import "./App.css";

// Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCeQU3rKV1DkNwkyF5mFqDp9NYDMPAfOt4",
  authDomain: "codigos-pergamino.firebaseapp.com",
  projectId: "codigos-pergamino",
  storageBucket: "codigos-pergamino.appspot.com",
  messagingSenderId: "849867276398",
  appId: "1:849867276398:web:0d9273b3c5130447f3a67f",
  measurementId: "G-GT982TM94R",
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [validCodes, setValidCodes] = useState([]);
  const [result, setResult] = useState("📡 Esperando código...");

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
      qrbox: 250,
    });
    scanner.render(
      async (text) => {
        console.log('Escaneado:', text);
        console.log('Códigos válidos:', validCodes);
        if (validCodes.includes(text)) {
          setResult(`✅ Código válido: ${text}`);
          document.getElementById("result").style.backgroundColor = "#e4f6e1";
          document.getElementById("result").style.borderColor = "#5eac5e";
          document.getElementById("result").style.color = "#235f23";
          // Registrar escaneo válido
          await addDoc(collection(db, "historial"), {
            codigo: text,
            fecha: serverTimestamp(),
            estado: "válido"
          });
        } else {
          setResult(`❌ Código inválido: ${text}`);
          document.getElementById("result").style.backgroundColor = "#ffe6e6";
          document.getElementById("result").style.borderColor = "#e76c6c";
          document.getElementById("result").style.color = "#922222";
          // Registrar escaneo inválido
          await addDoc(collection(db, "historial"), {
            codigo: text,
            fecha: serverTimestamp(),
            estado: "inválido"
          });
        }
      },
      (error) => {
        // Ignorar errores de escaneo
      }
    );
    return () => {
      document.getElementById("reader").innerHTML = "";
    };
  }, [validCodes]);

  return (
    <div className="App">
      <img src={logo} alt="Logo Pergamino" className="logo" />
      <h1>📷 Validador QR - Pergamino</h1>
      <div id="reader"></div>
      <p id="result">{result}</p>
    </div>
  );
}

export default App;
