import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas sin servidor web
 * Esta configuración es útil para ejecutar pruebas sin iniciar un servidor local.
 */
export default defineConfig({
    testDir: './apps/admin-web/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:3000', // URL base, aunque no se use
        trace: 'on-first-retry',

        // Configuración del navegador
        viewport: { width: 1280, height: 720 },

        // Tiempos de espera
        actionTimeout: 10000,
        navigationTimeout: 15000,

        // Capturas de pantalla
        screenshot: 'only-on-failure',
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

    // Eliminar la configuración del servidor web
    // webServer: {
    //   command: 'npm run start:test',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});