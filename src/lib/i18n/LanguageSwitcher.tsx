import React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    const params = new URLSearchParams(searchParams);
    params.set("language", lng);
    setSearchParams(params);
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