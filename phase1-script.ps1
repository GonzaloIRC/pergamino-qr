# Script PowerShell para implementar cambios en el proyecto
$ErrorActionPreference = "Stop"

function log_ok { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function log_skip { param($msg) Write-Host "↻ $msg" -ForegroundColor Yellow }
function log_info { param($msg) Write-Host "ℹ️ $msg" -ForegroundColor Blue }
function log_err { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }

# 0) Prechequeos
try {
    git rev-parse --is-inside-work-tree | Out-Null
} catch {
    log_err "No es un repo git"
    exit 1
}

try {
    git remote get-url origin | Out-Null
} catch {
    log_err "No encuentro remote 'origin'"
    exit 1
}

$GH_OK = $false
if (Get-Command gh -ErrorAction SilentlyContinue) {
    try {
        gh auth status | Out-Null
        $GH_OK = $true
    } catch {}
}

log_info "gh CLI: $(if ($GH_OK) { 'autenticado' } else { 'no disponible' })"

# Función: añadir/actualizar scripts en package.json (merge no destructivo)
function ensure_npm_scripts {
    $packageJsonPath = "package.json"
    if (-Not (Test-Path $packageJsonPath)) { return "NOCHANGE" }

    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    $changed = $false
    
    if (-Not $packageJson.scripts) {
        $packageJson | Add-Member -NotePropertyName scripts -NotePropertyValue ([PSCustomObject]@{})
    }
    
    $wantScripts = @{
        "start:dev" = "expo start --dev-client"
        "emulators:start" = "firebase emulators:start"
        "emulators:export" = "firebase emulators:export ./emulator-data"
        "seed:test-user" = "node scripts/seedBeneficioDemo.js"
        "test" = "jest"
        "run:android" = "expo run:android"
        "prebuild:android" = "expo prebuild --clean --platform android"
    }
    
    foreach ($key in $wantScripts.Keys) {
        if ($packageJson.scripts.$key -ne $wantScripts[$key]) {
            $packageJson.scripts | Add-Member -NotePropertyName $key -NotePropertyValue $wantScripts[$key] -Force
            $changed = $true
        }
    }
    
    if ($changed) {
        $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $packageJsonPath -Encoding utf8
        return "CHANGED"
    }
    
    return "NOCHANGE"
}

# Función para añadir bloque de texto al final de un archivo si no existe
function append_block_if_missing {
    param($file, $signature, $content)
    
    if (-Not (Test-Path $file)) {
        log_err "Archivo no existe: $file"
        return $false
    }
    
    $fileContent = Get-Content $file -Raw
    if ($fileContent -match [regex]::Escape($signature)) {
        log_skip "Bloque ya presente en $file ($signature)"
        return $true
    }
    
    Add-Content -Path $file -Value $content
    log_ok "Bloque añadido a $file"
    return $true
}

# -----------------------------------------
# PARTE A — Cerrar PR fix/infra-compat
# -----------------------------------------
try {
    git fetch origin --quiet | Out-Null
} catch {}

try {
    git rev-parse --verify fix/infra-compat | Out-Null
    git switch fix/infra-compat
    log_skip "Rama fix/infra-compat ya existía"
} catch {
    try {
        git switch -c fix/infra-compat origin/main
    } catch {
        git switch -c fix/infra-compat
    }
    log_ok "Rama fix/infra-compat creada desde main"
}

# A.1 REPORT/
if (-Not (Test-Path "REPORT")) {
    New-Item -Path "REPORT" -ItemType Directory | Out-Null
}

if (-Not (Test-Path "REPORT\compat.md")) {
    @'
# compat.md
Paquetes a chequear: expo, react-native, react, @react-navigation/*, react-native-paper,
react-native-reanimated, expo-camera, @react-native-async-storage/async-storage, firebase

Tabla:
Paquete | Instalada | Recomendada (Expo 53)
---|---|---
expo | (leer) | ^53.x
react-native | (leer) | 0.79.5
react | (leer) | 18.3.1
@react-navigation/native | (leer) | ^6.1.x
@react-navigation/native-stack | (leer) | ^6.9.x
react-native-reanimated | (leer) | ~3.16.x
expo-camera | (leer) | via `npx expo install`
@react-native-async-storage/async-storage | (leer) | ^1.23.x
react-native-paper | (leer) | ^5.12.x
firebase | (leer) | ^10.12.x

Comandos sugeridos:
- `npx expo install react react-native react-native-reanimated expo-camera @react-native-async-storage/async-storage`
- `npm i -S @react-navigation/native @react-navigation/native-stack react-native-paper firebase`
'@ | Out-File -FilePath "REPORT\compat.md" -Encoding utf8
    log_ok "REPORT\compat.md creado"
} else {
    log_skip "REPORT\compat.md ya existe"
}

if (-Not (Test-Path "REPORT\firebase.md")) {
    @'
# firebase.md
- Config activa: app.config.ts (si hay app.json con contenido, renombrar a app.json.bak)
- .env.local con EXPO_PUBLIC_FIREBASE_* y flags de emuladores
- firebase.json: auth 9099, firestore 8080, ui 4000
- .firebaserc con projects.default correcto
- Diagnóstico: getEmulatorStatus(), checkEmulatorConfig() en src/services/firebaseClient.js
'@ | Out-File -FilePath "REPORT\firebase.md" -Encoding utf8
    log_ok "REPORT\firebase.md creado"
} else {
    log_skip "REPORT\firebase.md ya existe"
}

if (-Not (Test-Path "REPORT\firebase-duplicates.md")) {
    @'
# firebase-duplicates.md
Buscar inicializaciones fuera de src/services/firebaseClient.js:
grep -R "initializeApp(" -n src | grep -v "firebaseClient"
grep -R "initializeAuth(" -n src | grep -v "firebaseClient"
grep -R "getAuth(" -n src | grep -v "firebaseClient"
grep -R "getFirestore(" -n src | grep -v "firebaseClient"

Esperado: 0 resultados. Si hay, refactor a:
import { app, auth, db } from '../services/firebaseClient';
'@ | Out-File -FilePath "REPORT\firebase-duplicates.md" -Encoding utf8
    log_ok "REPORT\firebase-duplicates.md creado"
} else {
    log_skip "REPORT\firebase-duplicates.md ya existe"
}

# A.2 Diagnóstico en src/services/firebaseClient.js
$FC = "src\services\firebaseClient.js"
if (Test-Path $FC) {
    $fcContent = Get-Content $FC -Raw
    
    if ($fcContent -match "export function getEmulatorStatus") {
        log_skip "getEmulatorStatus() ya existe en firebaseClient.js"
    } else {
        $emulatorStatusFunction = @'

export function getEmulatorStatus() {
  const use = String(process.env.EXPO_PUBLIC_USE_EMULATORS || '0') === '1';
  return {
    use,
    authHost: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost',
    authPort: Number(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || 9099),
    fsHost: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost',
    fsPort: Number(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || 8080),
  };
}
'@
        Add-Content -Path $FC -Value $emulatorStatusFunction
        log_ok "Añadido getEmulatorStatus() a firebaseClient.js"
    }
    
    if ($fcContent -match "export function checkEmulatorConfig") {
        log_skip "checkEmulatorConfig() ya existe en firebaseClient.js"
    } else {
        $checkEmulatorFunction = @'

export function checkEmulatorConfig() {
  const s = getEmulatorStatus();
  const missing = [];
  if (!process.env.EXPO_PUBLIC_FIREBASE_API_KEY) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.EXPO_PUBLIC_FIREBASE_APP_ID) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID');
  if (s.use && (!s.authHost || !s.authPort)) missing.push('AUTH_EMULATOR host/port');
  if (s.use && (!s.fsHost || !s.fsPort)) missing.push('FIRESTORE_EMULATOR host/port');
  return { ok: missing.length === 0, missing, status: s };
}
'@
        Add-Content -Path $FC -Value $checkEmulatorFunction
        log_ok "Añadido checkEmulatorConfig() a firebaseClient.js"
    }
} else {
    log_err "No existe $FC; revisa estructura del proyecto"
}

# A.3 Scripts npm
$CHG = ensure_npm_scripts
if ($CHG -eq "CHANGED") {
    log_ok "package.json scripts actualizados"
} else {
    log_skip "package.json scripts sin cambios"
}

# A.4 Commit/Push/PR
$status = git status --porcelain
if ($status) {
    git add REPORT src/services/firebaseClient.js package.json 2>$null
    try {
        git diff --cached --quiet
        log_skip "No hay cambios staged para commit"
    } catch {
        try {
            git commit -m "fix(infra): reports + firebase diagnostics + npm scripts (idempotent)"
            log_ok "Commit infra listo"
        } catch {
            log_skip "No se pudo crear commit"
        }
    }
} else {
    log_skip "Working tree limpio"
}

try {
    git push -u origin fix/infra-compat
} catch {
    log_skip "Push no requerido"
}

if ($GH_OK) {
    try {
        gh pr view --head fix/infra-compat | Out-Null
        log_skip "PR fix/infra-compat ya existe"
    } catch {
        try {
            gh pr create --title "fix/infra-compat — Expo config, env, emulators, diagnóstico Firebase" `
                --body "Este PR incluye:`n- REPORT/compat.md, firebase.md, firebase-duplicates.md`n- Diagnóstico en firebaseClient.js: getEmulatorStatus()/checkEmulatorConfig()`n- Scripts npm para dev/emuladores/tests`n`n**Cómo probar**`n````nnpm ci`nnpx expo install`nnpm run emulators:start   # UI 4000, Auth 9099, Firestore 8080`nnpx expo start --dev-client`n```" `
                --base main --head fix/infra-compat
        } catch {
            log_err "No se pudo crear PR A"
        }
    }
} else {
    log_info "Crea PR manual a main desde fix/infra-compat con el cuerpo sugerido arriba."
}

# -----------------------------------------
# PARTE B — M1 (rama apilada fix/phase1-base)
# -----------------------------------------
try {
    git fetch origin --quiet | Out-Null
} catch {}

try {
    git show-ref --verify --quiet refs/heads/fix/phase1-base
    git switch fix/phase1-base
    log_skip "Rama fix/phase1-base ya existía"
} catch {
    try {
        git show-ref --verify --quiet refs/heads/fix/infra-compat
        git switch -c fix/phase1-base fix/infra-compat
    } catch {
        try {
            git switch -c fix/phase1-base origin/main
        } catch {
            git switch -c fix/phase1-base
        }
    }
    log_ok "Rama fix/phase1-base creada"
}

# Crear directorios necesarios
$dirs = @("scripts", "src\utils", "src\services", "src\screens", "src\components\BarcodeScanner", ".github")
foreach ($dir in $dirs) {
    if (-Not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    }
}

# B.1 Seed idempotente
$SEED = "scripts\seedBeneficioDemo.js"
if (-Not (Test-Path $SEED)) {
    @'
/* Seed demo: beneficio + seriales SER-0001..SER-0020 (idempotente) */
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';

const cfg = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'demo',
};
const app = initializeApp(cfg);
const db = getFirestore(app);

async function main() {
  const beneficioId = 'beneficio-demo';
  const beneficioRef = doc(db, 'Beneficios', beneficioId);
  const exists = await getDoc(beneficioRef);
  if (!exists.exists()) {
    await setDoc(beneficioRef, {
      nombre: 'Café Pergamino (demo)',
      descripcion: '1x café gratis',
      activo: true,
      creadoEn: new Date(),
    });
    console.log('Beneficio creado');
  } else {
    console.log('Beneficio ya existía');
  }

  const batch = writeBatch(db);
  for (let i = 1; i <= 20; i++) {
    const serial = `SER-${String(i).padStart(4, '0')}`;
    const ref = doc(db, 'BeneficioSeriales', serial);
    const d = await getDoc(ref);
    if (!d.exists()) {
      batch.set(ref, {
        beneficioId,
        estado: 'activo',
        emitidoA: null,
        creadoEn: new Date(),
      });
    }
  }
  await batch.commit();
  console.log('Seriales listos (idempotente)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
'@ | Out-File -FilePath $SEED -Encoding utf8
    log_ok "Seed creado: $SEED"
} else {
    log_skip "Seed ya existía: $SEED"
}

# B.2 Utils QR
if (-Not (Test-Path "src\utils\qr.js")) {
    @'
export function parseQrPayload(data) {
  if (typeof data !== 'string') return null;
  if (data.startsWith('BNF:')) return { type: 'beneficio', serial: data.slice(4) };
  if (data.startsWith('APP:')) {
    const [_, dni, nonce] = data.split(':');
    if (!dni || !nonce) return null;
    return { type: 'app', dni, nonce };
  }
  return null;
}
'@ | Out-File -FilePath "src\utils\qr.js" -Encoding utf8
    log_ok "Utils QR creado"
} else {
    log_skip "Utils QR ya presente"
}

# B.3 Transacciones Firestore
if (-Not (Test-Path "src\services\transactions.js")) {
    @'
import { db } from './firebaseClient';
import {
  doc, getDoc, serverTimestamp, runTransaction, collection, addDoc
} from 'firebase/firestore';

export async function transactRedeemSerial({ serial, user }) {
  const serialRef = doc(db, 'BeneficioSeriales', serial);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(serialRef);
    if (!snap.exists()) throw new Error('Serial inexistente');
    const data = snap.data();
    if (data.estado !== 'activo') throw new Error('Serial no activo');
    if (data.emitidoA && user?.dni && data.emitidoA !== user.dni) {
      throw new Error('Serial asignado a otro DNI');
    }
    tx.update(serialRef, {
      estado: 'usado',
      canjeadoPor: user?.uid || null,
      canjeadoEn: serverTimestamp(),
    });
    await addDoc(collection(db, 'Historial'), {
      tipo: 'canje',
      serial,
      userId: user?.uid || null,
      dni: user?.dni || null,
      ts: serverTimestamp(),
    });
  });
}

export async function recordAccumulation({ dni, nonce, user }) {
  await addDoc(collection(db, 'Historial'), {
    tipo: 'acumulacion',
    dni,
    nonce,
    userId: user?.uid || null,
    ts: serverTimestamp(),
  });
}
'@ | Out-File -FilePath "src\services\transactions.js" -Encoding utf8
    log_ok "Transacciones creadas"
} else {
    log_skip "Transacciones ya presentes"
}

# B.4 ScannerScreen
if (-Not (Test-Path "src\screens\ScannerScreen.js")) {
    @'
import React, { useRef, useState, useContext } from 'react';
import { View, Text, Alert } from 'react-native';
import Scanner from '../components/BarcodeScanner/Scanner';
import { parseQrPayload } from '../utils/qr';
import { transactRedeemSerial, recordAccumulation } from '../services/transactions';
import { AuthCtx } from '../context/AuthContext';

export default function ScannerScreen() {
  const { user } = useContext(AuthCtx);
  const handling = useRef(false);
  const [open, setOpen] = useState(true);

  async function onPayload(data) {
    if (handling.current) return;
    handling.current = true;
    try {
      const p = parseQrPayload(data);
      if (!p) throw new Error('QR inválido');
      if (p.type === 'beneficio') {
        await transactRedeemSerial({ serial: p.serial, user });
        Alert.alert('OK', `Canjeado: ${p.serial}`);
      } else {
        await recordAccumulation({ dni: p.dni, nonce: p.nonce, user });
        Alert.alert('OK', `Acumulación: DNI ${p.dni}`);
      }
    } catch (e) {
      Alert.alert('Error', e.message || String(e));
    } finally {
      setTimeout(() => { handling.current = false; }, 1500);
    }
  }

  if (!open) return <View style={{padding:16}}><Text>Scanner cerrado</Text></View>;
  return <Scanner onPayload={onPayload} onClose={() => setOpen(false)} />;
}
'@ | Out-File -FilePath "src\screens\ScannerScreen.js" -Encoding utf8
    log_ok "ScannerScreen creada"
} else {
    log_skip "ScannerScreen ya presente"
}

# B.5 Componente Scanner
if (-Not (Test-Path "src\components\BarcodeScanner\Scanner.js")) {
    New-Item -Path "src\components\BarcodeScanner" -ItemType Directory -Force | Out-Null
    @'
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Camera } from 'expo-camera';

const DEBOUNCE_MS = Number(process.env.EXPO_PUBLIC_SCAN_DEBOUNCE_MS || 1500);

export default function Scanner({ onPayload, onClose }) {
  const [perm, setPerm] = useState(null);
  const lastRef = useRef(0);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => setPerm(status==='granted'));
  }, []);

  if (perm === null) return <Text>Solicitando permisos…</Text>;
  if (!perm) return <Text>Permiso de cámara denegado</Text>;

  return (
    <View style={{ flex:1 }}>
      <Camera
        style={{ flex:1 }}
        onBarCodeScanned={({ data }) => {
          const now = Date.now();
          if (now - lastRef.current < DEBOUNCE_MS) return;
          lastRef.current = now;
          onPayload?.(data);
        }}
      />
      <Pressable onPress={onClose} style={{ position:'absolute', top:20, right:20, padding:8, backgroundColor:'#0008', borderRadius:8 }}>
        <Text style={{ color:'#fff' }}>Cerrar</Text>
      </Pressable>
    </View>
  );
}
'@ | Out-File -FilePath "src\components\BarcodeScanner\Scanner.js" -Encoding utf8
    log_ok "Componente Scanner creado"
} else {
    log_skip "Componente Scanner ya existe"
}

# B.6 Customers (CRM básico)
if (-Not (Test-Path "src\screens\Customers.js")) {
    @'
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { db } from '../services/firebaseClient';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';

export default function Customers() {
  const [dni, setDni] = useState('');
  const [qtext, setQtext] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const qcol = collection(db, 'Clientes');
    const q = qtext ? query(qcol, where('dni', '>=', qtext), where('dni', '<=', qtext + '\uf8ff')) : qcol;
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [qtext]);

  async function create() {
    if (!dni) return;
    await setDoc(doc(db, 'Clientes', dni), { dni, creadoEn: new Date() }, { merge: true });
    setDni('');
  }

  return (
    <View style={{ padding: 12 }}>
      <Text>DNI único</Text>
      <TextInput placeholder="DNI" value={dni} onChangeText={setDni} style={{borderWidth:1, padding:8, marginVertical:8}} />
      <Button title="Crear cliente" onPress={create} />
      <TextInput placeholder="Buscar DNI..." value={qtext} onChangeText={setQtext} style={{borderWidth:1, padding:8, marginVertical:12}} />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => <Text>{item.dni}</Text>}
      />
    </View>
  );
}
'@ | Out-File -FilePath "src\screens\Customers.js" -Encoding utf8
    log_ok "Customers creado"
} else {
    log_skip "Customers ya presente"
}

# B.7 Inyección de rutas en AppNavigator
$NAV = "src\navigation\AppNavigator.js"
if (Test-Path $NAV) {
    $navContent = Get-Content $NAV -Raw
    
    # Imports Scanner/Customers
    if ($navContent -notmatch "from '../screens/ScannerScreen'") {
        $navContent = $navContent -replace "(^import React.*)", "`$1`nimport Scanner from '../screens/ScannerScreen';`nimport Customers from '../screens/Customers';"
        $navContent | Out-File -FilePath $NAV -Encoding utf8
        log_ok "Imports Scanner/Customers añadidos a AppNavigator"
    } else {
        log_skip "Imports de Scanner/Customers ya presentes"
    }
    
    # Imports guards
    $navContent = Get-Content $NAV -Raw
    if ($navContent -notmatch "RequireAuth") {
        $navContent = $navContent -replace "(^import React.*)", "`$1`nimport { RequireAuth, RequireRole } from './RouteGuards';"
        $navContent | Out-File -FilePath $NAV -Encoding utf8
        log_ok "Imports de RouteGuards añadidos"
    } else {
        log_skip "RouteGuards ya importados"
    }
    
    # Screens
    $navContent = Get-Content $NAV -Raw
    if ($navContent -notmatch 'name="Scanner"') {
        $navContent = $navContent -replace '(<\/Stack.Navigator>)', "    <Stack.Screen name=`"Scanner`" children={() => (`n          <RequireAuth><RequireRole role={['waiter','admin']}><Scanner/></RequireRole></RequireAuth>`n        )}/>`n`$1"
        $navContent | Out-File -FilePath $NAV -Encoding utf8
        log_ok "Ruta Scanner añadida"
    } else {
        log_skip "Ruta Scanner ya existente"
    }
    
    $navContent = Get-Content $NAV -Raw
    if ($navContent -notmatch 'name="Customers"') {
        $navContent = $navContent -replace '(<\/Stack.Navigator>)', "    <Stack.Screen name=`"Customers`" children={() => (`n          <RequireAuth><RequireRole role={['waiter','admin']}><Customers/></RequireRole></RequireAuth>`n        )}/>`n`$1"
        $navContent | Out-File -FilePath $NAV -Encoding utf8
        log_ok "Ruta Customers añadida"
    } else {
        log_skip "Ruta Customers ya existente"
    }
} else {
    # Si no existe, crear esqueleto mínimo
    New-Item -Path "src\navigation" -ItemType Directory -Force | Out-Null
    @'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RequireAuth, RequireRole } from './RouteGuards';
import Scanner from '../screens/ScannerScreen';
import Customers from '../screens/Customers';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Scanner" children={() => (
          <RequireAuth><RequireRole role={['waiter','admin']}><Scanner/></RequireRole></RequireAuth>
        )}/>
        <Stack.Screen name="Customers" children={() => (
          <RequireAuth><RequireRole role={['waiter','admin']}><Customers/></RequireRole></RequireAuth>
        )}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
'@ | Out-File -FilePath $NAV -Encoding utf8
    log_ok "AppNavigator básico creado"
}

# B.8 PR Template
$TPL = ".github\pull_request_template.md"
if (-Not (Test-Path $TPL)) {
    New-Item -Path ".github" -ItemType Directory -Force | Out-Null
    @'
## Alcance
- M1: Auth mínima + Scanner + CRM básico + Seeds + Docs

## Checklist
- [ ] Auth anónima o Email/Password habilitada (SDK modular)
- [ ] Scanner con expo-camera + debounce 1.5s
- [ ] BNF:{serial} => transacción estado activo->usado + Historial: canje
- [ ] APP:{dni}:{nonce} => Historial: acumulacion
- [ ] CRM Clientes: DNI único, búsqueda en vivo, listado con onSnapshot
- [ ] Seed beneficio + seriales SER-0001..SER-0020
- [ ] README/CHANGELOG actualizados

## Cómo probar
```bash
npm ci
npm run emulators:start
node scripts/seedBeneficioDemo.js
npx expo start --dev-client
# Probar Scanner con BNF:SER-0001 y APP:12345678:abc
```
'@ | Out-File -FilePath $TPL -Encoding utf8
    log_ok "PR template M1 creado"
} else {
    log_skip "PR template ya existe"
}

log_ok "Script completado con éxito"
