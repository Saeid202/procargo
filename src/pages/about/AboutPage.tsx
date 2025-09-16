import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon,
  BuildingOfficeIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Footer from '../../components/ui/Footer';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cargo-50 to-cargo-100 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="mb-2 block">{t("about_title")}</span>
              <span className="text-cargo-600 block">{t("about_subtitle")}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t("about_hero_description")}
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cargo-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cargo-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cargo-400 rounded-full opacity-20 animate-bounce"></div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t("our_story_title")}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t("our_story_description_1")}
              </p>
              <p className="text-lg text-gray-600 mb-6">
                {t("our_story_description_2")}
              </p>
              <p className="text-lg text-gray-600">
                {t("our_story_description_3")}
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-cargo-100 to-cargo-200 rounded-2xl p-8">
                <div className="text-center">
                  <BuildingOfficeIcon className="w-16 h-16 text-cargo-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("founded_in")}</h3>
                  <p className="text-gray-600 mb-6">{t("founded_description")}</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-cargo-600">15+</div>
                      <div className="text-sm text-gray-600">{t("years_experience")}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-cargo-600">50+</div>
                      <div className="text-sm text-gray-600">{t("countries_served")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("mission_values_title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("mission_values_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                <LightBulbIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("our_mission")}</h3>
              <p className="text-gray-600">{t("mission_description")}</p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                <GlobeAltIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("our_vision")}</h3>
              <p className="text-gray-600">{t("vision_description")}</p>
            </div>

            {/* Values */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                <HeartIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("our_values")}</h3>
              <p className="text-gray-600">{t("values_description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("why_choose_us_title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("why_choose_us_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("fast_delivery")}</h3>
              <p className="text-gray-600 text-sm">{t("fast_delivery_desc")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("secure_shipping")}</h3>
              <p className="text-gray-600 text-sm">{t("secure_shipping_desc")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("competitive_prices")}</h3>
              <p className="text-gray-600 text-sm">{t("competitive_prices_desc")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("expert_support")}</h3>
              <p className="text-gray-600 text-sm">{t("expert_support_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("meet_our_team_title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("meet_our_team_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="w-24 h-24 bg-cargo-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserGroupIcon className="w-12 h-12 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("logistics_team")}</h3>
              <p className="text-gray-600 mb-4">{t("logistics_team_desc")}</p>
              <div className="text-sm text-cargo-600 font-medium">50+ {t("professionals")}</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="w-24 h-24 bg-cargo-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShieldCheckIcon className="w-12 h-12 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("legal_team")}</h3>
              <p className="text-gray-600 mb-4">{t("legal_team_desc")}</p>
              <div className="text-sm text-cargo-600 font-medium">15+ {t("lawyers")}</div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="w-24 h-24 bg-cargo-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <TruckIcon className="w-12 h-12 text-cargo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("operations_team")}</h3>
              <p className="text-gray-600 mb-4">{t("operations_team_desc")}</p>
              <div className="text-sm text-cargo-600 font-medium">30+ {t("specialists")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-cargo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("our_achievements_title")}
            </h2>
            <p className="text-xl text-cargo-100 max-w-2xl mx-auto">
              {t("our_achievements_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">10,000+</div>
              <div className="text-cargo-100">{t("successful_shipments")}</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">99.8%</div>
              <div className="text-cargo-100">{t("on_time_delivery")}</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">500+</div>
              <div className="text-cargo-100">{t("happy_customers")}</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">24/7</div>
              <div className="text-cargo-100">{t("customer_support")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t("ready_to_work_with_us_title")}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("ready_to_work_with_us_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-cargo-600 hover:bg-cargo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {t("get_started_today")}
            </Link>
            <Link
              to="/contact"
              className="border-2 border-cargo-600 text-cargo-600 hover:bg-cargo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
            >
              {t("contact_us")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
