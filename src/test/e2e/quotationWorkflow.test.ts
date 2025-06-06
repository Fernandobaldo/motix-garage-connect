
import { test, expect } from '@playwright/test';

test.describe('Quotation Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Mock authentication state if needed
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user', email: 'test@example.com', role: 'client' }
      }));
    });
  });

  test('should complete full quotation workflow', async ({ page }) => {
    // Navigate to quotations page
    await page.click('[data-testid="quotations-nav"]');
    
    // Wait for quotations to load
    await page.waitForSelector('[data-testid="quotation-list"]');
    
    // Check if quotations are displayed
    const quotationItems = await page.locator('[data-testid="quotation-item"]').count();
    expect(quotationItems).toBeGreaterThan(0);
    
    // Click on first quotation to view details
    await page.click('[data-testid="quotation-item"]:first-child');
    
    // Wait for modal to open
    await page.waitForSelector('[data-testid="quotation-modal"]');
    
    // Verify quotation details are displayed
    await expect(page.locator('[data-testid="quote-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="quote-total"]')).toBeVisible();
    
    // Test PDF download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-pdf-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/quotation.*\.pdf/);
  });

  test('should handle quotation approval workflow', async ({ page }) => {
    // Navigate to quotations page
    await page.click('[data-testid="quotations-nav"]');
    
    // Find a pending quotation
    const pendingQuotation = page.locator('[data-testid="quotation-item"]').filter({
      has: page.locator('text=pending')
    }).first();
    
    if (await pendingQuotation.count() > 0) {
      // Click approve button
      await pendingQuotation.locator('[data-testid="approve-button"]').click();
      
      // Wait for status update
      await page.waitForSelector('text=approved', { timeout: 5000 });
      
      // Verify status changed
      await expect(pendingQuotation.locator('text=approved')).toBeVisible();
    }
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to quotations
    await page.click('[data-testid="quotations-nav"]');
    
    // Verify mobile layout works
    await expect(page.locator('[data-testid="quotation-list"]')).toBeVisible();
    
    // Test mobile interactions
    await page.click('[data-testid="quotation-item"]:first-child');
    await page.waitForSelector('[data-testid="quotation-modal"]');
    
    // Verify modal is responsive on mobile
    const modal = page.locator('[data-testid="quotation-modal"]');
    const boundingBox = await modal.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });
});
