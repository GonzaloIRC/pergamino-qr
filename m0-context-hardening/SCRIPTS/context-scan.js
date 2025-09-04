#!/usr/bin/env node
/*
 * context-scan.js
 *
 * Escanea el repositorio Pergamino‑QR local y genera un snapshot de contexto
 * en `agent-context/PROJECT_CONTEXT.md`.  El objetivo es proporcionar al
 * equipo y a los agentes automáticos un resumen claro del estado actual
 * del proyecto, destacando archivos clave, configuraciones importantes y
 * posibles riesgos de conformidad con el MegaPrompt.
 *
 * Este script no tiene dependencias externas más allá de los módulos
 * incorporados de Node.js.  Si necesitas extender su funcionalidad,
 * evita agregar dependencias de terceros; usa APIs estándar de Node.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Utilidades auxiliares ----------------------------------------------------

/**
 * Intenta ejecutar un comando de shell y devuelve su salida como cadena.
 * Si el comando falla, devuelve una cadena vacía.
 *
 * @param {string} cmd El comando a ejecutar.
 * @returns {string} La salida estándar del comando.
 */
function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (err) {
    return '';
  }
}

/**
 * Comprueba si existe un archivo relativo a la raíz del repositorio.
 *
 * @param {string} relPath Ruta relativa desde el directorio actual.
 * @returns {boolean} true si el archivo existe y es accesible.
 */
function fileExists(relPath) {
  try {
    return fs.statSync(path.join(process.cwd(), relPath)).isFile();
  } catch {
    return false;
  }
}

/**
 * Busca recursivamente en un directorio todas las coincidencias de un patrón de texto.
 *
 * @param {string} dir Directorio en el que buscar.
 * @param {RegExp} regex Expresión regular a evaluar sobre cada archivo de texto.
 * @param {string[]} results Acumulador interno de rutas donde se encontraron coincidencias.
 * @param {number} depth Profundidad máxima de búsqueda para evitar escaneo infinito.
 */
function searchInDir(dir, regex, results = [], depth = 5) {
  if (depth < 0) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // omitir node_modules y .git para acelerar
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      searchInDir(fullPath, regex, results, depth - 1);
    } else if (entry.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (regex.test(content)) {
          results.push(path.relative(process.cwd(), fullPath));
        }
      } catch {
        // ignore read errors
      }
    }
  }
  return results;
}

// Función principal --------------------------------------------------------

function generateContextReport() {
  const report = [];
  const now = new Date().toISOString();
  report.push(`# Contexto del Proyecto — Pergamino-QR`);
  report.push(``);
  report.push(`Generado automáticamente: ${now}`);
  report.push(``);

  // Resumen de ramas
  let branchSummary = '';
  const remoteBranches = safeExec('git branch -r --no-color');
  const localBranches  = safeExec('git branch --no-color');
  branchSummary += `**Ramas remotas:** ${remoteBranches || 'no detectadas'}`;
  branchSummary += `\n**Ramas locales:** ${localBranches || 'no detectadas'}`;
  report.push('## Ramas y Pull Requests');
  report.push(branchSummary);
  report.push('');

  // PRs abiertos (no implementamos API aquí; se puede suplir manualmente)
  report.push('- **PRs abiertos:** este script no consulta la API de GitHub.  Verificar manualmente.');
  report.push('');

  // Archivos clave esperados
  const expectedFiles = [
    'DECISIONES.md',
    'AGENT_AUDIT.md',
    'agent-context/AGENT_CONTEXT.md',
    'agent-context/DOCS/version-matrix.md',
    'agent-context/DOCS/constraints.md',
    'firebase.json',
    'firebase/firestore.rules',
    'firebase/firestore.indexes.json',
    'app.config.ts',
    'babel.config.js',
    'package.json',
    'scripts/seedBeneficioDemo.js',
    '.env.example',
  ];
  report.push('## Archivos Clave');
  for (const file of expectedFiles) {
    const exists = fileExists(file);
    report.push(`- ${file}: ${exists ? '✅' : '❌ no encontrado'}`);
  }
  report.push('');

  // Comprobaciones de dependencias en package.json
  let pkgData = {};
  try {
    pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  } catch {}
  report.push('## Dependencias y Configuraciones');
  if (pkgData.engines && pkgData.engines.node) {
    report.push(`- **Node (engines):** ${pkgData.engines.node}`);
  }
  if (pkgData.scripts && pkgData.scripts.start) {
    report.push(`- **Script start:** ${pkgData.scripts.start}`);
  }
  if (pkgData.dependencies) {
    report.push(`- **expo-camera:** ${pkgData.dependencies['expo-camera'] ? 'presente' : 'no instalado'}`);
    report.push(`- **expo-barcode-scanner:** ${pkgData.dependencies['expo-barcode-scanner'] ? '⚠️ presente' : 'ausente ✅'}`);
  }
  report.push('');

  // Scanner: buscar importaciones de expo-barcode-scanner y expo-camera
  const cameraUses = searchInDir('src', /expo-camera/, [], 4);
  const barcodeUses = searchInDir('src', /expo-barcode-scanner/, [], 4);
  report.push('## Uso de Escáner');
  report.push(`- Archivos que usan **expo-camera**: ${cameraUses.length ? cameraUses.join(', ') : 'ninguno'}`);
  report.push(`- Archivos que usan **expo-barcode-scanner**: ${barcodeUses.length ? '⚠️ ' + barcodeUses.join(', ') : 'ninguno ✅'}`);
  report.push('');

  // Payloads QR
  const bnfFiles = searchInDir('src', /BNF:/, [], 4);
  const appFiles = searchInDir('src', /APP:/, [], 4);
  report.push('## Referencias de Códigos QR');
  report.push(`- Archivos con payload **BNF:** ${bnfFiles.length ? bnfFiles.join(', ') : 'ninguno'}`);
  report.push(`- Archivos con payload **APP:{dni}:** ${appFiles.length ? appFiles.join(', ') : 'ninguno'}`);
  report.push('');

  // Reglas e índices
  const rulesExists = fileExists('firebase/firestore.rules');
  const indexesExists = fileExists('firebase/firestore.indexes.json');
  report.push('## Firestore');
  report.push(`- **Reglas**: ${rulesExists ? 'presente' : '❌ falta'}`);
  report.push(`- **Índices**: ${indexesExists ? 'presente' : '❌ falta'}`);
  if (rulesExists) {
    const rules = fs.readFileSync('firebase/firestore.rules', 'utf8');
    if (/allow read, write: if true/.test(rules)) {
      report.push('- ⚠️ Se detectó una regla permisiva `allow read, write: if true;`');
    }
  }
  if (indexesExists) {
    const idx = JSON.parse(fs.readFileSync('firebase/firestore.indexes.json', 'utf8'));
    const idxCount = Array.isArray(idx.indexes) ? idx.indexes.length : 0;
    report.push(`- Cantidad de índices configurados: ${idxCount}`);
  }
  report.push('');

  // Archivos sensibles
  const sensitiveFiles = [];
  ['.env', '.env.local', 'serviceAccount.json', 'serviceAccountKey.json', 'gpt-context/tools/serviceAccount.json'].forEach((f) => {
    if (fileExists(f)) sensitiveFiles.push(f);
  });
  report.push('## Archivos Sensibles');
  if (sensitiveFiles.length) {
    report.push(`⚠️ Se detectaron archivos potencialmente sensibles en el repo: ${sensitiveFiles.join(', ')}`);
  } else {
    report.push('No se detectaron archivos de credenciales o .env en el repositorio. ✅');
  }
  report.push('');

  // Escribir el archivo
  const outPath = path.join(process.cwd(), 'agent-context', 'PROJECT_CONTEXT.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, report.join('\n'));
  console.log(`Contexto guardado en ${outPath}`);
}

generateContextReport();