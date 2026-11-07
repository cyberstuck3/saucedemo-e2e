import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueBtn: Locator;
  readonly finishBtn: Locator;
  readonly error: Locator;
  readonly completeHeader: Locator;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueBtn = page.locator('[data-test="continue"]');
    this.finishBtn = page.locator('[data-test="finish"]');
    this.error = page.locator('[data-test="error"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.itemTotal = page.locator('[data-test="subtotal-label"]');
    this.tax = page.locator('[data-test="tax-label"]');
    this.total = page.locator('[data-test="total-label"]');
  }

  async fillDetails(first: string, last: string, zip: string): Promise<void> {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.postalCode.fill(zip);
    await this.continueBtn.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(message);
  }

  /** Reads the money row and strips the label, leaving a number. */
  private async amount(loc: Locator): Promise<number> {
    const text = (await loc.textContent()) ?? '';
    return Number(text.replace(/[^0-9.]/g, ''));
  }

  async subtotal(): Promise<number> { return this.amount(this.itemTotal); }
  async taxAmount(): Promise<number> { return this.amount(this.tax); }
  async grandTotal(): Promise<number> { return this.amount(this.total); }
}
