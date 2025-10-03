#!/usr/bin/env pwsh
# Script para verificar la estructura de rutas protegidas

# Función para mostrar mensajes coloridos
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Verificar la estructura de directorios para las rutas protegidas
$protectedRoutes = @(
    "dashboard",
    "analytics",
    "alerts",
    "clients",
    "benefits",
    "serials",
    "history",
    "settings"
)

Write-ColorMessage "Verificando estructura de rutas protegidas..." -ForegroundColor Cyan
$basePath = ".\apps\admin-web\app\(protected)"

$allRoutesExist = $true
foreach ($route in $protectedRoutes) {
    $routePath = Join-Path -Path $basePath -ChildPath $route
    
    if (Test-Path -Path $routePath) {
        # Verificar si hay un archivo page.tsx en la ruta
        $pagePath = Join-Path -Path $routePath -ChildPath "page.tsx"
        if (Test-Path -Path $pagePath) {
            Write-ColorMessage "✅ Ruta /$route - Directorio y página encontrados" -ForegroundColor Green
        } else {
            Write-ColorMessage "⚠️ Ruta /$route - Directorio encontrado pero falta page.tsx" -ForegroundColor Yellow
            $allRoutesExist = $false
        }
    } else {
        Write-ColorMessage "❌ Ruta /$route - Directorio no encontrado" -ForegroundColor Red
        $allRoutesExist = $false
    }
}

# Verificar que existe el archivo layout.tsx en el directorio protegido
$layoutPath = Join-Path -Path $basePath -ChildPath "layout.tsx"
if (Test-Path -Path $layoutPath) {
    Write-ColorMessage "✅ Layout de rutas protegidas encontrado" -ForegroundColor Green
} else {
    Write-ColorMessage "❌ Falta el archivo layout.tsx en rutas protegidas" -ForegroundColor Red
    $allRoutesExist = $false
}

# Verificar que existe el provider de autenticación
$providerPath = ".\apps\admin-web\app\providers.tsx"
if (Test-Path -Path $providerPath) {
    Write-ColorMessage "✅ Provider de autenticación encontrado" -ForegroundColor Green
} else {
    Write-ColorMessage "❌ Falta el archivo providers.tsx" -ForegroundColor Red
    $allRoutesExist = $false
}

# Resumen
if ($allRoutesExist) {
    Write-ColorMessage "`n✅ Todas las rutas protegidas están correctamente configuradas" -ForegroundColor Green
    exit 0
} else {
    Write-ColorMessage "`n⚠️ Hay problemas con algunas rutas protegidas" -ForegroundColor Yellow
    exit 1
}