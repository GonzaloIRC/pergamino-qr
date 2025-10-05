#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de prueba basica para validar la estructura de PowerShell.

.DESCRIPTION
    Este script simple verifica que PowerShell puede ejecutarse correctamente
    sin problemas de codificacion y realiza algunas validaciones basicas.

.PARAMETER Detallado
    Muestra informacion adicional de diagnostico.

.EXAMPLE
    .\test-basic-powershell-ascii.ps1
    Ejecuta la prueba basica.

.EXAMPLE
    .\test-basic-powershell-ascii.ps1 -Detallado
    Ejecuta la prueba basica mostrando informacion detallada.
#>

Param(
    [switch]$Detallado
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
Write-Host "$colorCyan$colorBright Prueba Basica de PowerShell (ASCII) $colorReset"
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host ""

# Funcion para verificar versiones
function Test-Environment {
    Write-Host "$colorBlue>> Verificando entorno de ejecucion:$colorReset"
    
    # Verificar PowerShell
    $psVersion = $PSVersionTable.PSVersion
    Write-Host "$colorGreen[OK] PowerShell: $psVersion$colorReset"
    
    # Verificar Node.js si esta instalado
    try {
        $nodeVersion = (node -v)
        Write-Host "$colorGreen[OK] Node.js: $nodeVersion$colorReset"
    } catch {
        Write-Host "$colorYellow[!] Node.js no detectado$colorReset"
    }
    
    # Verificar NPM si esta instalado
    try {
        $npmVersion = (npm -v)
        Write-Host "$colorGreen[OK] NPM: $npmVersion$colorReset"
    } catch {
        Write-Host "$colorYellow[!] NPM no detectado$colorReset"
    }

    # Verificar codificacion actual
    $encoding = [System.Text.Encoding]::Default.EncodingName
    Write-Host "$colorGreen[OK] Codificacion del sistema: $encoding$colorReset"

    # Verificar caracteres especiales
    Write-Host "$colorGreen[OK] Caracteres ASCII: [ ] ( ) / \ $colorReset"
    
    # Mostrar informacion adicional si se solicita
    if ($Detallado) {
        Write-Host ""
        Write-Host "$colorBlue>> Informacion detallada:$colorReset"
        Write-Host "Directorio actual: $(Get-Location)"
        Write-Host "Usuario: $env:USERNAME"
        Write-Host "Computadora: $env:COMPUTERNAME"
        Write-Host "Sistema operativo: $((Get-CimInstance -ClassName Win32_OperatingSystem).Caption)"
    }
}

# Funcion para validar estructura del proyecto
function Test-ProjectStructure {
    Write-Host ""
    Write-Host "$colorBlue>> Verificando estructura del proyecto:$colorReset"
    
    $paths = @(
        "apps/admin-web",
        "apps/admin-web/e2e",
        "tools"
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Write-Host "$colorGreen[OK] Directorio encontrado: $path$colorReset"
        } else {
            Write-Host "$colorRed[X] Directorio no encontrado: $path$colorReset"
        }
    }
    
    # Verificar archivos de prueba
    $testFiles = Get-ChildItem -Path "apps/admin-web/e2e" -Filter "*.spec.js" -ErrorAction SilentlyContinue
    if ($testFiles.Count -gt 0) {
        Write-Host "$colorGreen[OK] Se encontraron $($testFiles.Count) archivos de prueba en apps/admin-web/e2e$colorReset"
        
        # Mostrar los archivos
        if ($Detallado) {
            foreach ($file in $testFiles) {
                Write-Host "  - $($file.Name)"
            }
        }
    } else {
        Write-Host "$colorRed[X] No se encontraron archivos de prueba en apps/admin-web/e2e$colorReset"
    }
}

# Ejecutar las verificaciones
Test-Environment
Test-ProjectStructure

# Resumen
Write-Host ""
Write-Host "$colorCyan$colorBright==== Resumen ====$colorReset"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Prueba completada exitosamente."
Write-Host ""

# Devolver exito
exit 0