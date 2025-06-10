import { test, expect } from '@playwright/test';

test.describe('Quotation Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Use real authentication instead of mocked localStorage
    // Users will need to actually log in for E2E tests
  });

  test('should load quotations page', async ({ page }) => {
    // Navigate to quotations page
    await page.click('[data-testid="quotations-nav"]');
    
    // Wait for quotations to load
    await page.waitForSelector('[data-testid="quotation-list"]');
    
    // Basic UI verification without hardcoded data
    await expect(page.locator('[data-testid="quotation-list"]')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to quotations
    await page.click('[data-testid="quotations-nav"]');
    
    // Verify mobile layout works
    await expect(page.locator('[data-testid="quotation-list"]')).toBeVisible();
  });
});
