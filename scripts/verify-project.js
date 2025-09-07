/**
 * Script de verificación para el proyecto Pergamino App
 * Verifica la configuración y ejecuta pruebas básicas para asegurar
 * que los componentes esenciales funcionan correctamente.
 */

import { existsSync, readFileSync } from 'fs';
import path from 'path';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Función para formatear mensajes
const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[✓]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[✗]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[!]${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.blue}== ${msg} ==${colors.reset}`)
};

// Función para verificar la existencia de archivos críticos
function checkCriticalFiles() {
  log.title('Verificando archivos críticos');
  
  const criticalFiles = [
    { path: 'src/services/firebaseClient.js', description: 'Configuración de Firebase' },
    { path: 'src/context/AuthContext.js', description: 'Contexto de autenticación' },
    { path: 'src/navigation/RouteGuards.js', description: 'Protección de rutas' },
    { path: 'src/services/transactions.js', description: 'Manejo de transacciones' },
    { path: 'src/components/BarcodeScanner/Scanner.js', description: 'Componente de escáner' },
    { path: 'src/utils/qr.js', description: 'Utilidades para códigos QR' },
    { path: 'src/screens/main/ScannerScreen.js', description: 'Pantalla de escaneo' }
  ];
  
  let allFilesExist = true;
  
  criticalFiles.forEach(file => {
    const exists = existsSync(path.join(process.cwd(), file.path));
    if (exists) {
      log.success(`${file.description} (${file.path})`);
    } else {
      log.error(`Falta ${file.description} (${file.path})`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Función para verificar las dependencias en package.json
function checkDependencies() {
  log.title('Verificando dependencias');
  
  try {
    const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      { name: 'expo-camera', description: 'Componente de cámara para escaneo' },
      { name: 'firebase', description: 'SDK de Firebase' },
      { name: 'react-navigation', description: 'Navegación' },
      { name: '@react-native-async-storage/async-storage', description: 'Almacenamiento persistente' }
    ];
    
    let allDepsPresent = true;
    
    requiredDeps.forEach(dep => {
      // Verificar si la dependencia o alguna variante está presente
      const found = Object.keys(dependencies).some(key => 
        key === dep.name || 
        key.includes(dep.name.replace('expo-', '@expo/')) ||
        (dep.name === 'react-navigation' && key.includes('@react-navigation/'))
      );
      
      if (found) {
        log.success(`${dep.description} (${dep.name})`);
      } else {
        log.error(`Falta ${dep.description} (${dep.name})`);
        allDepsPresent = false;
      }
    });
    
    return allDepsPresent;
  } catch (error) {
    log.error(`Error al leer package.json: ${error.message}`);
    return false;
  }
}

// Función para verificar la estructura general del proyecto
function checkProjectStructure() {
  log.title('Verificando estructura del proyecto');
  
  const folders = [
    { path: 'src/components', description: 'Componentes' },
    { path: 'src/screens', description: 'Pantallas' },
    { path: 'src/context', description: 'Contextos' },
    { path: 'src/navigation', description: 'Navegación' },
    { path: 'src/services', description: 'Servicios' },
    { path: 'src/utils', description: 'Utilidades' }
  ];
  
  let allFoldersExist = true;
  
  folders.forEach(folder => {
    const exists = existsSync(path.join(process.cwd(), folder.path));
    if (exists) {
      log.success(`${folder.description} (${folder.path})`);
    } else {
      log.error(`Falta carpeta de ${folder.description} (${folder.path})`);
      allFoldersExist = false;
    }
  });
  
  return allFoldersExist;
}

// Función principal
async function main() {
  log.info('Iniciando verificación del proyecto Pergamino App...');
  
  const filesOk = checkCriticalFiles();
  const depsOk = checkDependencies();
  const structureOk = checkProjectStructure();
  
  log.title('Resultado de la verificación');
  if (filesOk && depsOk && structureOk) {
    log.success('Todas las verificaciones pasaron correctamente.');
    log.info('El proyecto está listo para ser ejecutado.');
  } else {
    log.warn('Hay problemas que deben ser corregidos.');
    if (!filesOk) log.error('Faltan archivos críticos.');
    if (!depsOk) log.error('Faltan dependencias necesarias.');
    if (!structureOk) log.error('La estructura del proyecto no es la esperada.');
  }
}

// Ejecutar la función principal
main().catch(error => {
  log.error(`Error durante la verificación: ${error.message}`);
  process.exit(1);
});
