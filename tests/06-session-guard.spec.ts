import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';
import { USERS } from '../src/data/users';

/**
 * Access control at the page level. A UI suite that only ever arrives through
 * the front door never finds out whether the back door is locked.
 */
test.use({ storageState: { cookies: [], origins: [] } });

const PROTECTED = ['/inventory.html', '/cart.html', '/checkout-step-one.html', '/checkout-step-two.html'];

test.describe('Session guard', () => {
  for (const path of PROTECTED) {
    test(`TC-SESS-01 | ${path} is not reachable without a session`, async ({ page }) => {
      await page.goto(path);
      // Either bounced to the login screen or shown an explicit error. What
      // must not happen is the protected content rendering.
      const onLogin = await page.locator('[data-test="login-button"]').count();
      const errored = await page.locator('[data-test="error"]').count();
      expect(onLogin + errored).toBeGreaterThan(0);
      await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
    });
  }

  test('TC-SESS-02 | logging out invalidates the session for a direct URL', async ({ page }) => {
    const login = new LoginPage(page);
    const inv = new InventoryPage(page);

    await login.goto();
    await login.login(USERS.standard);
    await inv.expectLoaded();
    await inv.logout();

    // Back button or a pasted URL must not restore access after logout.
    await page.goto('/inventory.html');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });

  test('TC-SESS-03 | the session cookie is scoped to the site', async ({ page, context }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard);
    await new InventoryPage(page).expectLoaded();

    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === 'session-username');
    expect(session, 'expected a session cookie after login').toBeDefined();
    expect(session!.domain).toContain('saucedemo.com');
  });
});
