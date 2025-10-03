/**
 * Script para verificar la configuración del proyecto Pergamino App
 * 
 * Este script realiza verificaciones básicas de configuración y
 * ayuda a preparar el proyecto para las fases M2/M3.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.cyan}==== Verificando configuración de Pergamino App ====${colors.reset}\n`);

// Directorio raíz del proyecto
const rootDir = path.resolve(__dirname, '..');

// Verificar estructura de directorios
console.log(`${colors.bright}Verificando estructura de directorios...${colors.reset}`);
const requiredDirs = [
  'src/components',
  'src/context',
  'src/navigation',
  'src/screens',
  'src/screens/admin',
  'src/screens/main',
  'src/services',
  'src/utils'
];

let allDirsExist = true;
requiredDirs.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✓' : '✗'} ${dir} ${exists ? colors.green + 'existe' : colors.red + 'no existe'}`);
  
  if (!exists) {
    allDirsExist = false;
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ${colors.green}✓ Directorio creado: ${dir}${colors.reset}`);
    } catch (e) {
      console.log(`  ${colors.red}✗ Error al crear directorio: ${dir} - ${e.message}${colors.reset}`);
    }
  }
});

console.log(`\n${allDirsExist ? colors.green + '✓ Estructura de directorios completa' : colors.yellow + '✓ Estructura de directorios corregida'}${colors.reset}\n`);

// Verificar dependencias
console.log(`${colors.bright}Verificando dependencias...${colors.reset}`);
try {
  const packageJson = require(path.join(rootDir, 'package.json'));
  
  const requiredDependencies = [
    'expo',
    'react',
    'react-native',
    'firebase',
    '@react-navigation/native',
    '@react-navigation/native-stack',
    '@react-navigation/bottom-tabs',
    'react-native-paper',
    'expo-barcode-scanner',
    'expo-camera',
  ];
  
  const missingDeps = [];
  requiredDependencies.forEach(dep => {
    const exists = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`  ${exists ? '✓' : '✗'} ${dep} ${exists ? colors.green + 'instalado' : colors.red + 'no instalado'}`);
    if (!exists) missingDeps.push(dep);
  });
  
  if (missingDeps.length > 0) {
    console.log(`\n${colors.yellow}⚠ Faltan dependencias. Para instalarlas ejecuta:${colors.reset}`);
    console.log(`  npm install --save ${missingDeps.join(' ')}`);
  } else {
    console.log(`\n${colors.green}✓ Todas las dependencias requeridas están instaladas${colors.reset}`);
  }
} catch (e) {
  console.log(`  ${colors.red}✗ Error al leer package.json: ${e.message}${colors.reset}`);
}

// Verificar configuración de Firebase
console.log(`\n${colors.bright}Verificando configuración de Firebase...${colors.reset}`);
const firebaseConfigPath = path.join(rootDir, 'src/firebase/firebaseConfig.js');

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');
    if (firebaseConfig.includes('apiKey') && 
        firebaseConfig.includes('authDomain') && 
        firebaseConfig.includes('projectId')) {
      console.log(`  ${colors.green}✓ Configuración de Firebase encontrada${colors.reset}`);
    } else {
      console.log(`  ${colors.yellow}⚠ El archivo de configuración de Firebase existe pero podría estar incompleto${colors.reset}`);
    }
  } catch (e) {
    console.log(`  ${colors.red}✗ Error al leer la configuración de Firebase: ${e.message}${colors.reset}`);
  }
} else {
  console.log(`  ${colors.red}✗ Archivo de configuración de Firebase no encontrado${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ Asegúrate de crear ${firebaseConfigPath} con la configuración correcta${colors.reset}`);
}

// Verificar existencia de archivos clave para M2/M3
console.log(`\n${colors.bright}Verificando componentes para fases M2/M3...${colors.reset}`);
const m2m3Components = [
  {
    path: 'src/screens/admin/ConfigScreen.js',
    description: 'Pantalla de Configuración para Admin'
  },
  {
    path: 'src/screens/admin/AnalyticsScreen.js',
    description: 'Pantalla de Analíticas'
  },
  {
    path: 'src/screens/admin/HistoryScreen.js',
    description: 'Pantalla de Historial'
  },
  {
    path: 'src/navigation/RoleBasedNavigator.js',
    description: 'Navegador basado en roles'
  },
  {
    path: 'src/components/QrDynamicCard.js',
    description: 'Componente de QR Dinámico'
  },
  {
    path: 'src/services/settings.js',
    description: 'Servicio de Configuración'
  }
];

let m2m3Ready = true;
m2m3Components.forEach(component => {
  const fullPath = path.join(rootDir, component.path);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✓' : '✗'} ${component.description} ${exists ? colors.green + 'implementado' : colors.red + 'no implementado'}`);
  if (!exists) m2m3Ready = false;
});

console.log(`\n${m2m3Ready ? colors.green + '✓ Todos los componentes para M2/M3 están implementados' : colors.yellow + '⚠ Faltan algunos componentes para M2/M3'}${colors.reset}\n`);

console.log(`${colors.bright}${colors.cyan}==== Verificación completada ====${colors.reset}\n`);

if (!m2m3Ready) {
  console.log(`${colors.yellow}Acciones recomendadas para preparar las fases M2/M3:${colors.reset}`);
  if (!allDirsExist) console.log(`  - Completar la estructura de directorios que se ha creado`);
  console.log(`  - Implementar los componentes faltantes marcados arriba`);
  console.log(`  - Revisar que las rutas de navegación estén correctamente configuradas`);
  console.log(`  - Verificar que los contextos de autenticación y configuración funcionen correctamente\n`);
}

console.log(`${colors.green}✨ ¡Proyecto verificado! ✨${colors.reset}`);
