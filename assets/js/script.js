"use strict";

/**
 * Практична робота №3: JavaScript для клієнтських сценаріїв
 * - Рендер проєктів з масиву об'єктів
 * - Фільтр за тегами (filter/map/includes)
 * - Делегування подій
 * - Модальне вікно (деталі проєкту)
 * - Перемикач теми + localStorage
 * - Back-to-top при прокрутці
 */

const SUPPORTED_LANGS = ["uk", "en"];
const I18N_CACHE = new Map();
const I18N_LANG_STORAGE_KEY = "lang";
const I18N_TEXT_SWAP_MS = 1000;
const textAnimationRafs = new WeakMap();

const appState = {
  lang: "uk",
  translations: null,
  projectUI: {
    initialized: false,
    grid: null,
    tagList: null,
    resultCount: null,
    state: { tag: "all" }
  }
};

// Точка входу: після побудови DOM послідовно ініціалізуємо всі клієнтські сценарії.
document.addEventListener("DOMContentLoaded", () => {
  void initApp();
});

async function initApp() {
  // Порядок має значення: спочатку базова поведінка сторінки, далі завантаження перекладів,
  // після цього можна безпечно ініціалізувати елементи, тексти яких залежать від мови.
  initPageTransitions();
  await initI18n();
  initTheme();
  initBackToTop();
  initScrollReveal();
  initProjects();
}

/* =========================
   1) Theme (localStorage)
========================= */

async function initI18n() {
  bindLanguageSwitcher();

  // Зберігаємо вибір мови в localStorage, щоб інтерфейс відновлювався при повторному відкритті.
  const stored = localStorage.getItem(I18N_LANG_STORAGE_KEY);
  const initialLang = SUPPORTED_LANGS.includes(stored) ? stored : "uk";
  await setLanguage(initialLang);
}

function bindLanguageSwitcher() {
  const buttons = Array.from(document.querySelectorAll("[data-lang]"));
  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      // Значення мови зчитується з data-атрибуту кнопки (dataset).
      const lang = btn.dataset.lang;
      if (!SUPPORTED_LANGS.includes(lang) || lang === appState.lang) return;
      await setLanguage(lang, { animate: true });
    });
  });
}

async function setLanguage(lang, options = {}) {
  const prefersReducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shouldAnimate = options.animate && !prefersReducedMotion;

  appState.lang = lang;
  localStorage.setItem(I18N_LANG_STORAGE_KEY, lang);

  try {
    // Завантажуємо JSON-файл перекладу і кешуємо його в пам'яті.
    appState.translations = await loadTranslations(lang);
  } catch (error) {
    console.error(`Failed to load ${lang}.json`, error);
    // Навчальний приклад fallback-логіки: при помилці повертаємось до базової мови.
    if (lang !== "uk") {
      appState.lang = "uk";
      localStorage.setItem(I18N_LANG_STORAGE_KEY, "uk");
      appState.translations = await loadTranslations("uk");
    }
  }

  applyTranslationsToDom({ animateText: shouldAnimate });
  refreshProjectsUI();
  syncOpenModalTranslation();
}

async function loadTranslations(lang) {
  if (I18N_CACHE.has(lang)) return I18N_CACHE.get(lang);

  // fetch() використовується для завантаження JSON із файлів перекладу.
  // Для цього сайт потрібно запускати через локальний сервер, а не file://
  const response = await fetch(getTranslationsFileUrl(lang), { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  I18N_CACHE.set(lang, data);
  return data;
}

function getTranslationsFileUrl(lang) {
  // Визначаємо шлях до JSON відносно script.js, щоб код працював і з index.html, і з pages/contacts.html.
  const scriptEl = document.querySelector('script[src$="assets/js/script.js"], script[src$="../assets/js/script.js"]');
  if (scriptEl?.src) {
    return new URL(`../data/${lang}.json`, scriptEl.src).href;
  }

  // Fallback для нестандартного підключення.
  return `../assets/data/${lang}.json`;
}

function initTheme() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  // Значення теми також відновлюємо з localStorage (приклад збереження стану інтерфейсу).
  const stored = localStorage.getItem("theme"); // "dark" | "light" | null
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = stored ?? (prefersDark ? "dark" : "light");
  applyTheme(initialTheme);

  toggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    applyTheme(isDark ? "light" : "dark", { animate: true });
  });
}

function applyTheme(theme, options = {}) {
  const toggle = document.getElementById("themeToggle");
  const isDark = theme === "dark";
  const prefersReducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (options.animate && !prefersReducedMotion) {
    // JS лише додає клас-стан, а візуальний перехід виконується засобами CSS.
    document.body.classList.add("theme-transition");
    window.setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 260);
  }

  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("theme", theme);
  updateThemeToggleLabel(toggle, isDark);
}

function applyTranslationsToDom(options = {}) {
  const htmlEl = document.documentElement;
  const body = document.body;
  if (!htmlEl || !body) return;

  const page = body.dataset.page;
  htmlEl.lang = appState.lang;

  const pageTitle = t(`site.pageTitles.${page}`);
  if (pageTitle) document.title = pageTitle;

  const metaDescription = document.querySelector('meta[name="description"]');
  const pageDescription = t(`site.metaDescriptions.${page}`);
  if (metaDescription && pageDescription) {
    metaDescription.setAttribute("content", pageDescription);
  }

  // Універсальний підхід: HTML-елементи позначаються data-i18n ключем,
  // а JS підставляє відповідні значення з об'єкта перекладу.
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = t(el.dataset.i18n);
    if (typeof value === "string") {
      if (options.animateText) {
        animateTextScramble(el, value);
      } else {
        el.textContent = value;
      }
    }
  });

  // Окремо оновлюємо aria-атрибути, щоб не втрачати доступність після перекладу.
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const value = t(el.dataset.i18nAriaLabel);
    if (typeof value === "string") {
      el.setAttribute("aria-label", value);
    }
  });

  updateLanguageButtons();

  updateThemeToggleLabel(document.getElementById("themeToggle"), document.body.classList.contains("dark"));
}

function updateLanguageButtons() {
  const buttons = Array.from(document.querySelectorAll("[data-lang]"));
  buttons.forEach((btn) => {
    const isActive = btn.dataset.lang === appState.lang;
    btn.setAttribute("aria-pressed", String(isActive));
    // Стан кнопки відображається і через aria-атрибут, і через CSS-клас.
    btn.classList.toggle("lang-switch__button--active", isActive);
  });
}

function updateThemeToggleLabel(toggle, isDark) {
  if (!toggle) return;
  const label = isDark ? t("theme.light", "Світла тема") : t("theme.dark", "Темна тема");
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute("aria-label", label);
  toggle.setAttribute("title", label);
}

/* =========================
   2) Back to top
========================= */

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  const onScroll = () => {
    // Під час прокрутки лише перемикаємо клас видимості (логіка проста, стилі — в CSS).
    btn.classList.toggle("back-to-top--show", window.scrollY > 450);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   3) Projects: data + render
========================= */

const defaultProjects = [
  {
    id: "events",
    title: "Сайт-афіша студентських подій",
    description: "Односторінковий сайт із програмою, спікерами та блоком реєстрації.",
    details:
      "Фокус: чиста верстка, структурований контент, навігація по секціях, невеликі інтерактивності (кнопки/посилання).",
    tags: ["HTML", "CSS", "Landing"],
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    repo: "https://github.com/"
  },
  {
    id: "cv",
    title: "Онлайн CV",
    description: "Персональний сайт-резюме з акцентом на структуру та читабельність.",
    details:
      "Фокус: логічні секції, типографіка, адаптивність. У цій практичній — JS для фільтрації/пошуку та теми.",
    tags: ["HTML", "CSS", "Portfolio"],
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
    repo: "https://github.com/"
  },
  {
    id: "todo",
    title: "Todo List",
    description: "Міні-застосунок для керування задачами з базовою логікою JavaScript.",
    details:
      "Фокус: робота зі станом, подіями, рендерингом списку. У цій версії показано підхід з масивами та DOM.",
    tags: ["JavaScript", "DOM", "Practice"],
    image:
      "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=900&q=80",
    repo: "https://github.com/"
  },
  {
    id: "gallery",
    title: "Міні-галерея фото",
    description: "Сторінка з картками зображень і простим пошуком/фільтром.",
    details:
      "Фокус: рендер з даних, делегування подій, робота з dataset, базові UI-стани.",
    tags: ["JavaScript", "UI", "Filter"],
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    repo: "https://github.com/"
  },
  {
    id: "notes",
    title: "Нотатки навчального курсу",
    description: "Невеликий довідник з темами курсу та прикладами.",
    details:
      "Фокус: структурування інформації, мікро-інтерактивності (пошук), акуратний інтерфейс без фреймворків.",
    tags: ["JavaScript", "Content", "Search"],
    image:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=80",
    repo: "https://github.com/"
  }
];

function initProjects() {
  const grid = document.getElementById("projectGrid");
  const tagList = document.getElementById("tagList");
  const resultCount = document.getElementById("resultCount");

  // Якщо на сторінці немає секції проєктів — просто виходимо
  if (!grid || !tagList || !resultCount) return;

  appState.projectUI.grid = grid;
  appState.projectUI.tagList = tagList;
  appState.projectUI.resultCount = resultCount;
  // Посилання на DOM-вузли зберігаємо в стані, щоб не шукати їх повторно при кожному оновленні.

  renderTagButtons(tagList, appState.projectUI.state);
  renderProjects(grid, resultCount, appState.projectUI.state);

  // Делегування кліків по тегах
  tagList.addEventListener("click", (e) => {
    // Делегування подій: один обробник на контейнер замість окремого обробника на кожну кнопку.
    const btn = e.target.closest("button[data-tag]");
    if (!btn) return;

    appState.projectUI.state.tag = btn.dataset.tag;
    setActiveTag(tagList, appState.projectUI.state.tag);
    renderProjects(grid, resultCount, appState.projectUI.state);
  });

  // Делегування кліків по кнопках у картці
  grid.addEventListener("click", (e) => {
    const openBtn = e.target.closest('[data-action="open"]');
    if (!openBtn) return;

    const card = openBtn.closest("[data-project-id]");
    if (!card) return;

    openProjectModal(card.dataset.projectId);
  });

  appState.projectUI.initialized = true;
  initModal();
}

function renderTagButtons(tagList, state) {
  const projects = getProjectsData();
  // Збір унікальних тегів з масиву об'єктів (flatMap + Set) — типовий шаблон для фільтрів.
  const uniqueTags = Array.from(
    new Set(projects.flatMap((p) => p.tags))
  ).sort((a, b) => a.localeCompare(b, appState.lang));

  tagList.innerHTML = "";

  const allBtn = createTagButton("all", t("projects.allTag", "Усі"));
  tagList.appendChild(allBtn);

  uniqueTags.forEach((t) => tagList.appendChild(createTagButton(t, t)));

  setActiveTag(tagList, state.tag);

  function createTagButton(tagValue, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag";
    btn.dataset.tag = tagValue;
    btn.textContent = label;
    return btn;
  }
}

function setActiveTag(tagList, activeTag) {
  const buttons = Array.from(tagList.querySelectorAll("button[data-tag]"));
  buttons.forEach((b) => b.classList.toggle("tag--active", b.dataset.tag === activeTag));
}

function renderProjects(grid, resultCount, state) {
  const projects = getProjectsData();
  // Фільтрація — приклад керування інтерфейсом на основі поточного стану (state.tag).
  const filtered = projects.filter((p) => {
    return state.tag === "all" || p.tags.includes(state.tag);
  });

  resultCount.textContent = `${filtered.length} / ${projects.length}`;

  grid.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("article");
    empty.className = "card";
    empty.innerHTML = `
      <h3>${escapeHtml(t("projects.emptyTitle", "Нічого не знайдено"))}</h3>
      <p>${escapeHtml(t("projects.emptyText", "Спробуй вибрати інший тег."))}</p>
    `;
    grid.appendChild(empty);
    return;
  }

  filtered.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card project-card";
    card.dataset.projectId = p.id;

    // Для навчального прикладу використано шаблонний рядок.
    // Важливо: динамічні значення проходять через escapeHtml / escapeHtmlAttr.
    card.innerHTML = `
      <img class="project-image" src="${escapeHtmlAttr(p.image)}" alt="Проєкт: ${escapeHtmlAttr(p.title)}" width="500" height="300">
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description)}</p>

      <div class="project-tags">
        ${p.tags.map((t) => `<span class="tag" aria-hidden="true">${escapeHtml(t)}</span>`).join("")}
      </div>

      <div class="project-footer">
        <button class="btn btn--ghost" type="button" data-action="open">${escapeHtml(t("projects.detailsButton", "Деталі"))}</button>
        <a href="${escapeHtmlAttr(p.repo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("projects.repoLink", "Репозиторій"))}</a>
      </div>
    `;

    grid.appendChild(card);
  });

  animateProjectCards(grid);
}

function getProjectsData() {
  // Якщо переклад завантажений, беремо дані з JSON; інакше використовуємо локальний fallback.
  const translated = appState.translations?.projects?.items;
  if (Array.isArray(translated) && translated.length > 0) return translated;
  return defaultProjects;
}

function refreshProjectsUI() {
  // Повторний рендер потрібен, наприклад, після зміни мови інтерфейсу.
  if (!appState.projectUI.initialized) return;
  const { grid, tagList, resultCount, state } = appState.projectUI;
  if (!grid || !tagList || !resultCount) return;
  renderTagButtons(tagList, state);
  renderProjects(grid, resultCount, state);
}

/* =========================
   4) Modal (details)
========================= */

let lastFocusedElement = null;
let modalCloseTimer = null;
let modalOpenFrame = null;
let activeProjectId = null;
const MODAL_ANIMATION_MS = 300;
const PAGE_TRANSITION_MS = 220;

function initModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  modal.addEventListener("click", (e) => {
    const close = e.target.closest('[data-action="close"]');
    if (close) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    // Приклад обробки клавіатури: закриття модального вікна клавішею Escape.
    const isOpen = modal.classList.contains("modal--open");
    if (!isOpen) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  });
}

function openProjectModal(projectId) {
  const modal = document.getElementById("projectModal");
  const titleEl = document.getElementById("modalTitle");
  const descEl = document.getElementById("modalDesc");
  const tagsEl = document.getElementById("modalTags");
  const repoEl = document.getElementById("modalRepo");

  if (!modal || !titleEl || !descEl || !tagsEl || !repoEl) return;

  const p = getProjectsData().find((x) => x.id === projectId);
  if (!p) return;
  activeProjectId = projectId;

  lastFocusedElement = document.activeElement;
  // Зберігаємо фокус, щоб після закриття повернути користувача в попередню точку взаємодії.
  fillProjectModal(p, { titleEl, descEl, tagsEl, repoEl });

  if (modalCloseTimer) {
    clearTimeout(modalCloseTimer);
    modalCloseTimer = null;
  }
  if (modalOpenFrame) {
    cancelAnimationFrame(modalOpenFrame);
    modalOpenFrame = null;
  }

  modal.classList.remove("modal--closing");
  modal.classList.remove("modal--visible");
  modal.classList.add("modal--open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  // Додаємо "видимий" клас у наступному кадрі, щоб CSS transition спрацював коректно.
  modalOpenFrame = requestAnimationFrame(() => {
    modal.classList.add("modal--visible");
    modalOpenFrame = null;
  });

  const closeBtn = modal.querySelector(".modal__close");
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;
  if (!modal.classList.contains("modal--open")) return;

  if (modalOpenFrame) {
    cancelAnimationFrame(modalOpenFrame);
    modalOpenFrame = null;
  }

  modal.classList.remove("modal--visible");
  modal.classList.remove("modal--open");
  modal.classList.add("modal--closing");

  if (modalCloseTimer) clearTimeout(modalCloseTimer);
  // Закриття узгоджується з CSS-анімацією через таймер тієї ж тривалості.
  modalCloseTimer = setTimeout(() => {
    modal.classList.remove("modal--closing");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    activeProjectId = null;

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }

    modalCloseTimer = null;
  }, MODAL_ANIMATION_MS);
}

function fillProjectModal(project, refs = {}) {
  const titleEl = refs.titleEl || document.getElementById("modalTitle");
  const descEl = refs.descEl || document.getElementById("modalDesc");
  const tagsEl = refs.tagsEl || document.getElementById("modalTags");
  const repoEl = refs.repoEl || document.getElementById("modalRepo");

  if (!project || !titleEl || !descEl || !tagsEl || !repoEl) return;

  titleEl.textContent = project.title;
  descEl.textContent = project.details;
  repoEl.href = project.repo;

  // Повністю перебудовуємо список тегів при кожному відкритті/оновленні модалки.
  tagsEl.innerHTML = "";
  project.tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tagsEl.appendChild(span);
  });
}

function syncOpenModalTranslation() {
  // Якщо мову змінено під час відкритої модалки, оновлюємо її контент без закриття вікна.
  if (!activeProjectId) return;
  const modal = document.getElementById("projectModal");
  if (!modal || modal.getAttribute("aria-hidden") === "true") return;

  const project = getProjectsData().find((item) => item.id === activeProjectId);
  if (!project) return;
  fillProjectModal(project);
}

/* =========================
   5) Simple animations
========================= */

function initScrollReveal() {
  const targets = Array.from(document.querySelectorAll(".hero, .section, footer"));
  if (targets.length === 0) return;

  const prefersReducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  targets.forEach((el) => el.classList.add("reveal-on-scroll"));

  // IntersectionObserver дозволяє запускати ефект появи без постійних обчислень у scroll.
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

function animateProjectCards(grid) {
  const prefersReducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const cards = Array.from(grid.querySelectorAll(".project-card"));
  cards.forEach((card, index) => {
    card.classList.remove("project-card--enter");
    card.style.animationDelay = `${Math.min(index * 60, 360)}ms`;
  });

  // Використовуємо requestAnimationFrame, щоб браузер застосував початковий стан перед анімацією.
  requestAnimationFrame(() => {
    cards.forEach((card) => card.classList.add("project-card--enter"));
  });
}

function initPageTransitions() {
  const prefersReducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const body = document.body;
  if (!body) return;

  body.classList.add("page-transition-ready", "page-enter");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      body.classList.remove("page-enter");
    });
  });

  window.addEventListener("pageshow", () => {
    body.classList.remove("page-leave", "page-enter");
  });

  // Перехоплення внутрішніх переходів між сторінками для невеликої анімації before navigation.
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const link = e.target.closest("a[href]");
    if (!link) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#")) return;
    if (/^(mailto|tel|javascript):/i.test(rawHref)) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    // Не втручаємось у зовнішні посилання та переходи в межах тієї ж сторінки.
    if (url.origin !== window.location.origin) return;
    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return;
    if (url.href === window.location.href) return;

    e.preventDefault();
    body.classList.add("page-leave");

    window.setTimeout(() => {
      window.location.href = url.href;
    }, PAGE_TRANSITION_MS);
  });
}

/* =========================
   Helpers
========================= */

function t(path, fallback = "") {
  // Невелика функція-доступ до перекладів за "шляхом" (наприклад, "nav.home").
  const value = getByPath(appState.translations, path);
  return value ?? fallback;
}

function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    if (Array.isArray(acc) && /^\d+$/.test(key)) return acc[Number(key)];
    return acc[key];
  }, obj);
}

function animateTextScramble(el, nextText) {
  if (!el) return;

  // Якщо для цього елемента вже виконується анімація, зупиняємо її перед запуском нової.
  const previousRaf = textAnimationRafs.get(el);
  if (previousRaf) cancelAnimationFrame(previousRaf);

  const currentText = el.textContent ?? "";
  if (currentText === nextText) return;

  // Для складних вузлів безпечніше оновити текст без анімації
  // Для складних вузлів (із вкладеними елементами) безпечніше не змінювати innerHTML покроково.
  if (el.childElementCount > 0) {
    el.textContent = nextText;
    return;
  }

  const fromChars = Array.from(currentText);
  const toChars = Array.from(nextText);
  const targetLen = toChars.length;
  const fromPadded = fromChars.slice(0, targetLen).concat(Array(Math.max(0, targetLen - fromChars.length)).fill(""));
  const toPadded = toChars;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / I18N_TEXT_SWAP_MS, 1);
    // Посимвольна заміна зліва направо: частина рядка вже нова, решта ще стара.
    const revealCount = Math.floor(progress * targetLen);
    const highlightIndex = revealCount < targetLen ? revealCount : -1;

    const out = [];
    for (let i = 0; i < targetLen; i += 1) {
      if (i < revealCount) {
        out.push(escapeHtml(toPadded[i]));
        continue;
      }

      const sourceChar = fromPadded[i];
      const charToShow = sourceChar === " " ? "\u00A0" : sourceChar;

      // Поточний символ підсвічуємо, щоб зробити сам процес "переписування" видимим.
      if (i === highlightIndex && sourceChar.trim() !== "") {
        out.push(`<span class="i18n-char-highlight">${escapeHtml(charToShow)}</span>`);
      } else {
        out.push(escapeHtml(charToShow));
      }
    }

    if (progress >= 1) {
      el.textContent = nextText;
    } else {
      el.innerHTML = out.join("").replace(/(?:\u00A0)+$/u, "");
    }

    if (progress < 1) {
      const rafId = requestAnimationFrame(step);
      textAnimationRafs.set(el, rafId);
    } else {
      textAnimationRafs.delete(el);
    }
  };

  const rafId = requestAnimationFrame(step);
  textAnimationRafs.set(el, rafId);
}

function escapeHtml(str) {
  // Мінімальне екранування HTML перед вставкою в innerHTML.
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(str) {
  // Те ж саме, але окрема функція підкреслює, що значення вставляється в HTML-атрибут.
  return escapeHtml(str);
}
