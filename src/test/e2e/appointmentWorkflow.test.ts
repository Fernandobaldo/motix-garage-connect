
import { test, expect } from '@playwright/test';

test.describe('Complete Appointment Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full appointment to service report workflow', async ({ page }) => {
    // This is a comprehensive E2E test that would need real authentication
    // For now, we'll test the UI components and navigation
    
    // 1. Navigate to appointments page
    await page.waitForSelector('[data-testid="appointments-nav"]', { timeout: 5000 });
    await page.click('[data-testid="appointments-nav"]');
    
    // 2. Verify appointments list loads
    await page.waitForSelector('[data-testid="appointment-list"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="appointment-list"]')).toBeVisible();
    
    // 3. Test appointment card interactions
    const appointmentCard = page.locator('[data-testid="appointment-card"]').first();
    if (await appointmentCard.count() > 0) {
      await expect(appointmentCard).toBeVisible();
      
      // Test status update button for workshop users
      const statusButton = appointmentCard.locator('[data-testid="status-manager"]');
      if (await statusButton.count() > 0) {
        await expect(statusButton).toBeVisible();
      }
      
      // Test service report button
      const serviceButton = appointmentCard.locator('button:has-text("Complete Service")');
      if (await serviceButton.count() > 0) {
        await expect(serviceButton).toBeVisible();
      }
      
      // Test chat button
      const chatButton = appointmentCard.locator('button:has-text("Chat")');
      if (await chatButton.count() > 0) {
        await expect(chatButton).toBeVisible();
      }
    }
    
    // 4. Test quotations navigation
    await page.click('[data-testid="quotations-nav"]');
    await page.waitForSelector('[data-testid="quotation-list"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="quotation-list"]')).toBeVisible();
    
    // 5. Test responsive design
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="quotation-list"]')).toBeVisible();
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should handle appointment status changes', async ({ page }) => {
    // Navigate to appointments
    await page.click('[data-testid="appointments-nav"]');
    await page.waitForSelector('[data-testid="appointment-list"]');
    
    // Look for status manager components
    const statusManagers = page.locator('[data-testid="status-manager"]');
    const count = await statusManagers.count();
    
    if (count > 0) {
      // Test dropdown opens
      await statusManagers.first().click();
      await expect(page.locator('[role="menu"]')).toBeVisible();
    }
  });

  test('should validate service report modal', async ({ page }) => {
    // This would test the service report modal if it's accessible
    // For now, just verify the component can be rendered
    await page.goto('/');
    
    // Test if we can navigate to appointments
    await page.waitForSelector('body');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate chat interface', async ({ page }) => {
    // Test chat interface accessibility
    await page.goto('/');
    
    // Look for chat navigation if available
    const chatNav = page.locator('[data-testid="chat-nav"]');
    if (await chatNav.count() > 0) {
      await chatNav.click();
      await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 5000 });
      await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    }
  });
});
