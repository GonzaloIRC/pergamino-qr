#!/usr/bin/env pwsh
# Script para ejecutar pruebas con más opciones de depuración

# Función para mostrar mensajes coloridos
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Función para cargar variables de entorno desde archivo
function Import-EnvFile {
    param(
        [string]$FilePath
    )
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath
        
        foreach ($line in $content) {
            if ($line -match '^\s*#' -or $line -match '^\s*$') {
                continue # Saltar comentarios y líneas vacías
            }
            
            if ($line -match '^\s*([^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Quitar comillas si están presentes
                if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
                    $value = $matches[1]
                }
                
                Write-ColorMessage "Configurando: $key = $value" -ForegroundColor Gray
                [Environment]::SetEnvironmentVariable($key, $value)
            }
        }
    }
    else {
        Write-ColorMessage "Archivo no encontrado: $FilePath" -ForegroundColor Red
    }
}

# Configurar variables de entorno explícitamente para asegurar consistencia
$env:NEXT_PUBLIC_USE_EMULATORS = "false"
$env:TEST_ADMIN_EMAIL = "admin@local.test"
$env:TEST_ADMIN_PASSWORD = "Admin123!"
$env:NODE_ENV = "test"

# Intentar cargar variables adicionales desde .env.test
$envTestPath = ".\apps\admin-web\.env.test"
if (Test-Path $envTestPath) {
    Write-ColorMessage "Cargando variables de $envTestPath..." -ForegroundColor Cyan
    Import-EnvFile -FilePath $envTestPath
}

# Mostrar configuración actual
Write-ColorMessage "Ejecutando pruebas con la siguiente configuración:" -ForegroundColor Cyan
Write-ColorMessage "NEXT_PUBLIC_USE_EMULATORS: $env:NEXT_PUBLIC_USE_EMULATORS" -ForegroundColor Yellow
Write-ColorMessage "TEST_ADMIN_EMAIL: $env:TEST_ADMIN_EMAIL" -ForegroundColor Yellow
Write-ColorMessage "NODE_ENV: $env:NODE_ENV" -ForegroundColor Yellow

# Cambiar al directorio del proyecto
Push-Location -Path ".\apps\admin-web"

# Asegurar que estamos en el directorio correcto
Write-ColorMessage "Directorio actual: $(Get-Location)" -ForegroundColor Green

# Limpiar caché anterior
if (Test-Path ".\.next") {
    Write-ColorMessage "Limpiando caché de Next.js..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force ".\.next" -ErrorAction SilentlyContinue
}

# Recompilar la aplicación para asegurar que se utilizan las variables correctas
Write-ColorMessage "Construyendo la aplicación con variables actualizadas..." -ForegroundColor Cyan
npm run build

# Ejecutar el servidor en modo test
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow

try {
    # Esperar a que el servidor esté listo
    Write-ColorMessage "Esperando 15 segundos a que el servidor esté listo..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Ejecutar las pruebas específicas con opciones de depuración
    Write-ColorMessage "Ejecutando prueba de login con opciones de depuración..." -ForegroundColor Cyan
    
    npx playwright test tests/e2e/admin-panel.spec.ts --headed --debug --timeout 120000
}
finally {
    # Detener el servidor al finalizar
    if ($null -ne $serverProcess) {
        Write-ColorMessage "Deteniendo servidor de desarrollo..." -ForegroundColor Yellow
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Volver al directorio original
    Pop-Location
    
    Write-ColorMessage "Prueba finalizada." -ForegroundColor Green
}