import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationVI from './locales/vi.json';
import translationEN from './locales/en.json';
import translationKO from './locales/ko.json';
import translationIT from './locales/it.json';

const resources = {
  vi: { translation: translationVI },
  en: { translation: translationEN },
  ko: { translation: translationKO },
  it: { translation: translationIT },
};

// Khởi tạo i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('app_lang') || 'en', // Ngôn ngữ mặc định
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React đã tự động escape chống XSS
    },
  });

export default i18n;
