import { test } from "@playwright/test";

test("Intento de inicio de sesión", async ({ page }) => {
  // Credenciales de prueba
  const email = "admin@local.test";
  const password = "Admin123!";
  
  // Ir a la página de login
  await page.goto("/login");
  
  // Esperar a que se cargue la página
  await page.waitForLoadState("networkidle");
  
  console.log("Intentando iniciar sesión con:", email);
  
  // Rellenar el formulario
  await page.locator("input[type=email], input[name=email], input[id=email]").fill(email);
  await page.locator("input[type=password], input[name=password], input[id=password]").fill(password);
  
  // Tomar captura antes de enviar
  await page.screenshot({ path: "./test-results/before-submit-login.png" });
  
  // Hacer clic en el botón de envío
  await page.locator("button[type=submit]").click();
  
  // Esperar un momento para la autenticación
  await page.waitForTimeout(3000);
  
  // Tomar captura después del envío
  await page.screenshot({ path: "./test-results/after-submit-login.png" });
  
  // Verificar la URL actual
  const currentUrl = page.url();
  console.log("URL después del intento de login:", currentUrl);
  
  // Verificar si hay algún mensaje de error visible
  const errorText = await page.locator("text=inválid, text=error, text=incorrec").count();
  console.log(`¿Hay mensajes de error? ${errorText > 0 ? "Sí" : "No"}`);
  
  // Verificar si el formulario de login sigue visible
  const loginForm = await page.locator("form input[type=email]").count();
  console.log(`¿El formulario de login sigue visible? ${loginForm > 0 ? "Sí" : "No"}`);
});
