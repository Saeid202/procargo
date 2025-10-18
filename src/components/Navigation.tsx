import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "./Logo";
import LanguageDropdown from "../lib/i18n/LanguageDropdown";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const lang = searchParams.get("language");
    if (lang) {
      i18n.changeLanguage(lang);
      document.documentElement.dir = lang.startsWith("fa") ? "rtl" : "ltr";
    }
  }, [searchParams, i18n]);

  // Ensure all navigation preserves current language in URL
  const langParam =
    searchParams.get("language") ||
    (i18n.language?.startsWith("fa") ? "fa" : "en");
  const withLang = (href: string) =>
    `${href}${href.includes("?") ? "&" : "?"}language=${langParam}`;

  const isActive = (path: string) => location.pathname === path;
  const navigation = [
    { name: t("home"), href: i18n.language === "fa" ? "/fa" : "/en" },
    {
      name: t("services"),
      href: i18n.language === "fa" ? "/fa/#services" : "/en/#services",
    },
    { name: t("about"), href: withLang("/about") },
    { name: t("contact"), href: withLang("/contact") },
  ];
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to={withLang("/")}
              className="flex-shrink-0 flex items-center"
            >
              <Logo />
              <span className="ms-2 text-xl font-bold text-gray-900">
                CargoBridge
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-gray-700 hover:text-cargo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href) ? "text-cargo-600" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
            {loading ? (
              <div className="w-[105px] h-1"></div>
            ) : user ? (
              <>
                {/* <Link
                      to={`/dashboard/${user.role == RolesEnum.USER ? '' : user.role?.toLowerCase()}`}
                      className="bg-cargo-600 hover:bg-cargo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {t('dashboard')}
                    </Link> */}
                <div className="w-[105px] h-1"></div>
              </>
            ) : (
              <>
                <Link
                  to={withLang("/login")}
                  className="text-gray-700 hover:text-cargo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  to={withLang("/signup")}
                  className="bg-cargo-600 hover:bg-cargo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t("sign_up")}
                </Link>
              </>
            )}
            <LanguageDropdown />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-cargo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cargo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={withLang(item.href)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-cargo-600 bg-cargo-50"
                    : "text-gray-700 hover:text-cargo-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {loading ? null : user ? (
              <>
                {/* <Link
                      to={`/dashboard/${user.role == RolesEnum.USER ? '' : user.role?.toLowerCase()}`}
                      className="block px-3 py-2 rounded-md text-base font-medium bg-cargo-600 text-white hover:bg-cargo-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('dashboard')}
                    </Link> */}
              </>
            ) : (
              <>
                <Link
                  to={withLang("/login")}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-cargo-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to={withLang("/signup")}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-cargo-600 text-white hover:bg-cargo-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
            <LanguageDropdown className="w-full !mt-4" />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
