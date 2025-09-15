// generateQR.js mejorado
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Crear directorio para los códigos QR si no existe
const outputDir = path.join(__dirname, 'qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Función para generar un código QR
async function generarQR(datos, archivo, options = {}) {
  const outputPath = path.join(outputDir, archivo);
  const defaultOptions = {
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 300,
    margin: 1,
    ...options
  };

  try {
    await QRCode.toFile(outputPath, datos, defaultOptions);
    console.log(`QR generado: ${outputPath} - Valor: ${datos}`);
    return outputPath;
  } catch (error) {
    console.error('Error generando QR:', error);
  }
}

// Función para generar QR grande (para mejor escaneo)
async function generarQRGrande(datos, archivo) {
  const outputPath = path.join(__dirname, archivo); // Directo en la carpeta scripts
  try {
    await QRCode.toFile(outputPath, datos, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 500,
      margin: 1
    });
    console.log(`QR grande generado: ${outputPath} - Valor: ${datos}`);
    return outputPath;
  } catch (error) {
    console.error('Error generando QR grande:', error);
  }
}

// Generar códigos QR para diferentes formatos
async function generarTodosLosQR() {
  console.log('Generando códigos QR de prueba...');

  // 1. Formato de beneficio (BNF:serialId)
  await generarQR('BNF:123456789', 'beneficio.png');
  await generarQR('BNF:987654321', 'beneficio2.png');
  
  // 2. Formato de cliente (APP:DNI:NONCE)
  const dni = '12345678';
  const nonce = Math.random().toString(36).slice(2, 8);
  await generarQR(`APP:${dni}:${nonce}`, 'cliente.png');
  
  // 3. Formato de prueba (TEST:VALOR)
  await generarQR('TEST:SIMPLE', 'test.png');
  await generarQR('TEST:FORMATO_ESPECIAL', 'test_especial.png');
  
  // 4. Generar versiones grandes para mejor escaneo
  await generarQRGrande('BNF:123456789', 'large-beneficio.png');
  await generarQRGrande(`APP:${dni}:${nonce}`, 'large-cliente.png');
  await generarQRGrande('TEST:SIMPLE', 'large-test.png');
}

// Ejecutar función principal
generarTodosLosQR().then(() => {
  console.log('¡Generación de códigos QR completada!');
  console.log('Para probar el escáner, usa los archivos "large-*.png" que están en la carpeta scripts.');
});