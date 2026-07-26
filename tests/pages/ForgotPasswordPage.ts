import { expect, type Locator, type Page } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly instructions: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly statusMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#user-pass');
    this.emailInput = page.locator('#edit-name');
    this.instructions = page.getByText('Password reset instructions will be sent to your registered email address.');
    this.submitButton = page.locator('#edit-submit');
    this.errorMessage = page.locator('.messages--error').first();
    this.statusMessage = page.locator('.messages--status').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/user/password', { waitUntil: 'domcontentloaded' });
  }

  async expectForgotPasswordFormVisible(): Promise<void> {
    await expect(this.page).toHaveTitle(/Forgot Password/i);
    await expect(this.form).toBeAttached();
    await expect(this.emailInput).toBeVisible();
    await expect(this.emailInput).toHaveAttribute('aria-required', 'true');
    await expect(this.instructions).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toHaveValue('Submit');
  }

  async submitEmptyForm(): Promise<void> {
    await this.submitButton.click();
  }

  async submitEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async expectRequiredEmailError(): Promise<void> {
    await expect(this.errorMessage).toContainText(/email field is required/i);
  }

  async expectInvalidEmailFormatError(email: string): Promise<void> {
    await expect(this.errorMessage).toContainText(new RegExp(`email address ${email} is not valid`, 'i'));
    await expect(this.errorMessage).toContainText(/format user@example\.com/i);
  }

  async expectUnregisteredEmailError(): Promise<void> {
    await expect(this.errorMessage).toContainText(/email address doesn't exist/i);
    await expect(this.errorMessage).toContainText(/enter valid email address/i);
  }

  async expectResetInstructionsSent(): Promise<void> {
    await expect(this.page).toHaveURL(/\/user\/login$/);
    await expect(this.statusMessage).toContainText(/further instructions have been sent to your registered email-id/i);
  }

  async expectAtForgotPasswordPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/user\/password$/);
  }
}
