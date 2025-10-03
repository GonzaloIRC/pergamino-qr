import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const out = [];
function h(t){ out.push(`\n## ${t}\n`); }
function p(t){ out.push(t + '\n'); }
function safe(path){ return existsSync(path) ? readFileSync(path, 'utf8') : ''; }

h('Resumen de entorno');
try {
  p(`node: ${execSync('node -v').toString().trim()}`);
  p(`npm: ${execSync('npm -v').toString().trim()}`);
} catch {}

h('Dependencias clave (package.json)');
const pkg = JSON.parse(safe('package.json') || '{}');
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const need = ['expo','react-native','react','expo-camera','firebase','@react-navigation/native','react-native-reanimated'];
need.forEach(k => p(`${k}: ${deps?.[k] || 'NO ENCONTRADA'}`));

h('Expo config');
const appTs = safe('app.config.ts');
const appJson = safe('app.json');
p(appTs ? 'app.config.ts encontrado ✅' : 'app.config.ts NO encontrado ❌');
if(appJson) p('app.json presente (revisar que no duplique config) ⚠️');

h('Babel/Metro');
p(existsSync('babel.config.js') ? 'babel.config.js ✅' : 'babel.config.js ❌');
p(existsSync('metro.config.js') ? 'metro.config.js ✅' : 'metro.config.js ⚠️ (opcional)');

h('.env.local flags');
const env = safe('.env.local');
['EXPO_PUBLIC_USE_EMULATORS','EXPO_PUBLIC_FIREBASE_PROJECT_ID','QR_TTL_SECONDS','SCAN_COOLDOWN_MS'].forEach(k=>{
  const ok = env.includes(k);
  p(`${k}: ${ok ? 'definido ✅' : 'faltante ⚠️'}`);
});

h('Patrones de riesgo/cobertura en código');
function grep(rx){
  try{
    const r = execSync(`powershell -Command "Select-String -Path .\\**\\*.{js,jsx,ts,tsx} -Pattern '${rx}' -AllMatches"`, {stdio:['pipe','pipe','ignore']}).toString();
    return r.split('\n').filter(Boolean).slice(0,20).join('\n');
  }catch{return '';}
}
p('expo-barcode-scanner:\n' + (grep('expo-barcode-scanner') || 'No encontrado ✅'));
p('CameraView (expo-camera):\n' + (grep('CameraView') || 'No encontrado ⚠️ (debería existir)'));
p('Duplicados Firebase (initializeApp/getApp/getApps):\n' + (grep('initializeApp|getApp|getApps') || 'No se ven duplicados evidentes'));
p('Parser QR (BNF:/APP:):\n' + (grep('BNF:|APP:') || 'No encontrado ⚠️'));

h('Modelos esperados (archivos comunes)');
['src/services/firebaseClient.ts','src/services/firebaseClient.js','src/screens/ScannerScreen.tsx','src/screens/Admin/*','src/components/QrDynamicCard.tsx','scripts/seedBeneficioDemo.js']
.forEach(f=> p(`${f} ${existsSync(f) ? '✅' : '❌'}`));

h('Resultado');
p('Genera este archivo para diagnóstico inicial. Revisa también REPORT/*.txt si corriste el paso 0.');
writeFileSync('REPORT/10_audit_context.md', out.join('\n'), 'utf8');

const gap = [];
function line(k,ok){ gap.push(`- ${ok?'✅':'❌'} ${k}`); }
line('Expo 53 / RN 0.79.5', !!(deps?.expo && deps['react-native']?.includes('0.79')));
line('Solo expo-camera (sin expo-barcode-scanner)', !grep('expo-barcode-scanner'));
line('app.config.ts único', !!appTs);
line('firebaseClient único', grep('initializeApp').split('\n').length <= 2);
line('QR dinámico QrDynamicCard', existsSync('src/components/QrDynamicCard.tsx'));
line('Seeds SER-0001..SER-0020', existsSync('scripts/seedBeneficioDemo.js'));
line('Roles/guards', grep('roles/|RequireRole|RequireAuth'));
line('Ajustes/global + useSettings()', grep('Ajustes/global|useSettings'));
line('Historial con filtros', grep('HistoryScreen|Historial'));
writeFileSync('REPORT/11_gap_M0_M3.md', gap.join('\n'), 'utf8');
console.log('OK -> REPORT/10_audit_context.md y REPORT/11_gap_M0_M3.md');