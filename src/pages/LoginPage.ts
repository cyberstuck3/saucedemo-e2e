import { Page, Locator, expect } from '@playwright/test';
import { PASSWORD } from '../data/users';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.submit = page.locator('[data-test="login-button"]');
    this.error = page.locator('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(user: string, pass: string = PASSWORD): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(message);
  }

  /** Still on the login screen means the attempt was refused. */
  async expectStillOnLogin(): Promise<void> {
    await expect(this.submit).toBeVisible();
    expect(new URL(this.page.url()).pathname).not.toContain('inventory');
  }
}
