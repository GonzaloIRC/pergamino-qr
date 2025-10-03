import { test, expect } from '@playwright/test';

test.describe('Maintenance Mode', () => {
  test('displays maintenance page when system is in maintenance mode', async ({ page, request }) => {
    // For this test, we need to simulate maintenance mode being active
    // In a real scenario, you would update this in your database or config
    
    // This is a mock implementation - in a real app, you would set maintenance mode via API or database
    // Mock example: Update maintenance status via API if available
    /*
    await request.post('/api/admin/maintenance', {
      data: {
        isMaintenanceMode: true,
        maintenanceMessage: 'System under maintenance. Please try again later.'
      }
    });
    */
    
    // Visit the site (assuming maintenance mode is active)
    await page.goto('/');
    
    // Check if maintenance mode is displayed
    await expect(page.getByText(/sistema en mantenimiento/i)).toBeVisible();
    await expect(page.getByText(/vuelva a intentarlo más tarde/i)).toBeVisible();
    
    // Verify that normal content is not accessible
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).not.toBeVisible();
    
    // After test, reset maintenance mode
    /*
    await request.post('/api/admin/maintenance', {
      data: {
        isMaintenanceMode: false
      }
    });
    */
  });

  test('maintenance mode can be toggled by admin', async ({ page }) => {
    // Log in as admin
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_ADMIN_PASSWORD || 'testpassword';
    
    await page.goto('/');
    await page.getByLabel(/correo electrónico/i).fill(testEmail);
    await page.getByLabel(/contraseña/i).fill(testPassword);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Navigate to admin settings page
    await page.getByRole('link', { name: /configuración/i }).click();
    await expect(page).toHaveURL(/settings/);
    
    // Toggle maintenance mode on
    await page.getByRole('switch', { name: /modo de mantenimiento/i }).click();
    
    // Confirm activation
    await page.getByRole('button', { name: /confirmar/i }).click();
    
    // Check for success message
    await expect(page.getByText(/modo de mantenimiento activado/i)).toBeVisible();
    
    // Toggle maintenance mode off
    await page.getByRole('switch', { name: /modo de mantenimiento/i }).click();
    
    // Confirm deactivation
    await page.getByRole('button', { name: /confirmar/i }).click();
    
    // Check for success message
    await expect(page.getByText(/modo de mantenimiento desactivado/i)).toBeVisible();
  });
});