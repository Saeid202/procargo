import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TruckIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Footer from '../../components/ui/Footer';

const ServicesPage = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const mainServices = [
    {
      icon: TruckIcon,
      title: t("sea_freight"),
      description: t("sea_freight_desc"),
      features: ["FCL & LCL Options", "Cost-Effective", "Large Shipments", "Global Coverage"]
    },
    {
      icon: PaperAirplaneIcon,
      title: t("air_freight"),
      description: t("air_freight_desc"),
      features: ["Express Delivery", "Time-Sensitive", "Urgent Shipments", "Fast Transit"]
    },
    {
      icon: ShieldCheckIcon,
      title: t("customs_compliance"),
      description: t("customs_compliance_desc"),
      features: ["Expert Clearance", "Compliance", "Documentation", "Border Crossing"]
    }
  ];

  const features = [
    {
      icon: ClockIcon,
      title: t("fast_transit"),
      description: t("fast_transit_desc")
    },
    {
      icon: GlobeAltIcon,
      title: t("global_network"),
      description: t("global_network_desc")
    },
    {
      icon: CurrencyDollarIcon,
      title: t("competitive_pricing"),
      description: t("competitive_pricing_desc")
    }
  ];

  const faqItems = [
    {
      question: t("what_services_do_you_offer"),
      answer: t("what_services_answer")
    },
    {
      question: t("how_long_does_shipping_take"),
      answer: t("how_long_answer")
    },
    {
      question: t("do_you_handle_customs_clearance"),
      answer: t("customs_answer")
    },
    {
      question: t("can_i_track_my_shipment"),
      answer: t("tracking_answer")
    },
    {
      question: t("what_are_your_payment_terms"),
      answer: t("payment_answer")
    },
    {
      question: t("do_you_offer_insurance"),
      answer: t("insurance_answer")
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cargo-50 to-cargo-100 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="mb-2 block">{t("services_title")}</span>
              <span className="text-cargo-600 block">{t("services_subtitle")}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t("about_hero_description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-cargo-600 hover:bg-cargo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {t("request_quote")}
              </Link>
              <Link
                to="/about"
                className="border-2 border-cargo-600 text-cargo-600 hover:bg-cargo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                {t("learn_more")}
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cargo-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cargo-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cargo-400 rounded-full opacity-20 animate-bounce"></div>
      </section>

      {/* Main Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("services_title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("services_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-cargo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("features_title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("features_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-cargo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("our_achievements_title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("our_achievements_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-cargo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-10 h-10 text-cargo-600" />
              </div>
              <div className="text-4xl font-bold text-cargo-600 mb-2">10,000+</div>
              <div className="text-lg text-gray-600">{t("successful_shipments")}</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-cargo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-10 h-10 text-cargo-600" />
              </div>
              <div className="text-4xl font-bold text-cargo-600 mb-2">98%</div>
              <div className="text-lg text-gray-600">{t("on_time_delivery")}</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-cargo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-10 h-10 text-cargo-600" />
              </div>
              <div className="text-4xl font-bold text-cargo-600 mb-2">500+</div>
              <div className="text-lg text-gray-600">{t("happy_customers")}</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-cargo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="w-10 h-10 text-cargo-600" />
              </div>
              <div className="text-4xl font-bold text-cargo-600 mb-2">15+</div>
              <div className="text-lg text-gray-600">{t("countries_served")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Request Section */}
      <section className="py-20 bg-cargo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t("calculate_cost")}
          </h2>
          <p className="text-xl text-cargo-100 mb-8">
            Get an instant quote for your shipping needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white hover:bg-gray-100 text-cargo-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {t("request_quote")}
            </Link>
            <Link
              to="/signup"
              className="border-2 border-white text-white hover:bg-white hover:text-cargo-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
            >
              {t("get_started")}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("frequently_asked_questions")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("faq_subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-lg font-medium text-gray-900">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-cargo-600" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-cargo-600" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cargo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t("cta_title")}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t("cta_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-cargo-600 hover:bg-cargo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {t("start_shipping")}
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
            >
              {t("contact_sales")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;