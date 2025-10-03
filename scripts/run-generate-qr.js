// Instalar y ejecutar
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directorio para los códigos QR
const qrDir = path.join(__dirname, 'qr-codes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir);
}

// Instalar qrcode si no está instalado
try {
  console.log('Verificando dependencia qrcode...');
  require.resolve('qrcode');
  console.log('Dependencia qrcode ya está instalada.');
} catch (e) {
  console.log('Instalando qrcode...');
  execSync('npm install qrcode', { stdio: 'inherit' });
}

// Ejecutar el script de generación
console.log('Ejecutando generador de códigos QR...');
require('./generate-qr-codes');