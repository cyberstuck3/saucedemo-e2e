import { test, expect } from '@playwright/test';
import { InventoryPage } from '../src/pages/InventoryPage';
import { EXPECTED_ITEM_COUNT, SORT } from '../src/data/users';
import path from 'path';

test.use({ storageState: path.join(__dirname, '..', 'playwright', '.auth', 'standard.json') });

test.describe('Inventory', () => {
  let inv: InventoryPage;

  test.beforeEach(async ({ page }) => {
    inv = new InventoryPage(page);
    await inv.goto();
    await inv.expectLoaded();
  });

  test('TC-INV-01 | the catalogue shows exactly six products', async () => {
    await expect(inv.items).toHaveCount(EXPECTED_ITEM_COUNT);
  });

  test('TC-INV-02 | every product has a name, a price, and an image', async () => {
    await expect(inv.itemNames).toHaveCount(EXPECTED_ITEM_COUNT);
    await expect(inv.itemPrices).toHaveCount(EXPECTED_ITEM_COUNT);
    await expect(inv.itemImages).toHaveCount(EXPECTED_ITEM_COUNT);
    for (const p of await inv.prices()) expect(p).toBeGreaterThan(0);
  });

  test('TC-INV-03 | sort by name A to Z', async () => {
    await inv.sortBy(SORT.nameAsc);
    const names = await inv.names();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('TC-INV-04 | sort by name Z to A', async () => {
    await inv.sortBy(SORT.nameDesc);
    const names = await inv.names();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('TC-INV-05 | sort by price low to high', async () => {
    await inv.sortBy(SORT.priceAsc);
    const prices = await inv.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('TC-INV-06 | sort by price high to low', async () => {
    await inv.sortBy(SORT.priceDesc);
    const prices = await inv.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('TC-INV-07 | adding an item swaps the button to Remove and sets the badge to 1', async () => {
    const item = 'Sauce Labs Backpack';
    await inv.addToCartButton(item).click();
    await expect(inv.removeButton(item)).toBeVisible();
    expect(await inv.cartCount()).toBe(1);
  });

  test('TC-INV-08 | removing the last item clears the badge rather than showing zero', async () => {
    const item = 'Sauce Labs Bike Light';
    await inv.addToCartButton(item).click();
    await inv.removeButton(item).click();
    await expect(inv.addToCartButton(item)).toBeVisible();
    // A badge reading "0" would be a defect; the element should disappear.
    expect(await inv.cartCount()).toBe(0);
    await expect(inv.cartBadge).toHaveCount(0);
  });

  test('TC-INV-09 | the badge counts distinct items, not clicks', async () => {
    await inv.addToCartButton('Sauce Labs Backpack').click();
    await inv.addToCartButton('Sauce Labs Bike Light').click();
    await inv.addToCartButton('Sauce Labs Onesie').click();
    expect(await inv.cartCount()).toBe(3);
  });
});
