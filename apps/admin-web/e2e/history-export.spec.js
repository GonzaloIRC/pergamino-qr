import { test, expect } from '@playwright/test';

// Test de exportación de datos de historial
test('Historia - exportación CSV funciona correctamente', async ({ page }) => {
  // Ir a la página de historial
  await page.goto('/history');
  await expect(page).toHaveURL('/history');
  
  // Verificar que se carga la página correctamente
  await expect(page.getByTestId('history-container')).toBeVisible();
  
  // Realizar una búsqueda
  await page.getByTestId('history-dni-filter').fill('12345678');
  await page.getByTestId('history-search-button').click();
  
  // Esperar a que los resultados se carguen
  await expect(page.getByTestId('history-table')).toBeVisible();
  
  // Verificar que el botón de exportar está disponible
  const exportButton = page.getByTestId('export-csv-button');
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeEnabled();
  
  // Mock para la descarga de archivos
  const downloadPromise = page.waitForEvent('download');
  
  // Hacer clic en el botón de exportar
  await exportButton.click();
  
  // Esperar a que se complete la descarga
  const download = await downloadPromise;
  
  // Verificar que el nombre del archivo contiene 'history_export'
  expect(download.suggestedFilename()).toContain('history_export');
  expect(download.suggestedFilename()).toContain('.csv');
  
  // Leer el contenido del archivo descargado
  const csvPath = await download.path();
  
  // Verificar que el archivo no está vacío
  // Nota: en un test real podríamos analizar el contenido del CSV
  const fileContents = await page.evaluate(async (csvPath) => {
    const response = await fetch(`file://${csvPath}`);
    return await response.text();
  }, csvPath);
  
  expect(fileContents).toBeTruthy();
  expect(fileContents).toContain('id,fecha,dni,serial,tipo');
});

// Test de filtros de historial
test('Historia - filtros funcionan correctamente', async ({ page }) => {
  // Ir a la página de historial
  await page.goto('/history');
  
  // Verificar que se carga la página correctamente
  await expect(page.getByTestId('history-container')).toBeVisible();
  
  // Probar filtro por DNI
  await page.getByTestId('history-dni-filter').fill('12345678');
  await page.getByTestId('history-search-button').click();
  
  // Esperar resultados y verificar que la tabla contiene el DNI buscado
  await expect(page.getByTestId('history-table')).toBeVisible();
  const dniCells = page.locator('td:nth-child(2)');
  await expect(dniCells.first()).toContainText('12345678');
  
  // Limpiar filtros y probar filtro por fechas
  await page.getByTestId('history-dni-filter').clear();
  
  // Establecer fecha desde
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  await page.getByTestId('history-from-filter').fill(fromDate);
  await page.getByTestId('history-search-button').click();
  
  // Verificar resultados
  await expect(page.getByTestId('history-table')).toBeVisible();
  
  // Verificar que no aparece el mensaje de "No se encontraron registros"
  const emptyMessage = page.getByTestId('history-empty');
  await expect(emptyMessage).not.toBeVisible();
});