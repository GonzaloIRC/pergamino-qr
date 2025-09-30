import { test, expect } from '@playwright/test';

test('Depuración de autenticación y navegación', async ({ page }) => {
  // 1. Ir a la página principal
  console.log('Navegando a la página principal...');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  console.log(`URL inicial: ${page.url()}`);
  await page.screenshot({ path: './test-results/debug-initial-page.png' });
  
  // 2. Intentar login directo
  console.log('Intentando login directo...');
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Buscar elementos de formulario por id específico basados en el HTML real
  const emailInput = await page.locator('#email').first();
  const passwordInput = await page.locator('#password').first();
  const loginButton = await page.locator('button[type="submit"]').first();
  
  // Verificar que se encontraron los elementos
  const emailFound = await emailInput.count() > 0;
  const passwordFound = await passwordInput.count() > 0;
  const buttonFound = await loginButton.count() > 0;
  
  console.log(`Email input encontrado: ${emailFound}`);
  console.log(`Password input encontrado: ${passwordFound}`);
  console.log(`Botón login encontrado: ${buttonFound}`);
  
  if (!emailFound || !passwordFound || !buttonFound) {
    console.log('Faltan elementos del formulario de login');
    await page.screenshot({ path: './test-results/debug-login-form-missing.png' });
    return;
  }
  
  // 3. Hacer login
  await emailInput.fill('admin@local.test');
  await passwordInput.fill('Admin123!');
  await page.screenshot({ path: './test-results/debug-before-login-click.png' });
  await loginButton.click();
  
  // 4. Esperar un poco para que se procese el login
  console.log('Esperando después del login...');
  await page.waitForTimeout(3000);
  
  // 5. Comprobar URL actual
  const currentUrl = page.url();
  console.log(`URL después del login: ${currentUrl}`);
  await page.screenshot({ path: './test-results/debug-after-login.png' });
  
  // 6. Ver si hay mensajes de error visibles (con timeout limitado)
  try {
    const errorLocator = page.getByText(/error|invalid|incorrect/i);
    const errorVisible = await errorLocator.isVisible({ timeout: 2000 });
    if (errorVisible) {
      const errorText = await errorLocator.textContent();
      console.log(`Error detectado: ${errorText}`);
    } else {
      console.log('No se detectaron mensajes de error');
    }
  } catch (e) {
    console.log('No se encontraron mensajes de error en la página');
  }
  
  // 7. Intentar navegar directamente al dashboard
  console.log('Navegando directamente al dashboard...');
  await page.goto('/dashboard');
  await page.waitForTimeout(1000);
  console.log(`URL después de navegar al dashboard: ${page.url()}`);
  await page.screenshot({ path: './test-results/debug-dashboard.png' });
  
  // 8. Comprobar si hay elementos del sidebar
  const sidebarVisible = await page.locator('aside').isVisible();
  console.log(`Sidebar visible: ${sidebarVisible}`);
  
  if (sidebarVisible) {
    // 9. Contar enlaces en el sidebar
    const navLinks = await page.locator('aside a[href]').all();
    console.log(`Enlaces en sidebar: ${navLinks.length}`);
    
    // 10. Listar los enlaces encontrados
    for (let i = 0; i < navLinks.length; i++) {
      const href = await navLinks[i].getAttribute('href');
      const text = await navLinks[i].textContent();
      console.log(`Enlace ${i+1}: ${text?.trim()} (${href})`);
    }
  }
});