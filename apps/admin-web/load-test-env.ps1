# Script para cargar variables de entorno para pruebas desde .env.test
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path $scriptPath -Parent
Set-Location $scriptDir

Write-Host "🔄 Cargando variables de entorno desde .env.test..." -ForegroundColor Yellow

if (Test-Path ".\tests\.env.test") {
    $envContent = Get-Content ".\tests\.env.test"
    $loadedCount = 0
    $criticalVars = @(
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_USE_EMULATORS",
        "TEST_ADMIN_EMAIL",
        "TEST_ADMIN_PASSWORD"
    )
    
    foreach ($line in $envContent) {
        if ($line -and !$line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                
                # Establecer la variable de entorno
                [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
                
                # Mostrar información diferente según el tipo de variable
                if ($criticalVars -contains $key) {
                    if ($key.Contains("PASSWORD")) {
                        Write-Host "✅ Variable crítica $key configurada con valor: ***********" -ForegroundColor Green
                    } else {
                        Write-Host "✅ Variable crítica $key configurada con valor: $value" -ForegroundColor Green
                    }
                } else {
                    Write-Host "Variable $key configurada" -ForegroundColor Cyan
                }
                
                $loadedCount++
            }
        }
    }
    
    Write-Host "✅ Se cargaron $loadedCount variables de entorno correctamente" -ForegroundColor Green
    
    # Verificar si las variables críticas están cargadas
    $missingVars = @()
    foreach ($var in $criticalVars) {
        if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($var))) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "⚠️ ADVERTENCIA: Faltan las siguientes variables críticas:" -ForegroundColor Yellow
        foreach ($var in $missingVars) {
            Write-Host "   - $var" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ ERROR: No se encontró el archivo .env.test en ./tests/" -ForegroundColor Red
    Write-Host "   Asegúrese de que el archivo exista y tenga los permisos correctos." -ForegroundColor Red
}