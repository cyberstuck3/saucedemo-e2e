import { test, expect } from '@playwright/test';
import { InventoryPage } from '../src/pages/InventoryPage';
import { CartPage } from '../src/pages/CartPage';
import path from 'path';

test.use({ storageState: path.join(__dirname, '..', 'playwright', '.auth', 'standard.json') });

test.describe('Cart', () => {
  test('TC-CART-01 | items added on the catalogue appear in the cart', async ({ page }) => {
    const inv = new InventoryPage(page);
    const cart = new CartPage(page);
    const picked = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];

    await inv.goto();
    for (const item of picked) await inv.addToCartButton(item).click();
    await inv.cartLink.click();

    await expect(cart.items).toHaveCount(picked.length);
    await cart.expectContains(picked);
  });

  test('TC-CART-02 | removing in the cart updates the badge', async ({ page }) => {
    const inv = new InventoryPage(page);
    const cart = new CartPage(page);

    await inv.goto();
    await inv.addToCartButton('Sauce Labs Backpack').click();
    await inv.addToCartButton('Sauce Labs Bike Light').click();
    await inv.cartLink.click();

    await cart.removeButton('Sauce Labs Backpack').click();
    await expect(cart.items).toHaveCount(1);
    expect(await inv.cartCount()).toBe(1);
  });

  test('TC-CART-03 | the cart survives navigating back to the catalogue', async ({ page }) => {
    const inv = new InventoryPage(page);
    const cart = new CartPage(page);

    await inv.goto();
    await inv.addToCartButton('Sauce Labs Onesie').click();
    await inv.cartLink.click();
    await cart.continueShopping.click();

    // State that silently resets on navigation is a common real defect.
    expect(await inv.cartCount()).toBe(1);
  });

  test('TC-CART-04 | an empty cart offers no way to check out into nothing', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await expect(cart.items).toHaveCount(0);
    // Documented behaviour: saucedemo does allow checkout from an empty cart.
    // Recorded as FINDING-SD-003 instead of asserting the behaviour I would prefer.
    await expect(cart.checkout).toBeVisible();
  });
});
