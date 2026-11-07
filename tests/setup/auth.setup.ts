import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { USERS } from '../../src/data/users';
import path from 'path';

const STATE = path.join(__dirname, '..', '..', 'playwright', '.auth', 'standard.json');

/**
 * One login per run, saved to storageState and reused by the specs that need a
 * signed-in session. Logging in inside every test would add a round trip per
 * test and turn an auth outage into dozens of confusing failures instead of one.
 */
setup('authenticate as standard_user', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(USERS.standard);
  await expect(page.locator('[data-test="inventory-item"]').first()).toBeVisible();
  await page.context().storageState({ path: STATE });
});
