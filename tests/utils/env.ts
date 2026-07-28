import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

const localEnvPath = resolve(process.cwd(), '.env');

if (existsSync(localEnvPath)) {
  loadEnvFile(localEnvPath);
}

export function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function missingEnvMessage(names: string[]): string {
  return `Set ${names.join(' and ')} to run this data-driven test.`;
}

export function missingAnyEnvMessage(names: string[]): string {
  return `Set one of ${names.join(' or ')} to run this data-driven test.`;
}

export const appConfig = {
  baseURL: readEnv('TASTELIFE_BASE_URL') ?? 'https://uat.tastelifelivelife.com',
};
