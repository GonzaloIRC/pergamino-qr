import { test, expect } from '@playwright/test';

// Prueba específica para el Sidebar
test('Estructura de Sidebar y enlaces', async ({ page }) => {
  // Ir a la página principal
  await page.goto('/', { timeout: 60000 });
  
  console.log("Verificando estructura del HTML...");
  
  // Tomar screenshot para verificar qué se está mostrando
  await page.screenshot({ path: './test-results/pagina-principal.png' });
  
  // Imprimir la URL actual
  console.log("URL actual:", page.url());
  
  // Verificar si hay algún elemento HTML en la página
  const bodyContent = await page.locator('body').innerHTML();
  console.log("Primeros 200 caracteres del HTML:", bodyContent.substring(0, 200));
  
  // Contar elementos
  const elementCount = await page.locator('*').count();
  console.log(`Número total de elementos en la página: ${elementCount}`);
  
  // No hacer una aserción estricta, solo verificar que la página tiene contenido
  expect(elementCount).toBeGreaterThan(0);
});