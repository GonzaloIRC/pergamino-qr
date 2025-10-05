# Script para recolectar contexto del proyecto
# Este script recopila información sobre el estado del proyecto Pergamino App

# Definir directorio de contexto
$ctx = "REPORT\context\report-context"

# Asegurar que el directorio existe
if (-not (Test-Path $ctx)) {
    New-Item -Path $ctx -ItemType Directory -Force | Out-Null
}

# --- Git: estado y ramas
Write-Host "Recopilando información de Git..."
git remote -v > "$ctx\git_remotes.txt" 2>&1
git status > "$ctx\git_status.txt" 2>&1
git branch -vv > "$ctx\git_branches.txt" 2>&1
git log --oneline -n 60 > "$ctx\git_log_last60.txt" 2>&1

# --- Información de la estructura del proyecto
Write-Host "Analizando estructura del proyecto..."
Get-ChildItem -Force > "$ctx\root_listing.txt"

# --- Información de Node.js
Write-Host "Recopilando información de versiones..."
node -v > "$ctx\node_version.txt" 2>&1
npm -v > "$ctx\npm_version.txt" 2>&1

# --- Package.json
if (Test-Path package.json) {
    Get-Content package.json > "$ctx\package_json.txt"
}

# --- Estructura de directorios apps (si existe)
if (Test-Path apps) {
    Get-ChildItem apps -Force > "$ctx\apps_structure.txt"
}

# --- Información de Firebase
if (Test-Path firebase) {
    Get-ChildItem firebase -Force -Recurse > "$ctx\firebase_structure.txt"
}

# --- Información de src
if (Test-Path src) {
    Get-ChildItem src -Force > "$ctx\src_structure.txt"
    
    # Revisar componentes relacionados con tablas de seguimiento
    if (Test-Path "src\components\TrackingTable.js") {
        Get-Content "src\components\TrackingTable.js" > "$ctx\tracking_table_component.txt"
    }
    
    if (Test-Path "src\screens\TrackingDashboard.js") {
        Get-Content "src\screens\TrackingDashboard.js" > "$ctx\tracking_dashboard_screen.txt"
    }
}

# --- Información de docs
if (Test-Path docs) {
    Get-ChildItem docs -Force -Recurse > "$ctx\docs_structure.txt"
    
    # Revisar documentación de tablas de seguimiento
    if (Test-Path "docs\TRACKING_TABLE_MODULE.md") {
        Get-Content "docs\TRACKING_TABLE_MODULE.md" > "$ctx\tracking_module_doc.txt"
    }
}

# --- Reporte final
$report = @"
# Informe de Contexto - Pergamino App
Fecha: $(Get-Date)

## Resumen de Archivos Recopilados
- Información Git: git_remotes.txt, git_status.txt, git_branches.txt, git_log_last60.txt
- Estructura: root_listing.txt
- Versiones: node_version.txt, npm_version.txt
- Configuración: package_json.txt
"@

$report | Set-Content "$ctx\informe.md"

Write-Host "Contexto generado en: $ctx"