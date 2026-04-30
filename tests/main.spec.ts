import { test, expect } from '@playwright/test';
import { MainPage } from './pages/MainPage';

test.describe('Головна сторінка навігації', () => {

  test('Має правильний заголовок сторінки', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.goto();

    await expect(page).toHaveTitle(/Веб-технології та веб-дизайн/);
    await expect(mainPage.heading).toContainText('Веб-технології та веб-дизайн');
  });

  test('Містить картки лабораторних робіт', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.goto();

    await expect(mainPage.cards).toHaveCount(8);
  });

  test('Посилання на лабораторну роботу №2 веде на правильну сторінку', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.goto();

    const pr2Card = mainPage.card('Лабораторна робота №2');
    const siteLink = pr2Card.locator('a.btn', { hasText: 'Сайт' });
    await expect(siteLink).toHaveAttribute('href', 'pr2/index.html');
  });

});
