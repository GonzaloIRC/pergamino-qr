<#
.SYNOPSIS
    Ejecuta todas las pruebas E2E en secuencia.

.DESCRIPTION
    Este script maestro ejecuta todos los scripts d            Write-Host "$colo            Write-Host "$colorGreen[OK] Emuladores de Firebase detenidos$colorReset"R            Write-Host "$colorRed[X] Error al detener los emuladores de Firebase: $($_.Exception.Message)$colorReset"d[X] L    Write-Host "$colorRed[X] Este script debe ejecutarse desde la carpeta raiz del proyecto.$colorReset"s emuladores de Firebase no pudieron iniciarse correctamente.$colorReset" pr        Write-Host "$colorGreen[OK] Emuladores de Firebase iniciados (PID: $($script:emulatorProcess.Id))$colorReset"eb        Write-Host "$colorRed[X] Error al iniciar los emuladores de Firebase: $($_.ToString())$colorReset" E2E en secu            Write-Host "$colorGreen[OK] Emuladores de Firebase detenidos$colorReset"n            Write-Host "$colorRed[X] Error al detener los emuladores de Firebase: $($_.ToString())$colorReset"ia,
     Write-Host "$colorRed[X] Este script debe ejecutarse desde la carpeta raiz del proyecto.$colorReset"  gener    # Verificar Node.js y npm
    try {
        $nodeVersion = node -v
        $npmVersion = npm -v
        Write-Host "$colorGreen[OK] Node.js: $nodeVersion$colorReset"
        Write-Host "$colorGreen[OK] NPM: $npmVersion$colorReset"n        Write-Host "$colorRed[X] Node.js o npm no estan instalados correctamente.$colorReset"res    # Verificar Playwright
    try {
        $playwrightVersion = npx playwright -V
        Write-Host "$colorGreen[OK] Playwright: $playwrightVersion$colorReset"         Write-Host "$colorYellow[!] Playwright no esta instalado o accesible. Instalando....$colorReset"onso                Write-Host "$colorRed[X] Error al instalar Playwright.$colorReset"id            Write-Host "$colorGreen[OK] Playwright instalado correctamente$colorReset"d            Write-Host "$colorRed[X] Error al instalar Playwright: $($_.ToString())$colorReset" de los resultados. Es Ãºtil para verificar
    completamente la aplicaciÃ³n web administrativa antes de desplegar cambios.

.PARAMETER Headless
    Ejecuta las pruebas en modo headless (sin interfaz grÃ¡fica). Por defecto es $true.

.PARAMETER Browser
    Especifica el navegador a utilizar: chromium, firefox o webkit. Por defecto es "chromium".

.PARAMETER GenerateReport
    Genera un reporte HTML detallado de la ejecuciÃ³n.

.PARAMETER SkipSetup
    Omite la verificaciÃ³n del entorno y la instalaciÃ³n de dependencias.

.EXAMPLE
    .\run-all-e2e.ps1
    Ejecuta todas las pruebas E2E en modo headless usando chromium.

.EXAMPLE
    .\run-all-e2e.ps1 -Browser "firefox" -GenerateReport
    Ejecuta todas las pruebas en Firefox y genera reportes HTML.

.EXAMPLE
    .\run-all-e2e.ps1 -Headless $false -SkipSetup
    Ejecuta todas las pruebas con interfaz grÃ¡fica, omitiendo las verificaciones iniciales.
#>

Param(
    [bool]$Headless = $true,
    [string]$Browser = "chromium",
    [switch]$GenerateReport,
    [switch]$SkipSetup
)

# ConfiguraciÃ³n de colores para la consola
$colorReset = "$([char]27)[0m"
$colorBright = "$([char]27)[1m"
$colorRed = "$([char]27)[31m"
$colorGreen = "$([char]27)[32m"
$colorYellow = "$([char]27)[33m"
$colorBlue = "$([char]27)[34m"
$colorCyan = "$([char]27)[36m"
$colorMagenta = "$([char]27)[35m"

# Banner
Write-Host "$colorCyan$colorBright===============================================$colorReset"
Write-Host "$colorCyan$colorBright       EjecuciÃ³n Completa de Pruebas E2E      $colorReset"
Write-Host "$colorCyan$colorBright===============================================$colorReset"
Write-Host ""

# Variables globales
$startTime = Get-Date
$testResults = @()
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootDir = (Get-Item $scriptDir).Parent.FullName
$emulatorProcess = $null

# Construir argumentos base para cada prueba
$testArgs = @{}
$testArgs["Headless"] = $Headless
$testArgs["Browser"] = $Browser
$testArgs["UseSimpleConfig"] = $true
if ($GenerateReport) {
    $testArgs["GenerateReport"] = $true
}

# FunciÃ³n para ejecutar una prueba y registrar el resultado
function Invoke-Test {
    Param(
        [string]$Name,
        [string]$ScriptPath,
        [hashtable]$Arguments
    )
    
    Write-Host ""
    Write-Host "$colorMagenta$colorBright=== Ejecutando prueba: $Name ===$colorReset"
    Write-Host ""
    
    $testStartTime = Get-Date
    
    # Construir los argumentos para el script
    $scriptArgs = @{}
    foreach ($key in $Arguments.Keys) {
        $scriptArgs[$key] = $Arguments[$key]
    }
    
    # Ejecutar el script
    try {
        & $ScriptPath @scriptArgs
        $success = ($LASTEXITCODE -eq 0)
    } catch {
        $success = $false
        Write-Host "$colorRed[X] Error al ejecutar $Name: $($_.Exception.Message)$colorReset"
    }
    
    $testEndTime = Get-Date
    $duration = ($testEndTime - $testStartTime).TotalSeconds
    
    # Registrar resultado
    $result = [PSCustomObject]@{
        Name = $Name
        Success = $success
        Duration = [math]::Round($duration, 2)
        StartTime = $testStartTime
        EndTime = $testEndTime
    }
    $script:testResults += $result
    
    # Mostrar resultado individual
    $statusIcon = if ($success) { "$colorGreen[OK]$colorReset" } else { "$colorRed[X]$colorReset" }
    Write-Host ""
    Write-Host "$statusIcon Prueba $Name completada en $($result.Duration) segundos - $(if ($success) { "Exitosa" } else { "Fallida" })"
    
    return $success
}

# FunciÃ³n para iniciar los emuladores de Firebase
function Start-Emulators {
    Write-Host "$colorYellow>> Iniciando emuladores de Firebase (espera 10 segundos)....$colorReset"
    
    try {
        $script:emulatorProcess = Start-Process -FilePath "npx" -ArgumentList "firebase emulators:start" -PassThru -WindowStyle Minimized
        Start-Sleep -Seconds 10
        
        if ($script:emulatorProcess.HasExited) {
            Write-Host "$colorRedâŒ Los emuladores de Firebase no pudieron iniciarse correctamente.$colorReset"
            return $false
        }
        
        Write-Host "$colorGreenâœ“ Emuladores de Firebase iniciados (PID: $($script:emulatorProcess.Id))$colorReset"
        return $true
    } catch {
        Write-Host "$colorRedâŒ Error al iniciar los emuladores de Firebase: $($_.ToString())$colorReset"
        return $false
    }
}

# FunciÃ³n para detener los emuladores de Firebase
function Stop-Emulators {
    if ($null -ne $script:emulatorProcess -and -not $script:emulatorProcess.HasExited) {
        Write-Host "$colorYellow>> Deteniendo emuladores de Firebase....$colorReset"
        
        try {
            $script:emulatorProcess.Kill()
            $script:emulatorProcess.WaitForExit()
            Write-Host "$colorGreenâœ“ Emuladores de Firebase detenidos$colorReset"
        } catch {
            Write-Host "$colorRedâŒ Error al detener los emuladores de Firebase: $($_.ToString())$colorReset"
        }
    }
}

# Verificar que estamos en la carpeta raÃ­z correcta
if (-not (Test-Path (Join-Path $rootDir "package.json"))) {
    Write-Host "$colorRedâŒ Este script debe ejecutarse desde la carpeta raÃ­z del proyecto.$colorReset"
    exit 1
}

# VerificaciÃ³n del entorno
if (-not $SkipSetup) {
    Write-Host "$colorCyan>> Verificando entorno de pruebas....$colorReset"
    
    # Verificar Node.js y npm
    try {
        $nodeVersion = node -v
        $npmVersion = npm -v
        Write-Host "$colorGreenâœ“ Node.js: $nodeVersion$colorReset"
        Write-Host "$colorGreenâœ“ NPM: $npmVersion$colorReset"
    } catch {
        Write-Host "$colorRedâŒ Node.js o npm no estÃ¡n instalados correctamente.$colorReset"
        exit 1
    }
    
    # Verificar Playwright
    try {
        $playwrightVersion = npx playwright -V
        Write-Host "$colorGreenâœ“ Playwright: $playwrightVersion$colorReset"
    } catch {
        Write-Host "$colorYellowâš ï¸ Playwright no estÃ¡ instalado o accesible. Instalando....$colorReset"
        
        try {
            npx playwright install -with-deps
            if ($LASTEXITCODE -ne 0) {
                Write-Host "$colorRedâŒ Error al instalar Playwright.$colorReset"
                exit 1
            }
            Write-Host "$colorGreenâœ“ Playwright instalado correctamente$colorReset"
        } catch {
            Write-Host "$colorRedâŒ Error al instalar Playwright: $($_.ToString())$colorReset"
            exit 1
        }
    }
    
    # Iniciar emuladores de Firebase
    Start-Emulators
}

# Ejecutar las pruebas en secuencia
try {
    # 1. Prueba de Sidebar
    $sidebarPath = Join-Path $scriptDir "test-sidebar.ps1"
    Invoke-Test -Name "Sidebar Navigation" -ScriptPath $sidebarPath -Arguments $testArgs
    
    # 2. Prueba de exportaciÃ³n de KPI
    $kpiPath = Join-Path $scriptDir "test-kpi-export.ps1"
    Invoke-Test -Name "KPI Export" -ScriptPath $kpiPath -Arguments $testArgs
    
    # 3. Prueba de exportaciÃ³n de historial
    $historyPath = Join-Path $scriptDir "test-history-export.ps1"
    $historyArgs = $testArgs.Clone()
    $historyArgs["WithFilters"] = $true
    Invoke-Test -Name "History Export" -ScriptPath $historyPath -Arguments $historyArgs
} finally {
    # Detener emuladores en caso de error
    if (-not $SkipSetup) {
        Stop-Emulators
    }
}

# Calcular estadÃ­sticas
$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalSeconds
$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Success }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

# Mostrar resumen detallado
Write-Host ""
Write-Host "$colorCyan$colorBright====== Resumen de Pruebas E2E ======$colorReset"
Write-Host ""
Write-Host "Fecha: $($endTime.ToString("yyyy-MM-dd HH:mm:ss"))"
Write-Host "DuraciÃ³n total: $([math]::Round($totalDuration, 2)) segundos"
Write-Host ""
Write-Host "Tests ejecutados: $totalTests"
Write-Host "Tests exitosos:   $colorGreen$passedTests$colorReset"
Write-Host "Tests fallidos:   $colorRed$failedTests$colorReset"
Write-Host "Tasa de Ã©xito:    $($passRate)%"
Write-Host ""
Write-Host "Detalles:"

# Mostrar resultados individuales
foreach ($result in $testResults) {
    $statusColor = if ($result.Success) { $colorGreen } else { $colorRed }
    $statusText = if ($result.Success) { "[OK] PASS" } else { "[X] FAIL" }
    Write-Host "  $($statusColor)$($statusText)$($colorReset) - $($result.Name) ($($result.Duration) s)"
}

# Indicar si todas las pruebas pasaron
Write-Host ""
if ($failedTests -eq 0) {
    Write-Host "$colorGreen[OK] TODAS LAS PRUEBAS PASARON EXITOSAMENTE$colorReset"
} else {
    Write-Host "$colorRed[X] HAY PRUEBAS FALLIDAS ($failedTests de $totalTests)$colorReset"
    exit 1
}