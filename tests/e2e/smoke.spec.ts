import { test } from '@playwright/test';

test('Smoke test - Validar estructura básica', async ({ page }) => {
  await page.goto('/');
  
  console.log("URL actual: " + page.url());
  await page.screenshot({ path: './test-results/smoke-test-home.png' });
  
  const html = await page.content();
  console.log("Primeros 200 caracteres del HTML: " + html.substring(0, 200));
  
  const elements = await page.$$('*');
  console.log("Número total de elementos en la página: " + elements.length);
});
