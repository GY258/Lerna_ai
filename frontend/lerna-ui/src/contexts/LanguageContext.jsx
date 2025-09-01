import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default to English
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  const switchLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  useEffect(() => {
    // Save language preference whenever it changes
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    switchLanguage,
    isEnglish: currentLanguage === 'en',
    isChinese: currentLanguage === 'zh'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
