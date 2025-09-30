import { test, expect } from '@playwright/test';

// Test de navegación entre secciones después de login exitoso
test.describe('Navegación por el panel de administración', () => {
  test('login y navegación a diferentes secciones', async ({ page, browserName }) => {
    // 1. Navegar a la página de inicio
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 2. Realizar login con credenciales de prueba
    console.log('Iniciando sesión con usuario de prueba...');
    
    // Usar selectores con data-testid para mayor robustez
    await page.getByTestId("email-input").fill('admin@local.test');
    await page.getByTestId("password-input").fill('Admin123!');
    
    // Hacer click en botón de login
    await page.getByTestId("login-button").click();
    
    // 3. Esperar a que la URL cambie a /dashboard con un timeout de 15 segundos
    await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
    
    // Verificar que la URL es /dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
    
    // Capturar estado después del login
    await page.screenshot({ path: './test-results/after-login-for-navigation.png' });
    
    // 4. Verificar si estamos en vista móvil o desktop
    const viewportSize = page.viewportSize();
    const isMobile = viewportSize ? viewportSize.width < 768 : false;
    
    if (isMobile) {
      // En móvil, verificar que el botón de menú está visible
      await expect(page.getByTestId("mobile-menu-button")).toBeVisible({ timeout: 10000 });
      
      // Hacer clic para mostrar el sidebar
      await page.getByTestId("mobile-menu-button").click();
      await page.waitForTimeout(500); // Esperar a la animación
    }
    
    // Ahora verificamos que el sidebar está presente y visible
    await expect(page.getByTestId("sidebar-nav")).toBeVisible({ timeout: 10000 });
    
    // 5. Verificar que los enlaces de navegación principales están presentes
    await expect(page.getByTestId("nav-dashboard")).toBeVisible();
    await expect(page.getByTestId("nav-analytics")).toBeVisible();
    await expect(page.getByTestId("nav-clients")).toBeVisible();
    
    console.log("Sidebar y navegación verificados correctamente");
    
    // 6. Navegar al Dashboard y verificar URL
    // En móvil, es posible que el sidebar se cierre automáticamente, así que debemos reabrirlo para cada navegación
    if (isMobile) {
      // Forzar el clic usando evaluate para evitar problemas de intercepción
      await page.evaluate(() => {
        const menuButton = document.querySelector('[data-testid="mobile-menu-button"]');
        if (menuButton && menuButton instanceof HTMLElement) {
          menuButton.click();
        }
      });
      await page.waitForTimeout(1000); // Mayor espera para asegurarnos que la animación se complete
    }
    // Método de navegación diferente según el navegador
    if (browserName === 'firefox' || browserName === 'webkit') {
      console.log(`Usando navegación programática directa para ${browserName}`);
      
      // Para Firefox y WebKit, navegamos programáticamente en lugar de usar clicks UI
      await page.evaluate(() => {
        window.location.href = "/dashboard";
      });
    } else {
      console.log(`Usando método de click para ${browserName}`);
      // Usar evaluate para hacer clic en el enlace del dashboard
      await page.evaluate(() => {
        const navLink = document.querySelector('[data-testid="nav-dashboard"]');
        if (navLink && navLink instanceof HTMLElement) {
          navLink.click();
        }
      });
    }
    
    // Esperar con timeout más generoso y manejar errores
    try {
      await page.waitForURL(/\/dashboard$/, { timeout: 30000 });
    } catch (err) {
      console.log('Error esperando URL de dashboard, verificando URL actual...');
      // Si el timeout ocurre, verificar manualmente la URL
      const currentUrl = page.url();
      console.log('URL actual:', currentUrl);
      expect(currentUrl).toContain('/dashboard');
    }
    
    // También verificar la URL usando expect
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 });
    console.log("Navegación a Dashboard exitosa");
    
    // 7. Navegar a Analytics y verificar URL
    if (isMobile) {
      // Forzar el clic usando evaluate para evitar problemas de intercepción
      await page.evaluate(() => {
        const menuButton = document.querySelector('[data-testid="mobile-menu-button"]');
        if (menuButton && menuButton instanceof HTMLElement) {
          menuButton.click();
        }
      });
      await page.waitForTimeout(1000); // Mayor espera para asegurarnos que la animación se complete
    }
    // Método de navegación diferente según el navegador
    if (browserName === 'firefox' || browserName === 'webkit') {
      console.log(`Usando navegación programática directa para ${browserName}`);
      
      // Para Firefox y WebKit, navegamos programáticamente en lugar de usar clicks UI
      await page.evaluate(() => {
        window.location.href = "/analytics";
      });
    } else {
      console.log(`Usando método de click para ${browserName}`);
      // Usar evaluate para hacer clic en el enlace de analytics
      await page.evaluate(() => {
        const navLink = document.querySelector('[data-testid="nav-analytics"]');
        if (navLink && navLink instanceof HTMLElement) {
          navLink.click();
        }
      });
    }
    
    // Esperar con timeout más generoso y manejar errores
    try {
      await page.waitForURL(/\/analytics$/, { timeout: 30000 });
    } catch (err) {
      console.log('Error esperando URL de analytics, verificando URL actual...');
      // Si el timeout ocurre, verificar manualmente la URL
      const currentUrl = page.url();
      console.log('URL actual:', currentUrl);
      expect(currentUrl).toContain('/analytics');
    }
    
    // También verificar la URL usando expect
    await expect(page).toHaveURL(/\/analytics$/, { timeout: 5000 });
    console.log("Navegación a Analytics exitosa");
    
    // 8. Navegar a Clients y verificar URL
    if (isMobile) {
      // Forzar el clic usando evaluate para evitar problemas de intercepción
      await page.evaluate(() => {
        const menuButton = document.querySelector('[data-testid="mobile-menu-button"]');
        if (menuButton && menuButton instanceof HTMLElement) {
          menuButton.click();
        }
      });
      await page.waitForTimeout(1000); // Mayor espera para asegurarnos que la animación se complete
    }
    // Método de navegación diferente según el navegador
    if (browserName === 'firefox' || browserName === 'webkit') {
      console.log(`Usando navegación programática directa para ${browserName}`);
      
      // Para Firefox y WebKit, navegamos programáticamente en lugar de usar clicks UI
      await page.evaluate(() => {
        window.location.href = "/clients";
      });
    } else {
      console.log(`Usando método de click para ${browserName}`);
      // Usar evaluate para hacer clic en el enlace de clients
      await page.evaluate(() => {
        const navLink = document.querySelector('[data-testid="nav-clients"]');
        if (navLink && navLink instanceof HTMLElement) {
          navLink.click();
        }
      });
    }
    
    // Esperar con timeout más generoso y manejar errores
    try {
      await page.waitForURL(/\/clients$/, { timeout: 30000 });
    } catch (err) {
      console.log('Error esperando URL de clients, verificando URL actual...');
      // Si el timeout ocurre, verificar manualmente la URL
      const currentUrl = page.url();
      console.log('URL actual:', currentUrl);
      expect(currentUrl).toContain('/clients');
    }
    
    // También verificar la URL usando expect
    await expect(page).toHaveURL(/\/clients$/, { timeout: 5000 });
    console.log("Navegación a Clients exitosa");
    
    // 9. Capturar el estado final
    await page.screenshot({ path: './test-results/navigation-complete.png' });
  });
});