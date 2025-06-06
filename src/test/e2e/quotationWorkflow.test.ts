
import { test, expect, Page } from '@playwright/test';

// E2E Test Pattern for complete workflows
class QuotationWorkflowPage {
  constructor(private page: Page) {}

  async navigateToQuotations() {
    await this.page.goto('/');
    await this.page.click('[data-testid="quotations-tab"]');
  }

  async createNewQuote(quoteData: {
    clientName: string;
    vehicle: string;
    serviceType: string;
    items: Array<{ description: string; quantity: number; price: number }>;
  }) {
    await this.page.click('text=New Quote');
    
    await this.page.fill('[data-testid="client-name"]', quoteData.clientName);
    await this.page.fill('[data-testid="vehicle"]', quoteData.vehicle);
    await this.page.fill('[data-testid="service-type"]', quoteData.serviceType);

    for (const item of quoteData.items) {
      await this.page.fill('[data-testid="item-description"]', item.description);
      await this.page.fill('[data-testid="item-quantity"]', item.quantity.toString());
      await this.page.fill('[data-testid="item-price"]', item.price.toString());
      await this.page.click('[data-testid="add-item"]');
    }

    await this.page.click('text=Send Quote');
  }

  async approveQuote(quoteNumber: string) {
    await this.page.click(`[data-testid="quote-${quoteNumber}"] [data-testid="approve-btn"]`);
  }

  async downloadPDF(quoteNumber: string) {
    const downloadPromise = this.page.waitForDownload();
    await this.page.click(`[data-testid="quote-${quoteNumber}"] [data-testid="download-btn"]`);
    return await downloadPromise;
  }
}

test.describe('Quotation Workflow E2E', () => {
  let quotationPage: QuotationWorkflowPage;

  test.beforeEach(async ({ page }) => {
    quotationPage = new QuotationWorkflowPage(page);
    
    // Setup: Login as workshop user
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', 'workshop@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('text=Sign In');
  });

  test('complete quote creation and approval flow', async ({ page }) => {
    await quotationPage.navigateToQuotations();

    // Create quote
    await quotationPage.createNewQuote({
      clientName: 'John Doe',
      vehicle: '2020 Toyota Camry',
      serviceType: 'Brake Service',
      items: [
        { description: 'Brake Pads', quantity: 2, price: 75 },
        { description: 'Labor', quantity: 1, price: 100 },
      ],
    });

    // Verify quote appears in list
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=$175.00')).toBeVisible();

    // Switch to client view and approve
    await page.click('[data-testid="role-switch-client"]');
    await quotationPage.approveQuote('Q-2024-001');

    // Verify approval
    await expect(page.locator('text=approved')).toBeVisible();
  });

  test('PDF download functionality', async ({ page }) => {
    await quotationPage.navigateToQuotations();

    const download = await quotationPage.downloadPDF('Q-2024-001');
    expect(download.suggestedFilename()).toContain('.pdf');
    expect(download.suggestedFilename()).toContain('Quote-');
  });
});
