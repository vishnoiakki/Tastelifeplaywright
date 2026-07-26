import { test, type Page, type TestInfo } from '@playwright/test';
import * as allure from 'allure-js-commons';

type AllureParameter = {
  name: string;
  value: string;
  masked?: boolean;
};

type AllureMetadata = {
  feature: string;
  story: string;
  severity: string;
  description: string;
  owner?: string;
  tags?: string[];
  parameters?: AllureParameter[];
};

export async function addAllureMetadata(metadata: AllureMetadata): Promise<void> {
  await allure.feature(metadata.feature);
  await allure.story(metadata.story);
  await allure.severity(metadata.severity);
  await allure.description(metadata.description);

  if (metadata.owner) {
    await allure.owner(metadata.owner);
  }

  if (metadata.tags?.length) {
    await allure.tags(...metadata.tags);
  }

  for (const parameter of metadata.parameters ?? []) {
    await allure.parameter(parameter.name, parameter.value, parameter.masked ? { mode: 'masked' } : undefined);
  }
}

export async function evidenceStep<T>(
  testInfo: TestInfo,
  page: Page,
  name: string,
  action: () => Promise<T>,
): Promise<T> {
  return await test.step(name, async () => {
    const result = await action();
    await attachScreenshot(testInfo, page, name);
    return result;
  });
}

async function attachScreenshot(testInfo: TestInfo, page: Page, name: string): Promise<void> {
  const screenshot = await page.screenshot({ fullPage: true });

  await testInfo.attach(`${name} - screenshot`, {
    body: screenshot,
    contentType: 'image/png',
  });
}
