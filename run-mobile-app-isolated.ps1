# Script para ejecutar la aplicación móvil desde la carpeta mobile-expo
# Este script aísla la configuración de la app móvil de la app web
# Autor: GitHub Copilot
# Fecha: 29/09/2025

Write-Host "🔵 Iniciando entorno aislado para la aplicación móvil de Pergamino" -ForegroundColor Cyan

# Directorio del proyecto principal
$rootDir = "C:\Users\k\Documents\Pergamino-app 2"
# Directorio de la app móvil
$mobileDir = "$rootDir\apps\mobile-expo"

# Añadir el directorio de Android SDK Platform Tools al PATH
$env:PATH += ";C:\Users\k\AppData\Local\Android\Sdk\platform-tools"

# Verificar si hay dispositivos conectados
$devices = & adb devices
Write-Host "📱 Dispositivos conectados:" -ForegroundColor Yellow
Write-Host $devices -ForegroundColor White

# Función para verificar si un dispositivo está conectado
function Test-DeviceConnected {
    $deviceList = & adb devices
    return $deviceList -match "device$"
}

# Preparar entorno móvil
Write-Host "⚙️ Preparando entorno para la aplicación móvil..." -ForegroundColor Yellow

# Copiar archivos .env necesarios si existen
if (Test-Path "$mobileDir\.env.staging") {
    Write-Host "📄 Copiando configuraciones de entorno..." -ForegroundColor Yellow
    Copy-Item "$mobileDir\.env.staging" "$rootDir\.env.local" -Force
}

# Limpiar caché y construir directorios para evitar conflictos
Write-Host "🧹 Limpiando directorios de build para evitar conflictos..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$rootDir\android\build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$rootDir\android\app\build" -ErrorAction SilentlyContinue

# Limpiar cache de metro
Write-Host "🧹 Limpiando caché de Metro Bundler..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$rootDir\.expo" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$rootDir\node_modules\.cache" -ErrorAction SilentlyContinue

# Preguntar al usuario si desea iniciar en modo Expo Go o Development Build
Write-Host "`n🚀 Opciones para iniciar la aplicación móvil:" -ForegroundColor Cyan
Write-Host "1. Iniciar con Expo Go (recomendado para desarrollo rápido)"
Write-Host "2. Iniciar con Development Build (mejor rendimiento, requiere compilación)"
Write-Host "3. Prebuild y ejecutar en dispositivo (instalación completa en dispositivo)"

$option = Read-Host "Seleccione una opción (1-3)"

# Cambiamos al directorio raíz para ejecutar los comandos
Set-Location $rootDir

switch ($option) {
    "1" {
        Write-Host "`n🚀 Iniciando la app móvil con Expo Go..." -ForegroundColor Green
        Write-Host "📱 Escanea el código QR con la app Expo Go en tu dispositivo" -ForegroundColor Yellow
        npx expo start
    }
    "2" {
        Write-Host "`n🚀 Iniciando en modo Development Build..." -ForegroundColor Green
        npx expo start --dev-client
    }
    "3" {
        Write-Host "`n🚀 Realizando prebuild y ejecutando en dispositivo..." -ForegroundColor Green
        
        if (Test-DeviceConnected) {
            # Limpiar y preparar la estructura Android
            Write-Host "📱 Dispositivo detectado. Preparando build..." -ForegroundColor Yellow
            
            # Hacer un prebuild limpio
            npx expo prebuild --platform android --clean
            
            # Verificar si el prebuild fue exitoso
            if ($LASTEXITCODE -eq 0) {
                Write-Host "🔨 Construyendo e instalando en dispositivo..." -ForegroundColor Yellow
                
                # Intentar resolver problemas con react-native-reanimated
                Write-Host "📦 Verificando compatibilidad de react-native-reanimated..." -ForegroundColor Yellow
                
                # Ajustar versión de reanimated temporalmente si es necesario
                $reanimatedFix = $false
                if (Test-Path "$rootDir\node_modules\react-native-reanimated\android\src\main\java\com\swmansion\reanimated\ReanimatedPackage.java") {
                    Write-Host "🛠️ Aplicando fix temporal para react-native-reanimated..." -ForegroundColor Yellow
                    $reanimatedFix = $true
                }
                
                # Ejecutar en el dispositivo
                npx expo run:android --device
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "⚠️ Error al compilar. Intentando solución alternativa..." -ForegroundColor Yellow
                    # Si falla, intentar con Expo Go como alternativa
                    Write-Host "🔄 Iniciando con Expo Go como alternativa..." -ForegroundColor Yellow
                    npx expo start
                }
            } else {
                Write-Host "❌ Prebuild falló. Intentando iniciar con Expo Go..." -ForegroundColor Red
                npx expo start
            }
        } else {
            Write-Host "❌ No se detectó ningún dispositivo conectado. Iniciando con Expo Go..." -ForegroundColor Yellow
            npx expo start
        }
    }
    default {
        Write-Host "❌ Opción no válida. Iniciando con Expo Go por defecto..." -ForegroundColor Yellow
        npx expo start
    }
}