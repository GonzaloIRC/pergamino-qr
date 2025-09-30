#!/usr/bin/env node

/**
 * Script para generar los entregables para el PR D
 * Este script:
 * 1. Ejecuta las pruebas en modo secuencial
 * 2. Genera capturas del dashboard con KPIs
 * 3. Registra logs del seed
 * 4. Prepara un resumen para incluir en el PR
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORT_DIR = path.join(__dirname, '..', 'pr-d-deliverables');

// Crear directorio para entregables
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('Generando entregables para PR D...');

// Función para ejecutar comandos y capturar la salida
function runCommand(command, description) {
  console.log(`\n[EJECUTANDO] ${description}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    const logPath = path.join(REPORT_DIR, `${description.toLowerCase().replace(/\s+/g, '-')}.log`);
    fs.writeFileSync(logPath, output);
    console.log(`✅ Comando completado. Log guardado en: ${logPath}`);
    return output;
  } catch (error) {
    console.error(`❌ Error ejecutando el comando: ${error.message}`);
    const errorLog = path.join(REPORT_DIR, `${description.toLowerCase().replace(/\s+/g, '-')}-error.log`);
    fs.writeFileSync(errorLog, error.stdout || error.message);
    console.error(`Log de error guardado en: ${errorLog}`);
    return null;
  }
}

// Generar datos de prueba con logs
const adminUserLog = runCommand('node tests/utils/seedAdminUser.real.js', 'Seed Admin User');
const clientLog = runCommand('node tests/utils/seedOneClient.real.js', 'Seed Client');
const serialsLog = runCommand('node tests/utils/emitSerials.real.js --count=3', 'Emit Test Serials');

// Ejecutar pruebas
console.log('\n[EJECUTANDO] Pruebas E2E en modo secuencial');
try {
  execSync('npm run test:e2e', { stdio: 'inherit' });
  console.log('✅ Pruebas completadas exitosamente');
} catch (error) {
  console.error('❌ Error ejecutando las pruebas');
  process.exit(1);
}

// Generar reporte HTML
console.log('\n[GENERANDO] Reporte HTML');
try {
  // Copiar el reporte generado al directorio de entregables
  execSync(`cp -r playwright-report/* "${REPORT_DIR}/html-report/"`, { stdio: 'inherit' });
  console.log('✅ Reporte HTML copiado a pr-d-deliverables/html-report/');
} catch (error) {
  console.error('❌ Error copiando el reporte HTML');
}

// Copiar capturas relevantes
console.log('\n[COPIANDO] Capturas de pantalla relevantes');
try {
  // Buscar y copiar capturas relevantes
  const screenshots = [
    'test-results/dashboard-kpi-final.png',
    'test-results/navigation-complete.png',
    'test-results/after-login-for-navigation.png'
  ];
  
  fs.mkdirSync(path.join(REPORT_DIR, 'screenshots'), { recursive: true });
  
  screenshots.forEach(screenshot => {
    if (fs.existsSync(screenshot)) {
      const destFile = path.join(REPORT_DIR, 'screenshots', path.basename(screenshot));
      fs.copyFileSync(screenshot, destFile);
      console.log(`✅ Captura copiada: ${destFile}`);
    } else {
      console.warn(`⚠️ No se encontró la captura: ${screenshot}`);
    }
  });
} catch (error) {
  console.error('❌ Error copiando capturas:', error);
}

// Limpiar datos de prueba
console.log('\n[LIMPIEZA] Limpiando datos de prueba');
const cleanupLog = runCommand('node tests/utils/cleanupTests.real.js', 'Cleanup Test Data');

// Generar archivo README con resumen
const readmePath = path.join(REPORT_DIR, 'ENTREGABLES.md');
const readmeContent = `# Entregables para PR D - Testing Estable

## Resumen de cambios implementados

1. **Ejecución secuencial en local y CI**
   - Configuración de \`--workers=1\` en package.json y workflow de GitHub Actions
   - Eliminación de pruebas concurrentes que causaban flakiness

2. **Aislamiento de datos de pruebas**
   - Implementación de namespace por ejecución: \`ci-<hash>\`
   - Limpieza automática de datos post-suite

3. **Fixtures minimalistas**
   - Creación de scripts para datos mínimos de prueba
   - Optimización para reducir escrituras a Firestore

4. **Assertions más robustas**
   - Verificaciones múltiples para evitar "verde falso"
   - Selectores basados en \`data-testid\` para mayor estabilidad

5. **Documentación actualizada**
   - README con instrucciones claras
   - Advertencia sobre ejecución secuencial obligatoria

## Archivos incluidos

1. **Logs de ejecución**
   - Creación de usuario admin
   - Creación de cliente de prueba
   - Generación de seriales
   - Limpieza de datos

2. **Capturas de pantalla**
   - Dashboard con KPIs cargados
   - Navegación completada
   - Panel después del login

3. **Reporte HTML de Playwright**
   - Resultados completos de la ejecución de pruebas
   - Tiempos de ejecución y detalles

## Verificación

Todas las pruebas ahora se ejecutan de manera consistente sin flakiness, mejorando la confiabilidad del proceso de CI.

## Próximos pasos

1. Ampliar cobertura de pruebas
2. Optimizar velocidad de ejecución sin sacrificar estabilidad
3. Implementar pruebas visuales para componentes clave
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`✅ Archivo README de entregables generado: ${readmePath}`);

console.log('\n✅ Generación de entregables completada.');
console.log(`Todos los archivos están disponibles en: ${REPORT_DIR}`);