import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const validUser = {
  username: 'vishnoiakhlesh@gmail.com',
  password: 'Q3tech@12345',
};

const invalidUser = {
  username: 'invalid.user@example.com',
  password: 'WrongPassword123!',
};

test.describe('Login', () => {
  test.describe.configure({ mode: 'serial' });

  test('shows login form fields and actions', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoginFormVisible();
  });

  test('shows required field errors when username and password are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.submitEmptyForm();
    await loginPage.expectRequiredFieldErrors();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(invalidUser.username, invalidUser.password);
    await loginPage.expectInvalidCredentialsError();
  });

  test('logs in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(validUser.username, validUser.password);
    await loginPage.expectLoggedIn();
  });
});
