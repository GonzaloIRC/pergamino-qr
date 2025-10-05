#!/usr/bin/env pwsh
# Script para ejecutar solo una prueba específica de KPI o exportación

param (
    [string]$TestName = "should display dashboard with KPI metrics"
)

$testFile = "apps\admin-web\e2e\kpi-export.spec.js"

Write-Host "Ejecutando prueba: '$TestName'" -ForegroundColor Cyan
Write-Host "Archivo: $testFile`n"

npx playwright test $testFile --config=playwright.config.noserver.js --grep "$TestName" --project=chromium --headed

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Prueba ejecutada correctamente" -ForegroundColor Green
} else {
    Write-Host "`n❌ La prueba falló" -ForegroundColor Red
}

Write-Host "`nPara ver el reporte: npx playwright show-report`n"