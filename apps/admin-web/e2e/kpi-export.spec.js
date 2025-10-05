import { test, expect } from '@playwright/test';

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
  
  test('should display the sidebar with navigation items', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check that sidebar exists
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Check that it contains important navigation links
    await expect(page.locator('[data-testid="sidebar-nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-nav-history"]')).toBeVisible();
    
    // Test sidebar navigation
    await page.click('[data-testid="sidebar-nav-history"]');
    await expect(page).toHaveURL(/.*history/);
    
    // Navigate back to dashboard
    await page.click('[data-testid="sidebar-nav-dashboard"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display dashboard with KPI metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for dashboard to load and verify all KPIs are visible
    await expect(page.locator('[data-testid="dashboard-kpi-grid"]')).toBeVisible();
    
    // Check that all required KPI cards are displayed
    await expect(page.locator('[data-testid="kpi-total-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-new-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-active-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-total-transactions"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-total-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-avg-transaction"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-total-tables"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-active-tables"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-table-utilization"]')).toBeVisible();
    
    // Verify that KPI cards contain actual numeric data (not just placeholder text)
    for (const kpiId of ['kpi-total-customers', 'kpi-total-transactions', 'kpi-active-tables']) {
      const kpiValue = await page.locator(`[data-testid="${kpiId}"]`).textContent();
      expect(kpiValue).toMatch(/\d+/); // Should contain at least one digit
    }
    
    // Check that date picker is working
    await page.click('[data-testid="dashboard-date-picker"]');
    await page.click('text=Último mes');
    
    // Wait for data to reload
    await expect(page.locator('[data-testid="dashboard-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-loading"]')).not.toBeVisible();
    
    // Verify last updated timestamp is present
    await expect(page.locator('[data-testid="dashboard-last-updated"]')).toContainText('Última actualización');
  });

  test('should navigate to history page and show filters', async ({ page }) => {
    await page.goto('/history');
    
    // Check that history page loaded
    await expect(page.locator('h1')).toContainText('Historial');
    
    // Check filters are present
    await expect(page.locator('[data-testid="history-filters"]')).toBeVisible();
    
    // Expand filters section
    await page.click('text=Mostrar filtros');
    
    // Check additional filters are visible
    await expect(page.locator('[data-testid="history-table-filter"]')).toBeVisible();
  });

  test('should filter history by DNI', async ({ page }) => {
    await page.goto('/history');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="history-table"]')).toBeVisible();
    
    // Filter by DNI
    await page.fill('[data-testid="history-dni-filter"]', '12345678');
    await page.click('[data-testid="history-search-button"]');
    
    // Check that results are filtered
    await expect(page.locator('[data-testid="history-loading"]')).not.toBeVisible();
    
    // Either we have filtered results or an empty state
    const hasResults = await page.locator('text=12345678').count() > 0;
    if (!hasResults) {
      await expect(page.locator('[data-testid="history-empty"]')).toBeVisible();
    }
  });

  test('should export history data to CSV', async ({ page, context }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    await page.goto('/history');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="history-table"]')).toBeVisible();
    
    // Verify export button is visible and enabled
    const exportButton = page.locator('[data-testid="export-csv-button"]');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
    
    // Take screenshot of export button for visual verification
    await exportButton.screenshot({ path: 'test-results/export-button.png' });
    
    // Click export button
    await page.click('[data-testid="export-csv-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
    
    // Save file and check content
    const path = await download.path();
    expect(path).toBeTruthy();
    
    // Save file for inspection
    const savedPath = `test-results/history-export-${new Date().getTime()}.csv`;
    await download.saveAs(savedPath);
    
    // Verify toast notification appears
    await expect(page.locator('text=Exportación exitosa')).toBeVisible();
    
    // After export, button should still be visible and enabled for further exports
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
  });
  
  test('should handle permissions for export functionality', async ({ page }) => {
    // First, ensure we're testing with a user who doesn't have export permissions
    // This requires setting up a test user with limited permissions before the test
    
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.LIMITED_USER_EMAIL || 'limited@pergamino.test');
    await page.fill('input[name="password"]', process.env.LIMITED_USER_PASSWORD || 'limited1234');
    await page.click('button[type="submit"]');
    
    await page.goto('/history');
    
    // Check that export button is not visible for users without permission
    await expect(page.locator('[data-testid="export-csv-button"]')).toHaveCount(0);
  });
});