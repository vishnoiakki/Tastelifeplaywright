import { test } from '@playwright/test';
import { Severity } from 'allure-js-commons';
import { LoginPage } from './pages/LoginPage';
import { invalidLoginUsers, validLoginUsers } from './data/login.data';
import { addAllureMetadata, evidenceStep } from './utils/allureHelpers';

test.describe('Login', () => {
  test.describe.configure({ mode: 'serial' });

  test('shows login form fields and actions', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await addAllureMetadata({
      feature: 'Login',
      story: 'Login form availability',
      severity: Severity.CRITICAL,
      owner: 'QA Automation',
      tags: ['login', 'ui', 'smoke'],
      description: 'Verify that the Tastelife login page exposes all required fields and actions.',
    });

    await evidenceStep(testInfo, page, 'Open login page', async () => {
      await loginPage.goto();
      await loginPage.expectLoginFormVisible();
    });
  });

  test('shows required field errors when username and password are empty', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await addAllureMetadata({
      feature: 'Login',
      story: 'Required field validation',
      severity: Severity.NORMAL,
      owner: 'QA Automation',
      tags: ['login', 'validation', 'negative'],
      description: 'Verify required validation messages when the login form is submitted without credentials.',
    });

    await evidenceStep(testInfo, page, 'Open login page', async () => {
      await loginPage.goto();
      await loginPage.expectLoginFormVisible();
    });

    await evidenceStep(testInfo, page, 'Submit empty login form and verify validation errors', async () => {
      await loginPage.submitEmptyForm();
      await loginPage.expectRequiredFieldErrors();
    });
  });

  for (const user of invalidLoginUsers) {
    test(`shows an error for invalid credentials: ${user.name}`, async ({ page }, testInfo) => {
      const loginPage = new LoginPage(page);

      await addAllureMetadata({
        feature: 'Login',
        story: 'Invalid credential validation',
        severity: Severity.CRITICAL,
        owner: 'QA Automation',
        tags: ['login', 'data-driven', 'negative'],
        description: `Verify invalid credential handling for the ${user.name} data set.`,
        parameters: [
          { name: 'username', value: user.username },
          { name: 'password', value: user.password, masked: true },
        ],
      });

      await evidenceStep(testInfo, page, 'Open login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoginFormVisible();
      });

      await evidenceStep(testInfo, page, `Submit invalid credentials for ${user.name}`, async () => {
        await loginPage.login(user.username, user.password);
        await loginPage.expectInvalidCredentialsError();
      });
    });
  }

  for (const user of validLoginUsers) {
    test(`logs in with valid credentials: ${user.name}`, async ({ page }, testInfo) => {
      const loginPage = new LoginPage(page);

      await addAllureMetadata({
        feature: 'Login',
        story: 'Successful login',
        severity: Severity.BLOCKER,
        owner: 'QA Automation',
        tags: ['login', 'data-driven', 'positive', 'smoke'],
        description: `Verify successful login for the ${user.name} data set.`,
        parameters: [
          { name: 'username', value: user.username },
          { name: 'password', value: user.password, masked: true },
        ],
      });

      await evidenceStep(testInfo, page, 'Open login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoginFormVisible();
      });

      await evidenceStep(testInfo, page, `Log in as ${user.name} and verify authenticated page`, async () => {
        await loginPage.login(user.username, user.password);
        await loginPage.expectLoggedIn();
      });
    });
  }
});
