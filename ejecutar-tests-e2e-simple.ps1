# Script simplificado para ejecutar las pruebas E2E
# Para ejecutar, simplemente usa: .\ejecutar-tests-e2e-simple.ps1

# Cambiar al directorio de admin-web
Set-Location -Path ".\apps\admin-web"

# Ejecutar las pruebas
npm run test:e2e

# Mostrar informe
npm run test:e2e:report

# Volver al directorio original
Set-Location -Path "..\.."