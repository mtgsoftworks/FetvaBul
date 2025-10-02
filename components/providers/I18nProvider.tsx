'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Locale, I18nContextType, getTranslation } from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, defaultLocale = 'tr' }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Tarayıcı dilini kontrol et
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['tr', 'en'].includes(savedLocale)) {
      setLocale(savedLocale);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'tr') {
        setLocale('tr');
      } else {
        setLocale('en');
      }
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    return getTranslation(locale, key);
  };

  const value: I18nContextType = {
    locale,
    setLocale: handleSetLocale,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};