import { expect, type Locator, type Page } from '@playwright/test';

export type LoggedOutPublicTabName = 'Home' | 'About' | 'Contact' | 'Legal';

export type LoggedOutPublicTab = {
  name: LoggedOutPublicTabName;
  path: string;
  urlPattern: RegExp;
  titlePattern: RegExp;
};

export const loggedOutPublicTabs: LoggedOutPublicTab[] = [
  {
    name: 'Home',
    path: '/',
    urlPattern: /\/$/,
    titlePattern: /Home \| Tastelife/i,
  },
  {
    name: 'About',
    path: '/about-us',
    urlPattern: /\/about-us$/,
    titlePattern: /About Us \| Tastelife/i,
  },
  {
    name: 'Contact',
    path: '/faq',
    urlPattern: /\/faq$/,
    titlePattern: /FAQ \| Tastelife/i,
  },
  {
    name: 'Legal',
    path: '/legal',
    urlPattern: /\/legal$/,
    titlePattern: /Legal \| Tastelife/i,
  },
];

export class HomePage {
  private page: Page;
  private mainNavigation: Locator;
  private publicTabLinks: Locator;
  private pageContent: Locator;
  private heroBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainNavigation = page.locator('#block-tastelife-main-menu');
    this.publicTabLinks = this.mainNavigation.locator('.navbar-nav .nav-link:not([href="/tastelife_login"])');
    this.pageContent = page.locator('main[role="main"]');
    this.heroBanner = page.locator('#bannercontent');
  }

  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async expectLoggedOutPublicTabsAreVisible(): Promise<void> {
    await expect(this.mainNavigation).toBeVisible();
    await expect(this.publicTabLinks).toHaveText(loggedOutPublicTabs.map((tab) => tab.name));

    for (const tab of loggedOutPublicTabs) {
      await expect(this.tabLink(tab.name)).toHaveAttribute('href', tab.path);
    }
  }

  async openTab(tabName: LoggedOutPublicTabName): Promise<void> {
    await this.tabLink(tabName).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectTabDetailPage(tab: LoggedOutPublicTab): Promise<void> {
    await expect(this.page).toHaveURL(tab.urlPattern);
    await expect(this.page).toHaveTitle(tab.titlePattern);
    await expect(this.mainNavigation).toBeVisible();

    switch (tab.name) {
      case 'Home':
        await this.expectHomeContent();
        break;
      case 'About':
        await this.expectAboutContent();
        break;
      case 'Contact':
        await this.expectContactContent();
        break;
      case 'Legal':
        await this.expectLegalContent();
        break;
    }
  }

  private tabLink(tabName: LoggedOutPublicTabName): Locator {
    return this.mainNavigation.getByRole('link', { name: new RegExp(`^${tabName}$`, 'i') });
  }

  private async expectHomeContent(): Promise<void> {
    await expect(this.heroBanner.getByText(/Delivering Health and Wellbeing services across Australia\./i)).toBeVisible();
    await expect(this.heroBanner.getByRole('link', { name: 'Discover More' })).toHaveAttribute(
      'href',
      '/tastelife_login',
    );
    await expect(this.pageContent.getByText('Physical Health', { exact: true })).toBeVisible();
    await expect(this.pageContent.getByText('Nutritional Health', { exact: true })).toBeVisible();
    await expect(this.pageContent.getByText('Mental Health', { exact: true })).toBeVisible();
    await expect(this.pageContent.getByText('Social Health', { exact: true })).toBeVisible();
  }

  private async expectAboutContent(): Promise<void> {
    const aboutPage = this.pageContent.locator('.view-about-us');

    await expect(aboutPage).toBeVisible();
    await expect(aboutPage.getByText('Welcome To Tastelife', { exact: true })).toBeVisible();
    await expect(aboutPage.getByText('Our program is based on 4 key pillars', { exact: true })).toBeVisible();
    await expect(aboutPage.getByText('Physical Health', { exact: true })).toBeVisible();
    await expect(aboutPage.getByText('Nutrition', { exact: true })).toBeVisible();
    await expect(aboutPage.getByText('Mental Health', { exact: true })).toBeVisible();
    await expect(aboutPage.getByText('Social & Community Health', { exact: true })).toBeVisible();
    await expect(aboutPage.getByRole('link', { name: 'Newsletter' })).toBeVisible();
  }

  private async expectContactContent(): Promise<void> {
    const supportBlock = this.page.locator('.support-block');
    const faqPage = this.pageContent.locator('.view-faq');

    await expect(supportBlock).toBeVisible();
    await expect(supportBlock.getByRole('link', { name: 'Tech Support' })).toHaveAttribute(
      'href',
      /mailto:guesst@compass-group\.com\.au/i,
    );
    await expect(supportBlock.getByRole('link', { name: 'Site Support' })).toHaveAttribute(
      'href',
      /mailto:tastelife@compass-group\.com\.au/i,
    );
    await expect(faqPage).toBeVisible();
    await expect(faqPage.getByText('General FAQ', { exact: true })).toBeVisible();
    await expect(faqPage.getByText('Account FAQ', { exact: true })).toBeVisible();
    await expect(faqPage.getByText('What is Tastelife?', { exact: true })).toBeVisible();
  }

  private async expectLegalContent(): Promise<void> {
    const legalPage = this.pageContent.locator('.view-terms-and-conditons');

    await expect(legalPage).toBeVisible();
    await expect(legalPage.getByText('Terms and Conditions', { exact: true })).toBeVisible();
    await expect(
      legalPage.getByText(/PLEASE READ THE FOLLOWING TERMS AND CONDITIONS CAREFULLY/i),
    ).toBeVisible();
    await expect(legalPage.getByText('Use of website at my own risk', { exact: true })).toBeVisible();
    await expect(legalPage.getByText('Disclaimer', { exact: true })).toBeVisible();
    await expect(legalPage.getByText('Governing Law', { exact: true })).toBeVisible();
    await expect(legalPage.getByText('Data Protection, Privacy Policy and Cookies', { exact: true })).toBeVisible();
  }
}
