#!/usr/bin/env pwsh
# kpi-export-test.ps1
# Script simplificado para ejecutar las pruebas E2E de KPI y exportación en Pergamino App

# Establecer variables de entorno para las pruebas (si no existe archivo .env.test)
$testUserEmail = "admin@pergamino.test"
$testUserPassword = "test1234"

# Colores para la salida
$colorInfo = "Cyan"
$colorSuccess = "Green" 
$colorError = "Red"

# Verificar archivo de pruebas
$testFile = "apps\admin-web\e2e\kpi-export.spec.js"
if (!(Test-Path $testFile)) {
    Write-Host "ERROR: No se encontró el archivo de prueba en $testFile" -ForegroundColor $colorError
    exit 1
}

# Mostrar encabezado
Write-Host "`n=== PRUEBAS E2E: Sidebar, KPIs y Exportación ===" -ForegroundColor $colorInfo
Write-Host "Ejecutando pruebas desde: $testFile`n"

# Ejecutar la prueba directamente sin usar una configuración especial
$env:TEST_USER_EMAIL = $testUserEmail
$env:TEST_USER_PASSWORD = $testUserPassword

try {
    # Usar la configuración sin servidor web y limitar a un solo navegador
    npx playwright test $testFile --config=playwright.config.noserver.js --project=chromium --headed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Las pruebas se ejecutaron correctamente" -ForegroundColor $colorSuccess
    } else {
        Write-Host "`n❌ Algunas pruebas fallaron" -ForegroundColor $colorError
    }
} catch {
    Write-Host "`n❌ Error al ejecutar las pruebas: $_" -ForegroundColor $colorError
}

Write-Host "`nPara ver el reporte detallado ejecuta:" -ForegroundColor $colorInfo
Write-Host "npx playwright show-report`n"