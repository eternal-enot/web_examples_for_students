import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteState } from '../context/SiteContext';

export const Footer: React.FC = () => {
  const { texts } = useSiteState();
  const location = useLocation();

  return (
    <footer>
      <div className="container footer-row">
        <p>{texts.footerText}</p>
        {location.pathname === '/' ? (
          <Link to="/contacts">{texts.footerContacts}</Link>
        ) : (
          <Link to="/">{texts.backHome}</Link>
        )}
      </div>
    </footer>
  );
};
