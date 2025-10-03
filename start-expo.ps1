# Script ultra simple para iniciar la app móvil con Expo Go
# Fecha: 29/09/2025

Write-Host "=== PERGAMINO APP MÓVIL - EXPO GO ===" -ForegroundColor Cyan

# Añadir Android SDK a PATH
$env:PATH += ";C:\Users\k\AppData\Local\Android\Sdk\platform-tools"

# Iniciar Expo
Write-Host "Iniciando Expo Go. Escanea el código QR con la app Expo Go..." -ForegroundColor Green
Set-Location "C:\Users\k\Documents\Pergamino-app 2"
npx expo start