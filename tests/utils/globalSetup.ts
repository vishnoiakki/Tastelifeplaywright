import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function writeAllureExecutorInfo(): void {
  const resultsDir = resolve(process.cwd(), 'allure-results');

  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(
    resolve(resultsDir, 'executor.json'),
    JSON.stringify(
      {
        name: process.env.CI ? 'CI Pipeline' : 'Local Playwright Runner',
        type: process.env.CI ? 'ci' : 'local',
        buildName: process.env.CI ? process.env.GITHUB_RUN_NUMBER ?? 'CI Run' : 'Local UAT Automation Run',
        buildUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          : undefined,
        reportName: 'Tastelife UAT E2E Automation Report',
      },
      null,
      2,
    ),
    'utf-8',
  );
}

export default async function globalSetup(): Promise<void> {
  writeAllureExecutorInfo();
}
