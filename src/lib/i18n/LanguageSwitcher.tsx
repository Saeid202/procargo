import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => changeLanguage("en")}
        className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        English
      </button>
      <button
        onClick={() => changeLanguage("fa")}
        className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
      >
        Persian
      </button>
    </div>
  );
};

export default LanguageSwitcher;