import { test as baseTest, expect, devices } from '@playwright/test';

// Configurar los tests para usar el dispositivo móvil
const test = baseTest.extend({
  ...devices['iPhone 13'],
});

// Test de navegación para dispositivos móviles
test.describe('Navegación móvil', () => {
  test('navegación por sidebar en dispositivo móvil', async ({ page }) => {
    // 1. Navegar a la página de inicio
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/\/login$/);
    
    // 2. Realizar login con credenciales de prueba
    console.log('Iniciando sesión con usuario de prueba en dispositivo móvil...');
    
    await page.getByTestId("email-input").fill('admin@local.test');
    await page.getByTestId("password-input").fill('Admin123!');
    
    // Hacer click en botón de login
    await page.getByTestId("login-button").click();
    
    // 3. Esperar a que la URL cambie a /dashboard con un timeout más generoso
    await page.waitForURL(/\/dashboard$/, { timeout: 30000 });
    console.log('Login exitoso, estamos en el dashboard');
    
    // 4. En móvil, normalmente hay un botón para mostrar/ocultar el sidebar
    // Buscar y hacer clic en el botón de menú hamburguesa si existe
    const menuButton = page.getByTestId("mobile-menu-button");
    
    if (await menuButton.isVisible()) {
      console.log('Botón de menú móvil encontrado, haciendo clic');
      await menuButton.click();
      // Esperar a que el sidebar sea visible
      await page.waitForSelector('[data-testid="sidebar-nav"]', { state: 'visible', timeout: 5000 });
    } else {
      console.log('No se encontró botón de menú móvil, verificando si el sidebar ya está visible');
    }
    
    // 5. Verificar que el sidebar es visible
    await expect(page.getByTestId("sidebar-nav")).toBeVisible({ timeout: 5000 });
    
    // 6. Verificar elementos de navegación principales
    await expect(page.getByTestId("nav-dashboard")).toBeVisible();
    await expect(page.getByTestId("nav-clients")).toBeVisible();
    
    // 7. Navegación a la sección de clientes
    console.log('Navegando a la sección de clientes');
    await page.getByTestId("nav-clients").click();
    
    // 8. Esperar a que se complete la navegación
    await page.waitForURL(/\/clients$/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/clients$/);
    
    // Verificar que el contenido de la página de clientes ha cargado
    await expect(page.getByRole('heading', { name: /Clientes|Clients/i })).toBeVisible({ timeout: 10000 });
    
    console.log('Navegación móvil a clientes completada exitosamente');
    
    // Captura de pantalla final
    await page.screenshot({ path: './test-results/mobile-navigation-complete.png' });
  });
});