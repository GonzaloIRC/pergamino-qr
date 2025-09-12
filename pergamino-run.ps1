# --- Pergamino App pipeline (M0→M3) ---
$ErrorActionPreference = "Stop"
function ok($m){ Write-Host "✅ $m" }
function info($m){ Write-Host "ℹ️ $m" }
function warn($m){ Write-Host "⚠️ $m" -ForegroundColor Yellow }
function fail($m){ Write-Host "❌ $m" -ForegroundColor Red; exit 1 }

git rev-parse --is-inside-work-tree | Out-Null; if($LASTEXITCODE -ne 0){ fail "No es repo git" }
$origin = git remote get-url origin; if(-not $origin){ fail "Sin remote origin" } else { info "origin: $origin" }

$GH_OK = 0; if(Get-Command gh -ErrorAction SilentlyContinue){ try { gh auth status | Out-Null; $GH_OK=1 } catch {} }

git fetch origin | Out-Null
function EnsureBranch($name,$base){ if(git show-ref --verify --quiet ("refs/heads/" + $name)){ git switch $name | Out-Null; ok "Rama $name" } else { if($base){ git switch -c $name $base | Out-Null } else { git switch -c $name | Out-Null }; ok "Crea $name" } }
function SafeCommitPush($msg){ if(-not (git status --porcelain)){ return }; git add -A; if(-not (git diff --cached --quiet)){ git commit -m $msg | Out-Null; ok $msg; git push -u origin (git branch --show-current) | Out-Null } }

# M0
EnsureBranch "fix/infra-compat" "origin/main"
New-Item -ItemType Directory -Force -Path REPORT | Out-Null
"compat.md","firebase.md","firebase-duplicates.md","navigation.md","scanner.md","auth.md","tooling.md","android.md","cleanup.md" | % { if(-not (Test-Path "REPORT/$_")){ "# $_" | Set-Content "REPORT/$_" } }
if(-not (Test-Path "metro.config.js")){
@"
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.resolverMainFields = ['react-native','browser','main'];
module.exports = config;
"@ | Set-Content metro.config.js
}
if(Test-Path "babel.config.js"){
  $b = Get-Content babel.config.js -Raw
  if($b -notmatch "react-native-reanimated/plugin"){
    $b = $b -replace "(\])\s*\}\s*$",'  ,plugins: ["react-native-reanimated/plugin"]\n}\n'
    Set-Content babel.config.js $b
  }
}
if(Test-Path "app.json"){ $j=(Get-Content app.json -Raw).Trim(); if($j -ne "{}"){ Rename-Item app.json app.json.bak -Force } }
$fc="src/services/firebaseClient.js"
if(Test-Path $fc){
  $raw=Get-Content $fc -Raw
  if($raw -notmatch "getEmulatorStatus"){ @"
export function getEmulatorStatus(){ const use=String(process.env.EXPO_PUBLIC_USE_EMULATORS||'0')==='1'; return {use,authHost:process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST||'localhost',authPort:Number(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT||9099),fsHost:process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST||'localhost',fsPort:Number(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT||8080)}; }
"@ | Add-Content $fc }
  if($raw -notmatch "checkEmulatorConfig"){ @"
export function checkEmulatorConfig(){ const s=getEmulatorStatus(); const missing=[]; if(!process.env.EXPO_PUBLIC_FIREBASE_API_KEY) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY'); if(!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID'); if(!process.env.EXPO_PUBLIC_FIREBASE_APP_ID) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID'); if(s.use&&(!s.authHost||!s.authPort)) missing.push('AUTH_EMULATOR host/port'); if(s.use&&(!s.fsHost||!s.fsPort)) missing.push('FIRESTORE_EMULATOR host/port'); return {ok:missing.length===0, missing, status:s}; }
"@ | Add-Content $fc }
}
$pkg="package.json"
if(Test-Path $pkg){
  $p = Get-Content $pkg -Raw | ConvertFrom-Json
  if(-not $p.scripts){ $p | Add-Member scripts (New-Object psobject) }
  $want=@{
    "start:dev"="expo start --dev-client";
    "emulators:start"="firebase emulators:start";
    "emulators:export"="firebase emulators:export ./emulator-data";
    "seed:test-user"="node scripts/seedBeneficioDemo.js";
    "test"="jest";
    "run:android"="expo run:android";
    "prebuild:android"="expo prebuild --clean --platform android"
  }
  $chg=$false; foreach($k in $want.Keys){ if($p.scripts.$k -ne $want[$k]){ $p.scripts | Add-Member -NotePropertyName $k -NotePropertyValue $want[$k] -Force; $chg=$true } }
  if($chg){ ($p|ConvertTo-Json -Depth 50) + "`n" | Set-Content $pkg }
}
SafeCommitPush "fix(infra): REPORT + metro/babel + diagnostics + scripts"
if($GH_OK -eq 1){ try{ gh pr view --head fix/infra-compat | Out-Null } catch { gh pr create --title "fix/infra-compat — Expo config, env, emulators, diagnóstico Firebase" --body "Cómo probar: npm ci; npx expo install; npm run emulators:start; npx expo start --dev-client" --base main --head fix/infra-compat | Out-Null } }

# M1
EnsureBranch "fix/phase1-base" "fix/infra-compat"
New-Item -ItemType Directory -Force -Path scripts,src/utils,src/services,src/screens,src/components/BarcodeScanner,src/navigation,src/context | Out-Null
if(-not (Test-Path "scripts/seedBeneficioDemo.js")){
@"
import 'dotenv/config'; import { initializeApp } from 'firebase/app'; import { getFirestore, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
const cfg={ apiKey:process.env.EXPO_PUBLIC_FIREBASE_API_KEY||'demo', authDomain:process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN||'demo', projectId:process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID||'demo' };
const app=initializeApp(cfg); const db=getFirestore(app);
async function main(){ const beneficioId='beneficio-demo'; const bRef=doc(db,'Beneficios',beneficioId); const bex=await getDoc(bRef); if(!bex.exists()) await setDoc(bRef,{nombre:'Café Pergamino (demo)',descripcion:'1x café gratis',activo:true,creadoEn:new Date()}); const batch=writeBatch(db); for(let i=1;i<=20;i++){ const s=`SER-${String(i).padStart(4,'0')}`; const r=doc(db,'BeneficioSeriales',s); const d=await getDoc(r); if(!d.exists()) batch.set(r,{beneficioId,estado:'activo',emitidoA:null,creadoEn:new Date()}); } await batch.commit(); console.log('Seed OK'); }
main().catch(e=>{console.error(e);process.exit(1)});
"@ | Set-Content scripts/seedBeneficioDemo.js }
@"
export function parseQrPayload(d){ if(typeof d!=='string') return null; if(d.startsWith('BNF:')) return {type:'beneficio',serial:d.slice(4)}; if(d.startsWith('APP:')){ const [_,dni,nonce]=d.split(':'); if(!dni||!nonce) return null; return {type:'app',dni,nonce} } return null; }
"@ | Set-Content src/utils/qr.js
@"
import { db } from './firebaseClient'; import { doc, serverTimestamp, runTransaction, collection, addDoc } from 'firebase/firestore';
export async function transactRedeemSerial({serial,user,dni}){ const ref=doc(db,'BeneficioSeriales',serial); await runTransaction(db, async(tx)=>{ const s=await tx.get(ref); if(!s.exists()) throw new Error('Serial inexistente'); const data=s.data(); if(data.estado!=='activo') throw new Error('Serial no activo'); if(data.emitidoA&&dni&&data.emitidoA!==dni) throw new Error('Serial asignado a otro DNI'); tx.update(ref,{estado:'usado',canjeadoPor:user?.uid||null,canjeadoEn:serverTimestamp()}); }); await addDoc(collection(db,'Historial'),{tipo:'canje',serial,userId:user?.uid||null,dni:dni||null,ts:serverTimestamp()}); }
export async function recordAccumulation({dni,nonce,user}){ await addDoc(collection(db,'Historial'),{tipo:'acumulacion',dni,nonce,userId:user?.uid||null,ts:serverTimestamp()}); }
"@ | Set-Content src/services/transactions.js
@"
import React,{createContext,useEffect,useMemo,useState} from 'react'; import { auth, db } from '../services/firebaseClient'; import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'; import { doc, getDoc } from 'firebase/firestore';
export const AuthCtx=createContext({user:null,role:'guest',profile:null});
export function AuthProvider({children}){ const [user,setUser]=useState(null); const [role,setRole]=useState('guest'); const [profile,setProfile]=useState(null);
useEffect(()=>{ const unsub=onAuthStateChanged(auth, async(u)=>{ if(!u){ try{ await signInAnonymously(auth) }catch{}; setUser(null); setRole('guest'); setProfile(null); return; } setUser(u); let r='waiter'; try{ const rs=await getDoc(doc(db,'roles',u.uid)); if(rs.exists()) r=rs.data()?.role||r }catch{}; setRole(r); try{ const ps=await getDoc(doc(db,'Perfiles',u.uid)); if(ps.exists()) setProfile(ps.data()) }catch{} }); return ()=>unsub(); },[]);
const value=useMemo(()=>({user,role,profile}),[user,role,profile]); return <AuthProvider.Context.Provider value={value}>{children}</AuthProvider.Context.Provider>; }
"@ | Set-Content src/context/AuthContext.js
@"
import React,{useContext} from 'react'; import { View, Text } from 'react-native'; import { AuthCtx } from '../context/AuthContext';
export function RequireAuth({children}){ const {user}=useContext(AuthCtx); if(!user) return <View style={{padding:16}}><Text>Autenticando…</Text></View>; return children; }
export function RequireRole({role,children}){ const {role:current}=useContext(AuthCtx); const roles=Array.isArray(role)?role:[role]; if(!roles.includes(current)) return <View style={{padding:16}}><Text>Sin permisos ({roles.join(', ')})</Text></View>; return children; }
"@ | Set-Content src/navigation/RouteGuards.js
@"
import React,{useRef,useEffect,useState} from 'react'; import { View, Text, Pressable } from 'react-native'; import { CameraView, useCameraPermissions } from 'expo-camera';
const DEBOUNCE_MS=Number(process.env.EXPO_PUBLIC_SCAN_COOLDOWN_MS||process.env.EXPO_PUBLIC_SCAN_DEBOUNCE_MS||1500);
export default function Scanner({onPayload,onClose}){ const [perm,requestPermission]=useCameraPermissions(); const [locked,setLocked]=useState(false); const lastRef=useRef(0);
useEffect(()=>{ if(!perm||perm.status!=='granted') requestPermission(); },[perm]);
if(!perm) return <Text>Solicitando permisos…</Text>; if(!perm.granted) return <Text>Permiso de cámara denegado</Text>;
const handle=({data})=>{ if(locked) return; const now=Date.now(); if(now-lastRef.current<DEBOUNCE_MS) return; lastRef.current=now; setLocked(true); Promise.resolve(onPayload?.(data)).finally(()=>setTimeout(()=>setLocked(false),DEBOUNCE_MS)); };
return (<View style={{flex:1}}><CameraView style={{flex:1}} barcodeScannerSettings={{barcodeTypes:['qr']}} onBarcodeScanned={locked?undefined:handle}/><Pressable onPress={onClose} style={{position:'absolute',top:20,right:20,padding:8,backgroundColor:'#0008',borderRadius:8}}><Text style={{color:'#fff'}}>Cerrar</Text></Pressable></View>);
}
"@ | Set-Content src/components/BarcodeScanner/Scanner.js
@"
import React,{useRef,useState,useContext} from 'react'; import { View, Text, Alert } from 'react-native'; import Scanner from '../components/BarcodeScanner/Scanner'; import { parseQrPayload } from '../utils/qr'; import { transactRedeemSerial, recordAccumulation } from '../services/transactions'; import { AuthCtx } from '../context/AuthContext';
export default function ScannerScreen(){ const { user, profile }=useContext(AuthCtx); const handling=useRef(false); const [open,setOpen]=useState(true);
async function onPayload(data){ if(handling.current) return; handling.current=true; try{ const p=parseQrPayload(data); if(!p) throw new Error('QR inválido'); if(p.type==='beneficio'){ await transactRedeemSerial({ serial:p.serial, user, dni:profile?.dni }); Alert.alert('OK',`Canjeado: ${p.serial}`);} else { await recordAccumulation({ dni:p.dni, nonce:p.nonce, user }); Alert.alert('OK',`Acumulación: DNI ${p.dni}`);} }catch(e){ Alert.alert('Error', e.message||String(e)); } finally { setTimeout(()=>{ handling.current=false },1500) } }
if(!open) return <View style={{padding:16}}><Text>Scanner cerrado</Text></View>; return <Scanner onPayload={onPayload} onClose={()=>setOpen(false)} />
}
"@ | Set-Content src/screens/ScannerScreen.js
if(-not (Test-Path ".github/pull_request_template.md")){
@"
## Alcance
- M1: Auth mínima + Scanner + CRM + Seeds
## Cómo probar
npm ci
npm run emulators:start
node scripts/seedBeneficioDemo.js
npx expo start --dev-client
"@ | Set-Content .github/pull_request_template.md
}
SafeCommitPush "feat(m1): base + roles + historial + cooldown + seeds"
if($GH_OK -eq 1){ try{ gh pr view --head fix/phase1-base | Out-Null } catch { gh pr create --title "M1 — Base + Roles + E2E (fix/phase1-base)" --body "Scanner + historial + seeds. Cómo probar en cuerpo del PR." --base fix/infra-compat --head fix/phase1-base | Out-Null } }

# M2
EnsureBranch "feat/phase2-dual-admin" "fix/phase1-base"
New-Item -ItemType Directory -Force -Path src/components,src/screens/admin,src/services | Out-Null
@"
import React,{useEffect,useRef,useState} from 'react'; import { View, Text } from 'react-native'; import QRCode from 'react-native-qrcode-svg';
const TTL=Number(process.env.EXPO_PUBLIC_QR_TTL_SECONDS||30); function nonce(){ return Math.random().toString(36).slice(2,8) }
export default function QrDynamicCard({dni}){ const [value,setValue]=useState(null); const timer=useRef(null); const refresh=()=>setValue(`APP:${dni}:${nonce()}`);
useEffect(()=>{ if(!dni) return; refresh(); timer.current=setInterval(refresh, TTL*1000); return ()=>clearInterval(timer.current); },[dni]);
if(!dni) return <Text>Completa tu DNI para generar QR.</Text>;
return (<View style={{alignItems:'center',padding:16}}><QRCode value={value||''} size={220}/><Text style={{marginTop:8}}>Se renueva cada {TTL}s</Text></View>);
}
"@ | Set-Content src/components/QrDynamicCard.js
@"
import { db } from './firebaseClient'; import { doc, onSnapshot } from 'firebase/firestore';
let cache={ QR_TTL_SECONDS:30, COOLDOWN_MIN:1, LIMITS_PER_WEEK:20, GEO_RADIUS_M:200, MAINTENANCE_MODE:false, AUTO_LOCK_SEC:2 };
export function subscribeSettings(cb){ const ref=doc(db,'Ajustes','global'); return onSnapshot(ref,(snap)=>{ if(snap.exists()){ cache={...cache,...snap.data()}; cb(cache) } else cb(cache) }); }
export function getSettings(){ return cache }
"@ | Set-Content src/services/settings.js
@"
import React,{useEffect,useState} from 'react'; import { View, FlatList, Text } from 'react-native'; import { db } from '../../services/firebaseClient'; import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
export default function HistoryScreen(){ const [items,setItems]=useState([]); useEffect(()=>{ const q=query(collection(db,'Historial'),orderBy('ts','desc'),limit(100)); return onSnapshot(q,(snap)=>setItems(snap.docs.map(d=>({id:d.id,...d.data()})))) },[]); return (<View style={{flex:1,padding:12}}><FlatList data={items} keyExtractor={(i)=>i.id} renderItem={({item})=><Text>{item.tipo} — {item.dni||item.serial}</Text>} /></View>); }
"@ | Set-Content src/screens/admin/HistoryScreen.js
SafeCommitPush "feat(m2): QR dinámico + settings runtime + History admin (mínimo)"
if($GH_OK -eq 1){ try{ gh pr view --head feat/phase2-dual-admin | Out-Null } catch { gh pr create --title "M2 — Dual + Consola Admin + Ajustes (feat/phase2-dual-admin)" --body "QR dinámico + settings + History (mínimo). Completar CRUDs en siguientes commits." --base fix/phase1-base --head feat/phase2-dual-admin | Out-Null } }

# M3 (scaffold)
EnsureBranch "feat/phase3-growth" "feat/phase2-dual-admin"
if(-not (Test-Path "src/services/guardrails.js")){ "export async function checkWeeklyLimits(){return true} export async function checkCooldown(){return true}" | Set-Content src/services/guardrails.js }
if(-not (Test-Path "src/screens/admin/AnalyticsScreen.js")){ "import React from 'react'; export default function AnalyticsScreen(){return null}" | Set-Content src/screens/admin/AnalyticsScreen.js }
SafeCommitPush "feat(m3): scaffolds guardrails + analytics"
if($GH_OK -eq 1){ try{ gh pr view --head feat/phase3-growth | Out-Null } catch { gh pr create --title "M3 — Growth (feat/phase3-growth)" --body "Scaffold referidos/antifraude/analytics/offline/tests." --base feat/phase2-dual-admin --head feat/phase3-growth | Out-Null } }

ok "Hecho. Revisa PRs apilados."
