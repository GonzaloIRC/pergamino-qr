# Script PowerShell para implementar cambios en el proyecto
$ErrorActionPreference = "Stop"

function log_ok { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function log_skip { param($msg) Write-Host "[SKIP] $msg" -ForegroundColor Yellow }
function log_info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Blue }
function log_err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

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
  const status = getEmulatorStatus();
  const cfg = {
    useEmulator: status.use,
    hostOk: true,
    portOk: true,
    dbOk: false,
    authOk: false,
    message: '',
  };

  // Check if emulators are configured correctly
  if (status.use) {
    try {
      const authUrl = `http://${status.authHost}:${status.authPort}/emulator/v1/projects/${app.options.projectId}/config`;
      const fsUrl = `http://${status.fsHost}:${status.fsPort}/emulator/v1/projects/${app.options.projectId}/databases/(default)/collectionGroups`;
      
      fetch(authUrl)
        .then(res => {
          cfg.authOk = res.status === 200;
          return fetch(fsUrl);
        })
        .then(res => {
          cfg.dbOk = res.status === 200;
          cfg.message = cfg.authOk && cfg.dbOk
            ? 'Emuladores configurados correctamente'
            : 'Error en la configuración de los emuladores';
        })
        .catch(err => {
          cfg.message = `Error al contactar emuladores: ${err.message}`;
        });
    } catch (err) {
      cfg.message = `Error: ${err.message}`;
    }
  } else {
    cfg.message = 'Emuladores deshabilitados';
  }
  
  return cfg;
}
'@
        Add-Content -Path $FC -Value $checkEmulatorFunction
        log_ok "Añadido checkEmulatorConfig() a firebaseClient.js"
    }
} else {
    New-Item -Path "src\services" -ItemType Directory -Force | Out-Null
    @'
// src/services/firebaseClient.js
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from '../../firebase/firebaseConfig';

// Initialize Firebase if not already initialized
export const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

// Configure emulators if enabled
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

export function checkEmulatorConfig() {
  const status = getEmulatorStatus();
  const cfg = {
    useEmulator: status.use,
    hostOk: true,
    portOk: true,
    dbOk: false,
    authOk: false,
    message: '',
  };

  // Check if emulators are configured correctly
  if (status.use) {
    try {
      const authUrl = `http://${status.authHost}:${status.authPort}/emulator/v1/projects/${app.options.projectId}/config`;
      const fsUrl = `http://${status.fsHost}:${status.fsPort}/emulator/v1/projects/${app.options.projectId}/databases/(default)/collectionGroups`;
      
      fetch(authUrl)
        .then(res => {
          cfg.authOk = res.status === 200;
          return fetch(fsUrl);
        })
        .then(res => {
          cfg.dbOk = res.status === 200;
          cfg.message = cfg.authOk && cfg.dbOk
            ? 'Emuladores configurados correctamente'
            : 'Error en la configuración de los emuladores';
        })
        .catch(err => {
          cfg.message = `Error al contactar emuladores: ${err.message}`;
        });
    } catch (err) {
      cfg.message = `Error: ${err.message}`;
    }
  } else {
    cfg.message = 'Emuladores deshabilitados';
  }
  
  return cfg;
}

// Activate emulators if configured
const emStatus = getEmulatorStatus();
if (emStatus.use) {
  console.log(`[Firebase] Using emulators: auth=${emStatus.authHost}:${emStatus.authPort}, firestore=${emStatus.fsHost}:${emStatus.fsPort}`);
  connectAuthEmulator(auth, `http://${emStatus.authHost}:${emStatus.authPort}`);
  connectFirestoreEmulator(db, emStatus.fsHost, emStatus.fsPort);
} else {
  console.log('[Firebase] Using production services');
}
'@ | Out-File -FilePath $FC -Encoding utf8
    log_ok "firebaseClient.js creado con diagnóstico"
}

# A.3 Scripts para .env y scripts/ directorio
if (-Not (Test-Path ".env.local")) {
    @'
# Firebase config for dev environment
EXPO_PUBLIC_USE_EMULATORS=1
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost
EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
'@ | Out-File -FilePath ".env.local" -Encoding utf8
    log_ok ".env.local creado"
} else {
    log_skip ".env.local ya existe"
}

if (-Not (Test-Path "scripts")) {
    New-Item -Path "scripts" -ItemType Directory | Out-Null
}

if (-Not (Test-Path "scripts\seedBeneficioDemo.js")) {
    @'
// scripts/seedBeneficioDemo.js - Seed script for demo data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, query, where, deleteDoc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');
const config = require('../firebase/firebaseConfig');

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

// Configure emulators
const useEmulators = true;
if (useEmulators) {
  const { connectAuthEmulator } = require('firebase/auth');
  const { connectFirestoreEmulator } = require('firebase/firestore');
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Seed data - 20 demo benefit tickets
async function seedBenefits() {
  console.log('🔥 Connecting to Firebase...');
  
  try {
    // Sign in anonymously to access Firestore
    await signInAnonymously(auth);
    console.log('✅ Connected to Firebase');
    
    // Clean existing seriales if any
    const existingQuery = query(collection(db, 'seriales'), where('prefix', '==', 'SER-'));
    const existingDocs = await getDocs(existingQuery);
    
    const deletePromises = [];
    existingDocs.forEach(docRef => {
      console.log(`🗑️ Deleting existing serial: ${docRef.id}`);
      deletePromises.push(deleteDoc(doc(db, 'seriales', docRef.id)));
    });
    
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${deletePromises.length} existing serials`);
    
    // Create beneficio document
    const beneficioId = 'beneficio-demo-' + Date.now();
    await setDoc(doc(db, 'beneficios', beneficioId), {
      nombre: 'Café Gratis',
      descripcion: 'Canjea este código por un café americano gratis',
      validoDesde: new Date(),
      validoHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      estado: 'activo',
      createdAt: new Date(),
    });
    
    console.log(`✅ Created beneficio: ${beneficioId}`);
    
    // Create 20 serial codes
    const serialPromises = [];
    
    for (let i = 1; i <= 20; i++) {
      const serialCode = `SER-${i.toString().padStart(4, '0')}`;
      const serialId = serialCode;
      
      serialPromises.push(
        setDoc(doc(db, 'seriales', serialId), {
          codigo: serialCode,
          beneficioId,
          estado: 'activo', // activo, usado, cancelado
          prefix: 'SER-',
          createdAt: new Date(),
        })
      );
    }
    
    await Promise.all(serialPromises);
    console.log(`✅ Created 20 serials for beneficio ${beneficioId}`);
    
    console.log('✨ Seed completed successfully');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seed function
seedBenefits().then(() => process.exit(0));
'@ | Out-File -FilePath "scripts\seedBeneficioDemo.js" -Encoding utf8
    log_ok "scripts\seedBeneficioDemo.js creado"
} else {
    log_skip "scripts\seedBeneficioDemo.js ya existe"
}

# A.4 .firebaserc y firebase.json
if (-Not (Test-Path ".firebaserc")) {
    @'
{
  "projects": {
    "default": "pergamino-app"
  }
}
'@ | Out-File -FilePath ".firebaserc" -Encoding utf8
    log_ok ".firebaserc creado"
} else {
    log_skip ".firebaserc ya existe"
}

if (-Not (Test-Path "firebase.json")) {
    @'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
'@ | Out-File -FilePath "firebase.json" -Encoding utf8
    log_ok "firebase.json creado"
} else {
    log_skip "firebase.json ya existe"
}

if (-Not (Test-Path "firestore.rules")) {
    @'
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public seriales can be read by any authenticated user
    match /seriales/{serialId} {
      allow read: if request.auth != null;
      // Only allow admins to create/update/delete
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.admin == true;
    }
    
    // Public beneficios can be read by any authenticated user
    match /beneficios/{beneficioId} {
      allow read: if request.auth != null;
      // Only allow admins to create/update/delete
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.admin == true;
    }
    
    // Transactions should only be created by authenticated users and read by admins or the user involved
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.admin == true);
      
      allow create: if request.auth != null;
      
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.admin == true;
    }
    
    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
'@ | Out-File -FilePath "firestore.rules" -Encoding utf8
    log_ok "firestore.rules creado"
} else {
    log_skip "firestore.rules ya existe"
}

if (-Not (Test-Path "firestore.indexes.json")) {
    @'
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "seriales",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "estado", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
'@ | Out-File -FilePath "firestore.indexes.json" -Encoding utf8
    log_ok "firestore.indexes.json creado"
} else {
    log_skip "firestore.indexes.json ya existe"
}

# A.5 Commit changes
ensure_npm_scripts | Out-Null
git add .
git commit -m "fix(infra): Firebase config y diagnóstico de emuladores"

if ($GH_OK) {
    try {
        gh pr create --title "fix/infra-compat" --body "Soporte para emuladores y diagnóstico"
        log_ok "PR creado: fix/infra-compat"
    } catch {
        log_skip "PR no creado (podría ya existir)"
    }
}

git switch main
git pull origin main --ff-only

# -----------------------------------------
# PARTE B — Cerrar PR fix/navigation-skeleton
# -----------------------------------------

try {
    git rev-parse --verify fix/navigation-skeleton | Out-Null
    git switch fix/navigation-skeleton
    log_skip "Rama fix/navigation-skeleton ya existía"
} catch {
    try {
        git switch -c fix/navigation-skeleton origin/main
    } catch {
        git switch -c fix/navigation-skeleton
    }
    log_ok "Rama fix/navigation-skeleton creada desde main"
}

# B.1 Estructura de directorios
$DIRS = @(
    "src/screens/auth", 
    "src/screens/main", 
    "src/screens/onboarding", 
    "src/navigation", 
    "src/components/Auth", 
    "src/components/Scanner", 
    "src/context"
)

foreach ($dir in $DIRS) {
    if (-Not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        log_ok "Directorio creado: $dir"
    } else {
        log_skip "Directorio ya existe: $dir"
    }
}

# B.2 Auth Context
$AC = "src\context\AuthContext.js"
if (-Not (Test-Path $AC)) {
    @'
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../services/firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Get user roles from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRoles(userDoc.data().roles || {});
          } else {
            // Create new user document with default roles
            const defaultRoles = { customer: true };
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              roles: defaultRoles,
              createdAt: new Date()
            });
            setUserRoles(defaultRoles);
          }
        } catch (error) {
          console.error("Error fetching user roles:", error);
          setUserRoles({});
        }
      } else {
        setUserRoles({});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up
  const signUp = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // Sign in
  const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // Sign out
  const signOut = () => {
    return firebaseSignOut(auth);
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser || !userRoles) return false;
    if (Array.isArray(role)) {
      return role.some(r => userRoles[r] === true);
    }
    return userRoles[role] === true;
  };

  const value = {
    currentUser,
    userRoles,
    hasRole,
    signUp,
    signIn,
    signOut,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
'@ | Out-File -FilePath $AC -Encoding utf8
    log_ok "AuthContext.js creado"
} else {
    log_skip "AuthContext.js ya existe"
}

# B.3 RouteGuards
$RG = "src\navigation\RouteGuards.js"
if (-Not (Test-Path $RG)) {
    @'
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Redirect to login if not authenticated
export function RequireAuth({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!currentUser) {
    // In a real app, navigate to login
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please login to continue</Text>
      </View>
    );
  }

  return children;
}

// Check if user has required role
export function RequireRole({ children, role }) {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!hasRole(role)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You don't have permission to access this page</Text>
      </View>
    );
  }

  return children;
}
'@ | Out-File -FilePath $RG -Encoding utf8
    log_ok "RouteGuards.js creado"
} else {
    log_skip "RouteGuards.js ya existe"
}

# B.4 Auth Screens
$LOGIN = "src\screens\auth\LoginScreen.js"
if (-Not (Test-Path $LOGIN)) {
    @'
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      // Navigation will happen automatically via the auth listener
    } catch (err) {
      setError('Failed to sign in: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  link: {
    color: '#007BFF',
    fontSize: 14,
  },
});
'@ | Out-File -FilePath $LOGIN -Encoding utf8
    log_ok "LoginScreen.js creado"
} else {
    log_skip "LoginScreen.js ya existe"
}

$REG = "src\screens\auth\RegisterScreen.js"
if (-Not (Test-Path $REG)) {
    @'
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();

  async function handleRegister() {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(email, password);
      // Navigation will happen automatically via the auth listener
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Register'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  links: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#007BFF',
    fontSize: 14,
  },
});
'@ | Out-File -FilePath $REG -Encoding utf8
    log_ok "RegisterScreen.js creado"
} else {
    log_skip "RegisterScreen.js ya existe"
}

$FORGOT = "src\screens\auth\ForgotPasswordScreen.js"
if (-Not (Test-Path $FORGOT)) {
    @'
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      Alert.alert(
        'Password Reset Email Sent', 
        'Check your email for instructions to reset your password',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to reset password: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      
      <Text style={styles.instructions}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  links: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#007BFF',
    fontSize: 14,
  },
});
'@ | Out-File -FilePath $FORGOT -Encoding utf8
    log_ok "ForgotPasswordScreen.js creado"
} else {
    log_skip "ForgotPasswordScreen.js ya existe"
}

# B.5 Main Screens
$HOME_SCREEN = "src\screens\main\HomeScreen.js"
if (-Not (Test-Path $HOME_SCREEN)) {
    @'
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { currentUser, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>Welcome!</Text>
      
      {currentUser && (
        <View style={styles.userInfo}>
          <Text>Logged in as: {currentUser.email}</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.buttonText}>Scanner</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Customers')}
        >
          <Text style={styles.buttonText}>Customers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={signOut}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
'@ | Out-File -FilePath $HOME_SCREEN -Encoding utf8
    log_ok "HomeScreen.js creado"
} else {
    log_skip "HomeScreen.js ya existe"
}

# B.6 Navigation Components
$AUTH_NAV = "src\navigation\AuthNavigator.js"
if (-Not (Test-Path $AUTH_NAV)) {
    @'
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
'@ | Out-File -FilePath $AUTH_NAV -Encoding utf8
    log_ok "AuthNavigator.js creado"
} else {
    log_skip "AuthNavigator.js ya existe"
}

$MAIN_NAV = "src\navigation\MainNavigator.js"
if (-Not (Test-Path $MAIN_NAV)) {
    @'
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import Customers from '../screens/Customers';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Customers" component={Customers} />
    </Stack.Navigator>
  );
}
'@ | Out-File -FilePath $MAIN_NAV -Encoding utf8
    log_ok "MainNavigator.js creado"
} else {
    log_skip "MainNavigator.js ya existe"
}

# B.7 Main Navigation Index
$NAV = "src\navigation\index.js"
if (Test-Path $NAV) {
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
