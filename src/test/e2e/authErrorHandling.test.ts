
import { test, expect } from '@playwright/test';

test.describe('Authentication Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Mock console to capture logs
    await page.addInitScript(() => {
      window.console.log = (...args) => {
        window.testLogs = window.testLogs || [];
        window.testLogs.push(args.join(' '));
      };
    });
  });

  test('should handle profile fetch timeout gracefully', async ({ page }) => {
    // Mock Supabase to simulate slow profile fetch
    await page.route('**/rest/v1/profiles*', async (route) => {
      // Delay response to simulate timeout
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.fulfill({
        status: 408,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Request timeout' })
      });
    });

    await page.goto('/');
    
    // Should show loading initially
    await expect(page.locator('text=Loading Dashboard...')).toBeVisible();
    
    // Should eventually show error state (with timeout)
    await expect(page.locator('text=Failed to load your profile')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Request timeout')).toBeVisible();
  });

  test('should handle RLS policy violations', async ({ page }) => {
    // Mock authentication to return user but profile fetch to fail with RLS error
    await page.route('**/auth/v1/token*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-123', email: 'test@example.com' }
        })
      });
    });

    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ 
          message: 'new row violates row-level security policy',
          code: 'PGRST301'
        })
      });
    });

    await page.goto('/');
    
    // Should show RLS error
    await expect(page.locator('text=Failed to load your profile')).toBeVisible();
    await expect(page.locator('text=new row violates row-level security policy')).toBeVisible();
    
    // Should have reload button
    await expect(page.locator('button:has-text("Reload Page")')).toBeVisible();
  });

  test('should retry on network errors', async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/rest/v1/profiles*', async (route) => {
      requestCount++;
      
      if (requestCount <= 2) {
        // First two requests fail with network error
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ 
            message: 'Network error',
            code: 'PGRST000'
          })
        });
      } else {
        // Third request succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: 'user-123',
            full_name: 'Test User',
            role: 'client',
            tenant_id: 'tenant-123',
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: null,
          }])
        });
      }
    });

    await page.goto('/');
    
    // Should eventually succeed after retries
    await expect(page.locator('text=Loading Dashboard...')).toBeVisible();
    
    // Wait for retries to complete and success
    await page.waitForTimeout(3000);
    
    // Should not show error after successful retry
    await expect(page.locator('text=Failed to load your profile')).not.toBeVisible();
  });

  test('should provide clear error messages for different scenarios', async ({ page }) => {
    const testScenarios = [
      {
        name: 'Permission denied',
        status: 403,
        error: { message: 'Permission denied', code: 'PGRST301' },
        expectedText: 'Permission denied'
      },
      {
        name: 'Profile not found',
        status: 404,
        error: { message: 'Profile not found', code: 'PGRST116' },
        expectedText: 'Profile not found'
      },
      {
        name: 'Database connection error',
        status: 503,
        error: { message: 'Database unavailable', code: 'PGRST003' },
        expectedText: 'Database unavailable'
      }
    ];

    for (const scenario of testScenarios) {
      await page.route('**/rest/v1/profiles*', async (route) => {
        await route.fulfill({
          status: scenario.status,
          contentType: 'application/json',
          body: JSON.stringify(scenario.error)
        });
      });

      await page.goto('/');
      
      await expect(page.locator('text=Failed to load your profile')).toBeVisible();
      await expect(page.locator(`text=${scenario.expectedText}`)).toBeVisible();
      
      // Clear route for next scenario
      await page.unroute('**/rest/v1/profiles*');
    }
  });
});
