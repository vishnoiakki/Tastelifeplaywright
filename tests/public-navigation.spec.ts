import { test } from '@playwright/test';
import { HomePage, loggedOutPublicTabs } from './pages/HomePage';
import { Severity, annotateTest, attachJson, reportStep } from './utils/reporting';

test.describe('Logged-out public navigation', () => {
  test('shows public tab names on the home page top navigation', async ({ page }) => {
    await annotateTest({
      id: 'PUBLIC-NAV-001',
      feature: 'Public Navigation',
      story: 'Logged-out top navigation',
      severity: Severity.CRITICAL,
      testType: 'Smoke',
      requirement: 'Logged-out users must see Home, About, Contact, and Legal tabs on the home page.',
      risk: 'Guests cannot discover public content if primary navigation labels are missing or incorrect.',
      description:
        'Opens the home page while logged out and verifies the public top navigation displays the Home, About, Contact, and Legal tab names with their expected destinations.',
      tags: ['public-navigation', 'logged-out', 'smoke', 'ui'],
    });

    const homePage = new HomePage(page);

    await attachJson(
      'Expected logged-out public tabs',
      loggedOutPublicTabs.map(({ name, path }) => ({ name, path })),
    );
    await reportStep('Open the home page', async () => {
      await homePage.open();
    });
    await reportStep('Verify public tab names in the top navigation', async () => {
      await homePage.expectLoggedOutPublicTabsAreVisible();
    });
  });

  loggedOutPublicTabs.forEach((tab, index) => {
    test(`${tab.name} tab opens its detail page with important elements`, async ({ page }) => {
      await annotateTest({
        id: `PUBLIC-NAV-${String(index + 2).padStart(3, '0')}`,
        feature: 'Public Navigation',
        story: `${tab.name} tab detail page`,
        severity: Severity.NORMAL,
        testType: 'Smoke',
        requirement: `Logged-out users must be able to open the ${tab.name} tab and see its key page content.`,
        risk: `Guests may reach a broken or incomplete ${tab.name} page if tab routing or content rendering regresses.`,
        description:
          `Starts from the home page, clicks the ${tab.name} top-navigation tab, and verifies the destination URL, title, navigation, and important page-specific content.`,
        tags: ['public-navigation', 'logged-out', 'detail-page', tab.name.toLowerCase()],
      });

      const homePage = new HomePage(page);

      await attachJson('Public tab scenario', { name: tab.name, path: tab.path });
      await reportStep('Open the home page', async () => {
        await homePage.open();
      });
      await reportStep(`Open the ${tab.name} tab`, async () => {
        await homePage.openTab(tab.name);
      });
      await reportStep(`Verify important ${tab.name} page elements`, async () => {
        await homePage.expectTabDetailPage(tab);
      });
    });
  });
});
