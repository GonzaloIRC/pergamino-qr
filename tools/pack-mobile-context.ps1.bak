<#
Uso
----
1) Guarda este archivo como: tools/pack-mobile-context.ps1
2) Ejecuta en PowerShell (desde la raíz del repo Expo/RN):
   pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\pack-mobile-context.ps1 -Root . -OutZip pergamino-mobile-context.zip
3) Sube el ZIP resultante aquí.

Qué incluye (si existe)
-----------------------
- package.json, app.config.ts, index.js, App.js
- metro.config.js, jest.config.*, eas.json, tsconfig.json
- src/components/BarcodeScanner/**/* (migración a expo-camera)
- android/build.gradle, android/app/build.gradle, android/gradle/wrapper/gradle-wrapper.properties
- android/app/src/main/AndroidManifest.xml
- android/app/src/main/java/**/MainActivity.kt (+ MainApplication.kt si existe)
- .env.local y .env.staging **saneados (valores = REDACTED)**
- logs/expo-run-android.txt (si existe) + copia truncada a 200 líneas

Por qué
-------
- Recolectar exactamente los artefactos que necesito para diagnosticar builds sin exponer secretos.
#>

param(
  [string]$Root = (Get-Location).Path,
  [string]$OutZip = "pergamino-mobile-context.zip",
  [string[]]$ExtraPaths = @(),
  [switch]$IncludeAndroid = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-TempDir {
  $d = Join-Path $Root ("pack-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
  New-Item -ItemType Directory -Path $d -Force | Out-Null
  return $d
}

function Add-Glob {
  param([string]$Glob)
  $matches = @(Get-ChildItem -Path (Join-Path $Root $Glob) -Recurse -Force -ErrorAction SilentlyContinue)
  if ($matches.Count -eq 0) { $script:Missing += $Glob; return }
  foreach ($m in $matches) {
    if ($m.PSIsContainer) { continue }
    $rel = [IO.Path]::GetRelativePath($Root, $m.FullName)
    $dest = Join-Path $Staging $rel
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
    Copy-Item -Path $m.FullName -Destination $dest -Force
  }
}

function Sanitize-EnvFile {
  param([string]$Path)
  # Por qué: evitar exponer secretos; mantener solo claves.
  $lines = Get-Content -Path $Path -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
  if (-not $lines) { return }
  $san = @()
  foreach ($line in ($lines -split "`n")) {
    if ($line -match '^[ \t]*#' -or $line.Trim().Length -eq 0) { $san += $line; continue }
    $san += ($line -replace '=(.*)$', '=REDACTED')
  }
  Set-Content -Path $Path -Value ($san -join "`r`n") -NoNewline -Encoding UTF8
}

$Staging = New-TempDir
$Missing = @()

# Núcleo
$include = @(
  'package.json',
  'app.config.ts',
  'index.js',
  'App.js',
  'metro.config.js',
  'jest.config.*',
  'eas.json',
  'tsconfig.json',
  'src/components/BarcodeScanner/**/*'
)

if ($IncludeAndroid) {
  $include += @(
    'android/build.gradle',
    'android/app/build.gradle',
    'android/gradle/wrapper/gradle-wrapper.properties',
    'android/app/src/main/AndroidManifest.xml',
    'android/app/src/main/java/**/MainActivity.kt',
    'android/app/src/main/java/**/MainApplication.kt'
  )
}

$include += $ExtraPaths

foreach ($g in $include) { Add-Glob -Glob $g }

# .env saneados si existen
$envs = @('.env.local', '.env.staging')
foreach ($e in $envs) {
  $src = Join-Path $Root $e
  if (Test-Path $src) {
    $dest = Join-Path $Staging $e
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
    Copy-Item $src $dest -Force
    Sanitize-EnvFile -Path $dest
  } else { $Missing += $e }
}

# Logs (opcional): incluir archivo completo y una versión truncada si existe
$logSrc = Join-Path $Root 'logs/expo-run-android.txt'
if (Test-Path $logSrc) {
  $logDest = Join-Path $Staging 'logs/expo-run-android.txt'
  New-Item -ItemType Directory -Path (Split-Path $logDest -Parent) -Force | Out-Null
  Copy-Item $logSrc $logDest -Force
  $head = Get-Content $logSrc -TotalCount 200
  Set-Content -Path (Join-Path $Staging 'logs/expo-run-android.head.txt') -Value $head -Encoding UTF8
} else { $Missing += 'logs/expo-run-android.txt' }

# Reporte de faltantes
if ($Missing.Count -gt 0) {
  $missPath = Join-Path $Staging 'MISSING.txt'
  "Faltantes (no encontrados en $Root):" | Set-Content -Path $missPath -Encoding UTF8
  $Missing | Add-Content -Path $missPath
}

# Excluir basura común
$excludes = @('.git', 'node_modules', '.gradle', 'android/.gradle', 'android/build', 'dist', 'build')

# Comprimir
if (Test-Path $OutZip) { Remove-Item $OutZip -Force }
Compress-Archive -Path (Get-ChildItem $Staging -Recurse | Where-Object { $_.PSIsContainer -eq $false -and ($excludes -notcontains $_.Name) } | ForEach-Object { $_.FullName }) `
                 -DestinationPath $OutZip -CompressionLevel Optimal

Write-Host '✔ ZIP listo:' (Resolve-Path $OutZip).Path
Write-Host ('Staging: ' + $Staging)
