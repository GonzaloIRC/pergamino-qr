# Script de configuración para ejecutar la aplicación móvil
# Este script prepara el entorno adecuado para la app móvil

# Directorio del proyecto principal
$rootDir = $PSScriptRoot
$mobileDir = "$rootDir\apps\mobile-expo"

# Función para mostrar un mensaje de encabezado
function Show-Header {
    param ([string]$Message)
    
    $separator = "=" * 80
    Write-Host $separator -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host $separator -ForegroundColor Cyan
}

# Mostrar encabezado
Show-Header "PERGAMINO APP - CONFIGURACIÓN DE ENTORNO MÓVIL"

# Verificar requisitos previos
$adbExists = $null -ne (Get-Command adb -ErrorAction SilentlyContinue)
if (-not $adbExists) {
    Write-Host "⚠️ ADB no encontrado en PATH. Añadiendo ruta del SDK..." -ForegroundColor Yellow
    $env:PATH += ";C:\Users\k\AppData\Local\Android\Sdk\platform-tools"
}

# Verificar dispositivos
$devices = & adb devices
$hasDevices = $devices -match "device$"
Write-Host "📱 Dispositivos conectados:" -ForegroundColor Yellow
Write-Host $devices -ForegroundColor White

if (-not $hasDevices) {
    Write-Host "⚠️ No se detectaron dispositivos Android. Se usará Expo Go o un emulador." -ForegroundColor Yellow
}

# Verificar archivos de configuración
if (-not (Test-Path "$mobileDir\.env.development")) {
    Write-Host "❌ Archivo de configuración no encontrado en $mobileDir\.env.development" -ForegroundColor Red
    exit 1
}

# Crear una copia temporal de .env.local actual si existe
if (Test-Path "$rootDir\.env.local") {
    Write-Host "📥 Guardando configuración actual..." -ForegroundColor Yellow
    Copy-Item "$rootDir\.env.local" "$rootDir\.env.local.web-backup" -Force
}

# Copiar la configuración móvil
Write-Host "📤 Aplicando configuración para app móvil..." -ForegroundColor Yellow
Copy-Item "$mobileDir\.env.development" "$rootDir\.env.local" -Force

# Verificar si hay conflictos en react-native-reanimated
$reanimatedPath = "$rootDir\node_modules\react-native-reanimated"
if (Test-Path $reanimatedPath) {
    $packageJson = Get-Content -Path "$rootDir\package.json" | ConvertFrom-Json
    $reactNativeVersion = $packageJson.dependencies."react-native"
    $reanimatedVersion = $packageJson.dependencies."react-native-reanimated"
    
    Write-Host "📦 React Native: $reactNativeVersion, Reanimated: $reanimatedVersion" -ForegroundColor White
    
    # Mostrar opciones disponibles
    Show-Header "OPCIONES DE INICIO"
    Write-Host "1. Expo Go (más simple, no requiere compilación)" -ForegroundColor Green
    Write-Host "2. Development Build (mejor rendimiento, requiere compilación)" -ForegroundColor Yellow
    Write-Host "3. Build completo en dispositivo (instalación nativa)" -ForegroundColor Yellow
    Write-Host "4. Restaurar configuración web y salir" -ForegroundColor Red
    
    $option = Read-Host "Seleccione una opción (1-4)"
    
    switch ($option) {
        "1" {
            # Iniciar con Expo Go
            Set-Location $rootDir
            & "$rootDir\run-mobile-app-isolated.ps1" 1
        }
        "2" {
            # Development Build
            Set-Location $rootDir
            & "$rootDir\run-mobile-app-isolated.ps1" 2
        }
        "3" {
            # Build completo
            Set-Location $rootDir
            & "$rootDir\run-mobile-app-isolated.ps1" 3
        }
        "4" {
            # Restaurar configuración web
            if (Test-Path "$rootDir\.env.local.web-backup") {
                Copy-Item "$rootDir\.env.local.web-backup" "$rootDir\.env.local" -Force
                Remove-Item "$rootDir\.env.local.web-backup" -Force
                Write-Host "✅ Configuración web restaurada" -ForegroundColor Green
            } else {
                Write-Host "❌ No se encontró backup de configuración web" -ForegroundColor Red
            }
            exit 0
        }
        default {
            Write-Host "❌ Opción no válida. Saliendo..." -ForegroundColor Red
            if (Test-Path "$rootDir\.env.local.web-backup") {
                Copy-Item "$rootDir\.env.local.web-backup" "$rootDir\.env.local" -Force
                Remove-Item "$rootDir\.env.local.web-backup" -Force
            }
            exit 1
        }
    }
} else {
    Write-Host "⚠️ No se encontró react-native-reanimated instalado." -ForegroundColor Yellow
    # Iniciar con Expo Go por defecto
    Set-Location $rootDir
    & "$rootDir\run-mobile-app-isolated.ps1" 1
}

# Al terminar, restaurar configuración web
if (Test-Path "$rootDir\.env.local.web-backup") {
    Copy-Item "$rootDir\.env.local.web-backup" "$rootDir\.env.local" -Force
    Remove-Item "$rootDir\.env.local.web-backup" -Force
    Write-Host "✅ Configuración web restaurada" -ForegroundColor Green
}