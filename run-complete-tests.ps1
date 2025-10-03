#!/usr/bin/env pwsh
# Script para ejecutar pruebas completas de Playwright

# Función para mostrar mensajes coloridos
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

Write-ColorMessage "Iniciando pruebas completas del panel de administración..." -ForegroundColor Cyan

# Verificar si el servidor está en ejecución
$serverRunning = $false
$serverPort = 3000

try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    $serverRunning = $true
    $serverPort = 3000
    Write-ColorMessage "Servidor Next.js detectado en puerto 3000" -ForegroundColor Green
} catch {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        $serverRunning = $true
        $serverPort = 3001
        Write-ColorMessage "Servidor Next.js detectado en puerto 3001" -ForegroundColor Green
    } catch {
        Write-ColorMessage "No se detectó un servidor Next.js en ejecución" -ForegroundColor Yellow
    }
}

# Si no hay servidor en ejecución, iniciar uno en una nueva terminal
if (-not $serverRunning) {
    Write-ColorMessage "Iniciando servidor Next.js en una nueva terminal..." -ForegroundColor Cyan
    
    # En Windows, Start-Process inicia un nuevo proceso en una ventana separada
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PWD\apps\admin-web'; npm run dev`""
    
    # Esperar a que el servidor esté listo
    Write-ColorMessage "Esperando a que el servidor esté listo (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Verificar nuevamente si el servidor está en ejecución
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        $serverRunning = $true
        $serverPort = 3000
        Write-ColorMessage "Servidor Next.js iniciado en puerto 3000" -ForegroundColor Green
    } catch {
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            $serverRunning = $true
            $serverPort = 3001
            Write-ColorMessage "Servidor Next.js iniciado en puerto 3001" -ForegroundColor Green
        } catch {
            Write-ColorMessage "No se pudo iniciar el servidor Next.js. Verificando manualmente..." -ForegroundColor Red
            
            # En este punto, intentamos varias veces con diferentes puertos
            for ($port = 3000; $port -le 3010; $port++) {
                Write-ColorMessage "Verificando puerto $port..." -ForegroundColor Yellow
                try {
                    $null = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
                    $serverRunning = $true
                    $serverPort = $port
                    Write-ColorMessage "Servidor Next.js encontrado en puerto $port" -ForegroundColor Green
                    break
                } catch {
                    # Continuar con el siguiente puerto
                }
            }
        }
    }
}

# Si el servidor está en ejecución, ejecutar las pruebas
if ($serverRunning) {
    # Cambiar al directorio de pruebas
    Set-Location -Path "apps/admin-web"
    
    # Configurar la URL base para las pruebas
    $env:PLAYWRIGHT_TEST_BASE_URL = "http://localhost:$serverPort"
    
    # Ejecutar todas las pruebas disponibles
    Write-ColorMessage "Ejecutando pruebas completas..." -ForegroundColor Cyan
    Write-ColorMessage "URL base para pruebas: $env:PLAYWRIGHT_TEST_BASE_URL" -ForegroundColor Yellow
    
    # Primero la prueba de humo para verificar la página principal
    Write-ColorMessage "1. Ejecutando prueba de estructura básica..." -ForegroundColor Cyan
    npx playwright test tests/e2e/sidebar-structure.spec.ts --project=chromium
    
    # Luego pruebas específicas de autenticación
    Write-ColorMessage "`n2. Ejecutando prueba de autenticación..." -ForegroundColor Cyan
    npx playwright test tests/e2e/debug.spec.ts --project=chromium
    
    # Pruebas de rutas protegidas si existen
    if (Test-Path "tests/e2e/auth-simulation.spec.ts") {
        Write-ColorMessage "`n3. Ejecutando prueba de simulación de autenticación..." -ForegroundColor Cyan
        npx playwright test tests/e2e/auth-simulation.spec.ts --project=chromium
    }
    
    # Mostrar el reporte completo
    Write-ColorMessage "`nGenerando reporte completo de pruebas..." -ForegroundColor Cyan
    npx playwright show-report --port 9325
    
    # Volver al directorio raíz
    Set-Location -Path "../.."
} else {
    Write-ColorMessage "No se pudo detectar o iniciar el servidor Next.js. Las pruebas no se ejecutarán." -ForegroundColor Red
    exit 1
}

Write-ColorMessage "Proceso de pruebas completas finalizado." -ForegroundColor Green