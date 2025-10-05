import { defineConfig } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas sin servidor
 * Esta configuración es útil para ejecutar pruebas con un servidor existente
 * o para pruebas que no requieren un servidor local.
 */
export default defineConfig({
  testDir: './apps/admin-web/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000', // Asume que el servidor ya está en ejecución
    trace: 'on-first-retry',
    
    // Configuración del navegador
    viewport: { width: 1280, height: 720 },
    
    // Tiempos de espera
    actionTimeout: 10000,
    navigationTimeout: 15000,
    
    // Capturas de pantalla
    screenshot: 'only-on-failure',
    
    // Contexto de almacenamiento persistente para mantener la sesión entre tests
    storageState: {
      cookies: [],
      origins: []
    },
  },
  
  // Configuración específica para proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
    
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
      },
    },
    
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
      },
    },
  ],
  
  // Servidor web (comentado porque asumimos que ya está en ejecución)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});