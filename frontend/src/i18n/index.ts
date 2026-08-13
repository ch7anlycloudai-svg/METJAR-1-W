import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import ar from './ar';
import fr from './fr';

type Translations = typeof ar;
type Language = 'ar' | 'fr';

interface LanguageStore {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const translations: Record<Language, Translations> = { ar, fr };

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: 'ar',
      t: ar,
      setLanguage: (lang: Language) => {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        set({ lang, t: translations[lang] });
      },
    }),
    {
      name: 'wwenatou-lang',
    }
  )
);

export type { Language, Translations };
