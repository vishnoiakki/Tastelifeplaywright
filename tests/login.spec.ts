import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { invalidLoginUser, missingValidLoginMessage, validLoginUser } from './data/login.data';
import { Severity, annotateTest, attachJson, reportStep } from './utils/reporting';

test.describe('Login page', () => {
  test('shows all login form fields', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-LOGIN-001',
      feature: 'Authentication - Login',
      story: 'Login form availability',
      severity: Severity.CRITICAL,
      testType: 'Smoke',
      requirement: 'Guest users must be able to access the login form.',
      risk: 'Users cannot authenticate if login controls are missing or hidden.',
      description:
        'Verifies that the login page loads successfully and displays the username, password, keep-me-logged-in, forgot-password, and submit controls.',
      tags: ['login', 'smoke', 'ui'],
    });

    const loginPage = new LoginPage(page);

    await reportStep('Open the login page', async () => {
      await loginPage.open();
    });
    await reportStep('Verify all login form controls are visible', async () => {
      await loginPage.expectFormIsVisible();
    });
  });

  test('shows required errors when username and password are empty', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-LOGIN-002',
      feature: 'Authentication - Login',
      story: 'Mandatory login validation',
      severity: Severity.NORMAL,
      testType: 'Negative',
      requirement: 'Login form must prevent empty username and password submission.',
      risk: 'Missing required validation can allow bad submissions and confuse users.',
      description:
        'Submits the login form without entering username or password and verifies both required-field validation messages are shown.',
      tags: ['login', 'validation', 'negative'],
    });

    const loginPage = new LoginPage(page);

    await reportStep('Open the login page', async () => {
      await loginPage.open();
    });
    await reportStep('Submit the form without username and password', async () => {
      await loginPage.submit();
    });
    await reportStep('Verify username and password required-field errors', async () => {
      await loginPage.expectRequiredFieldErrors();
    });
  });

  test('shows an error when login details are wrong', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-LOGIN-003',
      feature: 'Authentication - Login',
      story: 'Invalid credential handling',
      severity: Severity.CRITICAL,
      testType: 'Negative',
      requirement: 'Application must reject invalid login credentials.',
      risk: 'Invalid credential handling protects accounts and gives clear feedback.',
      description:
        'Attempts login with synthetic invalid credentials and verifies the application displays an invalid-credentials error.',
      tags: ['login', 'security', 'negative'],
    });

    const loginPage = new LoginPage(page);

    await attachJson('Invalid credential test data', {
      username: invalidLoginUser.username,
      password: 'Masked synthetic invalid password',
    });
    await reportStep('Open the login page', async () => {
      await loginPage.open();
    });
    await reportStep('Submit synthetic invalid credentials', async () => {
      await loginPage.login(invalidLoginUser.username, invalidLoginUser.password);
    });
    await reportStep('Verify invalid-credentials error is displayed', async () => {
      await loginPage.expectInvalidCredentialsError();
    });
  });

  test('logs in when valid credentials are available in .env', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-LOGIN-004',
      feature: 'Authentication - Login',
      story: 'Successful login',
      severity: Severity.BLOCKER,
      testType: 'Positive',
      requirement: 'Registered users must be able to log in with valid credentials.',
      risk: 'Valid users are blocked from the application if authentication fails.',
      description:
        'Uses valid credentials from the local .env file, submits the login form, and verifies the user leaves the login page.',
      tags: ['login', 'happy-path', 'credentials'],
    });
    await attachJson('Credential configuration', {
      source: '.env',
      requiredVariables: ['TASTELIFE_VALID_USERNAME', 'TASTELIFE_VALID_PASSWORD'],
      status: validLoginUser ? 'configured' : 'missing',
      secretsAttached: false,
    });
    test.skip(!validLoginUser, missingValidLoginMessage);

    if (!validLoginUser) {
      return;
    }

    const loginUser = validLoginUser;
    const loginPage = new LoginPage(page);

    await reportStep('Open the login page', async () => {
      await loginPage.open();
    });
    await reportStep('Submit valid credentials from .env', async () => {
      await loginPage.login(loginUser.username, loginUser.password);
    });
    await reportStep('Verify successful login navigation', async () => {
      await loginPage.expectUserIsLoggedIn();
    });
  });
});
