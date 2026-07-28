import { test } from '@playwright/test';
import {
  malformedEmail,
  missingRegisteredEmailMessage,
  registeredEmail,
  unregisteredEmail,
} from './data/forgotPassword.data';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LoginPage } from './pages/LoginPage';
import { Severity, annotateTest, attachJson, reportStep } from './utils/reporting';

test.describe('Forgot password page', () => {
  test('opens from the login page', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-FORGOT-001',
      feature: 'Authentication - Forgot Password',
      story: 'Forgot-password navigation',
      severity: Severity.CRITICAL,
      testType: 'Smoke',
      requirement: 'Users must be able to navigate from login to forgot password.',
      risk: 'Users cannot recover access if the forgot-password entry point is broken.',
      description:
        'Starts from the login page, clicks the Forgot Password link, and verifies the forgot-password page and form are displayed.',
      tags: ['forgot-password', 'navigation', 'smoke'],
    });

    const loginPage = new LoginPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await reportStep('Open the login page', async () => {
      await loginPage.open();
    });
    await reportStep('Click the Forgot Password link', async () => {
      await loginPage.openForgotPassword();
    });
    await reportStep('Verify forgot-password page URL and form', async () => {
      await forgotPasswordPage.expectPageIsOpen();
      await forgotPasswordPage.expectFormIsVisible();
    });
  });

  test('shows all forgot password form fields', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-FORGOT-002',
      feature: 'Authentication - Forgot Password',
      story: 'Forgot-password form availability',
      severity: Severity.NORMAL,
      testType: 'Smoke',
      requirement: 'Forgot-password form must show the email field and submit control.',
      risk: 'Users cannot request password reset instructions if the form is incomplete.',
      description:
        'Opens the forgot-password page directly and verifies the page title, email field, instructions, and submit button.',
      tags: ['forgot-password', 'ui', 'smoke'],
    });

    const forgotPasswordPage = new ForgotPasswordPage(page);

    await reportStep('Open the forgot-password page directly', async () => {
      await forgotPasswordPage.open();
    });
    await reportStep('Verify forgot-password form controls are visible', async () => {
      await forgotPasswordPage.expectFormIsVisible();
    });
  });

  test('shows required email error when submitted empty', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-FORGOT-003',
      feature: 'Authentication - Forgot Password',
      story: 'Mandatory email validation',
      severity: Severity.NORMAL,
      testType: 'Negative',
      requirement: 'Forgot-password form must require an email address.',
      risk: 'Empty reset requests create poor feedback and unnecessary server processing.',
      description:
        'Submits the forgot-password form with an empty email field and verifies the required-field validation message.',
      tags: ['forgot-password', 'validation', 'negative'],
    });

    const forgotPasswordPage = new ForgotPasswordPage(page);

    await reportStep('Open the forgot-password page', async () => {
      await forgotPasswordPage.open();
    });
    await reportStep('Submit without entering an email address', async () => {
      await forgotPasswordPage.submit();
    });
    await reportStep('Verify required email validation message', async () => {
      await forgotPasswordPage.expectRequiredEmailError();
    });
  });

  test('shows format error when email is not valid', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-FORGOT-004',
      feature: 'Authentication - Forgot Password',
      story: 'Email format validation',
      severity: Severity.NORMAL,
      testType: 'Negative',
      requirement: 'Forgot-password form must reject malformed email addresses.',
      risk: 'Invalid input can trigger bad requests and unclear user feedback.',
      description:
        'Submits a malformed email address and verifies the application displays the expected email-format guidance.',
      tags: ['forgot-password', 'validation', 'negative'],
    });

    const forgotPasswordPage = new ForgotPasswordPage(page);

    await attachJson('Forgot-password invalid email data', malformedEmail);
    await reportStep('Open the forgot-password page', async () => {
      await forgotPasswordPage.open();
    });
    await reportStep('Submit malformed email address', async () => {
      await forgotPasswordPage.submitEmail(malformedEmail.email);
    });
    await reportStep('Verify email-format validation message', async () => {
      await forgotPasswordPage.expectInvalidEmailFormatError();
    });
  });

  test('shows error when email is not registered', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-FORGOT-005',
      feature: 'Authentication - Forgot Password',
      story: 'Unregistered email handling',
      severity: Severity.NORMAL,
      testType: 'Negative',
      requirement: 'Forgot-password form must reject unregistered email addresses.',
      risk: 'Users need clear feedback when reset instructions cannot be sent.',
      description:
        'Submits a synthetic unregistered email address and verifies the application displays the unregistered-email error.',
      tags: ['forgot-password', 'validation', 'negative'],
    });

    const forgotPasswordPage = new ForgotPasswordPage(page);

    await attachJson('Forgot-password unregistered email data', unregisteredEmail);
    await reportStep('Open the forgot-password page', async () => {
      await forgotPasswordPage.open();
    });
    await reportStep('Submit synthetic unregistered email address', async () => {
      await forgotPasswordPage.submitEmail(unregisteredEmail.email);
    });
    await reportStep('Verify unregistered-email validation message', async () => {
      await forgotPasswordPage.expectUnregisteredEmailError();
    });
  });

  test('sends reset instructions when registered email is available in .env', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-FORGOT-006',
      feature: 'Authentication - Forgot Password',
      story: 'Successful reset request',
      severity: Severity.CRITICAL,
      testType: 'Positive',
      requirement: 'Registered users must be able to request password reset instructions.',
      risk: 'Users cannot recover accounts if reset instruction delivery fails.',
      description:
        'Uses a registered email from .env, submits the forgot-password form, and verifies the user is returned to login with the success message.',
      tags: ['forgot-password', 'happy-path', 'credentials'],
    });
    await attachJson('Registered email configuration', {
      source: 'TASTELIFE_REGISTERED_EMAIL or TASTELIFE_VALID_USERNAME fallback',
      status: registeredEmail ? 'configured' : 'missing',
      secretsAttached: false,
    });
    test.skip(!registeredEmail, missingRegisteredEmailMessage);

    if (!registeredEmail) {
      return;
    }

    const resetEmail = registeredEmail;
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await reportStep('Open the forgot-password page', async () => {
      await forgotPasswordPage.open();
    });
    await reportStep('Submit registered email from .env', async () => {
      await forgotPasswordPage.submitEmail(resetEmail.email);
    });
    await reportStep('Verify reset instructions confirmation', async () => {
      await forgotPasswordPage.expectResetInstructionsSent();
    });
  });
});
