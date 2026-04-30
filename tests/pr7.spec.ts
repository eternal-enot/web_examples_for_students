import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Практична робота №7: Todo List', () => {

  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('Має правильний заголовок', async ({ page }) => {
    await expect(page).toHaveTitle(/Практична робота №7 \| Reactive Todo/);
    await expect(page.locator('h1')).toContainText('Todo List');
  });

  test('Додавання нового завдання', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await expect(todoPage.list).toContainText('Задач за поточним фільтром не знайдено');

    await todoPage.addTodo('Вивчити Playwright');

    await expect(todoPage.list).toContainText('Вивчити Playwright');
    await expect(todoPage.metaInfo).toContainText('Всього: 1');
  });

  test('Робота фільтрів завдань', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.addTodo('Завдання 1');
    await todoPage.addTodo('Завдання 2');

    // Нові задачі додаються на початок, тому першою є "Завдання 2"
    const firstCheckbox = todoPage.items().first().locator('input[type="checkbox"]');
    await firstCheckbox.check();

    await todoPage.setFilter('active');
    await expect(todoPage.items()).toHaveCount(1);
    await expect(todoPage.list).toContainText('Завдання 1');

    await todoPage.setFilter('completed');
    await expect(todoPage.items()).toHaveCount(1);
    await expect(todoPage.list).toContainText('Завдання 2');
  });

});
