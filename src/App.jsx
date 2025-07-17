import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import validCodes from "./data/valid-codes.json";
import logo from "./assets/LOGO.png";
import "./App.css";

function App() {
  const [result, setResult] = useState("📟 Esperando código...");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      (text) => {
        if (validCodes.includes(text)) {
          setResult(`✅ Código válido: ${text}`);
          document.getElementById("result").style.backgroundColor = "#e4f6e1";
          document.getElementById("result").style.borderColor = "#5eac5e";
          document.getElementById("result").style.color = "#235f23";
        } else {
          setResult(`❌ Código inválido: ${text}`);
          document.getElementById("result").style.backgroundColor = "#ffe6e6";
          document.getElementById("result").style.borderColor = "#e76c6c";
          document.getElementById("result").style.color = "#922222";
        }
      },
      (error) => {
        // error de escaneo, se ignora para no llenar la consola
      }
    );
  }, []);

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

