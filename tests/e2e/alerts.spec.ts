import { test, expect } from '@playwright/test';

test.describe('Alerts Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login before each test
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_ADMIN_PASSWORD || 'testpassword';
    
    await page.goto('/');
    await page.getByLabel(/correo electrónico/i).fill(testEmail);
    await page.getByLabel(/contraseña/i).fill(testPassword);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Navigate to alerts page
    await page.getByRole('link', { name: /alerts/i }).click();
    await expect(page).toHaveURL(/alerts/);
  });
  
  test('displays alerts list', async ({ page }) => {
    // Check that alerts table is visible
    await expect(page.getByRole('table')).toBeVisible();
    
    // Check that alert headers are visible
    await expect(page.getByRole('columnheader', { name: /tipo/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /estado/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /fecha/i })).toBeVisible();
  });
  
  test('can filter alerts by type', async ({ page }) => {
    // Open filter dropdown
    await page.getByRole('button', { name: /filtrar por tipo/i }).click();
    
    // Select a specific alert type
    await page.getByRole('option', { name: /weekly limit/i }).click();
    
    // Check that filter was applied
    await expect(page.getByText(/filtros aplicados/i)).toBeVisible();
  });
  
  test('can filter alerts by status', async ({ page }) => {
    // Open status filter dropdown
    await page.getByRole('button', { name: /filtrar por estado/i }).click();
    
    // Select pending status
    await page.getByRole('option', { name: /pendiente/i }).click();
    
    // Check that filter was applied
    await expect(page.getByText(/filtros aplicados/i)).toBeVisible();
  });
  
  test('can view alert details', async ({ page }) => {
    // Click on first alert row
    await page.getByRole('row').nth(1).click();
    
    // Check that detail modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /detalles de alerta/i })).toBeVisible();
    
    // Close the modal
    await page.getByRole('button', { name: /cerrar/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
  
  test('can update alert status', async ({ page }) => {
    // Click on first alert row
    await page.getByRole('row').nth(1).click();
    
    // Wait for dialog to be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Change alert status
    await page.getByRole('button', { name: /cambiar estado/i }).click();
    await page.getByRole('option', { name: /resuelto/i }).click();
    await page.getByRole('button', { name: /guardar/i }).click();
    
    // Check for success message
    await expect(page.getByText(/estado actualizado/i)).toBeVisible();
  });
});