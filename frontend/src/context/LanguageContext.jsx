import { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

const translations = { en, hi };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('crop-lang') || 'en');

  const t = useCallback((key) => {
    const dict = translations[lang] || en;
    return dict[key] ?? key;
  }, [lang]);

  const setLanguage = useCallback((l) => {
    setLang(l);
    localStorage.setItem('crop-lang', l);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      <div lang={lang}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
