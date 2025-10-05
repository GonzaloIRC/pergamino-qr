import { test, expect } from '@playwright/test';

// Esta prueba se enfoca específicamente en la funcionalidad de exportación de KPIs
test.describe('KPI Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'admin@pergamino.test');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'test1234');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('/dashboard');
  });
  
  test('should export KPI data from dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Check that KPI export button exists
    await expect(page.locator('[data-testid="kpi-export-icon"]')).toBeVisible();
    
    // Setup download event listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click KPI export button
    await page.click('[data-testid="kpi-export-icon"]');
    
    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download.suggestedFilename()).toContain('kpis-pergamino');
    
    // Check success message appears
    await expect(page.locator('text=KPIs exportados exitosamente')).toBeVisible();
    
    // Verify download path exists
    const path = await download.path();
    expect(path).toBeTruthy();
  });
  
  test('should export history data with filters', async ({ page }) => {
    // Navigate to history page
    await page.goto('/history');
    
    // Apply filters
    await page.fill('[data-testid="history-dni-filter"]', '12345678');
    await page.click('[data-testid="history-search-button"]');
    
    // Wait for results to load
    await expect(page.locator('[data-testid="history-table"]')).toBeVisible();
    
    // Setup download event listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('[data-testid="export-csv-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download.suggestedFilename()).toContain('historial-pergamino');
    
    // Check success message appears
    await expect(page.locator('text=Historial exportado exitosamente')).toBeVisible();
    
    // Verify download path exists
    const path = await download.path();
    expect(path).toBeTruthy();
  });
});