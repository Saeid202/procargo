import "i18next";
import en from "../../locales/en/translation.json";
import fa from "../../locales/fa/translation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "en";
    resources: {
      en: typeof en;
      fa: typeof fa;
    };
  }
}