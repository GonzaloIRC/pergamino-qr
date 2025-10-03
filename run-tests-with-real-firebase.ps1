#!/usr/bin/env pwsh
# Script para ejecutar pruebas con Firebase real

# Función para mostrar mensajes coloridos
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Configurar variables de entorno para Firebase real
$env:NEXT_PUBLIC_USE_EMULATORS = "false"
$env:TEST_ADMIN_EMAIL = "admin@local.test"  # Cambia esto a tu email real si es diferente
$env:TEST_ADMIN_PASSWORD = "Admin123!"       # Cambia esto a tu contraseña real si es diferente

Write-ColorMessage "Iniciando pruebas con FIREBASE REAL (no emuladores)" -ForegroundColor Green
Write-ColorMessage "NEXT_PUBLIC_USE_EMULATORS: $env:NEXT_PUBLIC_USE_EMULATORS" -ForegroundColor Yellow
Write-ColorMessage "TEST_ADMIN_EMAIL: $env:TEST_ADMIN_EMAIL" -ForegroundColor Yellow

# Cambiar al directorio del proyecto
Push-Location -Path ".\apps\admin-web"
Write-ColorMessage "Directorio actual: $(Get-Location)" -ForegroundColor Green

# Verificar que .env.local tiene la configuración correcta para Firebase real
$envContent = Get-Content -Path ".env.local" -Raw -ErrorAction SilentlyContinue
if ($envContent -match "NEXT_PUBLIC_USE_EMULATORS=true") {
    Write-ColorMessage "ADVERTENCIA: .env.local tiene NEXT_PUBLIC_USE_EMULATORS=true" -ForegroundColor Red
    Write-ColorMessage "Debes editar .env.local manualmente y cambiar a 'false'" -ForegroundColor Red
    Write-ColorMessage "También asegúrate de que las credenciales de Firebase real estén configuradas" -ForegroundColor Red
    
    $confirmation = Read-Host "¿Deseas continuar de todos modos? (s/n)"
    if ($confirmation -ne "s") {
        Write-ColorMessage "Pruebas canceladas." -ForegroundColor Red
        Pop-Location
        exit 1
    }
}

# Limpieza de caché para asegurar una ejecución limpia
Write-ColorMessage "Limpiando caché de Next.js..." -ForegroundColor Cyan
if (Test-Path ".\.next") {
    Remove-Item -Recurse -Force ".\.next" -ErrorAction SilentlyContinue
}

# Iniciar servidor Next.js en segundo plano
Write-ColorMessage "Iniciando servidor Next.js en el puerto 3000..." -ForegroundColor Cyan
$nextProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev", "--", "-p", "3000" -PassThru -WindowStyle Hidden

try {
    # Esperar a que el servidor esté listo
    Write-ColorMessage "Esperando 20 segundos a que el servidor esté listo..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
    
    # Configurar base URL para Playwright
    $env:PLAYWRIGHT_TEST_BASE_URL = "http://localhost:3000"
    
    # Ejecutar las pruebas con Playwright
    Write-ColorMessage "Ejecutando pruebas con Firebase real..." -ForegroundColor Green
    npx playwright test tests/e2e/admin-panel.spec.ts --project=chromium
    
    # Capturar el código de salida
    $testExitCode = $LASTEXITCODE
    
    # Mostrar resultado
    if ($testExitCode -eq 0) {
        Write-ColorMessage "✅ Todas las pruebas pasaron exitosamente" -ForegroundColor Green
    } else {
        Write-ColorMessage "❌ Algunas pruebas fallaron. Consulta los detalles arriba." -ForegroundColor Red
    }
    
    # Mostrar el reporte HTML
    Write-ColorMessage "Generando reporte HTML..." -ForegroundColor Cyan
    npx playwright show-report
    
} finally {
    # Detener el servidor Next.js al finalizar
    if ($null -ne $nextProcess) {
        Write-ColorMessage "Deteniendo servidor Next.js..." -ForegroundColor Yellow
        Stop-Process -Id $nextProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Volver al directorio original
    Pop-Location
}