import { test } from '@playwright/test';
import {
  createValidSignupUser,
  malformedSignupEmail,
  shortSignupMobile,
  type SignupUser,
} from './data/signup.data';
import { SignupPage } from './pages/SignupPage';
import { Severity, annotateTest, attachJson, reportStep } from './utils/reporting';

function signupDataForReport(user: SignupUser): SignupUser {
  return user;
}

test.describe('Signup page', () => {
  test('shows all signup form fields', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-SIGNUP-001',
      feature: 'Authentication - Signup',
      story: 'Signup form availability',
      severity: Severity.CRITICAL,
      testType: 'Smoke',
      requirement: 'Guest users must be able to access the signup form.',
      risk: 'Users cannot register if mandatory signup controls are missing or hidden.',
      description:
        'Verifies that the signup page loads successfully and displays all visible input, dropdown, checkbox, submit, and login navigation controls.',
      tags: ['signup', 'smoke', 'ui'],
    });

    const signupPage = new SignupPage(page);

    await reportStep('Open the signup page', async () => {
      await signupPage.open();
    });
    await reportStep('Verify all signup form controls are visible', async () => {
      await signupPage.expectFormIsVisible();
    });
  });

  test('accepts valid values for each signup field', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-SIGNUP-002',
      feature: 'Authentication - Signup',
      story: 'Signup field entry',
      severity: Severity.NORMAL,
      testType: 'Positive',
      requirement: 'Signup form must accept valid input values for every field.',
      risk: 'Users cannot complete registration if valid values are rejected before submission.',
      description:
        'Fills valid values into every signup field, including optional middle name and mailing-list opt-out, then verifies the form retains the entered values.',
      tags: ['signup', 'happy-path', 'field-entry'],
    });

    const signupPage = new SignupPage(page);
    const signupUser = createValidSignupUser({ optOutMailingList: true });

    await attachJson('Generated signup data', signupDataForReport(signupUser));
    await reportStep('Open the signup page', async () => {
      await signupPage.open();
    });
    await reportStep('Fill valid values in all signup fields', async () => {
      await signupPage.fillForm(signupUser);
    });
    await reportStep('Verify each entered value remains selected or populated', async () => {
      await signupPage.expectFormValues(signupUser);
    });
  });

  test('creates an account when required signup details are valid and middle name is omitted', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-SIGNUP-003',
      feature: 'Authentication - Signup',
      story: 'Successful account creation',
      severity: Severity.BLOCKER,
      testType: 'Positive',
      requirement: 'Guest users must be able to create an account with valid required details.',
      risk: 'Registration failure blocks new users from accessing the application.',
      description:
        'Submits the signup form with all required fields valid and middle name blank, proving middle name is optional and registration reaches the thank-you page.',
      tags: ['signup', 'happy-path', 'account-creation'],
    });

    const signupPage = new SignupPage(page);
    const signupUser = createValidSignupUser({ middleName: '' });

    await attachJson('Generated signup data', signupDataForReport(signupUser));
    await reportStep('Open the signup page', async () => {
      await signupPage.open();
    });
    await reportStep('Submit valid required signup details', async () => {
      await signupPage.signup(signupUser);
    });
    await reportStep('Verify account creation confirmation page', async () => {
      await signupPage.expectAccountCreated();
    });
  });

  test('shows required errors when mandatory signup fields are empty', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-SIGNUP-004',
      feature: 'Authentication - Signup',
      story: 'Mandatory field validation',
      severity: Severity.CRITICAL,
      testType: 'Negative',
      requirement: 'Signup form must prevent empty submission of mandatory fields.',
      risk: 'Incomplete registrations create bad data and poor user feedback.',
      description:
        'Clicks Next on an empty signup form and verifies all required-field validation messages are displayed together.',
      tags: ['signup', 'validation', 'negative'],
    });

    const signupPage = new SignupPage(page);

    await reportStep('Open the signup page', async () => {
      await signupPage.open();
    });
    await reportStep('Submit the empty signup form', async () => {
      await signupPage.submit();
    });
    await reportStep('Verify all mandatory-field errors are displayed', async () => {
      await signupPage.expectRequiredFieldErrors();
    });
  });

  const requiredFieldCases: Array<{
    fieldName: string;
    overrides: Partial<SignupUser>;
    expectedError: RegExp;
  }> = [
    {
      fieldName: 'first name',
      overrides: { firstName: '' },
      expectedError: /First Name field is required/i,
    },
    {
      fieldName: 'last name',
      overrides: { lastName: '' },
      expectedError: /Last Name field is required/i,
    },
    {
      fieldName: 'email',
      overrides: { email: '' },
      expectedError: /Email field is required/i,
    },
    {
      fieldName: 'mobile',
      overrides: { mobile: '' },
      expectedError: /Mobile field is required/i,
    },
    {
      fieldName: 'age range',
      overrides: { ageRange: '' },
      expectedError: /Age Range field is required/i,
    },
    {
      fieldName: 'gender',
      overrides: { gender: '' },
      expectedError: /Gender field is required/i,
    },
    {
      fieldName: 'site',
      overrides: { site: '', company: '' },
      expectedError: /Site field is required/i,
    },
    {
      fieldName: 'company name',
      overrides: { company: '' },
      expectedError: /Company field is required/i,
    },
    {
      fieldName: 'terms and conditions',
      overrides: { acceptTerms: false },
      expectedError: /Terms and Conditions field is required/i,
    },
  ];

  for (const { fieldName, overrides, expectedError } of requiredFieldCases) {
    test(`requires ${fieldName}`, async ({ page }) => {
      await annotateTest({
        id: `AUTH-SIGNUP-REQ-${fieldName.toUpperCase().replaceAll(' ', '-')}`,
        feature: 'Authentication - Signup',
        story: 'Mandatory field validation',
        severity: Severity.NORMAL,
        testType: 'Negative',
        requirement: `Signup form must require ${fieldName}.`,
        risk: `Registration data can become incomplete if ${fieldName} is not validated.`,
        description:
          `Fills all other signup data with valid values, leaves ${fieldName} empty or unchecked, submits the form, and verifies the required-field error.`,
        tags: ['signup', 'validation', 'negative', 'required-field'],
      });

      const signupPage = new SignupPage(page);
      const signupUser = createValidSignupUser(overrides);

      await attachJson('Validation scenario', {
        fieldName,
        omittedOrInvalidValue: overrides,
        expectedError: expectedError.source,
      });
      await reportStep('Open the signup page', async () => {
        await signupPage.open();
      });
      await reportStep(`Submit signup form with missing ${fieldName}`, async () => {
        await signupPage.signup(signupUser);
      });
      await reportStep(`Verify required validation for ${fieldName}`, async () => {
        await signupPage.expectErrorText(expectedError);
      });
    });
  }

  test('rejects email when format is invalid', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-SIGNUP-014',
      feature: 'Authentication - Signup',
      story: 'Email format validation',
      severity: Severity.NORMAL,
      testType: 'Negative',
      requirement: 'Signup form must reject malformed email addresses.',
      risk: 'Invalid email addresses prevent account confirmation and password creation delivery.',
      description:
        'Submits signup with an invalid email format while all other fields are valid, then verifies the email-format validation message.',
      tags: ['signup', 'validation', 'negative', 'email'],
    });

    const signupPage = new SignupPage(page);
    const signupUser = createValidSignupUser({ email: malformedSignupEmail });

    await attachJson('Validation scenario', {
      fieldName: 'email',
      invalidValue: malformedSignupEmail,
      expectedErrors: ['email address is not valid', 'Use the format user@example.com'],
    });
    await reportStep('Open the signup page', async () => {
      await signupPage.open();
    });
    await reportStep('Submit signup form with malformed email address', async () => {
      await signupPage.signup(signupUser);
    });
    await reportStep('Verify email-format validation messages', async () => {
      await signupPage.expectErrorText(/email address .* is not valid/i);
      await signupPage.expectErrorText(/format user@example\.com/i);
    });
  });

  test('rejects mobile number when it is shorter than 9 digits', async ({ page }) => {
    await annotateTest({
      id: 'AUTH-SIGNUP-015',
      feature: 'Authentication - Signup',
      story: 'Mobile number validation',
      severity: Severity.NORMAL,
      testType: 'Negative',
      requirement: 'Signup form must require a 9 or 10 digit mobile number.',
      risk: 'Invalid mobile numbers reduce account contactability and data quality.',
      description:
        'Submits signup with a short mobile number while all other fields are valid, then verifies the mobile-length validation message.',
      tags: ['signup', 'validation', 'negative', 'mobile'],
    });

    const signupPage = new SignupPage(page);
    const signupUser = createValidSignupUser({ mobile: shortSignupMobile });

    await attachJson('Validation scenario', {
      fieldName: 'mobile',
      invalidValue: shortSignupMobile,
      expectedError: 'Mobile number must be 9 or 10 digits',
    });
    await reportStep('Open the signup page', async () => {
      await signupPage.open();
    });
    await reportStep('Submit signup form with short mobile number', async () => {
      await signupPage.signup(signupUser);
    });
    await reportStep('Verify mobile-length validation message', async () => {
      await signupPage.expectErrorText(/Mobile number must be 9 or 10 digits/i);
    });
  });
});
