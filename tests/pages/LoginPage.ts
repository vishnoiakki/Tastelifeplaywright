import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly form: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly keepMeLoggedInCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loggedInBody: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#user-login-form');
    this.usernameInput = page.locator('#edit-name');
    this.passwordInput = page.locator('#edit-pass');
    this.keepMeLoggedInCheckbox = page.locator('#edit-persistent-login');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.submitButton = page.locator('#edit-submit');
    this.errorMessage = page.locator('.messages--error, [role="contentinfo"]').first();
    this.loggedInBody = page.locator('body:not(.role-anonymous)');
  }

  async goto(): Promise<void> {
    await this.page.goto('/user/login', { waitUntil: 'domcontentloaded' });
  }

  async expectLoginFormVisible(): Promise<void> {
    await expect(this.form).toBeAttached();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.usernameInput).toHaveAttribute('aria-required', 'true');
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
    await expect(this.passwordInput).toHaveAttribute('aria-required', 'true');
    await expect(this.keepMeLoggedInCheckbox).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async submitEmptyForm(): Promise<void> {
    await this.submitButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectRequiredFieldErrors(): Promise<void> {
    await expect(this.errorMessage).toContainText(/email or username field is required/i);
    await expect(this.errorMessage).toContainText(/password field is required/i);
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.errorMessage).toContainText(/unrecognized|invalid|incorrect|password/i);
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.loggedInBody).toBeVisible();
    await expect(this.page).not.toHaveURL(/\/user\/login$/);
  }
}
