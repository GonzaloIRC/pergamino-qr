# Script para ejecutar las pruebas de exportación de datos de historial
# Este script ejecuta específicamente las pruebas relacionadas con la exportación de historial

# Colores para mejor legibilidad
$Yellow = [ConsoleColor]::Yellow
$Green = [ConsoleColor]::Green
$Red = [ConsoleColor]::Red
$Cyan = [ConsoleColor]::Cyan

function Show-Header {
    Write-Host "`n====================================================" -ForegroundColor $Yellow
    Write-Host "  PRUEBAS DE EXPORTACIÓN DE DATOS DE HISTORIAL" -ForegroundColor $Yellow
    Write-Host "====================================================" -ForegroundColor $Yellow
    Write-Host "Este script ejecuta las pruebas de exportación de datos de historial" -ForegroundColor $Cyan
    Write-Host "para verificar la funcionalidad completa de exportación a CSV." -ForegroundColor $Cyan
    Write-Host "====================================================`n" -ForegroundColor $Yellow
}

function Start-HistoryExportTests {
    param (
        [switch]$Headless = $false,
        [switch]$Debug = $false
    )
    
    $testFile = "./apps/admin-web/e2e/history-export.spec.js"
    
    # Verificar que el archivo de prueba existe
    if (-not (Test-Path $testFile)) {
        Write-Host "Error: No se encontró el archivo de prueba en $testFile" -ForegroundColor $Red
        Write-Host "Verifique que la ruta es correcta y que el archivo existe" -ForegroundColor $Red
        return $false
    }
    
    Write-Host "Ejecutando pruebas de exportación de datos de historial..." -ForegroundColor $Cyan
    
    # Construir comando de Playwright
    $playwrightCmd = "npx playwright test $testFile"
    
    # Agregar parámetros opcionales
    if (-not $Headless) {
        $playwrightCmd += " --headed"
    }
    
    if ($Debug) {
        $playwrightCmd += " --debug"
    }
    
    # Configurar para usar el archivo de configuración personalizado
    $playwrightCmd += " --config=apps/admin-web/playwright.config.noserver.js"
    
    # Ejecutar el comando
    Write-Host "Comando: $playwrightCmd" -ForegroundColor $Cyan
    
    try {
        Invoke-Expression $playwrightCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Pruebas de exportación de historial completadas con éxito!" -ForegroundColor $Green
            return $true
        } else {
            Write-Host "`n❌ Algunas pruebas de exportación de historial fallaron." -ForegroundColor $Red
            return $false
        }
    }
    catch {
        Write-Host "`n❌ Error al ejecutar las pruebas: $_" -ForegroundColor $Red
        return $false
    }
}

# Ejecutar el script
Show-Header

# Preguntar al usuario si desea ejecutar en modo headless
$headlessMode = Read-Host "¿Ejecutar en modo headless? (s/n, por defecto: n)"
$headless = ($headlessMode -eq "s")

# Preguntar al usuario si desea ejecutar en modo debug
$debugMode = Read-Host "¿Ejecutar en modo debug? (s/n, por defecto: n)"
$debug = ($debugMode -eq "s")

# Ejecutar las pruebas
$result = Start-HistoryExportTests -Headless:$headless -Debug:$debug

# Mostrar mensaje final
if ($result) {
    Write-Host "`n✨ Proceso de pruebas completado exitosamente." -ForegroundColor $Green
} else {
    Write-Host "`n⚠️ El proceso de pruebas finalizó con errores." -ForegroundColor $Red
}

Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor $Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")