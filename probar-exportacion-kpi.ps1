#!/usr/bin/env pwsh
# Script para ejecutar pruebas específicas de exportación de KPIs
# Este script usa el modo de simulación para pruebas rápidas

# Colores para la salida
$colorInfo = "Cyan"
$colorSuccess = "Green" 
$colorError = "Red"

# Archivo de pruebas específicas
$testFile = "apps\admin-web\e2e\kpi-export-specific.spec.js"

# Verificar que el archivo existe
if (!(Test-Path $testFile)) {
    Write-Host "`n❌ No se encontró el archivo de prueba en $testFile" -ForegroundColor $colorError
    exit 1
}

# Mostrar encabezado
Write-Host "`n=== PRUEBAS E2E: Exportación de KPIs e Historial ===" -ForegroundColor $colorInfo
Write-Host "Ejecutando pruebas desde: $testFile`n"

# Ejecutar en modo de simulación
$env:E2E_MOCK_MODE = "true"

try {
    # Ejecutar las pruebas con la configuración sin servidor
    npx playwright test $testFile --config=playwright.config.noserver.js --project=chromium
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Las pruebas de exportación se completaron correctamente" -ForegroundColor $colorSuccess
    } else {
        Write-Host "`n❌ Algunas pruebas de exportación fallaron" -ForegroundColor $colorError
    }
} catch {
    Write-Host "`n❌ Error al ejecutar las pruebas: $_" -ForegroundColor $colorError
} finally {
    # Limpiar la variable de entorno
    $env:E2E_MOCK_MODE = $null
}

Write-Host "`nPara ver el reporte detallado ejecuta:" -ForegroundColor $colorInfo
Write-Host "npx playwright show-report`n"