import { test } from "@playwright/test";

test("Inicio de sesión con usuario real", async ({ page }) => {
  // Credenciales de usuario real
  const email = "admin@local.test";
  const password = "Admin123!";
  
  // Ir a la página de login
  await page.goto("/login");
  
  // Esperar a que se cargue la página
  await page.waitForLoadState("networkidle");
  
  console.log("Intentando iniciar sesión con usuario real:", email);
  
  // Rellenar el formulario
  await page.locator("input[type=email], input[name=email], input[id=email]").fill(email);
  await page.locator("input[type=password], input[name=password], input[id=password]").fill(password);
  
  // Tomar captura antes de enviar
  await page.screenshot({ path: "./test-results/real-login-before.png" });
  
  // Hacer clic en el botón de envío
  await page.locator("button[type=submit]").click();
  
  // Esperar un poco más para la autenticación con Firebase real
  await page.waitForTimeout(5000);
  
  // Tomar captura después del envío
  await page.screenshot({ path: "./test-results/real-login-after.png" });
  
  // Verificar la URL actual
  const currentUrl = page.url();
  console.log("URL después del intento de login:", currentUrl);
  
  // Verificar si hay algún mensaje de error visible
  const errorText = await page.locator("text=inválid, text=error, text=incorrec").count();
  console.log(`¿Hay mensajes de error? ${errorText > 0 ? "Sí" : "No"}`);
  
  // Verificar si el formulario de login sigue visible
  const loginForm = await page.locator("form input[type=email]").count();
  console.log(`¿El formulario de login sigue visible? ${loginForm > 0 ? "Sí" : "No"}`);
  
  // Verificar si se ve algún elemento del dashboard (sidebar)
  const sidebarElements = await page.locator("[data-testid='sidebar-nav'], [data-testid^='nav-']").count();
  console.log(`¿Se ven elementos del sidebar? ${sidebarElements > 0 ? "Sí" : "No"}`);
  
  // En este punto, el login es considerado exitoso si:
  // 1. No hay mensajes de error
  // 2. Ya no estamos en /login o hemos sido redirigidos a otra página
  // 3. El formulario de login ya no es visible
  
  const success = 
    errorText === 0 && 
    (!currentUrl.includes("/login") || await page.locator("form").count() === 0);
  
  console.log(`Login considerado ${success ? "EXITOSO" : "FALLIDO"} según los criterios de la prueba`);
  
  // Esta prueba es solo informativa, no tiene assertions que la hagan fallar
  // En un escenario real, añadiríamos expect() para verificar la redirección
});
