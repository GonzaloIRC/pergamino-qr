# Script simplificado para ejecutar pruebas E2E para Pergamino App
# Este script ejecuta las pruebas que verifican el funcionamiento del sidebar, KPIs y exportación
# usando una configuración simplificada que no intenta iniciar el servidor

# Ejecutar la prueba kpi-export.spec.js con la configuración simplificada
npx playwright test apps/admin-web/e2e/kpi-export.spec.js --config=playwright.config.simple.ts --headed

# Mostrar mensaje al terminar
if ($LASTEXITCODE -eq 0) {
    Write-Host "Pruebas completadas exitosamente!"
    Write-Host "Para ver el reporte detallado: npx playwright show-report"
} else {
    Write-Host "Algunas pruebas fallaron. Para ver el reporte: npx playwright show-report"
}