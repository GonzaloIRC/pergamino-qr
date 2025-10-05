#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Ejecuta pruebas E2E de forma simplificada.

.DESCRIPTION
    Este script ejecuta pruebas E2E de forma simplificada para evitar problemas
    de sintaxis y codificacion en PowerShell.

.PARAMETER Headless
    Si es false, muestra la interfaz grafica del navegador. Por defecto es true.

.PARAMETER GenerateReport
    Si se especifica, genera un reporte HTML de las pruebas.

.EXAMPLE
    .\run-e2e-simple.ps1
    Ejecuta las pruebas en modo headless.

.EXAMPLE
    .\run-e2e-simple.ps1 -Headless $false
    Ejecuta las pruebas mostrando la interfaz grafica.
#>

Param(
    [bool]$Headless = $true,
    [switch]$GenerateReport
)

# Configuracion de colores para la consola
$colorReset = "$([char]27)[0m"
$colorBright = "$([char]27)[1m"
$colorRed = "$([char]27)[31m"
$colorGreen = "$([char]27)[32m"
$colorYellow = "$([char]27)[33m"
$colorBlue = "$([char]27)[34m"
$colorCyan = "$([char]27)[36m"
$colorMagenta = "$([char]27)[35m"

# Banner
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host "$colorCyan$colorBright Ejecucion Simple de Pruebas E2E $colorReset"
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host ""

# Variables para resultados
$startTime = Get-Date
$results = @()

# Funcion para ejecutar una prueba
function Run-Test {
    param (
        [string]$Name,
        [string]$File,
        [bool]$Headless,
        [switch]$GenerateReport
    )
    
    Write-Host ""
    Write-Host "$colorMagenta>> Ejecutando prueba: $Name$colorReset"
    
    $testStartTime = Get-Date
    
    # Construir comando
    $cmd = "npx playwright test $File --project=chromium --config=playwright.config.simple.js"
    
    if (-not $Headless) {
        $cmd += " --headed"
    }
    
    if ($GenerateReport) {
        $reportDir = "playwright-report-$($Name.ToLower().Replace(' ', '-'))"
        $cmd += " --reporter=html --output=$reportDir"
        Write-Host "$colorYellow>> Se generara un reporte en: $reportDir$colorReset"
    }
    
    # Mostrar comando
    Write-Host "$colorCyan>> Ejecutando: $cmd$colorReset"
    
    # Ejecutar comando
    $success = $false
    try {
        Invoke-Expression $cmd
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            $success = $true
            Write-Host "$colorGreen[OK] Prueba '$Name' completada exitosamente$colorReset"
        } else {
            Write-Host "$colorRed[X] Prueba '$Name' fallo con codigo: $exitCode$colorReset"
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host "$colorRed[X] Error al ejecutar prueba '$Name': $errorMsg$colorReset"
    }
    
    $testEndTime = Get-Date
    $duration = ($testEndTime - $testStartTime).TotalSeconds
    
    # Registrar resultado
    $result = @{
        Name = $Name
        Success = $success
        Duration = [math]::Round($duration, 2)
    }
    
    $script:results += $result
    
    return $success
}

# Lista de pruebas a ejecutar
$tests = @(
    @{
        Name = "Navegacion de Sidebar"
        File = "apps/admin-web/e2e/sidebar-navigation.spec.js"
    },
    @{
        Name = "Exportacion de KPIs"
        File = "apps/admin-web/e2e/kpi-export.spec.js"
    }
)

# Ejecutar pruebas
foreach ($test in $tests) {
    # Verificar que el archivo existe
    if (Test-Path $test.File) {
        Run-Test -Name $test.Name -File $test.File -Headless $Headless -GenerateReport:$GenerateReport
    } else {
        Write-Host "$colorRed[X] No se encontro el archivo de prueba: $($test.File)$colorReset"
        
        # Intentar encontrar archivos similares
        $directory = Split-Path -Parent $test.File
        $pattern = Split-Path -Leaf $test.File
        $pattern = $pattern.Replace(".spec.js", "*.spec.js")
        
        $alternativeFiles = Get-ChildItem -Path $directory -Filter $pattern -ErrorAction SilentlyContinue
        
        if ($alternativeFiles.Count -gt 0) {
            $altFile = $alternativeFiles[0].FullName
            Write-Host "$colorYellow>> Usando archivo alternativo: $altFile$colorReset"
            Run-Test -Name $test.Name -File $altFile -Headless $Headless -GenerateReport:$GenerateReport
        } else {
            Write-Host "$colorRed[X] No se encontraron archivos alternativos para la prueba: $($test.Name)$colorReset"
            $script:results += @{
                Name = $test.Name
                Success = $false
                Duration = 0
            }
        }
    }
}

# Mostrar resumen
$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalSeconds
$passedTests = @($results | Where-Object { $_.Success -eq $true }).Count
$failedTests = @($results | Where-Object { $_.Success -eq $false }).Count

Write-Host ""
Write-Host "$colorCyan$colorBright====== Resumen de Pruebas ======$colorReset"
Write-Host ""
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Duracion total: $([math]::Round($totalDuration, 2)) segundos"
Write-Host ""
Write-Host "Tests ejecutados: $($results.Count)"
Write-Host "Tests exitosos:   $colorGreen$passedTests$colorReset"
Write-Host "Tests fallidos:   $colorRed$failedTests$colorReset"
Write-Host ""
Write-Host "Resultados:"

foreach ($result in $results) {
    $status = if ($result.Success) { "$colorGreen[OK]$colorReset" } else { "$colorRed[X]$colorReset" }
    Write-Host "  $status $($result.Name): $($result.Duration)s"
}

# Retornar codigo de salida apropiado
exit ($failedTests -gt 0)