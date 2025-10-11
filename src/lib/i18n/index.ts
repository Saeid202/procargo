import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import DynamicTranslationLoader from "./dynamicLoader";

// Fallback translations (will be overridden by database translations)
import en from "../../locales/en/translation.json";
import fa from "../../locales/fa/translation.json";

const dynamicLoader = DynamicTranslationLoader.getInstance();

i18n
  .use(LanguageDetector) // auto-detect language
  .use(initReactI18next) // bind react-i18next
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already escapes
    },
    react: {
      bindI18nStore: "added removed",
    },
  });

// Load dynamic translations when language changes
i18n.on('languageChanged', (lng) => {
  dynamicLoader.loadLanguage(lng);
});

// Load initial language
dynamicLoader.loadLanguage(i18n.language);

export default i18n;
export { dynamicLoader };
