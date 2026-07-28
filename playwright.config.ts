import { defineConfig, devices } from '@playwright/test';
import { Status } from 'allure-js-commons';
import { appConfig, readEnv } from './tests/utils/env';

const isCI = !!process.env.CI;
const hasValidLoginCredentials = !!(readEnv('TASTELIFE_VALID_USERNAME') && readEnv('TASTELIFE_VALID_PASSWORD'));
const registeredForgotPasswordSource = readEnv('TASTELIFE_REGISTERED_EMAIL')
  ? 'TASTELIFE_REGISTERED_EMAIL'
  : readEnv('TASTELIFE_VALID_USERNAME')
    ? 'TASTELIFE_VALID_USERNAME fallback'
    : 'Missing';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/utils/globalSetup.ts',
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: false,
        suiteTitle: true,
        globalLabels: {
          epic: 'Tastelife Web',
          layer: 'e2e',
          owner: 'QA Automation',
        },
        environmentInfo: {
          Application: 'Tastelife',
          Environment: 'UAT',
          BaseURL: appConfig.baseURL,
          Framework: 'Playwright',
          Language: 'TypeScript',
          TestLayer: 'End-to-end UI automation',
          TestSuites: 'Login, Signup, Forgot Password, Public Navigation',
          RunType: isCI ? 'CI' : 'Local',
          BrowserProject: 'Chromium',
          ValidLoginCredentials: hasValidLoginCredentials ? 'Configured' : 'Missing',
          RegisteredForgotPasswordData: registeredForgotPasswordSource,
          Platform: process.platform,
          NodeVersion: process.version,
        },
        categories: [
          {
            name: 'Business rule validation failures',
            matchedStatuses: [Status.FAILED],
            messageRegex: '.*(field is required|not valid|must be 9 or 10 digits|email address).*',
          },
          {
            name: 'Credential or test data configuration',
            matchedStatuses: [Status.SKIPPED, Status.BROKEN],
            messageRegex: '.*(Set TASTELIFE_|\\.env|credentials).*',
          },
          {
            name: 'Assertion failures',
            matchedStatuses: [Status.FAILED],
            messageRegex: '.*expect.*',
          },
          {
            name: 'Application errors',
            matchedStatuses: [Status.FAILED, Status.BROKEN],
            messageRegex: '.*(500|502|503|504|server|application).*',
          },
          {
            name: 'Timeouts',
            matchedStatuses: [Status.FAILED, Status.BROKEN],
            messageRegex: '.*(Timeout|timeout).*',
          },
        ],
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: appConfig.baseURL,

    /* Collect rich evidence for Allure and Playwright reports. */
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //  name: 'firefox',
    //  use: { ...devices['Desktop Firefox'] },
    //},

   // {
    //  name: 'webkit',
     // use: { ...devices['Desktop Safari'] },
    //},

    /* Test against mobile viewports. */
    // {
     //name: 'Mobile Chrome',
      //use: { ...devices['Pixel 5'] },
    //},
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
