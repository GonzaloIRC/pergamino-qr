param(
  [switch]$FixIndex # opcional: si lo pasas, reescribe index.js al patrón canónico
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Status($level, $msg) {
  $color = switch ($level) {
    'OK'   { 'Green' }
    'WARN' { 'Yellow' }
    'FAIL' { 'Red' }
    default { 'White' }
  }
  Write-Host ("[{0}] {1}" -f $level, $msg) -ForegroundColor $color
}

$fail = New-Object System.Collections.ArrayList
$warn = New-Object System.Collections.ArrayList
$info = New-Object System.Collections.ArrayList

function Fail($m){ [void]$fail.Add($m); Status 'FAIL' $m }
function Warn($m){ [void]$warn.Add($m); Status 'WARN' $m }
function Info($m){ [void]$info.Add($m); Status 'INFO' $m }
function Ok($m){ Status 'OK' $m }

# --- 0) Guardrails de carpeta ---
if (!(Test-Path package.json)) { Fail "No se encontró package.json en $(Get-Location). Corre el script en la raíz del repo."; exit 1 }
Ok "Raíz del proyecto OK: $(Get-Location)"

# --- 1) Versiones runtime: Node, npm, Java, Android SDK ---
# Node
try {
  $nodeV = (& node -v) 2>&1
  if ($nodeV -match 'v(\d+)\.') {
    $nodeMajor = [int]$Matches[1]
    if ($nodeMajor -eq 20) { Ok "Node $nodeV (LTS 20.x) ✔" }
    else { Warn "Node $nodeV (recomendado 20.x). Puede funcionar, pero aléjate de 18/22 si ves rarezas." }
  } else { Warn "No pude parsear la versión de Node: $nodeV" }
} catch { Fail "Node no disponible en PATH." }

# npm
try { $npmV = (& npm -v) 2>&1; Ok "npm $npmV" } catch { Warn "npm no disponible" }

# Java / JDK
try {
  $javaV = (& java -version) 2>&1
  if ($javaV -match '"(\d+)\.') {
    $jdkMajor = [int]$Matches[1]
    if ($jdkMajor -ge 17) { Ok "Java $javaV (≥17) ✔" } else { Fail "Java demasiado antiguo. Necesitas JDK ≥17 (ideal: JBR 21 de Android Studio)." }
  } else { Warn "No pude parsear java -version: $javaV" }
} catch { Fail "Java no disponible. Revisa JAVA_HOME/PATH." }

# ANDROID_SDK_ROOT
if ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
  Ok "ANDROID_SDK_ROOT=$($env:ANDROID_SDK_ROOT)"
} else {
  Warn "ANDROID_SDK_ROOT no establecido o inválido. Gradle/Emulador puede fallar."
}

# AVD listing
$emu = Join-Path $env:ANDROID_SDK_ROOT 'emulator\emulator.exe'
if (Test-Path $emu) {
  try {
    $avds = & $emu -list-avds
    if ($avds) {
      Ok "AVDs detectados:`n$avds"
      if ($avds -match '^Pixel_4_API_33$') { Ok "AVD objetivo Pixel_4_API_33 disponible ✔" }
      else { Warn "No encontré Pixel_4_API_33. Usa AVD existente o crea uno con ese nombre." }
    } else { Warn "No hay AVDs definidos." }
  } catch { Warn "No pude listar AVDs: $_" }
} else { Warn "No encontré emulator.exe en $emu" }

# --- 2) Lockfiles coherentes ---
$hasYarn = Test-Path yarn.lock
$hasPnpm = Test-Path pnpm-lock.yaml
if ($hasYarn -or $hasPnpm) { Fail "Lockfiles conflictivos: $(if($hasYarn){'yarn.lock '})$(if($hasPnpm){'pnpm-lock.yaml'}) → usa solo npm (package-lock.json)" } else { Ok "Sin lockfiles conflictivos (solo npm) ✔" }

# --- 3) package.json: Expo/RN y módulos de cámara ---
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
function GetDep($name) {
  if ($pkg.dependencies.$name) { return "$($pkg.dependencies.$name)" }
  if ($pkg.devDependencies.$name) { return "$($pkg.devDependencies.$name)" }
  return $null
}

$expo = GetDep 'expo'
$rn   = GetDep 'react-native'
if ($expo -match '(^|[~^])53\.') { Ok "expo@$expo (SDK 53) ✔" } else { Fail "Expo no es 53.x (actual: $expo)" }
if ($rn -match '^0\.79\.') { Ok "react-native@$rn (0.79.x) ✔" } else { Warn "RN no es 0.79.x (actual: $rn). Tras prebuild se clava a 0.79.x." }

$cam = GetDep 'expo-camera'
if ($cam) { Ok "expo-camera@$cam presente ✔" } else { Fail "Falta expo-camera. Instala: npx expo install expo-camera" }

$bad1 = GetDep 'expo-barcode-scanner'
$bad2 = GetDep 'expo-barcode-scanner-interface'
if ($bad1 -or $bad2) { Fail "Paquetes prohibidos presentes: $(if($bad1){'expo-barcode-scanner '})$(if($bad2){'expo-barcode-scanner-interface'})" } else { Ok "Sin expo-barcode-scanner* en package.json ✔" }

# --- 4) Escaneo de código fuente por usos prohibidos ---
$srcFiles = Get-ChildItem -Recurse -File -Include *.js,*.jsx,*.ts,*.tsx | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\android\\build\\|\\ios\\build\\' }
$hits = $srcFiles | Select-String -Pattern 'expo-barcode-scanner' -SimpleMatch -CaseSensitive
if ($hits) {
  $list = ($hits | Select-Object -Unique Path | ForEach-Object { Resolve-Path $_ }).Path -join "`n"
  Fail "Referencias a 'expo-barcode-scanner' en código:`n$list"
} else { Ok "Código limpio de 'expo-barcode-scanner' ✔" }

# --- 5) index.js & App.* mínimos ---
$index = @('index.js','index.ts','index.tsx') | Where-Object { Test-Path $_ } | Select-Object -First 1
if (!$index) { Fail "No encontré index.js/ts/tsx" }
else {
    $idx = Get-Content $index -Raw
  $hasReg = ($idx -match 'registerRootComponent\s*\(')
  $hasApp = ($idx -match "import App from './App'")
    if ($hasReg -and $hasApp) {
      Ok "$index contiene patrón de registro ✔"
    } else {
      Warn "$index no parece registrar App con expo.registerRootComponent"
      if ($FixIndex) {
@"
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
"@ | Set-Content -Encoding UTF8 $index
        Ok "Reescribí $index al patrón mínimo."
      } else {
        Info "Ejecuta con -FixIndex para reescribir $index automáticamente."
      }
    }
}

$appFile = Get-ChildItem -File -Include App.js,App.jsx,App.ts,App.tsx | Select-Object -First 1
if ($appFile) {
  $appRaw = Get-Content $appFile -Raw
  if ($appRaw -match 'export\s+default\s+') { Ok "$($appFile.Name) export default ✔" } else { Fail "$($appFile.Name) no expone 'export default'." }
} else { Fail "No encontré App.(js|jsx|ts|tsx)" }

# --- 6) Android Gradle (si existe carpeta android/) ---
if (Test-Path android) {
  $appGradle = @('android/app/build.gradle','android/app/build.gradle.kts') | Where-Object { Test-Path $_ } | Select-Object -First 1
  $rootGradle = @('android/build.gradle','android/build.gradle.kts') | Where-Object { Test-Path $_ } | Select-Object -First 1

  if ($appGradle) {
    $gr = Get-Content $appGradle -Raw
    $compile = $null; $target = $null; $min = $null
    if ($gr -match 'compileSdk(?:Version)?\s*=?\s*(\d+)') { $compile = [int]$Matches[1] }
    if ($gr -match 'targetSdk(?:Version)?\s*=?\s*(\d+)')  { $target = [int]$Matches[1] }
    if ($gr -match 'minSdk(?:Version)?\s*=?\s*(\d+)')     { $min    = [int]$Matches[1] }

    if ($compile -eq 35) { Ok "compileSdk=35 ✔" } else { Fail "compileSdk esperado 35, actual: $compile" }
    if ($target  -eq 35) { Ok "targetSdk=35 ✔" } else { Fail "targetSdk esperado 35, actual: $target" }
    if ($min -ge 24)     { Ok "minSdk=$min (≥24) ✔" } else { Fail "minSdk esperado ≥24, actual: $min" }
  } else {
    Info "Aún no hay android/app/build.gradle (managed). Se generará con prebuild."
  }

  if ($rootGradle) {
    $rg = Get-Content $rootGradle -Raw
    if ($rg -match 'com\.android\.application' -or $rg -match 'com\.android\.library') { Ok "AGP plugins presentes" } else { Warn "No confirmé plugins AGP en $rootGradle" }
  }
} else {
  Info "No existe carpeta android/. En Expo managed se crea con: npx expo prebuild --platform android"
}

# --- 7) Metro config (ligero) ---
if (Test-Path metro.config.js) {
  $mc = Get-Content metro.config.js -Raw
  if ($mc -match 'blockList' -and $mc -match 'expo-modules') {
    Warn "metro.config.js parece bloquear expo-modules → revisa."
  } else {
    Ok "metro.config.js OK (no bloquea expo-modules) ✔"
  }
} else {
  Info "Sin metro.config.js → se usa config por defecto (OK)"
}

# --- 8) Resumen ---
Write-Host "`n==================== SANITY SUMMARY ====================" -ForegroundColor Cyan
if ($fail.Count -gt 0) {
  Write-Host "❌ Fallas: $($fail.Count)" -ForegroundColor Red
  $fail | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
} else {
  Write-Host "✅ Sin fallas críticas" -ForegroundColor Green
}
if ($warn.Count -gt 0) {
  Write-Host "⚠️  Advertencias: $($warn.Count)" -ForegroundColor Yellow
  $warn | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
} else {
  Write-Host "🟢 Sin advertencias" -ForegroundColor Green
}

if ($fail.Count -gt 0) { exit 1 } else { exit 0 }
