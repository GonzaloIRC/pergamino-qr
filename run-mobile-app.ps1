# Script para ejecutar la aplicación móvil de Pergamino en un entorno aislado
# Autor: GitHub Copilot
# Fecha: 29/09/2025

Write-Host "🔵 Iniciando entorno aislado para la aplicación móvil de Pergamino" -ForegroundColor Cyan

# Añadir el directorio de Android SDK Platform Tools al PATH
$env:PATH += ";C:\Users\k\AppData\Local\Android\Sdk\platform-tools"

# Verificar si hay dispositivos conectados
$devices = & adb devices
Write-Host "📱 Dispositivos conectados:" -ForegroundColor Yellow
Write-Host $devices -ForegroundColor White

# Función para verificar si un dispositivo está conectado
function Check-DeviceConnected {
    $deviceList = & adb devices
    return $deviceList -match "device$"
}

# Limpiar caché y construir directorios para evitar conflictos
Write-Host "🧹 Limpiando directorios de build para evitar conflictos..." -ForegroundColor Yellow
Remove-Item -Recurse -Force android\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue

# Limpiar cache de metro
Write-Host "🧹 Limpiando caché de Metro Bundler..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Asegurar que tenemos la versión adecuada de react-native-reanimated
Write-Host "📦 Verificando compatibilidad de dependencias..." -ForegroundColor Yellow
$packageJson = Get-Content -Path "package.json" | ConvertFrom-Json
$reactNativeVersion = $packageJson.dependencies."react-native"
Write-Host "ℹ️ Versión de React Native: $reactNativeVersion" -ForegroundColor White

# Preguntar al usuario si desea iniciar en modo Expo Go o Development Build
Write-Host "`n🚀 Opciones para iniciar la aplicación:" -ForegroundColor Cyan
Write-Host "1. Iniciar con Expo Go (recomendado para desarrollo rápido)"
Write-Host "2. Iniciar con Development Build (mejor rendimiento, requiere compilación)"
Write-Host "3. Prebuild y ejecutar en dispositivo (instalación completa en dispositivo)"

$option = Read-Host "Seleccione una opción (1-3)"

switch ($option) {
    "1" {
        Write-Host "`n🚀 Iniciando la app con Expo Go..." -ForegroundColor Green
        Write-Host "📱 Escanea el código QR con la app Expo Go en tu dispositivo" -ForegroundColor Yellow
        npx expo start
    }
    "2" {
        Write-Host "`n🚀 Iniciando en modo Development Build..." -ForegroundColor Green
        npx expo start --dev-client
    }
    "3" {
        Write-Host "`n🚀 Realizando prebuild y ejecutando en dispositivo..." -ForegroundColor Green
        
        if (Check-DeviceConnected) {
            Write-Host "📱 Dispositivo detectado. Preparando build..." -ForegroundColor Yellow
            npx expo prebuild --platform android --clean
            
            Write-Host "🔨 Construyendo e instalando en dispositivo..." -ForegroundColor Yellow
            npx expo run:android --device
        } else {
            Write-Host "❌ No se detectó ningún dispositivo conectado. Conecte un dispositivo y vuelva a intentarlo." -ForegroundColor Red
            exit 1
        }
    }
    default {
        Write-Host "❌ Opción no válida. Saliendo..." -ForegroundColor Red
        exit 1
    }
}