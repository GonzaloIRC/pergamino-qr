# Script para ejecutar las pruebas E2E de Pergamino Admin Web
# Autor: Equipo de desarrollo de Pergamino
# Fecha: 03/10/2025

# Definir colores para la salida
$colorVerde = @{ForegroundColor = "Green"}
$colorAmarillo = @{ForegroundColor = "Yellow"}
$colorRojo = @{ForegroundColor = "Red"}

# Mostrar mensaje de inicio
Write-Host "`n=========================================" @colorAmarillo
Write-Host " PRUEBAS E2E PARA PERGAMINO ADMIN WEB" @colorAmarillo
Write-Host "=========================================`n" @colorAmarillo

# Verificar ubicación
$rutaActual = Get-Location
Write-Host "Ubicación actual: $rutaActual" @colorVerde

# Cambiar al directorio de admin-web
try {
    Set-Location -Path ".\apps\admin-web" -ErrorAction Stop
    Write-Host "Cambiado al directorio: $(Get-Location)" @colorVerde
} catch {
    Write-Host "Error al cambiar al directorio de admin-web. Asegúrate de ejecutar este script desde la raíz del proyecto." @colorRojo
    exit 1
}

# Verificar que los archivos de prueba existen
if (-not (Test-Path ".\e2e")) {
    Write-Host "No se encontró el directorio de pruebas E2E." @colorRojo
    Write-Host "Creando directorio y estructura básica..." @colorAmarillo
    New-Item -ItemType Directory -Path ".\e2e" -Force | Out-Null
}

# Crear directorio para resultados si no existe
if (-not (Test-Path "..\..\test-results")) {
    New-Item -ItemType Directory -Path "..\..\test-results" -Force | Out-Null
    Write-Host "Directorio para resultados creado." @colorVerde
}

# Ejecutar las pruebas
Write-Host "`nEjecutando pruebas E2E..." @colorAmarillo
try {
    # Ejecutar las pruebas E2E con PowerShell
    npm run test:e2e
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Todas las pruebas E2E han pasado correctamente." @colorVerde
    } else {
        Write-Host "`n⚠️ Algunas pruebas han fallado. Revisa el informe para más detalles." @colorRojo
    }
} catch {
    Write-Host "`n❌ Error al ejecutar las pruebas: $_" @colorRojo
    exit 1
}

# Generar informe
Write-Host "`nGenerando informe de pruebas..." @colorAmarillo
try {
    npm run test:e2e:report
    Write-Host "✅ Informe generado correctamente." @colorVerde
    Write-Host "`nPuedes ver el informe abriendo: $(Get-Location)\playwright-report\index.html" @colorVerde
} catch {
    Write-Host "❌ Error al generar el informe: $_" @colorRojo
}

# Volver al directorio original
Set-Location -Path $rutaActual

Write-Host "`n=========================================" @colorAmarillo
Write-Host " FINALIZADO" @colorAmarillo
Write-Host "=========================================`n" @colorAmarillo