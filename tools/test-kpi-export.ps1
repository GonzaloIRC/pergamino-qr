<#
.SYNOPSIS
    Prueba la funcionalidad de exportaciÃ³n de KPIs.

.DESCRIPTION
    Este script ejecuta pruebas E2E especÃ­ficas para la exportaciÃ³n de KPIs
    desde el panel de control de la aplicaciÃ³n web administrativa de Pergamino,
    verificando la correcta generaciÃ³n de archivos CSV con los datos de KPI.

.PARAMETER Headless
    Ejecuta las pruebas en modo headless (sin interfaz grÃ¡fica). Por defecto es $true.

.PARAMETER Browser
    Especifica el navegador a utilizar: chromium, firefox o webkit. Por defecto es "chromium".

.PARAMETER GenerateReport
    Genera un reporte HTML detallado de la ejecuciÃ³n.

.EXAMPLE
    .\test-kpi-export.ps1
    Ejecuta la prueba de exportaciÃ³n de KPI en modo headless usando chromium.

.EXAMPLE
    .\test-kpi-export.ps1 -Headless $false -Browser "firefox"
    Ejecuta la prueba de exportaciÃ³n de KPI mostrando la interfaz grÃ¡fica en Firefox.

.EXAMPLE
    .\test-kpi-export.ps1 -GenerateReport
    Ejecuta la prueba y genera un reporte HTML detallado.
#>

Param(
    [bool]$Headless = $true,
    [string]$Browser = "chromium",
    [switch]$GenerateReport,
    [switch]$UseSimpleConfig
)

# ConfiguraciÃ³n de colores para la consola
$colorReset = "$([char]27)[0m"
$colorBright = "$([char]27)[1m"
$colorRed = "$([char]27)[31m"
$colorGreen = "$([char]27)[32m"
$colorYellow = "$([char]27)[33m"
$colorBlue = "$([char]27)[34m"
$colorCyan = "$([char]27)[36m"

# Banner
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host "$colorCyan$colorBright Prueba E2E - ExportaciÃ³n de KPIs $colorReset"
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host ""

# Ya no necesitamos definir el directorio de pruebas E2E aquí

# Usar una ruta relativa para el archivo de prueba
$testFileRelative = "apps/admin-web/e2e/kpi-export-specific.spec.js"
$testFile = Join-Path (Get-Location) $testFileRelative

# Verificar que el archivo de prueba existe
if (Test-Path $testFile) {
    Write-Host "$colorGreen>> Usando archivo de prueba existente: $testFileRelative$colorReset"
} else {
    Write-Host "$colorRed[X] No se encontrÃ³ el archivo de prueba: $testFileRelative$colorReset"
    Write-Host "$colorYellow>> Intentando usar archivo kpi-export.spec.js$colorReset"
    
    $testFileRelative = "apps/admin-web/e2e/kpi-export.spec.js"
    $testFile = Join-Path (Get-Location) $testFileRelative
    
    if (Test-Path $testFile) {
        Write-Host "$colorGreen>> Usando archivo de prueba alternativo: $testFileRelative$colorReset"
    } else {
        Write-Host "$colorRed[X] No se encontrÃ³ ningÃºn archivo de prueba de KPI.$colorReset"
        exit 1
    }
}

# Construir los argumentos para Playwright
$playwrightArgs = @("test", $testFileRelative)
$playwrightArgs += "--project=$Browser"

if ($Headless) {
    Write-Host "$colorBlue>> Ejecutando prueba en modo headless con $Browser....$colorReset"
} else {
    Write-Host "$colorBlue>> Ejecutando prueba con interfaz grÃ¡fica en $Browser....$colorReset"
    $playwrightArgs += "--headed"
}

if ($GenerateReport) {
    $reportDir = Join-Path (Get-Location) "playwright-report-kpi-export"
    $playwrightArgs += "-reporter=html"
    $playwrightArgs += "-output=$reportDir"
    Write-Host "$colorYellow>> Se generarÃ¡ un reporte HTML en: $reportDir$colorReset"
}

# Elegir la configuración adecuada
if ($UseSimpleConfig) {
    $playwrightArgs += "--config=playwright.config.simple.js"
    Write-Host "$colorCyan>> Usando configuración simple sin servidor web$colorReset"
} else {
    $playwrightArgs += "--config=playwright.config.noserver.js"
}

# Mostrar el comando a ejecutar
$cmdDisplay = "npx playwright " + ($playwrightArgs -join " ")
Write-Host "$colorCyan>> Ejecutando: $cmdDisplay$colorReset"

# Ejecutar Playwright
try {
    & npx playwright @playwrightArgs
    
    # Verificar el resultado
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$colorGreen[OK] Prueba de exportaciÃ³n de KPI exitosa$colorReset"
        
        # Buscar archivos CSV de exportaciÃ³n para validaciÃ³n adicional
        $downloadsPath = Join-Path $env:USERPROFILE "Downloads"
        $recentKpiExports = Get-ChildItem -Path $downloadsPath -Filter "kpis-pergamino*.csv" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
        
        if ($recentKpiExports) {
            $exportFile = $recentKpiExports.FullName
            Write-Host "$colorGreen[OK] Archivo de exportaciÃ³n KPI encontrado: $exportFile$colorReset"
            
            # Mostrar una pequeÃ±a vista previa del contenido
            Write-Host "$colorYellow>> Vista previa del archivo exportado:$colorReset"
            try {
                $csvContent = Get-Content -Path $exportFile -TotalCount 5
                $csvContent | ForEach-Object { Write-Host "  $_" }
                Write-Host "  ...."
            } catch {
                Write-Host "$colorRed  No se pudo leer el archivo CSV: $($_.ToString())$colorReset"
            }
        } else {
            Write-Host "$colorYellow[!] No se encontraron archivos de exportaciÃ³n KPI recientes en Downloads.$colorReset"
        }
        
        if ($GenerateReport) {
            Write-Host "$colorGreen[OK] Reporte HTML generado en: $reportDir$colorReset"
            Write-Host "$colorYellow  Puedes abrirlo con: npx playwright show-report $reportDir$colorReset"
        }
    } else {
        Write-Host "$colorRed[X] La prueba ha fallado con cÃ³digo: $LASTEXITCODE$colorReset"
        
        if ($GenerateReport) {
            Write-Host "$colorYellow  Puedes revisar los detalles en: $reportDir$colorReset"
            Write-Host "$colorYellow  Abre el reporte con: npx playwright show-report $reportDir$colorReset"
        } else {
            Write-Host "$colorYellow  Ejecuta con -GenerateReport para obtener un reporte detallado$colorReset"
        }
    }
} catch {
    Write-Host "$colorRed[X] Error al ejecutar la prueba: $($_.ToString())$colorReset"
    exit 1
}

# VerificaciÃ³n del entorno de pruebas
Write-Host ""
Write-Host "$colorCyan>> Verificando entorno de pruebas:$colorReset"

# Verificar node/npm
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "$colorGreen[OK] Node: $nodeVersion$colorReset"
    Write-Host "$colorGreen[OK] NPM: $npmVersion$colorReset"
} catch {
    Write-Host "$colorRed[X] Error al verificar Node/NPM: $($_.ToString())$colorReset"
}

# Verificar Playwright
try {
    $playwrightVersion = npx playwright -V
    Write-Host "$colorGreen[OK] Playwright: $playwrightVersion$colorReset"
} catch {
    Write-Host "$colorRed[X] Error al verificar Playwright: $($_.ToString())$colorReset"
}

# Mostrar resumen
Write-Host ""
Write-Host "$colorCyan==== Resumen de la prueba ====$colorReset"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Prueba: ExportaciÃ³n de KPI"
Write-Host "Navegador: $Browser"
Write-Host "Modo headless: $Headless"
Write-Host "Reporte generado: $GenerateReport"
Write-Host ""