
import { test, expect } from '@playwright/test';

test.describe('Plan-based Permissions E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test data and authentication
    await page.goto('/');
  });

  test('free user should see upgrade prompts for premium features', async ({ page }) => {
    // Mock free plan user
    await page.addInitScript(() => {
      window.localStorage.setItem('test-plan', 'free');
    });

    await page.goto('/dashboard');

    // Navigate to messages tab (chat feature)
    await page.click('[data-testid="messages-tab"]');

    // Should see upgrade prompt
    await expect(page.getByText('Premium Feature')).toBeVisible();
    await expect(page.getByText('This feature is available starting from the starter plan')).toBeVisible();
    await expect(page.getByText('Upgrade Now')).toBeVisible();
  });

  test('starter user should access chat but not file uploads', async ({ page }) => {
    // Mock starter plan user
    await page.addInitScript(() => {
      window.localStorage.setItem('test-plan', 'starter');
    });

    await page.goto('/dashboard');

    // Navigate to messages tab
    await page.click('[data-testid="messages-tab"]');

    // Should see chat interface (not upgrade prompt)
    await expect(page.getByText('Premium Feature')).not.toBeVisible();
    
    // Try to upload a file in chat
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await expect(fileInput).toBeDisabled();
    }
  });

  test('pro user should access all features except enterprise', async ({ page }) => {
    // Mock pro plan user
    await page.addInitScript(() => {
      window.localStorage.setItem('test-plan', 'pro');
    });

    await page.goto('/dashboard');

    // Should access chat
    await page.click('[data-testid="messages-tab"]');
    await expect(page.getByText('Premium Feature')).not.toBeVisible();

    // Should access file uploads in chat
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await expect(fileInput).toBeEnabled();
    }

    // Navigate to quotations (should work)
    await page.click('[data-testid="quotations-tab"]');
    await expect(page.getByText('Premium Feature')).not.toBeVisible();
  });

  test('enterprise user should access all features', async ({ page }) => {
    // Mock enterprise plan user
    await page.addInitScript(() => {
      window.localStorage.setItem('test-plan', 'enterprise');
    });

    await page.goto('/dashboard');

    // Test all major features are accessible
    const tabs = ['appointments-tab', 'messages-tab', 'quotations-tab', 'vehicles-tab'];
    
    for (const tab of tabs) {
      await page.click(`[data-testid="${tab}"]`);
      await expect(page.getByText('Premium Feature')).not.toBeVisible();
    }
  });

  test('upgrade button should show appropriate upgrade message', async ({ page }) => {
    // Mock free plan user
    await page.addInitScript(() => {
      window.localStorage.setItem('test-plan', 'free');
    });

    await page.goto('/dashboard');

    // Navigate to a premium feature
    await page.click('[data-testid="messages-tab"]');

    // Click upgrade button
    await page.click('text=Upgrade Now');

    // Should show upgrade toast/modal
    await expect(page.getByText('Upgrade Required')).toBeVisible();
  });

  test('plan limits should be displayed correctly', async ({ page }) => {
    // Mock free plan user
    await page.addInitScript(() => {
      window.localStorage.setItem('test-plan', 'free');
    });

    await page.goto('/dashboard');

    // Should show plan limits in stats
    await expect(page.getByText('/ 10 limit')).toBeVisible(); // appointment limit
    await expect(page.getByText('/ 3 limit')).toBeVisible(); // vehicle limit
  });
});
