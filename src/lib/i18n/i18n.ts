import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/translations/en.json';

/** App-owned i18next instance; initReactI18next binds react-i18next's hooks to it. */
const i18n = createInstance();

export const SUPPORTED_LANGUAGES = ['en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

export const resources = {
  en: { translation: en },
} as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)['en'];
  }
}

/** Synchronous init (inline resources) — called at module load in App.tsx with the persisted locale. */
export function initI18n(language: Language = DEFAULT_LANGUAGE) {
  if (i18n.isInitialized) return i18n;
  void i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return i18n;
}

export function changeLanguage(language: Language) {
  return i18n.changeLanguage(language);
}

export function isLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
