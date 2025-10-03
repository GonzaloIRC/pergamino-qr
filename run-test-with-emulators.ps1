#!/usr/bin/env pwsh
# Script para ejecutar pruebas usando emuladores de Firebase

# Función para mostrar mensajes coloridos
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Cambiar al directorio del proyecto
Push-Location -Path ".\apps\admin-web"

# Asegurar que estamos en el directorio correcto
Write-ColorMessage "Directorio actual: $(Get-Location)" -ForegroundColor Green

# Copiar .env.emulator a .env.local para usar emuladores
Write-ColorMessage "Configurando entorno para usar emuladores..." -ForegroundColor Cyan
Copy-Item -Path .env.emulator -Destination .env.local -Force

# Configurar variables de entorno explícitamente en el proceso actual
$env:NEXT_PUBLIC_USE_EMULATORS = "true"
$env:TEST_ADMIN_EMAIL = "admin@local.test"
$env:TEST_ADMIN_PASSWORD = "Admin123!"
$env:NODE_ENV = "development"

# Mostrar configuración actual
Write-ColorMessage "Ejecutando pruebas con la siguiente configuración:" -ForegroundColor Cyan
Write-ColorMessage "NEXT_PUBLIC_USE_EMULATORS: $env:NEXT_PUBLIC_USE_EMULATORS" -ForegroundColor Yellow
Write-ColorMessage "TEST_ADMIN_EMAIL: $env:TEST_ADMIN_EMAIL" -ForegroundColor Yellow
Write-ColorMessage "NODE_ENV: $env:NODE_ENV" -ForegroundColor Yellow

# Limpiar caché anterior
if (Test-Path ".\.next") {
    Write-ColorMessage "Limpiando caché de Next.js..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force ".\.next" -ErrorAction SilentlyContinue
}

# Iniciar los emuladores de Firebase
Write-ColorMessage "Iniciando emuladores de Firebase en segundo plano..." -ForegroundColor Green
$emulatorProcess = Start-Process -FilePath "npx" -ArgumentList "firebase", "emulators:start", "--only", "auth,firestore" -PassThru -WindowStyle Hidden

try {
    # Esperar a que los emuladores estén listos (15 segundos)
    Write-ColorMessage "Esperando 15 segundos a que los emuladores estén listos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Crear usuario admin de prueba en el emulador
    Write-ColorMessage "Creando usuario admin de prueba en el emulador..." -ForegroundColor Cyan
    
    # Ejecutar script para crear usuario admin en el emulador
    node ..\scripts\setup-emulator-admin.js
    
    # Ejecutar pruebas específicas con opciones de depuración
    Write-ColorMessage "Ejecutando prueba de login con emuladores..." -ForegroundColor Cyan
    npx playwright test tests/e2e/admin-panel-emulator.spec.ts --headed
    
} finally {
    # Detener los emuladores al finalizar
    if ($null -ne $emulatorProcess) {
        Write-ColorMessage "Deteniendo emuladores de Firebase..." -ForegroundColor Yellow
        Stop-Process -Id $emulatorProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Restaurar .env.local original si existe
    if (Test-Path .env.local.backup) {
        Copy-Item -Path .env.local.backup -Destination .env.local -Force
        Remove-Item -Path .env.local.backup -Force
    }
    
    # Volver al directorio original
    Pop-Location
    
    Write-ColorMessage "Prueba finalizada." -ForegroundColor Green
}