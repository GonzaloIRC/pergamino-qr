import { test as base, expect } from '@playwright/test';
import { Page } from '@playwright/test';

// Extend the base test with authentication helpers
export const test = base.extend({
  // Authenticated page
  authenticatedPage: async ({ page }, use) => {
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_ADMIN_PASSWORD || 'testpassword';
    
    await page.goto('/');
    await page.getByLabel(/correo electrónico/i).fill(testEmail);
    await page.getByLabel(/contraseña/i).fill(testPassword);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Wait for successful login (dashboard page loads)
    await expect(page).toHaveURL(/dashboard/);
    
    // Use the authenticated page
    await use(page);
  },
});

// Re-export expect for convenience
export { expect };