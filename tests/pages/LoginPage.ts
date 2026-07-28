import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  private page: Page;
  private form: Locator;
  private usernameInput: Locator;
  private passwordInput: Locator;
  private keepMeLoggedInCheckbox: Locator;
  private forgotPasswordLink: Locator;
  private submitButton: Locator;
  private errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#user-login-form');
    this.usernameInput = page.locator('#edit-name');
    this.passwordInput = page.locator('#edit-pass');
    this.keepMeLoggedInCheckbox = page.locator('#edit-persistent-login');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.submitButton = page.locator('#edit-submit');
    this.errorMessage = page.locator('.messages--error, [data-drupal-messages] .messages--error, [role="alert"]').first();
  }

  async open(): Promise<void> {
    await this.page.goto('/user/login', { waitUntil: 'domcontentloaded' });
  }

  async expectFormIsVisible(): Promise<void> {
    await expect(this.form).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.keepMeLoggedInCheckbox).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async openForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async expectRequiredFieldErrors(): Promise<void> {
    await expect(this.errorMessage).toContainText(/email or username field is required/i);
    await expect(this.errorMessage).toContainText(/password field is required/i);
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.errorMessage).toContainText(/unrecognized|invalid|incorrect|password/i);
  }

  async expectUserIsLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/user\/login$/);
  }
}
