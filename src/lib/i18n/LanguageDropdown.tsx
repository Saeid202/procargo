import React from "react";
import { useTranslation } from "react-i18next";

const LanguageDropdown: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="p-2 border rounded"
    >
      <option value="en">English</option>
      <option value="fa">Persian</option>
    </select>
  );
};

export default LanguageDropdown;