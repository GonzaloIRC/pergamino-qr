# Build Sherpa - Pergamino App (ASCII-safe)
# Uso:
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\bootstrap-and-pack.ps1 -Emulator Pixel_4_API_33
param([string]$Emulator = "Pixel_4_API_33")

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Info([string]$m){ Write-Host ("==> " + $m) -ForegroundColor Cyan }
function Warn([string]$m){ Write-Host ("!!  " + $m) -ForegroundColor Yellow }
function Ok([string]$m){ Write-Host ("OK  " + $m) -ForegroundColor Green }

# 0) JAVA/Node
Info "Configure JAVA_HOME if missing"
if(-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))){
  $jbr = 'C:\Program Files\Android\Android Studio\jbr'
  if(Test-Path $jbr){ $env:JAVA_HOME = $jbr; $env:Path = ("$jbr\bin;" + $env:Path); Ok "JAVA_HOME -> $jbr" } else { Warn "JBR not found at $jbr (continuing)" }
}
try{ & java -version | Out-Host } catch { Warn "java not found" }

Info "Verify Node >= 20"
try{ $nv = (& node -v) -replace '^v',''; if([version]$nv -lt [version]'20.0.0'){ Warn "Node $nv < 20 (recommended 20.x)" } } catch { Warn "node not found" }

# 1) Kill Node/Metro + clean caches
Info "Kill Node/Metro"
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Info "Clean caches/builds"
$paths = @('android\build','android\.gradle','.gradle','node_modules\.cache')
foreach($p in $paths){ if(Test-Path $p){ Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $p } }

# 2) Dependencies: ensure expo-camera; remove forbidden modules
Info "Ensure expo-camera and remove forbidden modules"
$pkgPath = Join-Path (Get-Location) 'package.json'
if(-not (Test-Path $pkgPath)){ throw 'package.json not found. Abort.' }
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
function DepExists($j,$n){
  return (($j.dependencies -and $j.dependencies.PSObject.Properties.Name -contains $n) -or
          ($j.devDependencies -and $j.devDependencies.PSObject.Properties.Name -contains $n))
}
if(DepExists $pkg 'expo-barcode-scanner'){ Info 'Removing expo-barcode-scanner'; & npm uninstall expo-barcode-scanner --silent }
if(DepExists $pkg 'expo-barcode-scanner-interface'){ Info 'Removing expo-barcode-scanner-interface'; & npm uninstall expo-barcode-scanner-interface --silent }
if(-not (DepExists $pkg 'expo-camera')){ Info 'Installing expo-camera@^16'; & npm i -E expo-camera@^16 }

# 3) Entry points (create minimal if missing)
if(-not (Test-Path 'index.js')){
  Info 'Creating index.js'
  @"
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
"@ | Set-Content -Path 'index.js' -Encoding UTF8
}
if(-not (Test-Path 'App.js')){
  Info 'Creating App.js'
  @"
import React from 'react';
import { View, Text, StatusBar } from 'react-native';
export default function App(){
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <StatusBar />
      <Text>Pergamino App</Text>
    </View>
  );
}
"@ | Set-Content -Path 'App.js' -Encoding UTF8
}
if(-not (Test-Path 'app.config.ts')){
  Info 'Creating app.config.ts (SDK 53 / compileSdk 35)'
  @"
import type { ExpoConfig } from 'expo-config';
const config: ExpoConfig = {
  name: 'PergaminoApp',
  slug: 'pergamino-app',
  version: '1.0.0',
  sdkVersion: '53.0.0',
  android: { compileSdkVersion: 35, targetSdkVersion: 35 },
  extra: {
    EXPO_PUBLIC_USE_EMULATORS: process.env.EXPO_PUBLIC_USE_EMULATORS ?? 'false',
    EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
    EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT,
    EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST,
    EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT
  }
};
export default config;
"@ | Set-Content -Path 'app.config.ts' -Encoding UTF8
}

# 4) Install deps
Info 'Install dependencies'
if(Test-Path 'package-lock.json'){ & npm ci } else { & npm install }

# 5) Prebuild clean (regenerate android)
Info 'Regenerate Android project (prebuild --clean)'
if(Test-Path 'android'){ Remove-Item -Recurse -Force -Path 'android' }
& npx expo prebuild --clean --platform android --non-interactive

if(Test-Path 'android\gradlew.bat'){
  Push-Location android
  & .\gradlew.bat clean
  Pop-Location
}

# 6) Run Android + log
if(-not (Test-Path 'logs')){ New-Item -ItemType Directory -Path 'logs' | Out-Null }
Info "Running 'expo run:android' (logs -> logs\expo-run-android.txt)"
& npx expo run:android *>&1 | Tee-Object -FilePath 'logs\expo-run-android.txt'

# 7) Pack ZIP with real context
Info 'Packing pergamino-mobile-context.zip'
$root=(Get-Location).Path;$ts=Get-Date -Format 'yyyyMMdd-HHmmss';$st=Join-Path $root ('pack-'+$ts)
New-Item -ItemType Directory -Path $st -Force | Out-Null
$gl=@(
  'package.json','package-lock.json','app.config.ts','app.json','index.js','App.js',
  'babel.config.*','metro.config.*','jest.config.*','eas.json','tsconfig.json','jsconfig.json',
  'README.md','RESUMEN.md','PLAN.md','src\**\*',
  'android\build.gradle','android\settings.gradle','android\gradle.properties','android\app\build.gradle',
  'android\gradle\wrapper\gradle-wrapper.properties','android\app\src\main\AndroidManifest.xml',
  'android\app\src\debug\AndroidManifest.xml','android\app\src\main\java\**\*','android\app\src\main\res\values*\*',
  'tools\**\*','scripts\**\*','tests\**\*','e2e\**\*','docs\**\*','.maestro\**\*','firebase\**\*','.vscode\**\*',
  '.env.local','.env.staging','logs\expo-run-android.txt'
)
$missing=@()
foreach($g in $gl){
  $items=Get-ChildItem -Path (Join-Path $root $g) -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object{ -not $_.PSIsContainer -and $_.FullName -notmatch "\\node_modules\\|\\\.git\\|\\android\\\\.gradle\\|\\android\\build\\|\\\\.gradle\\|\\dist\\|\\build\\|\\eas-build-local\\|\\pods\\|\\ios\\build\\" }
  if(!$items){ $missing+=$g } else {
    foreach($it in $items){
      $full=$it.FullName; $rel=$full.Substring($root.Length); if($rel -match '^[\\/]+' ){ $rel=$rel -replace '^[\\/]+','' }
      $dst=Join-Path $st $rel
      New-Item -ItemType Directory -Path (Split-Path $dst -Parent) -Force | Out-Null
      Copy-Item $full $dst -Force
    }
  }
}
# Sanitize .env values
Get-ChildItem $st -Recurse -Include '.env.local','.env.staging' -ErrorAction SilentlyContinue | ForEach-Object {
  (Get-Content $_.FullName) -replace '=(.*)$','=REDACTED' | Set-Content $_.FullName -Encoding UTF8
}
if($missing.Count -gt 0){ 'Faltantes:' | Set-Content (Join-Path $st 'MISSING.txt') -Encoding UTF8; $missing | Add-Content (Join-Path $st 'MISSING.txt') }
if(Test-Path 'pergamino-mobile-context.zip'){ Remove-Item 'pergamino-mobile-context.zip' -Force }
Compress-Archive -Path (Join-Path $st '*') -DestinationPath 'pergamino-mobile-context.zip' -CompressionLevel Optimal
Ok ("ZIP listo: " + (Resolve-Path 'pergamino-mobile-context.zip').Path)
Ok ("Staging: " + $st)
Ok 'Fin - Build + Pack completado'
