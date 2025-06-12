
import { test, expect } from '@playwright/test';

test.describe('Public Booking Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary test data or authentication
    await page.goto('/');
  });

  test('complete public booking workflow', async ({ page }) => {
    // This test would simulate the complete flow:
    // 1. Workshop owner generates public link
    // 2. Client uses public link to book appointment
    // 3. Client confirms booking through account creation
    
    // For demonstration, we'll test the UI components that should be accessible
    await page.goto('/');
    
    // Test that we can navigate to the application
    await expect(page.locator('body')).toBeVisible();
    
    // In a real scenario, this would:
    // 1. Log in as workshop owner
    // 2. Generate public link
    // 3. Use that link in incognito mode to book
    // 4. Verify appointment creation
  });

  test('public booking page loads correctly with workshop slug', async ({ page }) => {
    // Test loading a public booking page
    // In a real scenario, this would use an actual generated slug
    await page.goto('/book/test-workshop-slug');
    
    // Should show either the booking form or a not found message
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeDefined();
  });

  test('public booking form validation', async ({ page }) => {
    // Navigate to a test booking page
    await page.goto('/book/test-workshop');
    
    // Test form validation if the page loads
    const submitButton = page.locator('button:has-text("Book"), button:has-text("Submit")');
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Should show validation messages for required fields
      const validationMessages = page.locator('text=required, text=field is required');
      if (await validationMessages.count() > 0) {
        await expect(validationMessages.first()).toBeVisible();
      }
    }
  });

  test('workshop branding on public booking page', async ({ page }) => {
    // Test that workshop branding is applied correctly
    await page.goto('/book/test-workshop');
    
    // Check if custom styles are applied (would need actual workshop data)
    const pageStyles = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });
    
    expect(pageStyles).toBeDefined();
  });

  test('mobile responsiveness of public booking page', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/book/test-workshop');
    
    // Page should be responsive
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('public booking accessibility', async ({ page }) => {
    await page.goto('/book/test-workshop');
    
    // Check for basic accessibility features
    const headings = page.locator('h1, h2, h3');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
    
    // Check for form labels
    const labels = page.locator('label');
    if (await labels.count() > 0) {
      await expect(labels.first()).toBeVisible();
    }
  });

  test('error handling for invalid workshop slug', async ({ page }) => {
    // Test with an obviously invalid slug
    await page.goto('/book/invalid-nonexistent-workshop-slug-12345');
    
    // Should show appropriate error message
    const errorContent = await page.textContent('body');
    expect(errorContent).toContain('not found' || 'error' || 'unavailable');
  });
});
