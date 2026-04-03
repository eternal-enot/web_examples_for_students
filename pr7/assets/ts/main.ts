import type { Todo, TodoFilter } from "./types.js";

declare const rxjs: typeof import("rxjs");

const { BehaviorSubject, combineLatest, fromEvent, map } = rxjs;

const todoForm = document.getElementById("todoForm") as HTMLFormElement | null;
const todoInput = document.getElementById("todoInput") as HTMLInputElement | null;
const filterButtons = document.getElementById("filterButtons") as HTMLDivElement | null;
const todoList = document.getElementById("todoList") as HTMLUListElement | null;
const metaInfo = document.getElementById("metaInfo") as HTMLDivElement | null;

const STORAGE_KEY = "pr7_todos";

const todos$ = new BehaviorSubject<Todo[]>(loadTodosFromStorage());
const filter$ = new BehaviorSubject<TodoFilter>("all");

init();

function init(): void {
  if (!todoForm || !todoInput || !filterButtons || !todoList || !metaInfo) {
    console.error("Не вдалося ініціалізувати інтерфейс.");
    return;
  }

  bindAddTodo();
  bindFilters();
  bindListActions();
  bindRendering();
  bindPersistence();
}

function bindAddTodo(): void {
  if (!todoForm || !todoInput) return;

  fromEvent<SubmitEvent>(todoForm, "submit")
    .pipe(
      map((event) => {
        event.preventDefault();
        return todoInput.value.trim();
      }),
      map((text) => {
        if (text.length === 0) {
          return null;
        }

        const todo: Todo = {
          id: makeTodoId(),
          text,
          completed: false,
          createdAt: Date.now()
        };

        return todo;
      })
    )
    .subscribe((todo) => {
      if (!todo || !todoInput) return;

      const current = todos$.getValue();
      todos$.next([todo, ...current]);
      todoInput.value = "";
    });
}

function bindFilters(): void {
  if (!filterButtons) return;

  fromEvent<MouseEvent>(filterButtons, "click")
    .pipe(
      map((event) => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest<HTMLButtonElement>("button[data-filter]");
        return button?.dataset.filter as TodoFilter | undefined;
      }),
      map((value) => (value === "all" || value === "active" || value === "completed" ? value : null))
    )
    .subscribe((filter) => {
      if (!filter || !filterButtons) return;

      filter$.next(filter);
      updateActiveFilterButton(filter);
    });
}

function bindListActions(): void {
  if (!todoList) return;

  fromEvent<MouseEvent>(todoList, "click")
    .pipe(
      map((event) => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest<HTMLButtonElement>("button[data-action][data-id]");
        if (!button) return null;

        return {
          action: button.dataset.action,
          id: button.dataset.id
        };
      })
    )
    .subscribe((payload) => {
      if (!payload || !payload.id) return;

        const current = todos$.getValue();

      if (payload.action === "edit") {
        const targetTodo = current.find((todo) => todo.id === payload.id);
        if (!targetTodo) return;

        const updatedText = window.prompt("Редагувати задачу:", targetTodo.text);
        if (updatedText === null) return;

        const trimmedText = updatedText.trim();
        if (!trimmedText) return;

        const next = current.map((todo) =>
          todo.id === payload.id ? { ...todo, text: trimmedText } : todo
        );
        todos$.next(next);
      }

      if (payload.action === "delete") {
        const next = current.filter((todo) => todo.id !== payload.id);
        todos$.next(next);
      }
    });

  fromEvent<Event>(todoList, "change")
    .pipe(
      map((event) => {
        const target = event.target as HTMLElement | null;
        const checkbox = target?.closest<HTMLInputElement>('input[data-action="toggle"][data-id]');
        if (!checkbox) return null;

        return {
          id: checkbox.dataset.id,
          completed: checkbox.checked
        };
      })
    )
    .subscribe((payload) => {
      if (!payload?.id) return;

      const current = todos$.getValue();
      const next = current.map((todo) =>
        todo.id === payload.id ? { ...todo, completed: payload.completed } : todo
      );
      todos$.next(next);
    });
}

function bindRendering(): void {
  if (!todoList || !metaInfo) return;

  const visibleTodos$ = combineLatest([
    todos$,
    filter$
  ]).pipe(
    map(([todos, filter]) => {
      const visible = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
      });

      return {
        todos,
        visible
      };
    })
  );

  visibleTodos$.subscribe(({ todos, visible }) => {
    renderTodoList(visible);
    renderMeta(todos);
  });
}

function renderTodoList(items: Todo[]): void {
  if (!todoList) return;

  if (items.length === 0) {
    todoList.innerHTML = '<li class="todo-empty">Задач за поточним фільтром не знайдено.</li>';
    return;
  }

  todoList.innerHTML = items
    .map((todo) => {
      const safeText = escapeHtml(todo.text);

      return `
        <li class="todo-item ${todo.completed ? "todo-item--done" : ""}">
          <input class="todo-item__checkbox" type="checkbox" data-action="toggle" data-id="${todo.id}" ${todo.completed ? "checked" : ""} aria-label="Змінити стан задачі">
          <p class="todo-item__text">${safeText}</p>
          <button class="btn btn--ghost" type="button" data-action="edit" data-id="${todo.id}">Редагувати</button>
          <button class="btn btn--ghost btn--danger" type="button" data-action="delete" data-id="${todo.id}">Видалити</button>
        </li>
      `;
    })
    .join("");
}

function renderMeta(todos: Todo[]): void {
  if (!metaInfo) return;

  const completed = todos.filter((todo) => todo.completed).length;
  const active = todos.length - completed;

  metaInfo.textContent = `Всього: ${todos.length} | Активні: ${active} | Виконані: ${completed}`;
}

function updateActiveFilterButton(activeFilter: TodoFilter): void {
  if (!filterButtons) return;

  const buttons = Array.from(filterButtons.querySelectorAll<HTMLButtonElement>("button[data-filter]"));
  buttons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
  });
}

function bindPersistence(): void {
  todos$.subscribe((todos) => {
    saveTodosToStorage(todos);
  });
}

function makeTodoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadTodosFromStorage(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isTodo);
  } catch {
    return [];
  }
}

function saveTodosToStorage(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore quota/storage errors in this training example.
  }
}

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") return false;

  const todo = value as Record<string, unknown>;
  return (
    typeof todo.id === "string" &&
    typeof todo.text === "string" &&
    typeof todo.completed === "boolean" &&
    typeof todo.createdAt === "number"
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
