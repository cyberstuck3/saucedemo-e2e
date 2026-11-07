import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';
import { USERS, LOGIN_ERRORS, PASSWORD } from '../src/data/users';

// This spec authenticates by hand, so it must not inherit a saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  test('TC-LOGIN-01 | standard_user reaches the inventory page', async ({ page }) => {
    await login.login(USERS.standard);
    await new InventoryPage(page).expectLoaded();
    expect(new URL(page.url()).pathname).toBe('/inventory.html');
  });

  test('TC-LOGIN-02 | locked_out_user is refused with a specific message', async () => {
    await login.login(USERS.lockedOut);
    await login.expectError(LOGIN_ERRORS.lockedOut);
    await login.expectStillOnLogin();
  });

  test('TC-LOGIN-03 | wrong password is refused', async () => {
    await login.login(USERS.standard, 'wrong_password');
    await login.expectError(LOGIN_ERRORS.badCredentials);
    await login.expectStillOnLogin();
  });

  test('TC-LOGIN-04 | unknown username gets the same message as a wrong password', async () => {
    await login.login('no_such_user', PASSWORD);
    // Identical wording for both cases is correct: it gives an attacker no way
    // to tell a valid username from an invalid one.
    await login.expectError(LOGIN_ERRORS.badCredentials);
  });

  test('TC-LOGIN-05 | empty username is blocked before the password is considered', async () => {
    await login.login('', PASSWORD);
    await login.expectError(LOGIN_ERRORS.usernameRequired);
  });

  test('TC-LOGIN-06 | empty password is blocked', async () => {
    await login.login(USERS.standard, '');
    await login.expectError(LOGIN_ERRORS.passwordRequired);
  });

  test('TC-LOGIN-07 | both fields empty reports the username first', async () => {
    await login.login('', '');
    await login.expectError(LOGIN_ERRORS.usernameRequired);
  });

  test('TC-LOGIN-08 | the password field is masked', async () => {
    await expect(login.password).toHaveAttribute('type', 'password');
  });
});
