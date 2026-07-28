import { test } from '@playwright/test';
import {
  ContentType,
  Severity,
  attachment,
  description,
  epic,
  feature as allureFeature,
  owner,
  parameter,
  parentSuite,
  severity as allureSeverity,
  story as allureStory,
  subSuite,
  suite,
  tags,
  testCaseId,
} from 'allure-js-commons';

export { Severity };

type TestType = 'Smoke' | 'Positive' | 'Negative' | 'Validation';

type ReportMetadata = {
  id: string;
  feature: string;
  story: string;
  severity: Severity;
  testType: TestType;
  requirement: string;
  risk: string;
  description: string;
  tags?: string[];
};

export async function annotateTest(metadata: ReportMetadata): Promise<void> {
  await testCaseId(metadata.id);
  await epic('Tastelife Web');
  await parentSuite('Tastelife Web');
  await suite(metadata.feature);
  await subSuite(metadata.story);
  await allureFeature(metadata.feature);
  await allureStory(metadata.story);
  await owner('QA Automation');
  await allureSeverity(metadata.severity);
  await tags('e2e', 'playwright', 'uat', ...(metadata.tags ?? []));
  await description(metadata.description);
  await parameter('Test Case ID', metadata.id, { excluded: true });
  await parameter('Test Type', metadata.testType, { excluded: true });
  await parameter('Requirement', metadata.requirement, { excluded: true });
  await parameter('Risk Area', metadata.risk, { excluded: true });
}

export async function reportStep<T>(title: string, action: () => Promise<T>): Promise<T> {
  return await test.step(title, action);
}

export async function attachJson(name: string, value: unknown): Promise<void> {
  await attachment(name, JSON.stringify(value, null, 2), ContentType.JSON);
}
