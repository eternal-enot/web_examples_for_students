import { describe, it, expect } from 'vitest';
import { filterTodos, getTodoStats, escapeHtml, isTodo } from './todo.utils';
import type { Todo } from './todo.utils';

// Допоміжна функція для створення тестового todo
const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '1',
  text: 'Test todo',
  completed: false,
  createdAt: 1000000,
  ...overrides,
});

// ─── filterTodos ─────────────────────────────────────────────────────────────

describe('filterTodos', () => {
  const todos: Todo[] = [
    makeTodo({ id: '1', text: 'Активна задача', completed: false }),
    makeTodo({ id: '2', text: 'Виконана задача', completed: true }),
    makeTodo({ id: '3', text: 'Ще одна активна', completed: false }),
  ];

  it('повертає всі задачі при фільтрі "all"', () => {
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

// ─── getTodoStats ─────────────────────────────────────────────────────────────

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

  it('повертає нулі для порожнього масиву', () => {
    const stats = getTodoStats([]);
    expect(stats.total).toBe(0);
    expect(stats.active).toBe(0);
    expect(stats.completed).toBe(0);
  });

  it('total = active + completed завжди', () => {
    const todos = [makeTodo({ completed: true }), makeTodo({ completed: true })];
    const stats = getTodoStats(todos);
    expect(stats.active + stats.completed).toBe(stats.total);
  });
});

// ─── escapeHtml ───────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('екранує &', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('екранує < та >', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('екранує подвійні лапки', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('екранує одинарні лапки', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s');
  });

  it('не змінює рядок без спецсимволів', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('захищає від XSS у тексті задачі', () => {
    const input = '<img src=x onerror="alert(1)">';
    expect(escapeHtml(input)).not.toContain('<img');
    expect(escapeHtml(input)).not.toContain('>');
  });
});

// ─── isTodo ───────────────────────────────────────────────────────────────────

describe('isTodo', () => {
  it('повертає true для валідного Todo', () => {
    expect(isTodo(makeTodo())).toBe(true);
  });

  it('повертає false для null', () => {
    expect(isTodo(null)).toBe(false);
  });

  it('повертає false для рядка', () => {
    expect(isTodo('not a todo')).toBe(false);
  });

  it('повертає false якщо відсутні поля', () => {
    expect(isTodo({ id: '1', text: 'test' })).toBe(false);
  });

  it('повертає false якщо id не рядок', () => {
    expect(isTodo({ id: 1, text: 'test', completed: false, createdAt: 0 })).toBe(false);
  });

  it('повертає false якщо completed не boolean', () => {
    expect(isTodo({ id: '1', text: 'test', completed: 'false', createdAt: 0 })).toBe(false);
  });
});
