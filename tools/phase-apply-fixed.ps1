param(
  [ValidateSet('M1','M2','M3','All')] [string]$Phase = 'All',
  [string]$BranchPrefix = 'fix'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function W($m){ Write-Host "==> $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "OK  $m" -ForegroundColor Green }
function Warn($m){ Write-Host "!!  $m" -ForegroundColor Yellow }

# 0) Guardas estado git y creas rama
git rev-parse --is-inside-work-tree *> $null
if($LASTEXITCODE -ne 0){ throw "No es repo Git." }
$curBranch = (git rev-parse --abbrev-ref HEAD).Trim()

# Verificar si hay cambios sin commitar en la rama actual
$changes = (git status --porcelain).Length
if ($changes -gt 0) {
    Warn "Hay cambios sin commitar en la rama actual ($curBranch). Se recomienda hacer commit o stash primero."
    $confirm = Read-Host "¿Deseas continuar de todos modos? (S/N)"
    if ($confirm -ne "S" -and $confirm -ne "s") {
        throw "Operación cancelada por el usuario."
    }
}

$newBranch = if($Phase -eq 'All') { "$BranchPrefix/phases-m1-m3" } else { "$BranchPrefix/$Phase" }
W "Cambiando de rama $curBranch a $newBranch..."
git checkout -b $newBranch

# 1) Asegura carpetas
$dirs = @(
  "src/navigation","src/context","src/screens","src/screens/marketing",
  "src/services","firebase",".github/workflows","tools"
)
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

# 2) Borra inicializaciones Firebase duplicadas (deja solo firebaseClient.js)
$dups = Get-ChildItem -Recurse -Include *.js,*.ts,*.tsx -Path .\src |
  Select-String -Pattern "initializeApp\(" |
  Where-Object { $_.Path -notmatch "src\\services\\firebaseClient" }
foreach($hit in $dups){ 
  $p=$hit.Path; 
  if(Test-Path $p){ Rename-Item -Force -Path $p -NewName ($p + ".bak") }
}

# 3) Escribe firebaseClient.js (único punto de init + emuladores)
@"
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { initializeAuth, getAuth, connectAuthEmulator, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cfg = {
  apiKey:        process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:     process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId:         process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApp() : initializeApp(cfg);

// Auth con persistencia RN; fallback si ya está inicializado
let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  auth = getAuth(app);
}
export { auth };

export const db = getFirestore(app);
export const useEmulators = (process.env.EXPO_PUBLIC_USE_EMULATORS ?? 'false') === 'true';

export function enableEmulatorsIfNeeded() {
  if (!useEmulators) return;
  const ah = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1';
  const ap = parseInt(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099', 10);
  const fh = process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const fp = parseInt(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080', 10);
  try { connectAuthEmulator(auth, `http://${ah}:${ap}`, { disableWarnings: true }); } catch {}
  try { connectFirestoreEmulator(db, fh, fp); } catch {}
}
"@ | Set-Content -Encoding UTF8 -Path "src/services/firebaseClient.js"

# 4) Contextos + Guards
@"
import React, { createContext, useState, useEffect } from 'react';
import { auth, db, enableEmulatorsIfNeeded } from '../services/firebaseClient';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enableEmulatorsIfNeeded();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'roles', u.uid));
          setRole(snap.exists() ? (snap.data().role || null) : null);
        } catch { setRole(null); }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login    = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
  const register = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);
  const logout   = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, userRole: role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
"@ | Set-Content -Encoding UTF8 -Path "src/context/AuthContext.js"

@"
import React, { createContext, useState, useContext } from 'react';
import { MD3LightTheme, MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';

export const ThemeContext = createContext();
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? MD3DarkTheme : MD3LightTheme;
  const toggleTheme = () => setIsDark((d) => !d);
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}
export function useTheme(){ return useContext(ThemeContext); }
"@ | Set-Content -Encoding UTF8 -Path "src/context/ThemeContext.js"

@"
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export function RequireAuth(Component){
  return function Wrapper(props){
    const { isAuthenticated, loading } = useContext(AuthContext);
    if(loading) return <Text>Cargando...</Text>;
    if(!isAuthenticated){
      return <View style={{padding:16}}>
        <Text>Acceso denegado: inicia sesión.</Text>
        <Button title='Ir a Login' onPress={() => props.navigation.replace('Login')} />
      </View>;
    }
    return <Component {...props} />;
  }
}

export function RequireRole(roles, Component){
  return function Wrapper(props){
    const { isAuthenticated, userRole, loading } = useContext(AuthContext);
    if(loading) return <Text>Cargando...</Text>;
    if(!isAuthenticated){ 
      return <View style={{padding:16}}>
        <Text>Acceso denegado.</Text>
        <Button title='Ir a Login' onPress={() => props.navigation.replace('Login')} />
      </View>;
    }
    if(!roles.includes(userRole)){
      return <View style={{padding:16}}>
        <Text>Rol insuficiente.</Text>
      </View>;
    }
    return <Component {...props} />;
  }
}
"@ | Set-Content -Encoding UTF8 -Path "src/navigation/RouteGuards.js"

# 5) Navigator + pantallas mínimas
@"
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RequireAuth, RequireRole } from './RouteGuards';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboard from '../screens/AdminDashboard';
import WaiterDashboard from '../screens/WaiterDashboard';
import CustomerDashboard from '../screens/CustomerDashboard';
import Onboarding from '../screens/Onboarding';
import Settings from '../screens/Settings';
import Campaigns from '../screens/Campaigns';
import Customers from '../screens/Customers';
import Reports from '../screens/Reports';
import Landing from '../screens/marketing/Landing';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs(){
  return (
    <Tab.Navigator>
      <Tab.Screen name='Admin' component={RequireRole(['admin'], AdminDashboard)} />
      <Tab.Screen name='Waiter' component={RequireRole(['waiter'], WaiterDashboard)} />
      <Tab.Screen name='Customer' component={RequireRole(['customer'], CustomerDashboard)} />
    </Tab.Navigator>
  );
}

export default function AppNavigator(){
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Landing'>
        <Stack.Screen name='Landing' component={Landing} options={{ headerShown:false }} />
        <Stack.Screen name='Onboarding' component={Onboarding} />
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Register' component={RegisterScreen} />
        <Stack.Screen name='MainTabs' component={RequireAuth(MainTabs)} options={{ headerShown:false }} />
        <Stack.Screen name='Settings' component={RequireAuth(Settings)} />
        <Stack.Screen name='Campaigns' component={RequireAuth(Campaigns)} />
        <Stack.Screen name='Customers' component={RequireAuth(Customers)} />
        <Stack.Screen name='Reports' component={RequireAuth(Reports)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
"@ | Set-Content -Encoding UTF8 -Path "src/navigation/AppNavigator.js"

# 6) Stubs de pantallas (evita errores de import)
$stubs = @{
  "src/screens/LoginScreen.js" = "import React,{useState,useContext} from 'react'; import {View,Text,TextInput,Button} from 'react-native'; import {AuthContext} from '../context/AuthContext'; export default function LoginScreen({navigation}){ const {login}=useContext(AuthContext); const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); return <View style={{padding:16,gap:8}}><Text>Login</Text><TextInput placeholder='email' value={email} onChangeText={setEmail} style={{borderWidth:1,padding:8}}/><TextInput placeholder='password' value={pass} onChangeText={setPass} secureTextEntry style={{borderWidth:1,padding:8}}/><Button title='Entrar' onPress={async()=>{ await login(email,pass); navigation.replace('MainTabs'); }} /><Button title='Registrarme' onPress={()=>navigation.navigate('Register')} /></View>; }";
  "src/screens/RegisterScreen.js" = "import React,{useState,useContext} from 'react'; import {View,Text,TextInput,Button} from 'react-native'; import {AuthContext} from '../context/AuthContext'; export default function RegisterScreen({navigation}){ const {register}=useContext(AuthContext); const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); return <View style={{padding:16,gap:8}}><Text>Registro</Text><TextInput placeholder='email' value={email} onChangeText={setEmail} style={{borderWidth:1,padding:8}}/><TextInput placeholder='password' value={pass} onChangeText={setPass} secureTextEntry style={{borderWidth:1,padding:8}}/><Button title='Crear' onPress={async()=>{ await register(email,pass); navigation.replace('MainTabs'); }} /></View>; }";
  "src/screens/AdminDashboard.js" = "import React from 'react'; import {View,Text} from 'react-native'; export default function AdminDashboard(){ return <View style={{padding:16}}><Text>Admin</Text></View>; }";
  "src/screens/WaiterDashboard.js" = "import React from 'react'; import {View,Text} from 'react-native'; export default function WaiterDashboard(){ return <View style={{padding:16}}><Text>Mesero</Text></View>; }";
  "src/screens/CustomerDashboard.js" = "import React from 'react'; import {View,Text} from 'react-native'; export default function CustomerDashboard(){ return <View style={{padding:16}}><Text>Cliente</Text></View>; }";
  "src/screens/Onboarding.js" = "import React from 'react'; import {View,Text,Button} from 'react-native'; export default function Onboarding({navigation}){ return <View style={{padding:16}}><Text>Onboarding</Text><Button title='Continuar' onPress={()=>navigation.replace('Login')} /></View>; }";
  "src/screens/Settings.js" = "import React from 'react'; import {View,Text} from 'react-native'; export default function Settings(){ return <View style={{padding:16}}><Text>Settings</Text></View>; }";
  "src/screens/Campaigns.js" = "import React from 'react'; import {View,Text} from 'react-native'; export default function Campaigns(){ return <View style={{padding:16}}><Text>Campaigns</Text></View>; }";
  "src/screens/Customers.js" = "import React from 'react'; import {View,Text} from 'react-native'; export default function Customers(){ return <View style={{padding:16}}><Text>Customers</Text></View>; }";
  "src/screens/Reports.js" = "import React from 'react'; import {View,Text} from 'react-native'; export default function Reports(){ return <View style={{padding:16}}><Text>Reports</Text></View>; }";
  "src/screens/marketing/Landing.js" = "import React from 'react'; import {View,Text,Button} from 'react-native'; export default function Landing({navigation}){ return <View style={{padding:16,gap:8}}><Text style={{fontSize:22,fontWeight:'700'}}>Pergamino App</Text><Button title='Soy cliente' onPress={()=>navigation.navigate('Login')} /><Button title='Soy staff' onPress={()=>navigation.navigate('Login')} /></View>; }";
}
$stubs.GetEnumerator() | ForEach-Object { $_.Value | Set-Content -Encoding UTF8 -Path $_.Key }

# 7) App.js minimal que usa Providers + Navigator
@"
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App(){
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
"@ | Set-Content -Encoding UTF8 -Path "App.js"

# 8) babel/metro (seguros)
@"
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
"@ | Set-Content -Encoding UTF8 -Path "babel.config.js"

@"
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver = { ...config.resolver, resolverMainFields: ['react-native','browser','main'] };
module.exports = config;
"@ | Set-Content -Encoding UTF8 -Path "metro.config.js"

# 9) .env.local (usa los datos reales que pasaste)
$envContent = @"
EXPO_PUBLIC_USE_EMULATORS=true
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1
EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8080

EXPO_PUBLIC_FIREBASE_PROJECT_ID=codigos-pergamino
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCeQU3rKVlDKhWkyF5mFqDp9NYDMPAfOt4
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=codigos-pergamino.firebaseapp.com
EXPO_PUBLIC_FIREBASE_BUCKET=codigos-pergamino.firebasestorage.app
EXPO_PUBLIC_FIREBASE_SENDER_ID=849867276398
EXPO_PUBLIC_FIREBASE_APP_ID=1:849867276398:web:0d9273b3c5130447f3a67f
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-GT982TM94R
"@
$envContent | Set-Content -Encoding UTF8 -Path ".env.local"

# 10) Dependencias compatibles (usar expo install siempre que aplique)
W "Instalando dependencias (esto tarda)..."
npx expo install @react-native-async-storage/async-storage react-native-screens react-native-safe-area-context react-native-svg
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm i -E react-native-paper@^5
# Asegura notifs y location (para futuro)
npx expo install expo-notifications expo-location

# 11) Commit
git add -A
git commit -m "M1–M3 base: navegación, contextos, firebaseClient único, stubs de pantallas, env, babel/metro [desde rama $curBranch]"

Write-Host "Fase $Phase aplicada en rama $newBranch" -ForegroundColor Green
Write-Host "`nSiguiente:" -ForegroundColor Cyan
Write-Host "  git push -u origin $newBranch" -ForegroundColor White
Write-Host "  (opcional) gh pr create --fill --base main" -ForegroundColor White
