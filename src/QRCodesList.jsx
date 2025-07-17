import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { collection, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase"; // o "./App" si ahí se exporta `db`

function QRCodesList() {
  const codes = Array.from({ length: 20 }, (_, i) => `Piscosour${String(i + 1).padStart(2, "0")}`);

  const downloadQR = (code) => {
    const canvas = document.getElementById(`qr-${code}`);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${code}.png`;
    a.click();
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2em", justifyContent: "center", marginTop: "2em" }}>
      {codes.map((code) => (
        <div key={code} style={{ textAlign: "center", border: "1px solid #ccc", padding: "1em", borderRadius: "8px", background: "#fff" }}>
          <QRCode id={`qr-${code}`} value={code} size={128} includeMargin={true} />
          <div style={{ marginTop: "1em", fontWeight: "bold" }}>{code}</div>
          <button style={{ marginTop: "0.5em" }} onClick={() => downloadQR(code)}>Descargar QR</button>
        </div>
      ))}
    </div>
  );
}

export default QRCodesList;
