import { type Page, type Locator } from '@playwright/test';

export class TodoPage {
  readonly input: Locator;
  readonly submitBtn: Locator;
  readonly list: Locator;
  readonly metaInfo: Locator;

  constructor(private readonly page: Page) {
    this.input = page.locator('#todoInput');
    this.submitBtn = page.locator('button[type="submit"]');
    this.list = page.locator('#todoList');
    this.metaInfo = page.locator('#metaInfo');
  }

  async goto(): Promise<void> {
    await this.page.addInitScript(() => window.localStorage.clear());
    await this.page.goto('/pr7/index.html');
    await this.metaInfo.waitFor();
  }

  async addTodo(text: string): Promise<void> {
    await this.input.fill(text);
    await this.submitBtn.click();
  }

  async setFilter(filter: 'all' | 'active' | 'completed'): Promise<void> {
    await this.page.locator(`button[data-filter="${filter}"]`).click();
  }

  items(): Locator {
    return this.list.locator('li:not(.todo-empty)');
  }
}
