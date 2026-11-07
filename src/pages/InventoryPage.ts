import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly sortSelect: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(private readonly page: Page) {
    this.items = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.itemImages = page.locator('.inventory_item_img img');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.items.first()).toBeVisible();
  }

  async sortBy(value: string): Promise<void> {
    await this.sortSelect.selectOption(value);
  }

  async names(): Promise<string[]> {
    return (await this.itemNames.allTextContents()).map((s) => s.trim());
  }

  /** Prices as numbers, so ordering can be asserted arithmetically. */
  async prices(): Promise<number[]> {
    const raw = await this.itemPrices.allTextContents();
    return raw.map((p) => Number(p.replace(/[^0-9.]/g, '')));
  }

  async imageSources(): Promise<string[]> {
    return (await this.itemImages.evaluateAll((els) =>
      els.map((e) => (e as HTMLImageElement).getAttribute('src') ?? ''),
    )) as string[];
  }

  /** The add button is scoped to its own card, so the right item is added. */
  addToCartButton(itemName: string): Locator {
    return this.page
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: itemName })
      .getByRole('button', { name: /add to cart/i });
  }

  removeButton(itemName: string): Locator {
    return this.page
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: itemName })
      .getByRole('button', { name: /remove/i });
  }

  async cartCount(): Promise<number> {
    if (await this.cartBadge.count() === 0) return 0;
    return Number((await this.cartBadge.textContent())?.trim() ?? 0);
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
