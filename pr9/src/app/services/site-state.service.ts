import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Lang, TRANSLATIONS } from '../data/translations';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class SiteStateService {
  private readonly document = inject(DOCUMENT);

  private readonly languageStorageKey = 'language';
  private readonly themeStorageKey = 'theme';

  private readonly langState = signal<Lang>(this.readStoredLang());
  private readonly themeState = signal<Theme>(this.readStoredTheme());

  readonly lang = this.langState.asReadonly();
  readonly theme = this.themeState.asReadonly();

  readonly texts = computed(() => TRANSLATIONS[this.langState()]);

  constructor() {
    effect(() => {
      const lang = this.langState();
      localStorage.setItem(this.languageStorageKey, lang);
      this.document.documentElement.lang = lang;
    });

    effect(() => {
      const theme = this.themeState();
      localStorage.setItem(this.themeStorageKey, theme);
      this.document.body.classList.toggle('dark', theme === 'dark');
    });
  }

  setLanguage(lang: Lang): void {
    this.langState.set(lang);
  }

  toggleTheme(): void {
    this.themeState.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }

  pageTitle(page: 'index' | 'contacts'): string {
    const texts = this.texts();
    return page === 'index' ? texts.pageTitleIndex : texts.pageTitleContacts;
  }

  private readStoredLang(): Lang {
    const value = localStorage.getItem(this.languageStorageKey);
    return value === 'en' ? 'en' : 'uk';
  }

  private readStoredTheme(): Theme {
    const value = localStorage.getItem(this.themeStorageKey);
    return value === 'dark' ? 'dark' : 'light';
  }
}
