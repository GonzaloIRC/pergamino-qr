#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Prueba simple de exportacion de KPIs usando Playwright directamente.

.DESCRIPTION
    Este script ejecuta pruebas E2E para la exportacion de KPIs
    usando comandos directos de Playwright sin depender de configuraciones complejas.

.PARAMETER Headless
    Ejecuta las pruebas en modo headless (sin interfaz grafica). Por defecto es $true.

.PARAMETER Mock
    Usa datos simulados en lugar de intentar conectarse a un servidor real.

.EXAMPLE
    .\test-kpi-export-simple.ps1
    Ejecuta la prueba en modo headless.

.EXAMPLE
    .\test-kpi-export-simple.ps1 -Headless $false
    Ejecuta la prueba mostrando la interfaz grafica.
#>

Param(
    [bool]$Headless = $true,
    [switch]$Mock
)

# Configuracion de colores para la consola
$colorReset = "$([char]27)[0m"
$colorBright = "$([char]27)[1m"
$colorRed = "$([char]27)[31m"
$colorGreen = "$([char]27)[32m"
$colorYellow = "$([char]27)[33m"
$colorBlue = "$([char]27)[34m"
$colorCyan = "$([char]27)[36m"

# Banner
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host "$colorCyan$colorBright Prueba Simple - Exportacion de KPIs $colorReset"
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host ""

# Seleccionar archivo de prueba
$testFile = ""
if ($Mock) {
    $testFile = "apps/admin-web/e2e/kpi-export-mock.spec.js"
    Write-Host "$colorBlue>> Usando archivo de prueba con datos simulados$colorReset"
} else {
    $testFile = "apps/admin-web/e2e/kpi-export-specific.spec.js"
    Write-Host "$colorBlue>> Usando archivo de prueba estandar$colorReset"
}

# Verificar que el archivo de prueba existe
if (Test-Path $testFile) {
    Write-Host "$colorGreen[OK] Archivo de prueba encontrado: $testFile$colorReset"
} else {
    Write-Host "$colorRed[X] No se encuentra el archivo de prueba: $testFile$colorReset"
    Write-Host "$colorYellow>> Intentando usar archivo alternativo: kpi-export.spec.js$colorReset"
    
    $testFile = "apps/admin-web/e2e/kpi-export.spec.js"
    
    if (Test-Path $testFile) {
        Write-Host "$colorGreen[OK] Archivo alternativo encontrado: $testFile$colorReset"
    } else {
        Write-Host "$colorRed[X] No se encontraron archivos de prueba para KPIs.$colorReset"
        exit 1
    }
}

# Construir el comando de Playwright con la configuración simple
$playwrightCmd = "npx playwright test $testFile --project=chromium --config=playwright.config.simple.js"

if (-not $Headless) {
    $playwrightCmd += " --headed"
    Write-Host "$colorBlue>> Ejecutando prueba con interfaz grafica$colorReset"
} else {
    Write-Host "$colorBlue>> Ejecutando prueba en modo headless$colorReset"
}

# Si estamos usando datos mock, establecer la variable de entorno
if ($Mock) {
    $env:E2E_MOCK_MODE = "true"
    Write-Host "$colorYellow>> Modo simulacion activado (E2E_MOCK_MODE=true)$colorReset"
}

# Mostrar comando a ejecutar
Write-Host "$colorCyan>> Ejecutando: $playwrightCmd$colorReset"
Write-Host ""

# Ejecutar Playwright
$startTime = Get-Date
$exitCode = 0

try {
    # Ejecutar el comando
    Invoke-Expression $playwrightCmd
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "$colorGreen[OK] La prueba se ha completado correctamente$colorReset"
    } else {
        Write-Host "$colorRed[X] La prueba ha fallado con codigo: $exitCode$colorReset"
    }
} catch {
    Write-Host "$colorRed[X] Error al ejecutar la prueba: $($_.ToString())$colorReset"
    $exitCode = 1
} finally {
    # Limpiar la variable de entorno si se establacio
    if ($Mock) {
        $env:E2E_MOCK_MODE = $null
    }
}

# Calcular tiempo de ejecucion
$endTime = Get-Date
$duration = $endTime - $startTime

# Verificar entorno de pruebas
Write-Host ""
Write-Host "$colorBlue>> Verificando entorno de pruebas:$colorReset"
try { Write-Host "$colorGreen[OK] Node: $(node -v)$colorReset" } catch { Write-Host "$colorRed[X] Node: No detectado$colorReset" }
try { Write-Host "$colorGreen[OK] NPM: $(npm -v)$colorReset" } catch { Write-Host "$colorRed[X] NPM: No detectado$colorReset" }
try { 
    $playwrightVersion = npx playwright --version
    Write-Host "$colorGreen[OK] Playwright: $playwrightVersion$colorReset"
} catch { 
    Write-Host "$colorRed[X] Playwright: No detectado$colorReset" 
}

# Resumen
Write-Host ""
Write-Host "$colorCyan$colorBright==== Resumen de la prueba ====$colorReset"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Prueba: Exportacion de KPI"
Write-Host "Archivo: $testFile"
Write-Host "Modo headless: $Headless"
Write-Host "Modo simulacion: $Mock"
Write-Host "Duracion: $($duration.TotalSeconds.ToString('0.00')) segundos"
Write-Host "Resultado: $(if ($exitCode -eq 0) { 'Exitoso' } else { 'Fallido' })"

# Sugerencias para revisar el reporte
Write-Host ""
Write-Host "$colorCyan>> Para ver el informe detallado de las pruebas, ejecute:$colorReset"
Write-Host "npx playwright show-report"
Write-Host ""

# Devolver el codigo de salida
exit $exitCode