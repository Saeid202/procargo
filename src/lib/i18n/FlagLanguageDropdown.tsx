import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  className?: string;
}

const FlagLanguageDropdown: React.FC<IProps> = ({ className }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const normalized = (lng: string) => (lng?.startsWith("fa") ? "fa" : "en");
  const current = normalized(i18n.language);
  const other = current === "fa" ? "en" : "fa";

  const flags: Record<string, string> = {
    en: "🇺🇸",
    fa: "🇮🇷",
  };

  useEffect(() => {
    if (current === "fa") {
      document.documentElement.dir = "rtl";
      localStorage.setItem("i18nextLng", "fa");
    } else {
      document.documentElement.dir = "ltr";
      localStorage.setItem("i18nextLng", "en");
    }
  }, [current]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <div
      className={`relative ${className || ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 shadow-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-lg" aria-hidden>
          {flags[current]}
        </span>
        <span className="text-sm text-gray-700 capitalize hidden sm:inline">
          {current === "fa" ? "فارسی" : "English"}
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <li>
            <button
              role="option"
              aria-selected={false}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
              onMouseDown={() => changeLanguage(other)}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeLanguage(other); }}
            >
              <span className="text-lg" aria-hidden>
                {flags[other]}
              </span>
              <span className="capitalize">{other === "fa" ? "فارسی" : "English"}</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default FlagLanguageDropdown;


