# Update README and make final commits

# Check if README already has the development section
$readme = Get-Content -Path "README.md" -Raw
if ($readme -notmatch "## Desarrollo \(Expo Dev Client\)") {
    # Add development section to README
    $devSection = @'

## Desarrollo (Expo Dev Client)

Ejecutar emuladores Firebase: npm run emulators:start

Iniciar app en dispositivo físico: npx expo start --dev-client

Semillas: node scripts/seedBeneficioDemo.js

Variables: usar .env.local con EXPO_PUBLIC_*

Escáner: expo-camera (prohibido expo-barcode-scanner)
'@

    Add-Content -Path "README.md" -Value $devSection
    Write-Host "README actualizado con sección de desarrollo" -ForegroundColor Green
} else {
    Write-Host "README ya contiene la sección de desarrollo" -ForegroundColor Yellow
}

# Commit changes
git add src/services/transactions.js src/screens/main/ScannerScreen.js src/screens/Customers.js README.md
git commit -m "feat(m1): seeds, qr utils, scanner screen, CRM básico, rutas y plantilla de PR"
Write-Host "Commit M1 completado" -ForegroundColor Green

# Create and switch to new branch
git checkout -b fix/phase1-base
git push -u origin fix/phase1-base
Write-Host "Branch fix/phase1-base creada y subida a origin" -ForegroundColor Green

Write-Host "Para crear un PR, visita GitHub y crea un PR desde 'fix/phase1-base' a 'fix/infra-compat'" -ForegroundColor Cyan
