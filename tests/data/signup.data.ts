export type SignupUser = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  ageRange: string;
  gender: string;
  site: string;
  company: string;
  acceptTerms: boolean;
  optOutMailingList: boolean;
};

export const malformedSignupEmail = 'not-an-email';
export const shortSignupMobile = '123';

export function createValidSignupUser(overrides: Partial<SignupUser> = {}): SignupUser {
  const seed = `${Date.now()}.${process.pid}.${Math.floor(Math.random() * 1_000_000)}`;
  const mobileSuffix = Math.floor(100_000_000 + Math.random() * 900_000_000);

  return {
    firstName: 'Auto',
    middleName: 'Test',
    lastName: 'User',
    email: `tastelife.automation.${seed}@example.com`,
    mobile: String(mobileSuffix),
    ageRange: '31 - 45',
    gender: 'Other',
    site: 'Gateway',
    company: 'ESS',
    acceptTerms: true,
    optOutMailingList: false,
    ...overrides,
  };
}
