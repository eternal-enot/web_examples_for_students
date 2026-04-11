import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { Home } from './pages/Home';
import { Contacts } from './pages/Contacts';
import { SiteProvider } from './context/SiteContext';

const AppContent = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    <Footer />
    <BackToTop />
  </>
);

const App: React.FC = () => {
  return (
    <SiteProvider>
      <AppContent />
    </SiteProvider>
  );
};

export default App;
