import { type Page, type Locator } from '@playwright/test';

export class MainPage {
  readonly heading: Locator;
  readonly cards: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator('h1');
    this.cards = page.locator('.card');
  }

  async goto(): Promise<void> {
    await this.page.goto('/index.html');
  }

  card(titleText: string): Locator {
    return this.page.locator('article.card', { hasText: titleText });
  }
}
