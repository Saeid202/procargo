import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../../locales/en/translation.json";
import fa from "../../locales/fa/translation.json";

i18n
  .use(LanguageDetector) // auto-detect language
  .use(initReactI18next) // bind react-i18next
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fa },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already escapes
    },
  });

export default i18n;