import React, { useEffect } from 'react';
import { useSiteState } from '../context/SiteContext';
import { Link } from 'react-router-dom';

export const Contacts: React.FC = () => {
  const { texts, pageTitle } = useSiteState();

  useEffect(() => {
    document.title = pageTitle('contacts');
  }, [texts, pageTitle]);

  return (
    <main>
      <header className="hero">
        <div className="container">
          <p className="hero__label">ПРАКТИЧНА РОБОТА №8</p>
          <h1>{texts.contactsTitle}</h1>
          <p>{texts.contactsText}</p>
          <div className="hero__actions">
            <Link className="btn-link" to="/">На головну</Link>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="card">
            <h2>{texts.contactsListTitle}</h2>
            <p><strong>Email:</strong> <a href="mailto:illia.student@email.com">illia.student@email.com</a></p>
            <p><strong>GitHub:</strong> <a href="https://github.com/" target="_blank" rel="noopener noreferrer">github.com/illia</a></p>
            <p><strong>Telegram:</strong> <a href="https://t.me/" target="_blank" rel="noopener noreferrer">@illia</a></p>
          </div>
        </div>
      </section>
    </main>
  );
};
