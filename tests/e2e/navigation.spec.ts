import { test } from "@playwright/test";

test("Navegación con usuario autenticado", async ({ page }) => {
  // Credenciales de usuario real
  const email = "admin@local.test";
  const password = "Admin123!";
  
  // Iniciar sesión primero
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  
  // Rellenar formulario de login
  await page.locator("input[type=email], input[name=email], input[id=email]").fill(email);
  await page.locator("input[type=password], input[name=password], input[id=password]").fill(password);
  await page.locator("button[type=submit]").click();
  
  // Esperar redirección al dashboard
  await page.waitForTimeout(5000);
  
  // Verificar URL actual
  let currentUrl = page.url();
  console.log("Después de login, URL:", currentUrl);
  
  // Intentar navegar a las diferentes secciones
  console.log("\n--- Probando navegación ---");
  
  // Analytics
  try {
    await page.locator("[data-testid='nav-analytics'], a[href='/analytics']").click();
    await page.waitForTimeout(1000);
    console.log("Analytics - URL:", page.url());
    await page.screenshot({ path: "./test-results/nav-analytics.png" });
  } catch (e) {
    console.log("Error en Analytics:", e.message);
  }
  
  // Alerts
  try {
    await page.locator("[data-testid='nav-alerts'], a[href='/alerts']").click();
    await page.waitForTimeout(1000);
    console.log("Alerts - URL:", page.url());
    await page.screenshot({ path: "./test-results/nav-alerts.png" });
  } catch (e) {
    console.log("Error en Alerts:", e.message);
  }
  
  // Settings
  try {
    await page.locator("[data-testid='nav-settings'], a[href='/settings']").click();
    await page.waitForTimeout(1000);
    console.log("Settings - URL:", page.url());
    await page.screenshot({ path: "./test-results/nav-settings.png" });
  } catch (e) {
    console.log("Error en Settings:", e.message);
  }
  
  // Volver al dashboard
  try {
    await page.locator("[data-testid='nav-dashboard'], a[href='/dashboard']").click();
    await page.waitForTimeout(1000);
    console.log("Dashboard - URL:", page.url());
    await page.screenshot({ path: "./test-results/nav-dashboard.png" });
  } catch (e) {
    console.log("Error en Dashboard:", e.message);
  }
  
  console.log("\nPrueba de navegación completada");
});
