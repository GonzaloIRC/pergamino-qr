import { test, expect } from '@playwright/test';

// Prueba básica de navegación
test('Navegación básica funciona con autenticación', async ({ page }) => {
  // 1. Ir a la página de inicio
  await page.goto('/login');
  
  // 2. Verificar que estamos en la página de login
  await expect(page.locator('h2:text("Pergamino Admin")')).toBeVisible();
  
  // 3. Llenar el formulario de login
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'testpassword');
  
  // 4. Capturar estado antes de enviar
  await page.screenshot({ path: './test-results/antes-login.png' });
  
  // 5. Enviar el formulario
  await page.locator('button:text("Iniciar sesión")').click();
  
  // 6. Esperar redirección (puede tomar tiempo si hay emulador)
  await page.waitForTimeout(3000);
  
  // 7. Capturar estado después del intento de login
  await page.screenshot({ path: './test-results/despues-login.png' });
  
  // 8. Verificar si llegamos al dashboard o si hay un error visible
  const currentUrl = page.url();
  console.log("URL después del intento de login:", currentUrl);
  
  if (currentUrl.includes('/dashboard')) {
    console.log("✅ Login exitoso - Verificando elementos del sidebar");
    
    // Verificar si el sidebar es visible
    const sidebar = page.locator('[data-testid="sidebar-nav"]');
    const sidebarVisible = await sidebar.isVisible();
    
    console.log("Sidebar visible:", sidebarVisible);
    
    if (sidebarVisible) {
      // Intentar hacer clic en un enlace de navegación
      await page.locator('[data-testid="nav-analytics"]').click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './test-results/navegacion-analytics.png' });
      
      // Verificar que la URL cambió
      expect(page.url()).toContain('/analytics');
    } else {
      console.log("⚠️ Sidebar no es visible");
    }
  } else {
    console.log("❌ No se pudo iniciar sesión - Comprobando errores");
    const errorText = await page.locator('.bg-red-50.text-red-700').textContent();
    console.log("Mensaje de error:", errorText);
  }
});