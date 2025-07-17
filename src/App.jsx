import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./App.css";

function App() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250
    });

    scanner.render(
      (text) => {
        document.getElementById("result").innerText = `✅ Código: ${text}`;
      },
      (error) => {
        // Puedes registrar errores si quieres
      }
    );
  }, []);

  return (
    <div className="App">
      <h1>📷 Validador QR - Pergamino</h1>
      <div id="reader" style={{ width: "300px", margin: "auto" }}></div>
      <p id="result" style={{ marginTop: "20px", fontSize: "18px" }}>
        📟 Esperando código...
      </p>
    </div>
  );
}

export default App;
