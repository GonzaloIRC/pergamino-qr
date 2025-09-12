# B.9 y B.10 - Completar README y hacer commit de los cambios finales

# Verificar si existe la sección de Desarrollo en README
$readmeContent = Get-Content -Path "README.md" -Raw
if ($readmeContent -notmatch "## Desarrollo \(Expo Dev Client\)") {
    # Añadir la sección de desarrollo al README
    $developmentSection = @'

## Desarrollo (Expo Dev Client)

Ejecutar emuladores Firebase: npm run emulators:start

Iniciar app en dispositivo físico: npx expo start --dev-client

Semillas: node scripts/seedBeneficioDemo.js

Variables: usar .env.local con EXPO_PUBLIC_*

Escáner: expo-camera (prohibido expo-barcode-scanner)
'@
    Add-Content -Path "README.md" -Value $developmentSection
    Write-Host "[OK] README actualizado" -ForegroundColor Green
} else {
    Write-Host "[SKIP] README ya tenía la sección de desarrollo" -ForegroundColor Yellow
}

# B.10 Commit/Push/PR M1
$hasChanges = git status --porcelain
if ($hasChanges) {
    git add scripts src utils src/services/transactions.js src/screens src/components/BarcodeScanner .github README.md
    git commit -m "feat(m1): seeds, qr utils, scanner screen, CRM básico, rutas y plantilla de PR"
    Write-Host "[OK] Commit M1 listo" -ForegroundColor Green
} else {
    Write-Host "[SKIP] Sin cambios para M1" -ForegroundColor Yellow
}

# Crear una nueva branch para phase1-base si no existe y hacer push
$branchExists = $false
try {
    git rev-parse --verify fix/phase1-base | Out-Null
    $branchExists = $true
} catch {}

if (-Not $branchExists) {
    git checkout -b fix/phase1-base
}
git push -u origin fix/phase1-base

# Verificar si gh CLI está disponible
$GH_OK = $false
if (Get-Command gh -ErrorAction SilentlyContinue) {
    try {
        gh auth status | Out-Null
        $GH_OK = $true
    } catch {}
}

# Crear PR si gh está disponible
if ($GH_OK) {
    $prExists = $false
    try {
        gh pr view --head fix/phase1-base | Out-Null
        $prExists = $true
    } catch {}

    if ($prExists) {
        Write-Host "[SKIP] PR M1 ya existe" -ForegroundColor Yellow
    } else {
        $prBody = @'
Este PR implementa M1 (Base + Roles + E2E):

Seeds: beneficio demo + seriales SER-0001..SER-0020

Utils QR y transacciones (canje / acumulación)

Pantallas: ScannerScreen, Customers (CRM básico)

Rutas protegidas (waiter/admin)

Template de PR y README con pasos de ejecución

Cómo probar

npm ci
npm run emulators:start
node scripts/seedBeneficioDemo.js
npx expo start --dev-client
# Probar Scanner con:
#   BNF:SER-0001 (canje)
#   APP:12345678:abc (acumulación)
'@
        $prBody | Out-File -FilePath "pr_body.txt" -Encoding utf8
        gh pr create --title "M1 — Base + Roles + E2E (fix/phase1-base)" --body-file pr_body.txt --base fix/infra-compat
        Remove-Item -Path "pr_body.txt"
        Write-Host "[OK] PR M1 creado (base fix/infra-compat)" -ForegroundColor Green
    }
} else {
    Write-Host "[INFO] Crea PR M1 manual a base 'fix/infra-compat' desde 'fix/phase1-base' con el body anterior." -ForegroundColor Blue
}

Write-Host "[OK] Proceso completado." -ForegroundColor Green
