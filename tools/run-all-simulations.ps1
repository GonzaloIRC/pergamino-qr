#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Ejecuta todas las simulaciones de pruebas E2E.

.DESCRIPTION
    Este script ejecuta todas las simulaciones de pruebas E2E
    y genera un resumen de los resultados.

.PARAMETER Verbose
    Muestra informacion detallada durante la ejecucion.

.EXAMPLE
    .\run-all-simulations.ps1
    Ejecuta todas las simulaciones de prueba.

.EXAMPLE
    .\run-all-simulations.ps1 -Verbose
    Ejecuta todas las simulaciones con informacion detallada.
#>

Param(
    [switch]$Verbose
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
Write-Host "$colorCyan$colorBright Ejecucion de Todas las Pruebas Simuladas $colorReset"
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host ""

# Lista de pruebas a ejecutar
$tests = @(
    @{
        name = "Prueba Basica PowerShell";
        script = "test-basic-powershell-ascii.ps1";
        args = @{};
    },
    @{
        name = "Navegacion Sidebar";
        script = "simulate-sidebar-test.ps1";
        args = @{};
    },
    @{
        name = "Exportacion KPIs";
        script = "simulate-kpi-export-test.ps1";
        args = @{};
    }
)

# Resultados
$results = @()

# Ejecutar cada prueba
foreach ($test in $tests) {
    # Construir argumentos
    $scriptArgs = @{}
    
    # Agregar el parametro Verbose si se solicita
    if ($Verbose) {
        $scriptArgs["Verbose"] = $true
    }
    
    # Combinar con los argumentos especificos de la prueba
    foreach ($key in $test.args.Keys) {
        $scriptArgs[$key] = $test.args[$key]
    }
    
    Write-Host "$colorBlue>> Ejecutando: $($test.name)$colorReset"
    
    # Preparar ruta del script
    $scriptPath = Join-Path "tools" $test.script
    
    # Verificar que el script existe
    if (-not (Test-Path $scriptPath)) {
        Write-Host "$colorRed[X] No se encuentra el script: $scriptPath$colorReset"
        $results += @{
            name = $test.name;
            success = $false;
            error = "Script no encontrado";
            duration = 0;
        }
        continue
    }
    
    # Medir tiempo de ejecucion
    $startTime = Get-Date
    
    # Ejecutar script
    try {
        # Convertir hashtable a parametros
        $paramString = ""
        foreach ($key in $scriptArgs.Keys) {
            if ($scriptArgs[$key] -is [bool] -and $scriptArgs[$key]) {
                $paramString += " -$key"
            }
            elseif ($scriptArgs[$key] -isnot [bool]) {
                $paramString += " -$key `"$($scriptArgs[$key])`""
            }
        }
        
        # Comando a ejecutar
        $command = "$scriptPath$paramString"
        
        if ($Verbose) {
            Write-Host "  Ejecutando comando: $command"
        }
        
        # Ejecutar el script
        & $scriptPath @scriptArgs 2>&1 | Out-Null
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host "$colorGreen[OK] Prueba completada exitosamente$colorReset"
            $success = $true
            $errorMsg = ""
        } else {
            Write-Host "$colorRed[X] Prueba fallida con codigo $exitCode$colorReset"
            $success = $false
            $errorMsg = "Codigo de salida: $exitCode"
        }
    } catch {
        Write-Host "$colorRed[X] Error ejecutando la prueba: $($_.Exception.Message)$colorReset"
        $success = $false
        $errorMsg = $_.Exception.Message
    }
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    # Registrar resultado
    $results += @{
        name = $test.name;
        success = $success;
        error = $errorMsg;
        duration = $duration;
    }
    
    Write-Host "  Duracion: $($duration.ToString('0.00')) segundos"
    Write-Host ""
}

# Mostrar resumen
Write-Host "$colorCyan$colorBright==== Resumen de Resultados ====$colorReset"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""
Write-Host "Pruebas ejecutadas: $($results.Count)"
Write-Host "Exitosas: $(@($results | Where-Object { $_.success }).Count)"
Write-Host "Fallidas: $(@($results | Where-Object { -not $_.success }).Count)"
Write-Host ""

# Mostrar tabla de resultados
Write-Host "Detalle de resultados:"
Write-Host "-----------------------------------------------------"
Write-Host "| Prueba                | Estado  | Duracion (seg) |"
Write-Host "-----------------------------------------------------"

foreach ($result in $results) {
    $status = if ($result.success) { "EXITOSO" } else { "FALLIDO" }
    $statusColor = if ($result.success) { $colorGreen } else { $colorRed }
    $name = $result.name.PadRight(21).Substring(0, 21)
    $statusText = $status.PadRight(7).Substring(0, 7)
    $duration = $result.duration.ToString("0.00").PadLeft(14)
    
    Write-Host "| $name | $statusColor$statusText$colorReset | $duration |"
}
Write-Host "-----------------------------------------------------"

# Mostrar detalles de errores si hay alguno
$failedTests = @($results | Where-Object { -not $_.success })
if ($failedTests.Count -gt 0) {
    Write-Host ""
    Write-Host "$colorRed==== Detalles de Errores ====$colorReset"
    
    foreach ($test in $failedTests) {
        Write-Host "$colorRed[X] $($test.name): $($test.error)$colorReset"
    }
}

# Calcular estado de salida
$exitCode = if (@($results | Where-Object { -not $_.success }).Count -gt 0) { 1 } else { 0 }

# Mensaje final
Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "$colorGreen>> Todas las pruebas completadas exitosamente$colorReset"
} else {
    Write-Host "$colorRed>> Algunas pruebas han fallado, revise el resumen para mas detalles$colorReset"
}
Write-Host ""

# Devolver codigo de salida
exit $exitCode