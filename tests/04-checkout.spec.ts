import { test, expect } from '@playwright/test';
import { InventoryPage } from '../src/pages/InventoryPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { CHECKOUT_ERRORS } from '../src/data/users';
import path from 'path';

test.use({ storageState: path.join(__dirname, '..', 'playwright', '.auth', 'standard.json') });

async function startCheckout(page: import('@playwright/test').Page, items: string[]) {
  const inv = new InventoryPage(page);
  const cart = new CartPage(page);
  await inv.goto();
  for (const i of items) await inv.addToCartButton(i).click();
  await inv.cartLink.click();
  await cart.checkout.click();
  return new CheckoutPage(page);
}

test.describe('Checkout', () => {
  test('TC-CO-01 | the full happy path completes the order', async ({ page }) => {
    const co = await startCheckout(page, ['Sauce Labs Backpack']);
    await co.fillDetails('Aifa', 'Ulya', '55281');
    await co.finishBtn.click();
    await expect(co.completeHeader).toBeVisible();
    await expect(co.completeHeader).toHaveText(/thank you for your order/i);
  });

  test('TC-CO-02 | a missing first name blocks the step', async ({ page }) => {
    const co = await startCheckout(page, ['Sauce Labs Backpack']);
    await co.fillDetails('', 'Ulya', '55281');
    await co.expectError(CHECKOUT_ERRORS.firstName);
  });

  test('TC-CO-03 | a missing last name blocks the step', async ({ page }) => {
    const co = await startCheckout(page, ['Sauce Labs Backpack']);
    await co.fillDetails('Aifa', '', '55281');
    await co.expectError(CHECKOUT_ERRORS.lastName);
  });

  test('TC-CO-04 | a missing postal code blocks the step', async ({ page }) => {
    const co = await startCheckout(page, ['Sauce Labs Backpack']);
    await co.fillDetails('Aifa', 'Ulya', '');
    await co.expectError(CHECKOUT_ERRORS.postalCode);
  });

  test('TC-CO-05 | the summary total equals subtotal plus tax', async ({ page }) => {
    const co = await startCheckout(page, ['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    await co.fillDetails('Aifa', 'Ulya', '55281');

    const [sub, tax, total] = [await co.subtotal(), await co.taxAmount(), await co.grandTotal()];
    // Arithmetic, not a hardcoded figure, so the test survives a price change
    // and still catches a broken total.
    expect(Number((sub + tax).toFixed(2))).toBe(total);
  });

  test('TC-CO-06 | the subtotal equals the sum of the item prices', async ({ page }) => {
    const items = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];
    const inv = new InventoryPage(page);
    await inv.goto();

    const prices = await inv.prices();
    const names = await inv.names();
    const expected = items.reduce((sum, n) => sum + prices[names.indexOf(n)], 0);

    const co = await startCheckout(page, items);
    await co.fillDetails('Aifa', 'Ulya', '55281');
    expect(await co.subtotal()).toBeCloseTo(expected, 2);
  });
});
