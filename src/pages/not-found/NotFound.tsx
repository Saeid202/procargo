import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HomeIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  TruckIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import Footer from '../../components/ui/Footer';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const suggestedPages = [
    { name: t("home"), path: "/", icon: HomeIcon, description: t("hero_subtitle") },
    { name: t("services"), path: "/services", icon: TruckIcon, description: t("services_subtitle") },
    { name: t("about"), path: "/about", icon: GlobeAltIcon, description: t("about_subtitle") },
    { name: t("contact"), path: "/contact", icon: ShieldCheckIcon, description: t("contact_subtitle") },
    { name: t("careers_title" as any), path: "/careers", icon: UserIcon, description: t("careers_subtitle" as any) },
    { name: t("news_title" as any), path: "/news", icon: QuestionMarkCircleIcon, description: t("news_subtitle" as any) },
  ];

  const popularLinks = [
    { name: t("dashboard"), path: "/dashboard", icon: Cog6ToothIcon },
    { name: t("login"), path: "/login", icon: UserIcon },
    { name: t("sign_up"), path: "/signup", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cargo-50 to-cargo-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* 404 Error Code */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-cargo-100 rounded-full mb-6">
              <ExclamationTriangleIcon className="w-16 h-16 text-cargo-600" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-cargo-600 mb-4">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("page_not_found")}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t("page_not_found_title")}
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
              {t("page_not_found_description")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={goBack}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {t("back")}
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-cargo-600 hover:bg-cargo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              {t("go_back_home")}
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 border-2 border-cargo-600 text-cargo-600 hover:bg-cargo-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <QuestionMarkCircleIcon className="w-5 h-5" />
              {t("contact_support")}
            </Link>
          </div>

          {/* Suggested Pages */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              {t("suggested_pages")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedPages.map((page, index) => (
                <Link
                  key={index}
                  to={page.path}
                  className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-cargo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cargo-200 transition-colors">
                      <page.icon className="w-6 h-6 text-cargo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-cargo-600 transition-colors">
                        {page.name}
                      </h4>
                      <p className="text-gray-500 text-sm mt-1">
                        {page.description as string}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Links */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              {t("popular_links")}
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {popularLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="flex items-center gap-2 bg-white text-gray-700 hover:text-cargo-600 hover:bg-cargo-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-cargo-300 transition-all duration-200"
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t("get_help")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("page_not_found_description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-cargo-600 hover:bg-cargo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t("contact_support")}
              </Link>
              <Link
                to="/support"
                className="border-2 border-cargo-600 text-cargo-600 hover:bg-cargo-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t("report_issue")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;