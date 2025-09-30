import { test, expect } from '@playwright/test';

// Test alternativo de navegación directa que funciona en todos los navegadores
test.describe('Navegación programática en todos los navegadores', () => {
  test('navegar programáticamente a diferentes secciones', async ({ page }) => {
    // Iniciar en dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Login
    console.log('Iniciando sesión con usuario de prueba...');
    await page.getByTestId("email-input").fill('admin@local.test');
    await page.getByTestId("password-input").fill('Admin123!');
    await page.getByTestId("login-button").click();
    
    // Esperar a que estemos en dashboard
    await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard$/);
    console.log("Login exitoso, estamos en dashboard");
    
    // Navegar programáticamente a Analytics
    await page.evaluate(() => {
      console.log("Navegando a Analytics");
      window.location.href = "/analytics";
    });
    
    try {
      await page.waitForURL(/\/analytics$/, { timeout: 30000 });
      console.log("Navegación programática a Analytics exitosa");
    } catch (err) {
      console.log('Error esperando URL de analytics, verificando URL actual...');
      const currentUrl = page.url();
      console.log('URL actual:', currentUrl);
      expect(currentUrl).toContain('/analytics');
    }
    
    await expect(page).toHaveURL(/\/analytics$/, { timeout: 5000 });
    
    // Navegar programáticamente a Clients
    await page.evaluate(() => {
      console.log("Navegando a Clients");
      window.location.href = "/clients";
    });
    
    try {
      await page.waitForURL(/\/clients$/, { timeout: 30000 });
      console.log("Navegación programática a Clients exitosa");
    } catch (err) {
      console.log('Error esperando URL de clients, verificando URL actual...');
      const currentUrl = page.url();
      console.log('URL actual:', currentUrl);
      expect(currentUrl).toContain('/clients');
    }
    
    await expect(page).toHaveURL(/\/clients$/, { timeout: 5000 });
    
    // Navegar programáticamente de vuelta a Dashboard
    await page.evaluate(() => {
      console.log("Navegando a Dashboard");
      window.location.href = "/dashboard";
    });
    
    try {
      await page.waitForURL(/\/dashboard$/, { timeout: 30000 });
      console.log("Navegación programática a Dashboard exitosa");
    } catch (err) {
      console.log('Error esperando URL de dashboard, verificando URL actual...');
      const currentUrl = page.url();
      console.log('URL actual:', currentUrl);
      expect(currentUrl).toContain('/dashboard');
    }
    
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 });
  });
});