# Install Playwright para el proyecto web admin
Set-Location "C:\Users\k\Documents\Pergamino-app 2\apps\admin-web"

# Install Playwright
npm install --save-dev @playwright/test

# Install Playwright browsers
npx playwright install

Write-Host "Dependencias de testing instaladas correctamente para admin-web!" -ForegroundColor Green
Write-Host "Para ejecutar pruebas web: npm run test:e2e" -ForegroundColor Cyan
Write-Host "Para ejecutar pruebas web con UI: npm run test:e2e:ui" -ForegroundColor Cyan