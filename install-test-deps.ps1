# Install Playwright
npm install --save-dev @playwright/test

# Install Playwright browsers
npx playwright install

# Crear directorio para resultados de pruebas si no existe
if (-not (Test-Path -Path "apps/admin-web/test-results")) {
    New-Item -Path "apps/admin-web/test-results" -ItemType Directory
}

Write-Host "Testing dependencies installed successfully!" -ForegroundColor Green
Write-Host "Para ejecutar las pruebas completas, siga estos pasos:" -ForegroundColor Yellow
Write-Host "1. Inicie los emuladores de Firebase:" -ForegroundColor Cyan
Write-Host "   firebase emulators:start --import=./dev_data --export-on-exit" -ForegroundColor White
Write-Host "2. Cree un usuario de prueba para los emuladores:" -ForegroundColor Cyan
Write-Host "   node scripts/createTestUser.js" -ForegroundColor White
Write-Host "3. Cargue las variables de entorno para pruebas:" -ForegroundColor Cyan
Write-Host "   cd apps/admin-web; ./load-test-env.ps1" -ForegroundColor White
Write-Host "4. Ejecute las pruebas:" -ForegroundColor Cyan
Write-Host "   cd apps/admin-web; npx playwright test" -ForegroundColor White
Write-Host "5. Para ver el informe de pruebas:" -ForegroundColor Cyan
Write-Host "   cd apps/admin-web; npx playwright show-report" -ForegroundColor White