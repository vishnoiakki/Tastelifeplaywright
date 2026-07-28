import { expect, type Locator, type Page } from '@playwright/test';
import type { SignupUser } from '../data/signup.data';

export class SignupPage {
  private page: Page;
  private form: Locator;
  private firstNameInput: Locator;
  private middleNameInput: Locator;
  private lastNameInput: Locator;
  private emailInput: Locator;
  private mobileInput: Locator;
  private ageRangeSelect: Locator;
  private genderSelect: Locator;
  private siteSelect: Locator;
  private companySelect: Locator;
  private termsCheckbox: Locator;
  private mailingListOptOutCheckbox: Locator;
  private submitButton: Locator;
  private errorMessage: Locator;
  private accountCreatedMessage: Locator;
  private loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('form').filter({ has: page.locator('#edit-mail') });
    this.firstNameInput = page.locator('#edit-field-first-name-0-value');
    this.middleNameInput = page.locator('#edit-field-middle-name-0-value');
    this.lastNameInput = page.locator('#edit-field-last-name-0-value');
    this.emailInput = page.locator('#edit-mail');
    this.mobileInput = page.locator('#edit-field-mobile-number-0-value');
    this.ageRangeSelect = page.locator('#edit-field-age-range');
    this.genderSelect = page.locator('#edit-field-gender');
    this.siteSelect = page.locator('#edit-field-site');
    this.companySelect = page.locator('#edit-field-company-name');
    this.termsCheckbox = page.locator('#edit-field-terms-and-conditions-value');
    this.mailingListOptOutCheckbox = page.locator('#edit-field-no-i-don-t-want-to-subscri-value');
    this.submitButton = page.locator('#edit-submit');
    this.errorMessage = page.locator('.messages--error').first();
    this.accountCreatedMessage = page.getByText(/Your Account Has Been Created/i);
    this.loginLink = page.getByRole('link', { name: 'Log In' }).last();
  }

  async open(): Promise<void> {
    await this.page.goto('/user/register', { waitUntil: 'domcontentloaded' });
  }

  async expectFormIsVisible(): Promise<void> {
    await expect(this.page).toHaveTitle(/Sign Up/i);
    await expect(this.form).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.middleNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.mobileInput).toBeVisible();
    await expect(this.ageRangeSelect).toBeVisible();
    await expect(this.genderSelect).toBeVisible();
    await expect(this.siteSelect).toBeVisible();
    await expect(this.companySelect).toBeVisible();
    await expect(this.termsCheckbox).toBeVisible();
    await expect(this.mailingListOptOutCheckbox).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.loginLink).toBeVisible();
  }

  async fillForm(user: SignupUser): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.middleNameInput.fill(user.middleName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.mobileInput.fill(user.mobile);
    await this.selectAgeRange(user.ageRange);
    await this.selectGender(user.gender);
    await this.selectSite(user.site);
    await this.selectCompany(user.company);
    await this.setTerms(user.acceptTerms);
    await this.setMailingListOptOut(user.optOutMailingList);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async signup(user: SignupUser): Promise<void> {
    await this.fillForm(user);
    await this.submit();
  }

  async expectFormValues(user: SignupUser): Promise<void> {
    await expect(this.firstNameInput).toHaveValue(user.firstName);
    await expect(this.middleNameInput).toHaveValue(user.middleName);
    await expect(this.lastNameInput).toHaveValue(user.lastName);
    await expect(this.emailInput).toHaveValue(user.email);
    await expect(this.mobileInput).toHaveValue(user.mobile);
    await expect(this.ageRangeSelect.locator('option:checked')).toHaveText(user.ageRange);
    await expect(this.genderSelect.locator('option:checked')).toHaveText(user.gender);
    await expect(this.siteSelect.locator('option:checked')).toHaveText(user.site);
    await expect(this.companySelect.locator('option:checked')).toHaveText(user.company);

    if (user.acceptTerms) {
      await expect(this.termsCheckbox).toBeChecked();
    } else {
      await expect(this.termsCheckbox).not.toBeChecked();
    }

    if (user.optOutMailingList) {
      await expect(this.mailingListOptOutCheckbox).toBeChecked();
    } else {
      await expect(this.mailingListOptOutCheckbox).not.toBeChecked();
    }
  }

  async expectRequiredFieldErrors(): Promise<void> {
    await this.expectErrorText(/First Name field is required/i);
    await this.expectErrorText(/Last Name field is required/i);
    await this.expectErrorText(/Email field is required/i);
    await this.expectErrorText(/Mobile field is required/i);
    await this.expectErrorText(/Age Range field is required/i);
    await this.expectErrorText(/Gender field is required/i);
    await this.expectErrorText(/Site field is required/i);
    await this.expectErrorText(/Company field is required/i);
    await this.expectErrorText(/Terms and Conditions field is required/i);
  }

  async expectErrorText(expectedText: RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async expectAccountCreated(): Promise<void> {
    await expect(this.page).toHaveURL(/\/thank-you$/);
    await expect(this.accountCreatedMessage).toBeVisible();
  }

  private async selectAgeRange(ageRange: string): Promise<void> {
    await this.ageRangeSelect.selectOption(ageRange ? { label: ageRange } : '_none');
  }

  private async selectGender(gender: string): Promise<void> {
    await this.genderSelect.selectOption(gender ? { label: gender } : '_none');
  }

  private async selectSite(site: string): Promise<void> {
    await this.siteSelect.selectOption(site ? { label: site } : '_none');

    if (site) {
      await expect
        .poll(async () => this.companySelect.locator('option').count(), { timeout: 10_000 })
        .toBeGreaterThan(1);
    }
  }

  private async selectCompany(company: string): Promise<void> {
    await this.companySelect.selectOption(company ? { label: company } : '');
  }

  private async setTerms(acceptTerms: boolean): Promise<void> {
    if (acceptTerms) {
      await this.termsCheckbox.check({ force: true });
    } else {
      await this.termsCheckbox.uncheck({ force: true });
    }
  }

  private async setMailingListOptOut(optOut: boolean): Promise<void> {
    if (optOut) {
      await this.mailingListOptOutCheckbox.check({ force: true });
    } else {
      await this.mailingListOptOutCheckbox.uncheck({ force: true });
    }
  }
}
