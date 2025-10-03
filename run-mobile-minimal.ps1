# Script minimalista para ejecutar la app móvil
# Autor: GitHub Copilot
# Fecha: 29/09/2025

Write-Host "=== PERGAMINO APP - INICIANDO APP MÓVIL ===" -ForegroundColor Cyan

# Añadir Android SDK a PATH
$env:PATH += ";C:\Users\k\AppData\Local\Android\Sdk\platform-tools"

# Verificar dispositivos
$devices = adb devices
Write-Host "Dispositivos conectados:" -ForegroundColor Yellow
Write-Host $devices

# Preguntar qué modo usar
Write-Host "1. Expo Go (simple)"
Write-Host "2. Instalar en dispositivo"

$option = Read-Host "Selecciona opción (1 o 2)"

if ($option -eq "1") {
    Write-Host "Iniciando con Expo Go..." -ForegroundColor Green
    npx expo start
} else {
    Write-Host "Instalando en dispositivo..." -ForegroundColor Green
    npx expo run:android --device
}