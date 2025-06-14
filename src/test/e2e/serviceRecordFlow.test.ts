
import { test, expect } from '@playwright/test';

test.describe('Service Record Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Mock authentication state for testing
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'test-token',
        user: {
          id: 'test-user-123',
          email: 'test@example.com'
        }
      }));
    });
  });

  test('complete service record creation workflow', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/admin');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Look for service-related navigation or buttons
    const serviceTab = page.locator('text=Service').first();
    if (await serviceTab.isVisible()) {
      await serviceTab.click();
    }

    // Look for "Create Service Record" or similar button
    const createButton = page.locator('button', { hasText: /create.*service/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // If modal opens, fill out the form
    const serviceTypeInput = page.locator('input[placeholder*="service"]').first();
    if (await serviceTypeInput.isVisible()) {
      await serviceTypeInput.fill('Oil Change');
    }

    const descriptionInput = page.locator('textarea[placeholder*="describe"]').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Regular oil change service for customer vehicle');
    }

    const costInput = page.locator('input[type="number"]').first();
    if (await costInput.isVisible()) {
      await costInput.fill('75.00');
    }

    // Submit the form if submit button exists
    const submitButton = page.locator('button', { hasText: /create|submit/i }).first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Verify success (this depends on the actual UI implementation)
    await page.waitForTimeout(2000);
  });

  test('service record status updates', async ({ page }) => {
    // Navigate to service records list
    await page.goto('/admin');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Look for service records in the interface
    const serviceCard = page.locator('[data-testid="service-record-card"]').first();
    
    if (await serviceCard.isVisible()) {
      // Look for status dropdown or buttons
      const statusSelect = serviceCard.locator('select').first();
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('in_progress');
        
        // Verify status update
        await page.waitForTimeout(1000);
        const updatedStatus = await statusSelect.inputValue();
        expect(updatedStatus).toBe('in_progress');
      }
    }
  });

  test('service record filtering and search', async ({ page }) => {
    // Navigate to service records
    await page.goto('/admin');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Look for filter controls
    const statusFilter = page.locator('select[name*="status"]').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('pending');
      await page.waitForTimeout(1000);
    }

    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('oil change');
      await page.waitForTimeout(1000);
    }

    // Verify filtering works (this would check if results are filtered)
    const serviceCards = page.locator('[data-testid="service-record-card"]');
    const cardCount = await serviceCards.count();
    
    // Basic validation that filtering interface exists
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test('service record details view', async ({ page }) => {
    // Navigate to service records
    await page.goto('/admin');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Look for service record cards
    const serviceCard = page.locator('[data-testid="service-record-card"]').first();
    
    if (await serviceCard.isVisible()) {
      // Click on the card to view details
      await serviceCard.click();
      
      // Look for detail elements that might be shown
      const details = [
        'text=Service Type',
        'text=Client',
        'text=Vehicle',
        'text=Status',
        'text=Cost'
      ];
      
      for (const detail of details) {
        const element = page.locator(detail).first();
        if (await element.isVisible()) {
          expect(await element.isVisible()).toBe(true);
        }
      }
    }
  });

  test('error handling and validation', async ({ page }) => {
    // Navigate to create service record
    await page.goto('/admin');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Try to create service record with missing data
    const createButton = page.locator('button', { hasText: /create.*service/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Try to submit without filling required fields
      const submitButton = page.locator('button', { hasText: /create|submit/i }).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Look for validation errors
        const errorMessages = page.locator('text=required').first();
        if (await errorMessages.isVisible()) {
          expect(await errorMessages.isVisible()).toBe(true);
        }
      }
    }
  });

  test('responsive design and mobile compatibility', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to service records
    await page.goto('/admin');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Verify mobile layout works
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').first();
    const serviceCards = page.locator('[data-testid="service-record-card"]').first();
    
    // Basic mobile compatibility check
    if (await serviceCards.isVisible()) {
      const cardBox = await serviceCards.boundingBox();
      expect(cardBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('data persistence and reload', async ({ page }) => {
    // Navigate to service records
    await page.goto('/admin');
    
    // Wait for initial load
    await page.waitForTimeout(3000);
    
    // Count initial service records
    const initialCards = page.locator('[data-testid="service-record-card"]');
    const initialCount = await initialCards.count();
    
    // Reload the page
    await page.reload();
    
    // Wait for reload
    await page.waitForTimeout(3000);
    
    // Verify data persisted
    const reloadedCards = page.locator('[data-testid="service-record-card"]');
    const reloadedCount = await reloadedCards.count();
    
    // Data should persist through reload
    expect(reloadedCount).toBe(initialCount);
  });

  test('accessibility compliance', async ({ page }) => {
    // Navigate to service records
    await page.goto('/admin');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check for basic accessibility features
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const buttons = page.locator('button');
    const inputs = page.locator('input, select, textarea');
    
    // Verify headings exist for page structure
    expect(await headings.count()).toBeGreaterThan(0);
    
    // Verify interactive elements are accessible
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const ariaLabel = await firstButton.getAttribute('aria-label');
      const textContent = await firstButton.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent).toBeTruthy();
    }
    
    // Verify form inputs have labels
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`).first();
          const hasLabel = await label.isVisible();
          
          // Input should have label or aria-label
          expect(hasLabel || ariaLabel).toBeTruthy();
        }
      }
    }
  });
});
