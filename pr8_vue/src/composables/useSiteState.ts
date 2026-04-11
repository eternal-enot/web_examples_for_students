import { ref, computed, watch } from 'vue';
import { translations } from '../data/translations';

type Theme = 'light' | 'dark';
type Lang = 'uk' | 'en';

const langState = ref<Lang>((localStorage.getItem('language') as Lang) === 'en' ? 'en' : 'uk');
const themeState = ref<Theme>((localStorage.getItem('theme') as Theme) === 'dark' ? 'dark' : 'light');

watch(langState, (newLang) => {
  localStorage.setItem('language', newLang);
  document.documentElement.lang = newLang;
}, { immediate: true });

watch(themeState, (newTheme) => {
  localStorage.setItem('theme', newTheme);
  const isDark = newTheme === 'dark';
  if (isDark) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}, { immediate: true });

export function useSiteState() {
  const texts = computed(() => translations[langState.value]);

  const toggleTheme = () => {
    themeState.value = themeState.value === 'light' ? 'dark' : 'light';
  };

  const setLanguage = (lang: Lang) => {
    langState.value = lang;
  };

  const pageTitle = (page: 'index' | 'contacts'): string => {
    return page === 'index' ? texts.value.pageTitleIndex : texts.value.pageTitleContacts;
  };

  return {
    lang: langState,
    theme: themeState,
    texts,
    toggleTheme,
    setLanguage,
    pageTitle
  };
}
