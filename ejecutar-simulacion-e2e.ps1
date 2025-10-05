#!/usr/bin/env pwsh
# Script para ejecutar pruebas E2E en modo simulación (sin servidor real)
# Este script ejecuta pruebas que verifican la estructura de UI sin necesidad de un servidor en funcionamiento

# Colores para la salida
$colorInfo = "Cyan"
$colorSuccess = "Green" 
$colorError = "Red"

# Archivo de pruebas mock
$testFile = "apps\admin-web\e2e\kpi-export-mock.spec.js"

# Verificar que el archivo existe
if (!(Test-Path $testFile)) {
    Write-Host "`n❌ No se encontró el archivo de prueba en $testFile" -ForegroundColor $colorError
    exit 1
}

# Mostrar encabezado
Write-Host "`n=== PRUEBAS E2E (MODO SIMULACIÓN): Sidebar, KPIs y Exportación ===" -ForegroundColor $colorInfo
Write-Host "Ejecutando pruebas desde: $testFile`n"

try {
    # Establecer variable de entorno para activar el modo simulación
    $env:E2E_MOCK_MODE = "true"
    
    # Ejecutar las pruebas con la configuración sin servidor
    npx playwright test $testFile --config=playwright.config.noserver.js --project=chromium
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Las pruebas de simulación se completaron correctamente" -ForegroundColor $colorSuccess
        Write-Host "   Estas pruebas verifican la estructura del código de prueba sin necesitar un servidor real."
    } else {
        Write-Host "`n❌ Algunas pruebas fallaron" -ForegroundColor $colorError
    }
} catch {
    Write-Host "`n❌ Error al ejecutar las pruebas: $_" -ForegroundColor $colorError
} finally {
    # Limpiar la variable de entorno
    $env:E2E_MOCK_MODE = $null
}

Write-Host "`nPara ver el reporte detallado ejecuta:" -ForegroundColor $colorInfo
Write-Host "npx playwright show-report`n"