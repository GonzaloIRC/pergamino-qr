import { test, expect } from '@playwright/test';

// Test de autenticación usando emuladores de Firebase
test.describe('Authentication with Emulators', () => {
  test('admin user can login successfully', async ({ page }) => {
    // Capturar mensajes de consola del navegador
    page.on('console', (msg) => {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });
    
    // Configurar variables para el test
    const testEmail = 'admin@local.test';
    const testPassword = 'Admin123!';
    
    console.log(`Usando credenciales para emulador: ${testEmail}`);
    
    // Navegar a la página de login
    await page.goto('/');
    console.log('URL inicial:', page.url());
    
    // Esperar a que la página se cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Capturar estado antes del login
    await page.screenshot({ path: './test-results/before-login.png' });
    
    // Llenar formulario usando selectores robustos
    await page.locator('input[type="email"], input[name="email"], input[id="email"], [data-testid="email-input"]')
      .first()
      .fill(testEmail);
      
    await page.locator('input[type="password"], input[name="password"], input[id="password"], [data-testid="password-input"]')
      .first()
      .fill(testPassword);
    
    // Hacer clic en el botón de login con selector robusto
    await page.locator('button[type="submit"], input[type="submit"], [data-testid="login-button"]')
      .first()
      .click();
    
    console.log("Login enviado, esperando redirección...");
    
    // Esperar un momento para que se procese el login
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './test-results/just-after-login.png' });
    
    // Esperar a la redirección con timeout generoso
    await page.waitForURL(/\/dashboard$/, { timeout: 30000 });
    
    // Verificar redirección exitosa
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.screenshot({ path: './test-results/dashboard-loaded.png' });
    
    // Verificar elementos del dashboard para dispositivos móviles o desktop
    const viewportSize = page.viewportSize();
    const isMobile = viewportSize ? viewportSize.width < 768 : false;
    
    if (isMobile) {
      // En móvil, el sidebar está oculto pero el botón de menú debe estar visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible({ timeout: 10000 });
      // Hacer clic para mostrar el sidebar
      await page.locator('[data-testid="mobile-menu-button"]').click();
      // Ahora el sidebar debería estar visible
      await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible({ timeout: 10000 });
    } else {
      // En desktop, el sidebar debe estar visible directamente
      await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible({ timeout: 10000 });
    }
    
    console.log("Test de login completado exitosamente");
  });
});

// Main navigation test
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="email"], [data-testid="email-input"]')
      .first()
      .fill('admin@local.test');
      
    await page.locator('input[type="password"], [data-testid="password-input"]')
      .first()
      .fill('Admin123!');
      
    await page.locator('button[type="submit"], [data-testid="login-button"]')
      .first()
      .click();
      
    // Esperar redirección al dashboard
    await page.waitForURL(/\/dashboard$/);
  });
  
  test('sidebar has all required navigation links', async ({ page }) => {
    // Determinar si estamos en móvil o desktop
    const viewportSize = page.viewportSize();
    const isMobile = viewportSize ? viewportSize.width < 768 : false;
    
    if (isMobile) {
      // En móvil, hacer clic en el botón del menú para mostrar el sidebar
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      await page.locator('[data-testid="mobile-menu-button"]').click();
    }
    
    // Verificar que el sidebar es visible (después del clic en móvil o directo en desktop)
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible();
    
    // Verificar enlaces de navegación
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-analytics"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-clients"]')).toBeVisible();
  });
  
  test('can navigate to different sections', async ({ page }) => {
    // Determinar si estamos en móvil o desktop
    const viewportSize = page.viewportSize();
    const isMobile = viewportSize ? viewportSize.width < 768 : false;
    
    // En móvil, hacer clic en el botón del menú para mostrar el sidebar antes de cada navegación
    if (isMobile) {
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      await page.locator('[data-testid="mobile-menu-button"]').click();
    }
    
    // Navegar al dashboard
    await page.locator('[data-testid="nav-dashboard"]').click();
    await expect(page).toHaveURL(/\/dashboard$/);
    
    // En móvil, volver a abrir el menú para la siguiente navegación
    if (isMobile) {
      await page.locator('[data-testid="mobile-menu-button"]').click();
    }
    
    // Navegar a analytics
    await page.locator('[data-testid="nav-analytics"]').click();
    await expect(page).toHaveURL(/\/analytics$/);
    
    // En móvil, volver a abrir el menú para la siguiente navegación
    if (isMobile) {
      await page.locator('[data-testid="mobile-menu-button"]').click();
    }
    
    // Navegar a clients
    await page.locator('[data-testid="nav-clients"]').click();
    await expect(page).toHaveURL(/\/clients$/);
  });
});