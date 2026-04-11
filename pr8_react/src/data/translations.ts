export type Project = {
  id: number;
  title: string;
  description: string;
  details: string;
  tags: string[];
};

export type Translations = Record<string, Record<string, any>>;

export const translations: Translations = {
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
