import { missingEnvMessage, readEnv } from '../utils/env';

export type LoginUser = {
  username: string;
  password: string;
};

export const validLoginEnvVars = ['TASTELIFE_VALID_USERNAME', 'TASTELIFE_VALID_PASSWORD'];
export const missingValidLoginMessage = missingEnvMessage(validLoginEnvVars);

export const invalidLoginUser: LoginUser = {
  username: readEnv('TASTELIFE_INVALID_USERNAME') ?? 'invalid.user@example.com',
  password: readEnv('TASTELIFE_INVALID_PASSWORD') ?? 'WrongPassword123!',
};

export const validLoginUser = getValidLoginUser();

function getValidLoginUser(): LoginUser | undefined {
  const username = readEnv('TASTELIFE_VALID_USERNAME');
  const password = readEnv('TASTELIFE_VALID_PASSWORD');

  if (!username || !password) {
    return undefined;
  }

  return { username, password };
}
