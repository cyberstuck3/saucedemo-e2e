import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkout: Locator;
  readonly continueShopping: Locator;

  constructor(private readonly page: Page) {
    this.items = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.checkout = page.locator('[data-test="checkout"]');
    this.continueShopping = page.locator('[data-test="continue-shopping"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  async expectContains(names: string[]): Promise<void> {
    const actual = (await this.itemNames.allTextContents()).map((s) => s.trim());
    for (const n of names) expect(actual).toContain(n);
  }

  removeButton(itemName: string): Locator {
    return this.items.filter({ hasText: itemName }).getByRole('button', { name: /remove/i });
  }
}
