import { createContext, useState, useCallback, type ReactNode } from 'react';
import { translations, DEFAULT_LOCALE, type Locale, type TranslationKey } from './translations';

const STORAGE_KEY = 'pvm-language';

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'de' || stored === 'en-GB' || stored === 'fr') return stored;
  } catch {
    // localStorage may be unavailable
  }
  return DEFAULT_LOCALE;
}

export interface LanguageContextValue {
  language: Locale;
  setLanguage: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LOCALE,
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Locale>(loadLocale);

  const setLanguage = useCallback((locale: Locale) => {
    setLanguageState(locale);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      let str = translations[language][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
