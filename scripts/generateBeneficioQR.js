// generateBeneficioQR.js
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Formato para beneficios basado en el código de seeding
const value = "BNF:SER-0001";

const outputFile = path.join(__dirname, 'beneficio-qrcode.png');

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
  console.log('QR Code de beneficio generado exitosamente:');
  console.log('Archivo:', outputFile);
  console.log('Valor codificado:', value);
});