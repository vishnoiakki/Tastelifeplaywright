import { test } from '@playwright/test';
import { Severity } from 'allure-js-commons';
import { forgotPasswordEmails } from './data/forgotPassword.data';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LoginPage } from './pages/LoginPage';
import { addAllureMetadata, evidenceStep } from './utils/allureHelpers';

test.describe('Forgot password', () => {
  test.describe.configure({ mode: 'serial' });

  test('opens forgot password page from login', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await addAllureMetadata({
      feature: 'Forgot password',
      story: 'Navigation from login',
      severity: Severity.CRITICAL,
      owner: 'QA Automation',
      tags: ['forgot-password', 'navigation', 'smoke'],
      description: 'Verify users can open the forgot-password page from the login form.',
    });

    await evidenceStep(testInfo, page, 'Open login page', async () => {
      await loginPage.goto();
      await loginPage.expectLoginFormVisible();
    });

    await evidenceStep(testInfo, page, 'Navigate to forgot password page', async () => {
      await loginPage.forgotPasswordLink.click();
      await forgotPasswordPage.expectAtForgotPasswordPage();
      await forgotPasswordPage.expectForgotPasswordFormVisible();
    });
  });

  test('shows forgot password form fields and actions', async ({ page }, testInfo) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await addAllureMetadata({
      feature: 'Forgot password',
      story: 'Reset form availability',
      severity: Severity.CRITICAL,
      owner: 'QA Automation',
      tags: ['forgot-password', 'ui', 'smoke'],
      description: 'Verify the forgot-password page exposes the email field, helper text, and submit action.',
    });

    await evidenceStep(testInfo, page, 'Open forgot password page and verify form', async () => {
      await forgotPasswordPage.goto();
      await forgotPasswordPage.expectForgotPasswordFormVisible();
    });
  });

  test('shows required email error when submitted empty', async ({ page }, testInfo) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await addAllureMetadata({
      feature: 'Forgot password',
      story: 'Required email validation',
      severity: Severity.NORMAL,
      owner: 'QA Automation',
      tags: ['forgot-password', 'validation', 'negative'],
      description: 'Verify required email validation when forgot-password is submitted empty.',
    });

    await evidenceStep(testInfo, page, 'Open forgot password page', async () => {
      await forgotPasswordPage.goto();
      await forgotPasswordPage.expectForgotPasswordFormVisible();
    });

    await evidenceStep(testInfo, page, 'Submit empty forgot password form and verify validation error', async () => {
      await forgotPasswordPage.submitEmptyForm();
      await forgotPasswordPage.expectRequiredEmailError();
    });
  });

  for (const testData of forgotPasswordEmails.malformed) {
    test(`shows format error for malformed email: ${testData.name}`, async ({ page }, testInfo) => {
      const forgotPasswordPage = new ForgotPasswordPage(page);

      await addAllureMetadata({
        feature: 'Forgot password',
        story: 'Malformed email validation',
        severity: Severity.NORMAL,
        owner: 'QA Automation',
        tags: ['forgot-password', 'data-driven', 'validation', 'negative'],
        description: `Verify malformed email validation for the ${testData.name} data set.`,
        parameters: [{ name: 'email', value: testData.email }],
      });

      await evidenceStep(testInfo, page, 'Open forgot password page', async () => {
        await forgotPasswordPage.goto();
        await forgotPasswordPage.expectForgotPasswordFormVisible();
      });

      await evidenceStep(testInfo, page, `Submit malformed email for ${testData.name}`, async () => {
        await forgotPasswordPage.submitEmail(testData.email);
        await forgotPasswordPage.expectInvalidEmailFormatError(testData.email);
      });
    });
  }

  for (const testData of forgotPasswordEmails.unregistered) {
    test(`shows error for unregistered email: ${testData.name}`, async ({ page }, testInfo) => {
      const forgotPasswordPage = new ForgotPasswordPage(page);

      await addAllureMetadata({
        feature: 'Forgot password',
        story: 'Unregistered email validation',
        severity: Severity.CRITICAL,
        owner: 'QA Automation',
        tags: ['forgot-password', 'data-driven', 'negative'],
        description: `Verify unregistered email handling for the ${testData.name} data set.`,
        parameters: [{ name: 'email', value: testData.email }],
      });

      await evidenceStep(testInfo, page, 'Open forgot password page', async () => {
        await forgotPasswordPage.goto();
        await forgotPasswordPage.expectForgotPasswordFormVisible();
      });

      await evidenceStep(testInfo, page, `Submit unregistered email for ${testData.name}`, async () => {
        await forgotPasswordPage.submitEmail(testData.email);
        await forgotPasswordPage.expectUnregisteredEmailError();
      });
    });
  }

  for (const testData of forgotPasswordEmails.registered) {
    test(`sends reset instructions for registered email: ${testData.name}`, async ({ page }, testInfo) => {
      const forgotPasswordPage = new ForgotPasswordPage(page);

      await addAllureMetadata({
        feature: 'Forgot password',
        story: 'Successful reset instruction request',
        severity: Severity.BLOCKER,
        owner: 'QA Automation',
        tags: ['forgot-password', 'data-driven', 'positive', 'smoke'],
        description: `Verify reset instructions are sent for the ${testData.name} data set.`,
        parameters: [{ name: 'email', value: testData.email }],
      });

      await evidenceStep(testInfo, page, 'Open forgot password page', async () => {
        await forgotPasswordPage.goto();
        await forgotPasswordPage.expectForgotPasswordFormVisible();
      });

      await evidenceStep(testInfo, page, `Submit registered email for ${testData.name}`, async () => {
        await forgotPasswordPage.submitEmail(testData.email);
        await forgotPasswordPage.expectResetInstructionsSent();
      });
    });
  }
});
