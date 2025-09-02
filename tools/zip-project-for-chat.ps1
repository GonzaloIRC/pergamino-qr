param(
    [string]$OutZip = "pergamino-full-upload.zip"
)

$ErrorActionPreference = "Stop"

# Verificar package.json
if (!(Test-Path ".\package.json")) {
    Write-Host "ERROR: package.json not found in project root. Aborting."
    exit 1
}

# Crear carpeta staging
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$staging = "upload-$stamp"
New-Item -ItemType Directory -Force -Path $staging | Out-Null

# Función para copiar archivos/directorios si existen
function Copy-IfExists($src, $dst) {
    if (Test-Path $src) {
        Copy-Item $src $dst -Recurse -Force
    }
}

# Lista de archivos y carpetas a incluir
$include = @(
    "package.json","package-lock.json","app.config.ts","app.json","index.js","App.js",
    "babel.config.js","babel.config.cjs","babel.config.mjs","metro.config.js","jest.config.js","jest.config.cjs","jest.config.mjs",
    "eas.json","tsconfig.json","jsconfig.json","README.md","RESUMEN.md","PLAN.md",
    "src","android/build.gradle","android/settings.gradle","android/gradle.properties","android/app/build.gradle",
    "android/gradle/wrapper/gradle-wrapper.properties","android/app/src/main/AndroidManifest.xml",
    "android/app/src/debug/AndroidManifest.xml","android/app/src/main/java","android/app/src/main/res/values",
    "tools","scripts","tests","e2e","docs",".maestro","firebase",".vscode",".env.local",".env.staging","logs"
)

# Excluir patrones
$exclude = @(
    "node_modules",".git","android/.gradle","android/build",".gradle","dist","build",".expo",".turbo","ios/build","pods",".yarn/cache"
)

# Copiar archivos y carpetas
foreach ($item in $include) {
    Copy-IfExists $item "$staging"
}

# Eliminar carpetas excluidas del staging
foreach ($ex in $exclude) {
    $target = Join-Path $staging (Split-Path $ex -Leaf)
    if (Test-Path $target) {
        Remove-Item $target -Recurse -Force
    }
}

# Sanitizar .env.local y .env.staging
foreach ($envfile in @("$staging\.env.local", "$staging\.env.staging")) {
    if (Test-Path $envfile) {
        $lines = Get-Content $envfile
        $sanitized = $lines | ForEach-Object {
            if ($_ -match "^\s*([^#][^=]*)\s*=") {
                $key = $Matches[1]
                "$key=REDACTED"
            } else {
                $_
            }
        }
        Set-Content -Path $envfile -Value $sanitized -Encoding ASCII
    }
}

# Comprimir el staging
if (Test-Path $OutZip) { Remove-Item $OutZip -Force }
Compress-Archive -Path $staging\* -DestinationPath $OutZip -Force

# Imprimir rutas finales
Write-Host "ZIP: $OutZip"
Write-Host "STAGING: $staging"
exit 0
