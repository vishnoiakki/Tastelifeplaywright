import { expect, type Locator, type Page } from '@playwright/test';

export class ForgotPasswordPage {
  private page: Page;
  private form: Locator;
  private emailInput: Locator;
  private instructions: Locator;
  private submitButton: Locator;
  private errorMessage: Locator;
  private statusMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#user-pass');
    this.emailInput = page.locator('#edit-name');
    this.instructions = page.getByText('Password reset instructions will be sent to your registered email address.');
    this.submitButton = page.locator('#edit-submit');
    this.errorMessage = page.locator('.messages--error').first();
    this.statusMessage = page.locator('.messages--status').first();
  }

  async open(): Promise<void> {
    await this.page.goto('/user/password', { waitUntil: 'domcontentloaded' });
  }

  async expectFormIsVisible(): Promise<void> {
    await expect(this.page).toHaveTitle(/Forgot Password/i);
    await expect(this.form).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.instructions).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async submitEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async expectRequiredEmailError(): Promise<void> {
    await expect(this.errorMessage).toContainText(/email field is required/i);
  }

  async expectInvalidEmailFormatError(): Promise<void> {
    await expect(this.errorMessage).toContainText(/not valid/i);
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

  async expectPageIsOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/user\/password$/);
  }
}
