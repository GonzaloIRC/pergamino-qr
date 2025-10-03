# Script simple para iniciar la aplicación móvil de Pergamino
# Este script está diseñado para ejecutar la app móvil sin afectar la configuración web
# Autor: GitHub Copilot
# Fecha: 29/09/2025

# Configurar colores para mejor legibilidad
$Host.UI.RawUI.ForegroundColor = "White"
$Host.UI.RawUI.BackgroundColor = "Black"
Clear-Host

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "       PERGAMINO APP - ENTORNO MÓVIL AISLADO          " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Directorio del proyecto y app móvil
$rootDir = $PSScriptRoot
$mobileDir = "$rootDir\apps\mobile-expo"

# Añadir Android SDK a PATH
$env:PATH += ";C:\Users\k\AppData\Local\Android\Sdk\platform-tools"

# Verificar dispositivos Android conectados
Write-Host "Verificando dispositivos conectados..." -ForegroundColor Yellow
$devices = & adb devices
Write-Host $devices -ForegroundColor White
$hasDevice = $devices -match "device$"

# Hacer backup de configuración web si existe
if (Test-Path "$rootDir\.env.local") {
    Write-Host "Guardando configuración web actual..." -ForegroundColor Yellow
    Copy-Item "$rootDir\.env.local" "$rootDir\.env.local.backup" -Force
}

# Aplicar configuración para la app móvil
Write-Host "Aplicando configuración para app móvil..." -ForegroundColor Yellow
if (Test-Path "$mobileDir\.env.development") {
    Copy-Item "$mobileDir\.env.development" "$rootDir\.env.local" -Force
} elseif (Test-Path "$mobileDir\.env.staging") {
    Copy-Item "$mobileDir\.env.staging" "$rootDir\.env.local" -Force
}

# Mostrar opciones disponibles
Write-Host ""
Write-Host "Opciones disponibles:" -ForegroundColor Cyan
Write-Host "1. Iniciar con Expo Go (recomendado para desarrollo)" -ForegroundColor White
Write-Host "2. Iniciar con Development Client" -ForegroundColor White
if ($hasDevice) {
    Write-Host "3. Instalar en dispositivo conectado" -ForegroundColor White
}
Write-Host ""

$option = Read-Host "Seleccione una opción (1-3)"

# Ejecutar según la opción seleccionada
try {
    switch ($option) {
        "1" {
            Write-Host "Iniciando con Expo Go..." -ForegroundColor Green
            npx expo start
        }
        "2" {
            Write-Host "Iniciando con Development Client..." -ForegroundColor Green
            npx expo start --dev-client
        }
        "3" {
            if ($hasDevice) {
                Write-Host "Compilando e instalando en dispositivo..." -ForegroundColor Green
                npx expo prebuild --platform android --clean
                npx expo run:android --device
            } else {
                Write-Host "No hay dispositivo conectado. Iniciando con Expo Go..." -ForegroundColor Yellow
                npx expo start
            }
        }
        default {
            Write-Host "Opción no válida. Iniciando con Expo Go..." -ForegroundColor Yellow
            npx expo start
        }
    }
}
finally {
    # Restaurar configuración web original
    if (Test-Path "$rootDir\.env.local.backup") {
        Write-Host "Restaurando configuración web original..." -ForegroundColor Yellow
        Copy-Item "$rootDir\.env.local.backup" "$rootDir\.env.local" -Force
        Remove-Item "$rootDir\.env.local.backup" -Force
    }
}