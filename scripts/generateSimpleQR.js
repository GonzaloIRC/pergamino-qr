// generateSimpleQR.js
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Usamos un formato más sencillo - solo texto
const value = "TEST123";

const outputFile = path.join(__dirname, 'simple-qrcode.png');

QRCode.toFile(outputFile, value, {
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  width: 300,
  margin: 1,
  errorCorrectionLevel: 'H' // Alta corrección de errores
}, function(err) {
  if (err) throw err;
  console.log('QR Code simple generado exitosamente:');
  console.log('Archivo:', outputFile);
  console.log('Valor codificado:', value);
});