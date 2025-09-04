#!/usr/bin/env node
/**
 * context-scan.js — Snapshot del repo sin dependencias externas.
 * Ejecuta escaneos de archivos, busca patrones y vuelca un PROJECT_CONTEXT.md.
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'agent-context', 'PROJECT_CONTEXT.md');

function safeExec(cmd) {
  try {
    return cp.execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

function fileExists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); } catch { return null; }
}

function grep(pattern, dirOrFile) {
  const results = [];
  const rootPath = path.join(ROOT, dirOrFile || '');
  function walk(p) {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      for (const f of fs.readdirSync(p)) {
        if (['.git', 'node_modules', 'android', 'ios', 'build', 'dist'].includes(f)) continue;
        walk(path.join(p, f));
      }
    } else {
      const text = fs.readFileSync(p, 'utf8');
      if (pattern.test(text)) results.push(path.relative(ROOT, p));
    }
  }
  if (fs.existsSync(rootPath)) walk(rootPath);
  return Array.from(new Set(results)).sort();
}

function main() {
  const requiredFiles = [
    'DECISIONES.md',
    'AGENT_AUDIT.md',
    'agent-context/AGENT_CONTEXT.md',
    'agent-context/DOCS/version-matrix.md',
    'agent-context/DOCS/constraints.md',
    'firestore.rules',
    'firestore.indexes.json',
    'firebase.json',
    'app.config.ts',
    'babel.config.js',
    'SCRIPTS/seedBeneficioDemo.js',
    'README.md',
    'CHANGELOG.md'
  ];

  const filesPresent = requiredFiles.filter(fileExists);
  const filesMissing = requiredFiles.filter(f => !filesPresent.includes(f));

  const pkg = readJSON('package.json');
  const nodeEngine = pkg?.engines?.node || '(sin engines.node)';
  const startScript = pkg?.scripts?.start || '(sin script start)';
  const deps = Object.keys(pkg?.dependencies || {});

  const hasExpoCamera = deps.includes('expo-camera') || grep(/expo-camera/, 'src').length > 0;
  const hasBarcodeScanner = deps.includes('expo-barcode-scanner') || grep(/expo-barcode-scanner/, 'src').length > 0;
  const hasInterfacePkgs = grep(/-interface['"]?/, 'src').length > 0;

  const payloadBNF = grep(/BNF:/, 'src');
  const payloadAPP = grep(/APP:[^\\s]*/, 'src');

  const envExample = fileExists('.env.example');
  const leaks = grep(/(API_KEY|SECRET|PRIVATE_KEY|SERVICE_ACCOUNT|BEGIN PRIVATE KEY)/i, '.'); // heurística simple
  const trackedSecrets = ['.env', 'serviceAccount.json', 'service-account.json', 'firebase-service-account.json']
    .filter(fileExists);

  // git info
  const defaultRemoteHead = safeExec('git symbolic-ref --quiet refs/remotes/origin/HEAD || true');
  const defaultBranch = defaultRemoteHead.split('/').pop() || (safeExec('git rev-parse --abbrev-ref HEAD') || '');
  const branches = safeExec('git branch -a --format="%(refname:short)"');
  const lastCommits = safeExec('git log --oneline -n 10');
  const remotes = safeExec('git remote -v');

  const indexes = fileExists('firestore.indexes.json') ?
    fs.readFileSync(path.join(ROOT, 'firestore.indexes.json'), 'utf8') : '(faltante)';
  const rules = fileExists('firestore.rules') ?
    fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8') : '(faltante)';

  const now = new Date().toISOString();

  const md = `# PROJECT_CONTEXT.md — Snapshot real
Generado: ${now}

## Git
- Default branch: \`${defaultBranch}\`
- Branches (top):\n${branches ? branches.split('\n').slice(0, 20).map(b => `  - ${b}`).join('\n') : '  (sin datos)'}
- Últimos commits:\n${lastCommits ? lastCommits.split('\n').map(c => `  - ${c}`).join('\n') : '  (sin datos)'}
- Remotes:\n${remotes ? remotes.split('\n').map(r => `  - ${r}`).join('\n') : '  (sin datos)'}

## Archivos clave (según Megaprompt)
- Presentes: ${filesPresent.length ? filesPresent.map(f => '`'+f+'`').join(', ') : 'ninguno'}
- Faltantes: ${filesMissing.length ? filesMissing.map(f => '`'+f+'`').join(', ') : 'ninguno'}

## Scanner / QR
- expo-camera: ${hasExpoCamera ? 'ENCONTRADO' : 'NO encontrado'}
- expo-barcode-scanner: ${hasBarcodeScanner ? 'ENCONTRADO (⚠️ prohibido)' : 'no'}
- *-interface: ${hasInterfacePkgs ? 'ENCONTRADO (⚠️ revisar)' : 'no'}
- Payload BNF: ${payloadBNF.length ? 'ENCONTRADO' : 'no'} ${payloadBNF.slice(0,5).map(f => `(${f})`).join(' ')}
- Payload APP: ${payloadAPP.length ? 'ENCONTRADO' : 'no'} ${payloadAPP.slice(0,5).map(f => `(${f})`).join(' ')}

## package.json
- engines.node: \`${nodeEngine}\` (esperado 20.x)
- scripts.start: \`${startScript}\` (esperado: "expo start --dev-client")

## Firestore
### Reglas
\`\`\`\n${rules}\n\`\`\`
### Índices
\`\`\`\n${indexes}\n\`\`\`

## Entornos y secretos
- \`.env.example\`: ${envExample ? 'presente' : 'faltante'}
- Posibles secretos versionados (heurística): ${leaks.length ? leaks.slice(0,5).map(f => `(${f})`).join(' ') : 'no hallados'}
- Archivos sensibles rastreados: ${trackedSecrets.length ? trackedSecrets.map(f => '`'+f+'`').join(', ') : 'ninguno'}

> **Nota:** Para PRs y Issues remotos es necesario acceso por red a GitHub; este script solo inspecciona el repo local.

`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, md, 'utf8');
  console.log(`[OK] Snapshot escrito en: ${OUT}`);
}

main();
