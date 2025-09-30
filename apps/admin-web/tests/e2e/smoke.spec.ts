import { test, expect } from '@playwright/test';

test('basic smoke test - login page loads', async ({ page }) => {
  await page.goto('/');
  
  // Esperar a que la página cargue completamente
  await page.waitForLoadState('networkidle');
  
  // Tomar una captura de pantalla de la página de inicio
  await page.screenshot({ path: './test-results/login-page-smoke.png' });
  
  console.log(`URL cargada: ${page.url()}`);
  console.log(`Título de la página: ${await page.title()}`);
  
  // Verificar que hay elementos en la página
  const elementCount = await page.locator('body *').count();
  console.log(`Elementos encontrados en la página: ${elementCount}`);
  
  expect(elementCount).toBeGreaterThan(5);
});