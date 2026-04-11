import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { translations } from '../data/translations';

type Theme = 'light' | 'dark';
type Lang = 'uk' | 'en';

interface SiteContextType {
  theme: Theme;
  lang: Lang;
  texts: Record<string, any>;
  toggleTheme: () => void;
  setLanguage: (lang: Lang) => void;
  pageTitle: (page: 'index' | 'contacts') => string;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) === 'dark' ? 'dark' : 'light';
  });

  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('language') as Lang) === 'en' ? 'en' : 'uk';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const isDark = theme === 'dark';
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLanguage = (newLang: Lang) => {
    setLangState(newLang);
  };

  const texts = useMemo(() => translations[lang], [lang]);

  const pageTitle = (page: 'index' | 'contacts') => {
    return page === 'index' ? texts.pageTitleIndex : texts.pageTitleContacts;
  };

  const value = {
    theme,
    lang,
    texts,
    toggleTheme,
    setLanguage,
    pageTitle
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSiteState = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteState must be used within a SiteProvider');
  }
  return context;
};
