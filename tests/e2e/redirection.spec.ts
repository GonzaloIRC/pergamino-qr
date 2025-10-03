import { test, expect } from "@playwright/test";

test("Redirección a login desde raíz", async ({ page }) => {
  // Visitar la página principal
  await page.goto("/");
  
  // Esperar a que se complete cualquier redirección (máximo 5 segundos)
  await page.waitForTimeout(5000);
  
  // Obtener la URL actual
  const currentUrl = page.url();
  console.log("URL después de posible redirección: " + currentUrl);
  
  // Tomar una captura de la página
  await page.screenshot({ path: "./test-results/redirection-test.png" });
  
  // Verificar si hay elementos del formulario de login
  const emailField = await page.locator("input[type=email], input[name=email], input[id=email]").count();
  const passwordField = await page.locator("input[type=password], input[name=password]").count();
  
  console.log(`Elementos de formulario encontrados: Email (${emailField}), Password (${passwordField})`);
  
  // También verificar si la URL contiene "login" o si estamos en dashboard
  console.log(`¿La URL contiene "login"? ${currentUrl.includes("login")}`);
  console.log(`¿La URL contiene "dashboard"? ${currentUrl.includes("dashboard")}`);
});
