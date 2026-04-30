# Посібник: CI/CD, Тестування та Якість Коду

Цей посібник описує повний pipeline автоматизації, реалізований у проєкті. Він охоплює три рівні якості коду та автоматичне розгортання на GitHub Pages.

---

## Огляд: Як влаштований pipeline

При кожному `git push` в гілку `main` GitHub Actions запускає три job-и **по черзі**:

```
push до main
    │
    ▼
┌─────────────────────────┐
│  1. quality             │  ESLint + Vitest unit-тести
│     ~30 секунд          │  (якщо падає — далі нічого не запускається)
└────────────┬────────────┘
             │ успіх
             ▼
┌─────────────────────────┐
│  2. test                │  Playwright E2E тести в браузері
│     ~60–120 секунд      │  (якщо падає — деплою не буде)
└────────────┬────────────┘
             │ успіх
             ▼
┌─────────────────────────┐
│  3. deploy              │  Публікація на GitHub Pages
└─────────────────────────┘
```

**Піраміда тестування** у цьому проєкті:
- **Основа (unit)** — Vitest тестує чисті функції: швидко, без браузера
- **Вершина (E2E)** — Playwright тестує в реальному браузері: повільніше, але перевіряє весь UX

---

## Частина 1: Unit-тести з Vitest

### Що таке unit-тести

Unit-тест перевіряє **одну функцію** в **ізоляції** від решти коду. Переваги:
- Виконуються за мілісекунди
- Не потребують браузера чи сервера
- Дають точну відповідь: яка саме функція зламалась

### 1.1 Встановлення

```bash
npm install -D vitest
```

### 1.2 Конфігурація: `vitest.config.ts`

Файл у корені проєкту вказує Vitest де шукати тести:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'], // тільки файли *.test.ts у папці tests/unit/
  },
});
```

**Чому окрема папка `tests/unit/`?**
Щоб Playwright не намагався запускати unit-тести як E2E. У `playwright.config.ts` є рядок `testIgnore: ['**/unit/**']` — він виключає цю папку з E2E запуску.

### 1.3 Скрипти у `package.json`

```json
"test:unit": "vitest run",
"test:unit:watch": "vitest"
```

- `vitest run` — запустити всі тести один раз і вийти (для CI)
- `vitest` — запустити в режимі watch (для розробки: перезапускає при змінах)

### 1.4 Що ми тестуємо: `tests/unit/todo.utils.ts`

З логіки TodoApp (pr7) виокремлені **чисті функції** — ті що не залежать від DOM чи RxJS.
Це стандартна практика: виносити логіку в окремий модуль, щоб її можна було тестувати.

```typescript
// tests/unit/todo.utils.ts

export type TodoFilter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
}

// Фільтрує масив задач за типом фільтра
export function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
  if (filter === 'active') return todos.filter((t) => !t.completed);
  if (filter === 'completed') return todos.filter((t) => t.completed);
  return todos; // 'all'
}

// Повертає статистику: скільки всього / активних / виконаних
export function getTodoStats(todos: Todo[]): TodoStats {
  const completed = todos.filter((t) => t.completed).length;
  return { total: todos.length, active: todos.length - completed, completed };
}

// Екранує спецсимволи HTML щоб уникнути XSS
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Перевіряє чи є невідомий об'єкт коректним Todo (для localStorage)
export function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.createdAt === 'number'
  );
}
```

### 1.5 Написання тестів: `tests/unit/todo.utils.test.ts`

Vitest використовує API: `describe` (група тестів), `it`/`test` (один тест), `expect` (перевірка).

```typescript
import { describe, it, expect } from 'vitest';
import { filterTodos, getTodoStats, escapeHtml, isTodo } from './todo.utils';
import type { Todo } from './todo.utils';

// Допоміжна функція: створює тестовий об'єкт Todo з дефолтними значеннями
// overrides дозволяє замінити будь-яке поле
const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '1',
  text: 'Test todo',
  completed: false,
  createdAt: 1000000,
  ...overrides,
});

// describe — групує пов'язані тести
describe('filterTodos', () => {

  const todos: Todo[] = [
    makeTodo({ id: '1', text: 'Активна задача', completed: false }),
    makeTodo({ id: '2', text: 'Виконана задача', completed: true }),
    makeTodo({ id: '3', text: 'Ще одна активна', completed: false }),
  ];

  // it — один тест. Назва: "що повинно статись"
  it('повертає всі задачі при фільтрі "all"', () => {
    // expect(отримане).toHaveLength(очікуване)
    expect(filterTodos(todos, 'all')).toHaveLength(3);
  });

  it('повертає тільки активні при фільтрі "active"', () => {
    const result = filterTodos(todos, 'active');
    expect(result).toHaveLength(2);
    expect(result.every((t) => !t.completed)).toBe(true);
  });

  it('повертає тільки виконані при фільтрі "completed"', () => {
    const result = filterTodos(todos, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Виконана задача');
  });

  it('повертає порожній масив коли нема задач', () => {
    expect(filterTodos([], 'active')).toHaveLength(0);
  });
});

describe('getTodoStats', () => {
  it('повертає правильні лічильники', () => {
    const todos = [
      makeTodo({ completed: false }),
      makeTodo({ completed: true }),
      makeTodo({ completed: false }),
    ];
    const stats = getTodoStats(todos);
    expect(stats.total).toBe(3);
    expect(stats.active).toBe(2);
    expect(stats.completed).toBe(1);
  });

  it('total = active + completed завжди', () => {
    const todos = [makeTodo({ completed: true }), makeTodo({ completed: true })];
    const stats = getTodoStats(todos);
    expect(stats.active + stats.completed).toBe(stats.total);
  });
});

describe('escapeHtml', () => {
  it('екранує < та >', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('захищає від XSS у тексті задачі', () => {
    const input = '<img src=x onerror="alert(1)">';
    expect(escapeHtml(input)).not.toContain('<img');
  });
});

describe('isTodo', () => {
  it('повертає true для валідного Todo', () => {
    expect(isTodo(makeTodo())).toBe(true);
  });

  it('повертає false для null', () => {
    expect(isTodo(null)).toBe(false);
  });

  it('повертає false якщо відсутні поля', () => {
    expect(isTodo({ id: '1', text: 'test' })).toBe(false);
  });
});
```

### 1.6 Запуск unit-тестів

```bash
# Запустити всі unit-тести один раз
npm run test:unit

# Запустити в режимі watch (перезапускає при збереженні файлу)
npm run test:unit:watch

# Запустити конкретний файл
npx vitest run tests/unit/todo.utils.test.ts
```

**Очікуваний вивід:**
```
✓ tests/unit/todo.utils.test.ts (15)
  ✓ filterTodos (4)
  ✓ getTodoStats (3)
  ✓ escapeHtml (5)
  ✓ isTodo (6)

Test Files  1 passed (1)
Tests       15 passed (15)
```

---

## Частина 2: E2E-тести з Playwright

### Що таке E2E-тести

E2E (End-to-End) тести запускають **реальний браузер** і симулюють дії користувача: клікають, вводять текст, перевіряють що сторінка відображає правильне. Це найповільніший, але найбільш реалістичний тип тестів.

### 2.1 Встановлення

```bash
# Встановлення бібліотеки Playwright
npm install -D @playwright/test

# Встановлення локального сервера (для коректної роботи ES-модулів)
npm install -D http-server

# Встановлення браузера Chromium (лише він потрібен для нашого проєкту)
npx playwright install chromium --with-deps
```

### 2.2 Конфігурація: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',           // де шукати тести
  testIgnore: ['**/unit/**'],   // виключити папку з unit-тестами Vitest
  fullyParallel: true,          // запускати тести паралельно між файлами
  forbidOnly: !!process.env.CI, // в CI забороняє test.only (захист від помилок)
  retries: process.env.CI ? 2 : 0, // в CI повторити тест до 2 разів при падінні
  workers: process.env.CI ? 1 : undefined, // в CI — 1 воркер (стабільніше)
  reporter: 'html',             // генерувати HTML-звіт у папці playwright-report/
  use: {
    trace: 'on-first-retry',    // записувати trace при першому retry (для дебагу)
    baseURL: 'http://127.0.0.1:8080', // базова адреса — всі goto() відносні
  },
  // Автоматично запускає http-server перед тестами і вимикає після
  webServer: {
    command: 'npx http-server -p 8080',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: !process.env.CI, // локально — перевикористати існуючий
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

**Пояснення `baseURL`:** завдяки цьому налаштуванню в тестах замість
`page.goto('http://127.0.0.1:8080/index.html')` пишемо просто `page.goto('/index.html')`.

### 2.3 Page Object Model (POM)

**Проблема без POM:** локатори (селектори елементів) розкидані по всіх тестах. Якщо змінився клас кнопки — треба правити десятки рядків у десятках файлів.

**Рішення — POM:** кожна сторінка = окремий клас. Усі локатори та дії — в одному місці. Тест читається як сценарій користувача.

```
tests/
  pages/
    MainPage.ts   ← локатори і дії для index.html
    TodoPage.ts   ← локатори і дії для pr7/index.html
  main.spec.ts    ← використовує MainPage
  pr7.spec.ts     ← використовує TodoPage
```

### 2.4 `tests/pages/MainPage.ts`

```typescript
import { type Page, type Locator } from '@playwright/test';

export class MainPage {
  // Публічні локатори — можна використовувати в тестах для assertions
  readonly heading: Locator;
  readonly cards: Locator;

  constructor(private readonly page: Page) {
    // Локатори визначаємо один раз у конструкторі
    this.heading = page.locator('h1');
    this.cards = page.locator('.card');
  }

  // Метод навігації — інкапсулює goto
  async goto(): Promise<void> {
    await this.page.goto('/index.html');
  }

  // Метод для знаходження картки за текстом заголовка
  card(titleText: string): Locator {
    return this.page.locator('article.card', { hasText: titleText });
  }
}
```

### 2.5 `tests/pages/TodoPage.ts`

```typescript
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
    // addInitScript виконується ДО завантаження сторінки — очищаємо localStorage
    await this.page.addInitScript(() => window.localStorage.clear());
    await this.page.goto('/pr7/index.html');
    // Чекаємо поки JS ініціалізується і metaInfo відмалюється
    await this.metaInfo.waitFor();
  }

  // Метод addTodo інкапсулює: заповнити поле + клік по кнопці
  async addTodo(text: string): Promise<void> {
    await this.input.fill(text);
    await this.submitBtn.click();
  }

  // Метод setFilter кліє по кнопці фільтра
  async setFilter(filter: 'all' | 'active' | 'completed'): Promise<void> {
    await this.page.locator(`button[data-filter="${filter}"]`).click();
  }

  // Повертає локатор всіх видимих задач (виключає пустий стан)
  items(): Locator {
    return this.list.locator('li:not(.todo-empty)');
  }
}
```

### 2.6 `tests/main.spec.ts` — тести головної сторінки

```typescript
import { test, expect } from '@playwright/test';
import { MainPage } from './pages/MainPage';

test.describe('Головна сторінка навігації', () => {

  // Кожен test отримує ізольований page (свіжий браузерний контекст)
  test('Має правильний заголовок сторінки', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.goto();

    // Перевіряємо <title> сторінки
    await expect(page).toHaveTitle(/Веб-технології та веб-дизайн/);
    // Перевіряємо <h1> через локатор з POM
    await expect(mainPage.heading).toContainText('Веб-технології та веб-дизайн');
  });

  test('Містить картки лабораторних робіт', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.goto();

    // toHaveCount — auto-wait: чекає поки кількість елементів стане 8
    await expect(mainPage.cards).toHaveCount(8);
  });

  test('Посилання на лабораторну роботу №2 веде на правильну сторінку', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.goto();

    // mainPage.card() повертає локатор конкретної картки
    const pr2Card = mainPage.card('Лабораторна робота №2');
    const siteLink = pr2Card.locator('a.btn', { hasText: 'Сайт' });
    await expect(siteLink).toHaveAttribute('href', 'pr2/index.html');
  });

});
```

### 2.7 `tests/pr7.spec.ts` — тести TodoApp

```typescript
import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Практична робота №7: Todo List', () => {

  // beforeEach — виконується перед КОЖНИМ тестом
  // Тут: очищаємо localStorage і відкриваємо сторінку
  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto(); // включає clear localStorage + goto + waitFor
  });

  test('Має правильний заголовок', async ({ page }) => {
    await expect(page).toHaveTitle(/Практична робота №7 \| Reactive Todo/);
    await expect(page.locator('h1')).toContainText('Todo List');
  });

  test('Додавання нового завдання', async ({ page }) => {
    const todoPage = new TodoPage(page);

    // На початку список порожній
    await expect(todoPage.list).toContainText('Задач за поточним фільтром не знайдено');

    // Додаємо задачу через метод POM
    await todoPage.addTodo('Вивчити Playwright');

    // Перевіряємо що задача з'явилась і лічильник оновився
    await expect(todoPage.list).toContainText('Вивчити Playwright');
    await expect(todoPage.metaInfo).toContainText('Всього: 1');
  });

  test('Робота фільтрів завдань', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.addTodo('Завдання 1');
    await todoPage.addTodo('Завдання 2'); // нові додаються на початок

    // Перша в списку — "Завдання 2". Відмічаємо її як виконану
    const firstCheckbox = todoPage.items().first().locator('input[type="checkbox"]');
    await firstCheckbox.check();

    // Фільтр "Активні" — має бути тільки "Завдання 1"
    await todoPage.setFilter('active');
    await expect(todoPage.items()).toHaveCount(1);
    await expect(todoPage.list).toContainText('Завдання 1');

    // Фільтр "Виконані" — має бути тільки "Завдання 2"
    await todoPage.setFilter('completed');
    await expect(todoPage.items()).toHaveCount(1);
    await expect(todoPage.list).toContainText('Завдання 2');
  });

});
```

### 2.8 Шпаргалка: локатори Playwright

| Метод | Використання | Пріоритет |
|---|---|---|
| `getByRole('button', { name: 'Зберегти' })` | Семантичний пошук за ARIA-роллю | Найвищий |
| `getByLabel('Email')` | Пошук input за його `<label>` | Високий |
| `getByText('Привіт')` | Пошук за видимим текстом | Середній |
| `getByPlaceholder('Введіть текст')` | Пошук input за placeholder | Середній |
| `locator('.card')` | CSS-селектор | Нижчий |
| `getByTestId('submit-btn')` | За `data-testid` атрибутом | Fallback |

### 2.9 Шпаргалка: assertions (перевірки)

```typescript
// Видимість
await expect(locator).toBeVisible();
await expect(locator).not.toBeVisible();

// Текст
await expect(locator).toHaveText('Точний текст');
await expect(locator).toContainText('Частина тексту');

// Кількість елементів
await expect(locator).toHaveCount(5);

// Атрибути та значення
await expect(locator).toHaveAttribute('href', '/home');
await expect(locator).toHaveValue('введений текст');

// Стан
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();

// Сторінка
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle('Моя сторінка');
```

> **Auto-wait:** всі assertion-и автоматично чекають до 5 секунд поки умова стане true. `waitFor()` потрібен лише у виняткових випадках.

### 2.10 Запуск E2E тестів

```bash
# Запустити всі E2E тести
npm run test:e2e

# Запустити тільки один файл
npx playwright test tests/main.spec.ts

# Запустити в інтерактивному UI-режимі (найзручніше для розробки)
npx playwright test --ui

# Переглянути HTML-звіт після запуску
npx playwright show-report

# Записати тест автоматично (Codegen — корисно для початку)
npx playwright codegen http://127.0.0.1:8080
```

---

## Частина 3: Якість коду з ESLint

### Що таке лінтер

ESLint статично аналізує код **без його запуску** і знаходить:
- Невикористані змінні
- Потенційні помилки типізації
- Порушення стилю

Це швидша перевірка ніж тести, тому вона стоїть **першою** в pipeline.

### 3.1 Встановлення

```bash
npm install -D eslint typescript-eslint
```

### 3.2 Конфігурація: `eslint.config.mjs`

Файл використовує новий **flat config** формат ESLint (v9+). Розширення `.mjs` дозволяє використовувати `import` без `"type": "module"` у `package.json`.

```javascript
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Виключаємо папки що не треба перевіряти
  { ignores: ['**/node_modules/**', '**/dist/**', '**/.angular/**'] },
  {
    files: ['tests/**/*.ts'], // перевіряємо тільки TypeScript файли у tests/
    extends: tseslint.configs.recommended, // базові правила для TypeScript
    rules: {
      // Невикористані змінні — помилка (але параметри з _ — можна)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Явний any — попередження
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
```

### 3.3 Скрипт у `package.json`

```json
"lint": "eslint tests/"
```

### 3.4 Запуск лінтера

```bash
# Перевірити всі файли
npm run lint

# Автоматично виправити прості помилки
npx eslint tests/ --fix
```

**Приклад помилки:**
```
tests/main.spec.ts
  3:8  error  'path' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (1 error, 0 warnings)
```

---

## Частина 4: CI/CD з GitHub Actions

### 4.1 Файл workflow: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages with Tests

on:
  push:
    branches: ["main", "master"]   # запускати при пуші в main
  workflow_dispatch:                # або вручну з вкладки Actions

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false  # не скасовувати деплой що вже йде

jobs:

  # ── JOB 1 ───────────────────────────────────────────────────────────────────
  quality:
    name: Lint & Unit Tests
    runs-on: ubuntu-latest          # віртуальна машина з Ubuntu
    steps:
      - uses: actions/checkout@v4   # клонує репозиторій

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'              # кешує node_modules між запусками

      - run: npm ci                 # детерміноване встановлення з package-lock.json

      - name: Перевірка лінтером (ESLint)
        run: npm run lint           # якщо знайде помилки — job впаде тут

      - name: Unit-тести (Vitest)
        run: npm run test:unit      # якщо тест провалиться — job впаде тут

  # ── JOB 2 ───────────────────────────────────────────────────────────────────
  test:
    name: E2E Tests (Playwright)
    needs: quality                  # ЧЕКАЄ поки quality пройде успішно
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - name: Встановлення браузерів Playwright
        run: npx playwright install --with-deps chromium

      - name: Запуск E2E тестів
        run: npm run test:e2e

      # Зберігаємо звіт навіть якщо тести впали (if: always())
      - name: Збереження звіту Playwright
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 10        # зберігати 10 днів

  # ── JOB 3 ───────────────────────────────────────────────────────────────────
  deploy:
    name: Deploy to GitHub Pages
    needs: test                     # ЧЕКАЄ поки test пройде успішно
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'                 # публікуємо всю кореневу папку
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 4.2 Ключові концепції GitHub Actions

| Поняття | Що це |
|---|---|
| **Workflow** | Весь YAML-файл — опис процесу |
| **Job** | Набір кроків на окремій VM (`quality`, `test`, `deploy`) |
| **Step** | Один крок: `uses` (готова action) або `run` (команда) |
| **Runner** | Віртуальна машина (`ubuntu-latest`) |
| **`needs`** | Залежність між jobs — один чекає іншого |
| **`if: always()`** | Крок виконується навіть якщо попередні впали |
| **`cache: 'npm'`** | Кешує `node_modules` між запусками — пришвидшує pipeline |

### 4.3 Порядок виконання та блокування

```
quality (lint + unit) ─── fail ──→ СТОП. Нічого більше не запускається.
        │
       pass
        │
        ▼
test (playwright e2e) ──── fail ──→ deploy НЕ запускається.
        │
       pass
        │
        ▼
deploy (github pages) ──────────→ Сайт опублікований.
```

### 4.4 Налаштування GitHub Pages (одноразово)

1. Зайдіть у ваш репозиторій на GitHub
2. **Settings** → **Pages**
3. У розділі **Build and deployment** → **Source** → оберіть **GitHub Actions**

Без цього кроку job `deploy` буде падати з помилкою прав доступу.

---

## Крок за кроком: як додати до власного проєкту

### Крок 1 — Встановлення залежностей

```bash
npm install -D vitest eslint typescript-eslint @playwright/test http-server
npx playwright install chromium --with-deps
```

### Крок 2 — Додати скрипти у `package.json`

```json
{
  "scripts": {
    "lint": "eslint tests/",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "npx playwright test"
  }
}
```

### Крок 3 — Створити `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
```

### Крок 4 — Створити `eslint.config.mjs`

```javascript
import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**'] },
  {
    files: ['tests/**/*.ts'],
    extends: tseslint.configs.recommended,
  },
);
```

### Крок 5 — Створити `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**'],
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://127.0.0.1:8080',
  },
  webServer: {
    command: 'npx http-server -p 8080',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

### Крок 6 — Написати utility функції

Виокремте чисту логіку вашого застосунку (функції без DOM) у `tests/unit/your.utils.ts`.

### Крок 7 — Написати unit-тести

Створіть `tests/unit/your.utils.test.ts` і покрийте кожну функцію кількома тестами.
Запустіть: `npm run test:unit`

### Крок 8 — Написати POM класи

Для кожної сторінки що тестується створіть клас у `tests/pages/`.

### Крок 9 — Написати E2E тести

Використайте POM класи у файлах `tests/*.spec.ts`.
Запустіть: `npm run test:e2e`

### Крок 10 — Перевірити лінтер

```bash
npm run lint
```

### Крок 11 — Додати GitHub Actions workflow

Скопіюйте `.github/workflows/deploy.yml` з цього проєкту.
Налаштуйте GitHub Pages як описано в 4.4.

### Крок 12 — Запушити і перевірити

```bash
git add .
git commit -m "Add CI/CD pipeline with tests and linting"
git push
```

Перейдіть на вкладку **Actions** у репозиторії. Ви побачите три job-и по черзі.

---

## Перевірка: як переконатись що pipeline захищає від помилок

**Експеримент 1 — зламати unit-тест:**
Змініть функцію `filterTodos` так щоб вона завжди повертала порожній масив.
Після push: job `quality` впаде на unit-тестах. `test` і `deploy` не запустяться.

**Експеримент 2 — зламати E2E тест:**
Змініть текст заголовка `<h1>` у `index.html` на щось інше.
Після push: `quality` пройде, але `test` впаде. `deploy` не запуститься.

**Експеримент 3 — зламати лінтер:**
Додайте в будь-який `.ts` файл у `tests/` невикористану змінну: `const x = 1;`
Після push: `quality` впаде одразу на lint. Решта не запуститься.

У всіх трьох випадках сайт **не буде оновлений** — зламаний код не потрапить до production.
