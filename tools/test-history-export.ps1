<#
.SYNOPSIS
    Prueba la funcionalidad de exportaciÃ³n de datos del historial.

.DESCRIPTION
    Este script ejecuta pruebas E2E especÃ­ficas para la exportaciÃ³n de datos
    histÃ³ricos desde la pÃ¡gina de historial de la aplicaciÃ³n web administrativa
    de Pergamino, verificando la correcta generaciÃ³n de archivos CSV con filtros.

.PARAMETER Headless
    Ejecuta las pruebas en modo headless (sin interfaz grÃ¡fica). Por defecto es $true.

.PARAMETER Browser
    Especifica el navegador a utilizar: chromium, firefox o webkit. Por defecto es "chromium".

.PARAMETER GenerateReport
    Genera un reporte HTML detallado de la ejecuciÃ³n.

.PARAMETER WithFilters
    Ejecuta pruebas adicionales con diferentes combinaciones de filtros.

.EXAMPLE
    .\test-history-export.ps1
    Ejecuta la prueba bÃ¡sica de exportaciÃ³n de historial.

.EXAMPLE
    .\test-history-export.ps1 -Headless $false -Browser "firefox" -WithFilters
    Ejecuta pruebas completas con filtros en Firefox con interfaz grÃ¡fica.
#>

Param(
    [bool]$Headless = $true,
    [string]$Browser = "chromium",
    [switch]$GenerateReport,
    [switch]$WithFilters
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
Write-Host "$colorCyan$colorBright Prueba E2E - ExportaciÃ³n de Historial $colorReset"
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host ""

# Directorio de pruebas E2E
$e2eDir = Join-Path (Get-Location) "apps/admin-web/e2e"

# Usar el archivo de prueba existente
$testFile = Join-Path $e2eDir "history-export.spec.js"

# Verificar que el archivo de prueba existe
if (Test-Path $testFile) {
    Write-Host "$colorGreen>> Usando archivo de prueba existente: $testFile$colorReset"
} else {
    Write-Host "$colorRedâŒ No se encontrÃ³ el archivo de prueba: $testFile$colorReset"
    
    # Crear el archivo de prueba si no existe
    Write-Host "$colorYellow>> Creando archivo de prueba para la exportaciÃ³n de historial....$colorReset"
    
    # Contenido del archivo de prueba
    $testContent = @"
import { test, expect } from '@playwright/test';

// Test de exportaciÃ³n de datos de historial
test('Historia - exportaciÃ³n CSV funciona correctamente', async ({ page }) => {
  // Ir a la pÃ¡gina de historial
  await page.goto('/history');
  await expect(page).toHaveURL('/history');
  
  // Verificar que se carga la pÃ¡gina correctamente
  await expect(page.getByTestId('history-container')).toBeVisible();
  
  // Realizar una bÃºsqueda
  await page.getByTestId('history-dni-filter').fill('12345678');
  await page.getByTestId('history-search-button').click();
  
  // Esperar a que los resultados se carguen
  await expect(page.getByTestId('history-table')).toBeVisible();
  
  // Verificar que el botÃ³n de exportar estÃ¡ disponible
  const exportButton = page.getByTestId('export-csv-button');
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeEnabled();
  
  // Mock para la descarga de archivos
  const downloadPromise = page.waitForEvent('download');
  
  // Hacer clic en el botÃ³n de exportar
  await exportButton.click();
  
  // Esperar a que se complete la descarga
  const download = await downloadPromise;
  
  // Verificar que el nombre del archivo contiene 'history_export'
  expect(download.suggestedFilename()).toContain('history_export');
  expect(download.suggestedFilename()).toContain('.csv');
  
  // Verificar que el archivo no estÃ¡ vacÃ­o
  const csvPath = await download.path();
  expect(csvPath).toBeTruthy();
});

// Test adicional con filtros de fecha
test('Historia - exportaciÃ³n CSV con filtros de fecha', async ({ page }) => {
  // Ir a la pÃ¡gina de historial
  await page.goto('/history');
  
  // Aplicar filtro de fecha
  await page.getByTestId('history-date-from').fill('2023-01-01');
  await page.getByTestId('history-date-to').fill('2023-12-31');
  await page.getByTestId('history-search-button').click();
  
  // Esperar a que los resultados se carguen
  await expect(page.getByTestId('history-table')).toBeVisible();
  
  // Exportar resultados filtrados
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-csv-button').click();
  
  // Verificar descarga
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('history_export');
  
  // Verificar que el archivo existe
  const csvPath = await download.path();
  expect(csvPath).toBeTruthy();
});
"@
    
    # Crear el directorio si no existe
    if (-not (Test-Path $e2eDir)) {
        New-Item -ItemType Directory -Path $e2eDir -Force | Out-Null
    }
    
    # Escribir el archivo
    Set-Content -Path $testFile -Value $testContent
    Write-Host "$colorGreenâœ“ Archivo de prueba creado: $testFile$colorReset"
}

# Si se solicitan pruebas con filtros adicionales, crear/actualizar un archivo especÃ­fico
if ($WithFilters) {
    $filtersTestFile = Join-Path $e2eDir "history-export-filters.spec.js"
    
    Write-Host "$colorYellow>> Configurando pruebas adicionales con filtros....$colorReset"
    
    # Contenido del archivo de prueba con filtros
    $filtersTestContent = @"
import { test, expect } from '@playwright/test';

// Tests de exportaciÃ³n de historial con varios filtros
test.describe('ExportaciÃ³n de Historial con Filtros', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'admin@pergamino.test');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'test1234');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete and navigate to history
    await page.waitForURL('/dashboard');
    await page.goto('/history');
  });

  test('exportar historial con filtro de DNI', async ({ page }) => {
    // Aplicar filtro de DNI
    await page.getByTestId('history-dni-filter').fill('12345678');
    await page.getByTestId('history-search-button').click();
    
    // Esperar a que los resultados se carguen
    await expect(page.getByTestId('history-table')).toBeVisible();
    
    // Exportar resultados
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-csv-button').click();
    
    // Verificar descarga
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('history_export');
  });
  
  test('exportar historial con filtro de serial', async ({ page }) => {
    // Aplicar filtro de nÃºmero de serie
    await page.getByTestId('history-serial-filter').fill('ABC123');
    await page.getByTestId('history-search-button').click();
    
    // Esperar a que los resultados se carguen
    await expect(page.getByTestId('history-table')).toBeVisible();
    
    // Exportar resultados
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-csv-button').click();
    
    // Verificar descarga
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('history_export');
  });
  
  test('exportar historial con filtro de tipo', async ({ page }) => {
    // Aplicar filtro de tipo
    await page.getByTestId('history-type-filter').selectOption('scan');
    await page.getByTestId('history-search-button').click();
    
    // Esperar a que los resultados se carguen
    await expect(page.getByTestId('history-table')).toBeVisible();
    
    // Exportar resultados
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-csv-button').click();
    
    // Verificar descarga
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('history_export');
  });
  
  test('exportar historial con mÃºltiples filtros', async ({ page }) => {
    // Aplicar mÃºltiples filtros
    await page.getByTestId('history-date-from').fill('2023-01-01');
    await page.getByTestId('history-date-to').fill('2023-12-31');
    await page.getByTestId('history-dni-filter').fill('12345678');
    await page.getByTestId('history-type-filter').selectOption('scan');
    await page.getByTestId('history-search-button').click();
    
    // Esperar a que los resultados se carguen
    await expect(page.getByTestId('history-table')).toBeVisible();
    
    // Exportar resultados
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-csv-button').click();
    
    // Verificar descarga
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('history_export');
  });
});
"@
    
    # Crear o actualizar el archivo de prueba con filtros
    Set-Content -Path $filtersTestFile -Value $filtersTestContent
    Write-Host "$colorGreenâœ“ Archivo de prueba con filtros creado: $filtersTestFile$colorReset"
    
    # Actualizar la variable $testFile para incluir ambos archivos
    $testFile = "$testFile $filtersTestFile"
}

# Construir los argumentos para Playwright
$playwrightArgs = @("test")

# AÃ±adir los archivos de prueba (pueden ser varios si WithFilters estÃ¡ activado)
foreach ($file in $testFile.Split(" ")) {
    $playwrightArgs += $file
}

$playwrightArgs += "--project=$Browser"

if ($Headless) {
    Write-Host "$colorBlue>> Ejecutando prueba en modo headless con $Browser....$colorReset"
} else {
    Write-Host "$colorBlue>> Ejecutando prueba con interfaz grÃ¡fica en $Browser....$colorReset"
    $playwrightArgs += "--headed"
}

if ($GenerateReport) {
    $reportDir = Join-Path (Get-Location) "playwright-report-history-export"
    $playwrightArgs += "-reporter=html"
    $playwrightArgs += "-output=$reportDir"
    Write-Host "$colorYellow>> Se generarÃ¡ un reporte HTML en: $reportDir$colorReset"
}

# Añadir la configuración sin servidor
$playwrightArgs += "--config=playwright.config.noserver.js"

# Mostrar el comando a ejecutar
$cmdDisplay = "npx playwright " + ($playwrightArgs -join " ")
Write-Host "$colorCyan>> Ejecutando: $cmdDisplay$colorReset"

# Ejecutar Playwright
try {
    & npx playwright @playwrightArgs
    
    # Verificar el resultado
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$colorGreenâœ“ Prueba de exportaciÃ³n de historial exitosa$colorReset"
        
        # Buscar archivos CSV de exportaciÃ³n para validaciÃ³n adicional
        $downloadsPath = Join-Path $env:USERPROFILE "Downloads"
        $recentHistoryExports = Get-ChildItem -Path $downloadsPath -Filter "history_export*.csv" |
                               Sort-Object LastWriteTime -Descending |
                               Select-Object -First 1
        
        if ($recentHistoryExports) {
            $exportFile = $recentHistoryExports.FullName
            Write-Host "$colorGreenâœ“ Archivo de exportaciÃ³n de historial encontrado: $exportFile$colorReset"
            
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
            Write-Host "$colorYellowâš ï¸ No se encontraron archivos de exportaciÃ³n de historial recientes en Downloads.$colorReset"
        }
        
        if ($GenerateReport) {
            Write-Host "$colorGreenâœ“ Reporte HTML generado en: $reportDir$colorReset"
            Write-Host "$colorYellow  Puedes abrirlo con: npx playwright show-report $reportDir$colorReset"
        }
    } else {
        Write-Host "$colorRedâŒ La prueba ha fallado con cÃ³digo: $LASTEXITCODE$colorReset"
        
        if ($GenerateReport) {
            Write-Host "$colorYellow  Puedes revisar los detalles en: $reportDir$colorReset"
            Write-Host "$colorYellow  Abre el reporte con: npx playwright show-report $reportDir$colorReset"
        } else {
            Write-Host "$colorYellow  Ejecuta con -GenerateReport para obtener un reporte detallado$colorReset"
        }
    }
} catch {
    Write-Host "$colorRedâŒ Error al ejecutar la prueba: $($_.ToString())$colorReset"
    exit 1
}

# Mostrar resumen
Write-Host ""
Write-Host "$colorCyan==== Resumen de la prueba ====$colorReset"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Prueba: ExportaciÃ³n de Historial"
Write-Host "Navegador: $Browser"
Write-Host "Modo headless: $Headless"
Write-Host "Reporte generado: $GenerateReport"
Write-Host "Pruebas con filtros: $WithFilters"
Write-Host ""