import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSiteState } from '../context/SiteContext';

export const Navbar: React.FC = () => {
  const { lang, texts, toggleTheme, setLanguage } = useSiteState();

  return (
    <nav className="main-nav">
      <div className="container nav-row">
        <div className="nav-links">
          <a href="../../index.html">Список робіт</a>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            {texts.navHome}
          </NavLink>
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'active' : '')}>
            {texts.navContacts}
          </NavLink>
        </div>

        <div className="nav-controls">
          <button 
            type="button" 
            className={lang === 'uk' ? 'active' : ''} 
            onClick={() => setLanguage('uk')}
          >
            UA
          </button>
          <button 
            type="button" 
            className={lang === 'en' ? 'active' : ''} 
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button type="button" onClick={toggleTheme}>
            {texts.themeButton}
          </button>
        </div>
      </div>
    </nav>
  );
};
