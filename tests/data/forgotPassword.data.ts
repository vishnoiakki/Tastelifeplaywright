import { missingAnyEnvMessage, readEnv } from '../utils/env';

type EmailExample = {
  email: string;
};

const registeredEmailValue = readEnv('TASTELIFE_REGISTERED_EMAIL') ?? readEnv('TASTELIFE_VALID_USERNAME');
const registeredEmailEnvVars = ['TASTELIFE_REGISTERED_EMAIL', 'TASTELIFE_VALID_USERNAME'];

export const missingRegisteredEmailMessage = missingAnyEnvMessage(registeredEmailEnvVars);

export const malformedEmail: EmailExample = {
  email: 'not-an-email',
};

export const unregisteredEmail: EmailExample = {
  email: readEnv('TASTELIFE_UNREGISTERED_EMAIL') ?? 'invalid.user@example.com',
};

export const registeredEmail: EmailExample | undefined = registeredEmailValue ? { email: registeredEmailValue } : undefined;
