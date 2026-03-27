"use strict";

const translations = {
  uk: {
    heroTitle: "Ілля",
    heroText: "Люблю створювати зручні та зрозумілі вебсторінки, працювати з інтерфейсами та поступово розвиватися у frontend-розробці.",
    projectsLink: "Перейти до проєктів",
    navHome: "Головна",
    navContacts: "Контакти",
    themeButton: "Тема",
    aboutTitle: "Про сторінку",
    aboutText: "Люблю фільми студії A24, фотографувати на аналогову плівку, кататися на велосипеді та програмувати. Найбільше цікаво поєднувати аналітичне мислення з візуально чистими веб-інтерфейсами.",
    projectsTitle: "Проєкти",
    shownLabel: "Показано:",
    allTag: "Усі",
    detailsButton: "Деталі",
    repoLink: "Репозиторій",
    footerText: "Портфоліо студента.",
    footerContacts: "Відкрити контакти",
    contactsTitle: "Контакти",
    contactsText: "Тут зібрані основні способи зв'язку зі мною.",
    contactsListTitle: "Основні контакти",
    backHome: "Повернутися на головну",
    pageTitleIndex: "Портфоліо студента",
    pageTitleContacts: "Контакти",
    projects: [
      {
        id: 1,
        title: "Портфоліо",
        description: "Сайт з інформацією про студента.",
        details: "Приклад структури сторінки, навігації та базового оформлення.",
        tags: ["HTML", "CSS"]
      },
      {
        id: 2,
        title: "Список справ",
        description: "Невеликий застосунок для задач.",
        details: "Добрий приклад для роботи з масивами, подіями і DOM.",
        tags: ["JavaScript", "DOM"]
      },
      {
        id: 3,
        title: "Галерея",
        description: "Сторінка з картками та фільтрацією.",
        details: "Пояснює, як рендерити елементи з масиву і змінювати інтерфейс.",
        tags: ["JavaScript", "UI"]
      }
    ]
  },
  en: {
    heroTitle: "Illia",
    heroText: "I enjoy creating clear and convenient web pages, working with interfaces, and gradually growing in frontend development.",
    projectsLink: "Go to projects",
    navHome: "Home",
    navContacts: "Contacts",
    themeButton: "Theme",
    aboutTitle: "About this page",
    aboutText: "I enjoy A24 films, analog photography, cycling, and programming. I am most interested in combining analytical thinking with visually clean web interfaces.",
    projectsTitle: "Projects",
    shownLabel: "Shown:",
    allTag: "All",
    detailsButton: "Details",
    repoLink: "Repository",
    footerText: "Student portfolio.",
    footerContacts: "Open contacts",
    contactsTitle: "Contacts",
    contactsText: "Here you can find the main ways to contact me.",
    contactsListTitle: "Main contacts",
    backHome: "Back to home",
    pageTitleIndex: "Student portfolio",
    pageTitleContacts: "Contacts",
    projects: [
      {
        id: 1,
        title: "Portfolio",
        description: "A website with information about a student.",
        details: "An example of page structure, navigation, and basic styling.",
        tags: ["HTML", "CSS"]
      },
      {
        id: 2,
        title: "Todo list",
        description: "A small app for tasks.",
        details: "A good example of arrays, events, and DOM manipulation.",
        tags: ["JavaScript", "DOM"]
      },
      {
        id: 3,
        title: "Gallery",
        description: "A page with cards and filtering.",
        details: "Shows how to render items from an array and update the interface.",
        tags: ["JavaScript", "UI"]
      }
    ]
  }
};

let currentLanguage = localStorage.getItem("language") || "uk";
let currentTheme = localStorage.getItem("theme") || "light";
let selectedTag = "all";
let currentModalProjectId = null;

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  initLanguage();
  initProjects();
  initModal();
  initBackToTop();
});

function initTheme() {
  const themeButton = document.getElementById("themeToggle");

  applyTheme();

  if (!themeButton) {
    return;
  }

  themeButton.addEventListener("click", function () {
    if (currentTheme === "light") {
      currentTheme = "dark";
    } else {
      currentTheme = "light";
    }

    localStorage.setItem("theme", currentTheme);
    applyTheme();
  });
}

function applyTheme() {
  if (currentTheme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

function initLanguage() {
  const buttons = document.querySelectorAll("[data-lang]");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentLanguage = button.dataset.lang;
      localStorage.setItem("language", currentLanguage);
      applyLanguage();
      renderTagButtons();
      renderProjects();
      refreshModal();
      updateLanguageButtons();
    });
  });

  applyLanguage();
  updateLanguageButtons();
}

function applyLanguage() {
  const page = document.body.dataset.page;
  const currentTexts = translations[currentLanguage];
  const elements = document.querySelectorAll("[data-i18n]");

  document.documentElement.lang = currentLanguage;

  if (page === "index") {
    document.title = currentTexts.pageTitleIndex;
  }

  if (page === "contacts") {
    document.title = currentTexts.pageTitleContacts;
  }

  elements.forEach(function (element) {
    const key = element.dataset.i18n;
    element.textContent = currentTexts[key];
  });
}

function updateLanguageButtons() {
  const buttons = document.querySelectorAll("[data-lang]");

  buttons.forEach(function (button) {
    if (button.dataset.lang === currentLanguage) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function initProjects() {
  if (!document.getElementById("projectGrid")) {
    return;
  }

  renderTagButtons();
  renderProjects();
}

function getProjects() {
  return translations[currentLanguage].projects;
}

function renderTagButtons() {
  const tagList = document.getElementById("tagList");
  const projects = getProjects();
  const tags = ["all"];

  projects.forEach(function (project) {
    project.tags.forEach(function (tag) {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
  });

  tagList.innerHTML = "";

  tags.forEach(function (tag) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag-button";
    button.dataset.tag = tag;

    if (tag === "all") {
      button.textContent = translations[currentLanguage].allTag;
    } else {
      button.textContent = tag;
    }

    if (tag === selectedTag) {
      button.classList.add("active");
    }

    button.addEventListener("click", function () {
      selectedTag = tag;
      renderTagButtons();
      renderProjects();
    });

    tagList.appendChild(button);
  });
}

function renderProjects() {
  const grid = document.getElementById("projectGrid");
  const resultCount = document.getElementById("resultCount");

  if (!grid || !resultCount) {
    return;
  }

  const projects = getProjects();
  let filteredProjects = projects;

  if (selectedTag !== "all") {
    filteredProjects = projects.filter(function (project) {
      return project.tags.includes(selectedTag);
    });
  }

  resultCount.textContent = filteredProjects.length + " / " + projects.length;
  grid.innerHTML = "";

  filteredProjects.forEach(function (project) {
    const article = document.createElement("article");
    article.className = "project-card";

    const tagsHtml = project.tags.map(function (tag) {
      return '<span class="project-tag">' + tag + "</span>";
    }).join("");

    article.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-tags">${tagsHtml}</div>
      <div class="project-actions">
        <button type="button" data-id="${project.id}">${translations[currentLanguage].detailsButton}</button>
      </div>
    `;

    const button = article.querySelector("button");
    button.addEventListener("click", function () {
      openModal(project.id);
    });

    grid.appendChild(article);
  });
}

function initModal() {
  const modal = document.getElementById("projectModal");
  const closeButton = document.getElementById("modalClose");
  const overlay = document.getElementById("modalOverlay");

  if (!modal || !closeButton || !overlay) {
    return;
  }

  closeButton.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}

function openModal(projectId) {
  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalDetails = document.getElementById("modalDetails");
  const modalRepo = document.getElementById("modalRepo");
  const project = getProjects().find(function (item) {
    return item.id === projectId;
  });

  if (!modal || !project) {
    return;
  }

  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  modalDetails.textContent = project.details;
  modalRepo.href = "https://github.com/";
  modal.classList.add("open");
  currentModalProjectId = projectId;
}

function closeModal() {
  const modal = document.getElementById("projectModal");

  if (modal) {
    modal.classList.remove("open");
  }

  currentModalProjectId = null;
}

function refreshModal() {
  if (currentModalProjectId !== null) {
    openModal(currentModalProjectId);
  }
}

function initBackToTop() {
  const button = document.getElementById("backToTop");

  if (!button) {
    return;
  }

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      button.classList.add("show");
    } else {
      button.classList.remove("show");
    }
  });

  button.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}
