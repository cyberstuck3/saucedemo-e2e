import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';
import { CartPage } from '../src/pages/CartPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { USERS, SORT } from '../src/data/users';

/**
 * Characterisation tests for the defects saucedemo ships on purpose under
 * problem_user. They assert the behaviour that is actually there, so the suite
 * stays green and the defects are written up in docs/BUG-REPORT.md.
 *
 * Asserting the correct behaviour instead would give a permanently red suite
 * that nobody reads. The value of a characterisation test is that it fails on
 * the day the bug is fixed, which is exactly when the report needs updating.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('problem_user defects', () => {
  let inv: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.problem);
    inv = new InventoryPage(page);
    await inv.expectLoaded();
  });

  test('BUG-SD-001 | every product image resolves to the same asset', async () => {
    const sources = await inv.imageSources();
    expect(sources).toHaveLength(6);
    const distinct = new Set(sources);
    // Correct behaviour would be six distinct images. One distinct source for
    // six different products is the defect.
    expect(distinct.size).toBe(1);
  });

  test('BUG-SD-002 | sorting by name Z to A does not reorder the catalogue', async () => {
    const before = await inv.names();
    await inv.sortBy(SORT.nameDesc);
    const after = await inv.names();
    // The control accepts the selection and the list never changes.
    expect(after).toEqual(before);
    expect(after).not.toEqual([...before].sort((a, b) => b.localeCompare(a)));
  });

  test('BUG-SD-003 | the last name field cannot be filled at checkout', async ({ page }) => {
    await inv.addToCartButton('Sauce Labs Backpack').click();
    await inv.cartLink.click();
    await new CartPage(page).checkout.click();

    const co = new CheckoutPage(page);
    await co.firstName.fill('Aifa');
    await co.lastName.fill('Ulya');

    // The field rejects the input, so a user can never satisfy the required
    // validation and the order is unreachable. This is the highest-impact of
    // the three: it blocks revenue entirely for this account.
    await expect(co.lastName).toHaveValue('');
  });
});

test.describe('performance_glitch_user', () => {
  test('BUG-SD-004 | login takes several seconds longer than for standard_user', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    const started = Date.now();
    await login.login(USERS.performanceGlitch);
    await new InventoryPage(page).expectLoaded();
    const elapsed = Date.now() - started;

    // Recorded as a measurement, not a pass or fail threshold plucked from the
    // air. The reported figure in BUG-REPORT.md comes from this number.
    console.log(`performance_glitch_user login took ${elapsed} ms`);
    expect(elapsed).toBeGreaterThan(2_000);
  });
});
