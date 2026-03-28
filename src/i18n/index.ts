import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arCommon from '../locales/ar/common.json';
import arExtra from '../locales/ar/extra.json';
import enCommon from '../locales/en/common.json';
import enExtra from '../locales/en/extra.json';

const enMerged = { ...enCommon, ...enExtra };
const arMerged = { ...arCommon, ...arExtra };

export const LOCALE_STORAGE_KEY = 'ceenaix.lang';

const applyDocumentLanguage = (lng: string) => {
  const isArabic = lng.startsWith('ar');
  document.documentElement.lang = isArabic ? 'ar' : 'en';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
};

const initialLng =
  typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) ?? 'en' : 'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: enMerged },
    ar: { common: arMerged },
  },
  lng: initialLng,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  // Cast: i18next v26 typings omit `interpolation.format` but the runtime still applies it for {{count}}, etc.
  interpolation: {
    escapeValue: false,
    format: (value: unknown, _format: string | undefined, lng: string | undefined) => {
      if (typeof lng === 'string' && lng.startsWith('ar')) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          try {
            return new Intl.NumberFormat('ar-AE', { numberingSystem: 'arab' }).format(value);
          } catch {
            return String(value);
          }
        }
        if (typeof value === 'string' && /^\d+$/.test(value)) {
          const n = Number(value);
          if (Number.isSafeInteger(n)) {
            try {
              return new Intl.NumberFormat('ar-AE', { numberingSystem: 'arab' }).format(n);
            } catch {
              return value;
            }
          }
        }
      }
      return value as string | number | boolean | object | null | undefined;
    },
  } as NonNullable<Parameters<typeof i18n.init>[0]>['interpolation'],
});

applyDocumentLanguage(i18n.language);

i18n.on('languageChanged', (lng) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng);
  }
  applyDocumentLanguage(lng);
});

export default i18n;
