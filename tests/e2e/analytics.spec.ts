import { test, expect } from '@playwright/test';

test.describe('Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login before each test
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_ADMIN_PASSWORD || 'testpassword';
    
    await page.goto('/');
    await page.getByLabel(/correo electrónico/i).fill(testEmail);
    await page.getByLabel(/contraseña/i).fill(testPassword);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Navigate to analytics page
    await page.getByRole('link', { name: /analytics/i }).click();
    await expect(page).toHaveURL(/analytics/);
  });
  
  test('displays KPI cards', async ({ page }) => {
    // Check that KPI cards are visible
    await expect(page.getByTestId('kpi-card-total-users')).toBeVisible();
    await expect(page.getByTestId('kpi-card-active-users')).toBeVisible();
    await expect(page.getByTestId('kpi-card-transactions')).toBeVisible();
  });
  
  test('can filter analytics by date range', async ({ page }) => {
    // Open date range picker
    await page.getByRole('button', { name: /filtrar por fecha/i }).click();
    
    // Select last 7 days
    await page.getByRole('option', { name: /últimos 7 días/i }).click();
    
    // Check that data was refreshed
    await expect(page.getByText(/datos filtrados/i)).toBeVisible();
  });
  
  test('can download CSV data', async ({ page, context }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.getByRole('button', { name: /exportar csv/i }).click();
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download started with correct filename
    expect(download.suggestedFilename()).toContain('.csv');
  });
  
  test('charts load with data', async ({ page }) => {
    // Check for charts
    await expect(page.locator('.recharts-surface')).toBeVisible();
    
    // Check for data points in charts
    await expect(page.locator('.recharts-dot')).toBeVisible();
  });
});