// generateLargeQR.js
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Crearemos tres códigos QR diferentes para pruebas
const codes = [
  { value: "BNF:SER-0001", file: "large-benefit-qr.png", desc: "Código para beneficio" },
  { value: "APP:12345678:abc123", file: "large-customer-qr.png", desc: "Código para cliente" },
  { value: "TEST123", file: "large-simple-qr.png", desc: "Código simple" }
];

async function generateQRs() {
  for (const code of codes) {
    await QRCode.toFile(
      path.join(__dirname, code.file),
      code.value,
      {
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 600, // Mucho más grande
        margin: 2,
        errorCorrectionLevel: 'H' // Alta corrección de errores
      }
    );
    console.log(`QR Code ${code.desc} generado exitosamente:`);
    console.log(`Archivo: ${path.join(__dirname, code.file)}`);
    console.log(`Valor codificado: ${code.value}`);
    console.log('-----------------------');
  }
}

generateQRs().catch(err => console.error(err));