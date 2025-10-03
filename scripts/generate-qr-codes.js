/**
 * Script para generar códigos QR de prueba para la aplicación Pergamino
 * 
 * Este script genera diferentes formatos de códigos QR usados en la app:
 * 1. BNF: Formato para canjear beneficios
 * 2. APP: Formato para registrar puntos de clientes
 * 3. TEST: Formato para pruebas y debugging
 * 
 * Uso: node generate-qr-codes.js
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Asegurarse que el directorio existe
const outputDir = path.join(__dirname, 'qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Generar un código QR y guardarlo como PNG
async function generateQR(data, filename) {
  try {
    const outputPath = path.join(outputDir, filename);
    await QRCode.toFile(outputPath, data);
    console.log(`Código QR guardado en: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error al generar código QR:', error);
  }
}

// Generar código QR grande (más fácil de escanear)
async function generateLargeQR(data, filename) {
  try {
    const outputPath = path.join(__dirname, filename);
    const options = {
      width: 500, // Tamaño grande
      margin: 2,  // Margen pequeño para maximizar tamaño del código
      color: {
        dark: '#000000',  // Color negro para los puntos
        light: '#ffffff'  // Color blanco para el fondo
      }
    };
    
    await QRCode.toFile(outputPath, data, options);
    console.log(`Código QR grande guardado en: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error al generar código QR grande:', error);
  }
}

// Generar códigos QR de ejemplo
async function generateExampleQRs() {
  console.log('Generando códigos QR de ejemplo...');
  
  // 1. Códigos de beneficio (BNF:serialId)
  await generateQR('BNF:123456789', 'benefit-code.png');
  
  // 2. Códigos de cliente (APP:DNI:NONCE)
  await generateQR('APP:12345678:ABC123', 'customer-code.png');
  
  // 3. Códigos de prueba para debugging
  await generateQR('TEST:SIMPLE', 'test-code.png');
  
  // 4. Versiones grandes para más fácil escaneo
  await generateLargeQR('BNF:123456789', 'large-benefit.png');
  await generateLargeQR('APP:12345678:ABC123', 'large-customer.png');
  await generateLargeQR('TEST:SIMPLE', 'large-test.png');
}

// Ejecutar la función principal
generateExampleQRs().then(() => {
  console.log('Generación de códigos QR completada.');
});