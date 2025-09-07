#!/usr/bin/env bash
set -euo pipefail

log_ok(){ echo "✅ $*"; }
log_skip(){ echo "↻ $*"; }
log_info(){ echo "ℹ️  $*"; }
log_err(){ echo "❌ $*" >&2; }

# 0) Prechequeos
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { log_err "No es un repo git"; exit 1; }
git remote get-url origin >/dev/null 2>&1 || { log_err "No encuentro remote 'origin'"; exit 1; }
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then GH_OK=1; else GH_OK=0; fi
else GH_OK=0; fi
log_info "gh CLI: $([ ${GH_OK:-0} -eq 1 ] && echo 'autenticado' || echo 'no disponible')"

# Función: añadir/actualizar scripts en package.json (merge no destructivo)
ensure_npm_scripts() {
node - <<'NODE'
const fs = require('fs');
const path = 'package.json';
const want = {
  "start:dev": "expo start --dev-client",
  "emulators:start": "firebase emulators:start",
  "emulators:export": "firebase emulators:export ./emulator-data",
  "seed:test-user": "node scripts/seedBeneficioDemo.js",
  "test": "jest",
  "run:android": "expo run:android",
  "prebuild:android": "expo prebuild --clean --platform android"
};
if (!fs.existsSync(path)) { process.exit(0); }
const pkg = JSON.parse(fs.readFileSync(path,'utf8'));
pkg.scripts = pkg.scripts || {};
let changed = false;
for (const [k,v] of Object.entries(want)) {
  if (pkg.scripts[k] !== v) { pkg.scripts[k] = v; changed = true; }
}
if (changed) fs.writeFileSync(path, JSON.stringify(pkg,null,2) + '\n');
console.log(changed ? 'CHANGED' : 'NOCHANGE');
NODE
}

# Función: insertar bloque al final del archivo si no existe por firma
append_block_if_missing() {
  local file="$1"; shift
  local signature="$1"; shift
  local tmp="$(mktemp)"
  if [ ! -f "$file" ]; then log_err "Archivo no existe: $file"; return 1; fi
  if grep -q "$signature" "$file"; then
    log_skip "Bloque ya presente en $file ($signature)"
    return 0
  fi
  cat >> "$file" <<'EOFBLOCK'
'"$@"'
EOFBLOCK
  log_ok "Bloque añadido a $file"
}

# -----------------------------------------
# PARTE A — Cerrar PR fix/infra-compat
# -----------------------------------------
git fetch origin --quiet || true
if git rev-parse --verify fix/infra-compat >/dev/null 2>&1; then
  git switch fix/infra-compat
  log_skip "Rama fix/infra-compat ya existía"
else
  # Crear desde main
  git switch -c fix/infra-compat origin/main || git switch -c fix/infra-compat
  log_ok "Rama fix/infra-compat creada desde main"
fi

# A.1 REPORT/
mkdir -p REPORT
if [ ! -f REPORT/compat.md ]; then
  cat > REPORT/compat.md <<'EOF'
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
EOF
  log_ok "REPORT/compat.md creado"
else
  log_skip "REPORT/compat.md ya existe"
fi

if [ ! -f REPORT/firebase.md ]; then
  cat > REPORT/firebase.md <<'EOF'
# firebase.md
- Config activa: app.config.ts (si hay app.json con contenido, renombrar a app.json.bak)
- .env.local con EXPO_PUBLIC_FIREBASE_* y flags de emuladores
- firebase.json: auth 9099, firestore 8080, ui 4000
- .firebaserc con projects.default correcto
- Diagnóstico: getEmulatorStatus(), checkEmulatorConfig() en src/services/firebaseClient.js
EOF
  log_ok "REPORT/firebase.md creado"
else
  log_skip "REPORT/firebase.md ya existe"
fi

if [ ! -f REPORT/firebase-duplicates.md ]; then
  cat > REPORT/firebase-duplicates.md <<'EOF'
# firebase-duplicates.md
Buscar inicializaciones fuera de src/services/firebaseClient.js:
grep -R "initializeApp(" -n src | grep -v "firebaseClient"
grep -R "initializeAuth(" -n src | grep -v "firebaseClient"
grep -R "getAuth(" -n src | grep -v "firebaseClient"
grep -R "getFirestore(" -n src | grep -v "firebaseClient"

Esperado: 0 resultados. Si hay, refactor a:
import { app, auth, db } from '../services/firebaseClient';
EOF
  log_ok "REPORT/firebase-duplicates.md creado"
else
  log_skip "REPORT/firebase-duplicates.md ya existe"
fi

# A.2 Diagnóstico en src/services/firebaseClient.js
FC="src/services/firebaseClient.js"
if [ -f "$FC" ]; then
  if grep -q "export function getEmulatorStatus" "$FC"; then
    log_skip "getEmulatorStatus() ya existe en firebaseClient.js"
  else
    cat >> "$FC" <<'EOF'
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
EOF
    log_ok "Añadido getEmulatorStatus() a firebaseClient.js"
  fi
  if grep -q "export function checkEmulatorConfig" "$FC"; then
    log_skip "checkEmulatorConfig() ya existe en firebaseClient.js"
  else
    cat >> "$FC" <<'EOF'
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
EOF
    log_ok "Añadido checkEmulatorConfig() a firebaseClient.js"
  fi
else
  log_err "No existe $FC; revisa estructura del proyecto"
fi

# A.3 Scripts npm
CHG=$(ensure_npm_scripts)
if [ "$CHG" = "CHANGED" ]; then log_ok "package.json scripts actualizados"; else log_skip "package.json scripts sin cambios"; fi

# A.4 Commit/Push/PR
if [ -n "$(git status --porcelain)" ]; then
  git add REPORT src/services/firebaseClient.js package.json 2>/dev/null || true
  if git diff --cached --quiet; then
    log_skip "No hay cambios staged para commit"
  else
    git commit -m "fix(infra): reports + firebase diagnostics + npm scripts (idempotent)" || true
    log_ok "Commit infra listo"
  fi
else
  log_skip "Working tree limpio"
fi

git push -u origin fix/infra-compat || log_skip "Push no requerido"

if [ ${GH_OK:-0} -eq 1 ]; then
  # crear o actualizar PR base main
  if gh pr view --head fix/infra-compat >/dev/null 2>&1; then
    log_skip "PR fix/infra-compat ya existe"
  else
    gh pr create --title "fix/infra-compat — Expo config, env, emulators, diagnóstico Firebase" \
      --body $'Este PR incluye:\n- REPORT/compat.md, firebase.md, firebase-duplicates.md\n- Diagnóstico en firebaseClient.js: getEmulatorStatus()/checkEmulatorConfig()\n- Scripts npm para dev/emuladores/tests\n\n**Cómo probar**\n```\nnpm ci\nnpx expo install\nnpm run emulators:start   # UI 4000, Auth 9099, Firestore 8080\nnpx expo start --dev-client\n```' \
      --base main --head fix/infra-compat || log_err "No se pudo crear PR A"
  fi
else
  log_info "Crea PR manual a main desde fix/infra-compat con el cuerpo sugerido arriba."
fi

# -----------------------------------------
# PARTE B — M1 (rama apilada fix/phase1-base)
# -----------------------------------------
git fetch origin --quiet || true
if git show-ref --verify --quiet refs/heads/fix/phase1-base; then
  git switch fix/phase1-base
  log_skip "Rama fix/phase1-base ya existía"
else
  # apilada sobre fix/infra-compat si existe, si no, over main
  if git show-ref --verify --quiet refs/heads/fix/infra-compat; then
    git switch -c fix/phase1-base fix/infra-compat
  else
    git switch -c fix/phase1-base origin/main || git switch -c fix/phase1-base
  fi
  log_ok "Rama fix/phase1-base creada"
fi

mkdir -p scripts src/utils src/services src/screens src/components/BarcodeScanner .github

# B.1 Seed idempotente
SEED=scripts/seedBeneficioDemo.js
if [ ! -f "$SEED" ]; then
  cat > "$SEED" <<'EOF'
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
EOF
  log_ok "Seed creado: $SEED"
else
  log_skip "Seed ya existía: $SEED"
fi

# B.2 Utils QR
if [ ! -f src/utils/qr.js ]; then
  cat > src/utils/qr.js <<'EOF'
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
EOF
  log_ok "Utils QR creado"
else
  log_skip "Utils QR ya presente"
fi

# B.3 Transacciones Firestore
if [ ! -f src/services/transactions.js ]; then
  cat > src/services/transactions.js <<'EOF'
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
EOF
  log_ok "Transacciones creadas"
else
  log_skip "Transacciones ya presentes"
fi

# B.4 ScannerScreen (usa componente Scanner de expo-camera)
if [ ! -f src/screens/ScannerScreen.js ]; then
  cat > src/screens/ScannerScreen.js <<'EOF'
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
EOF
  log_ok "ScannerScreen creada"
else
  log_skip "ScannerScreen ya presente"
fi

# B.5 Componente Scanner (si no existe)
if [ ! -f src/components/BarcodeScanner/Scanner.js ]; then
  mkdir -p src/components/BarcodeScanner
  cat > src/components/BarcodeScanner/Scanner.js <<'EOF'
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
EOF
  log_ok "Componente Scanner creado"
else
  log_skip "Componente Scanner ya existe"
fi

# B.6 Customers (CRM básico)
if [ ! -f src/screens/Customers.js ]; then
  cat > src/screens/Customers.js <<'EOF'
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
EOF
  log_ok "Customers creado"
else
  log_skip "Customers ya presente"
fi

# B.7 Inyección de rutas en AppNavigator (si archivo existe)
NAV=src/navigation/AppNavigator.js
if [ -f "$NAV" ]; then
  # Imports Scanner/Customers
  if ! grep -q "from '../screens/ScannerScreen'" "$NAV"; then
    sed -i.bak "1,/^$/ s#^import React.*#&\nimport Scanner from '../screens/ScannerScreen';\nimport Customers from '../screens/Customers';#" "$NAV" || true
    log_ok "Imports Scanner/Customers añadidos a AppNavigator"
  else
    log_skip "Imports de Scanner/Customers ya presentes"
  fi
  # Imports guards (si faltan)
  if ! grep -q "RequireAuth" "$NAV"; then
    sed -i.bak "1,/^$/ s#^import React.*#&\nimport { RequireAuth, RequireRole } from './RouteGuards';#" "$NAV" || true
    log_ok "Imports de RouteGuards añadidos"
  else
    log_skip "RouteGuards ya importados"
  fi
  # Screens (antes de </Stack.Navigator>)
  if ! grep -q 'name="Scanner"' "$NAV"; then
    sed -i.bak "/<\/Stack.Navigator>/i \ \ \ \ <Stack.Screen name=\"Scanner\" children={() => (\n          <RequireAuth><RequireRole role={['waiter','admin']}><Scanner/></RequireRole></RequireAuth>\n        )}/>" "$NAV" || true
    log_ok "Ruta Scanner añadida"
  else
    log_skip "Ruta Scanner ya existente"
  fi
  if ! grep -q 'name="Customers"' "$NAV"; then
    sed -i.bak "/<\/Stack.Navigator>/i \ \ \ \ <Stack.Screen name=\"Customers\" children={() => (\n          <RequireAuth><RequireRole role={['waiter','admin']}><Customers/></RequireRole></RequireAuth>\n        )}/>" "$NAV" || true
    log_ok "Ruta Customers añadida"
  else
    log_skip "Ruta Customers ya existente"
  fi
else
  # Si no existe, crear esqueleto mínimo
  mkdir -p src/navigation
  cat > "$NAV" <<'EOF'
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
EOF
  log_ok "AppNavigator básico creado"
fi

# B.8 PR Template
TPL=.github/pull_request_template.md
if [ ! -f "$TPL" ]; then
  cat > "$TPL" <<'EOF'
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

EOF
log_ok "PR template M1 creado"
else
log_skip "PR template ya existe"
fi
