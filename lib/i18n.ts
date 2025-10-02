import { createContext, useContext } from 'react';

export type Locale = 'tr' | 'en';

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const getTranslation = (locale: Locale, key: string): string => {
  const translations = getTranslations(locale);
  const keys = key.split('.');
  let result: any = translations;
  
  for (const k of keys) {
    result = result?.[k];
  }
  
  return result || key;
};

const getTranslations = (locale: Locale) => {
  switch (locale) {
    case 'tr':
      return require('../locales/tr.json');
    case 'en':
      return require('../locales/en.json');
    default:
      return require('../locales/tr.json');
  }
};