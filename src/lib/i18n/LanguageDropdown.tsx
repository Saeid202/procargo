import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";

interface IProps {
  className?: string;
}

const LanguageDropdown: React.FC<IProps> = ({ className }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language === "fa") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, [i18n.language]);

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className={cn("p-2 border rounded outline-none bg-white",className)}
    >
      <option value="en">🇺🇸 English</option>
      <option value="fa">🇮🇷 فارسی</option>
    </select>
  );
};

export default LanguageDropdown;