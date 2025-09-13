import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  TruckIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Footer from '../../components/ui/Footer';

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: ''
    });
  };

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
              <span className="mb-2 block">{t("contact_title")}</span>
              <span className="text-cargo-600 block">{t("contact_subtitle")}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t("contact_hero_description")}
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cargo-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cargo-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cargo-400 rounded-full opacity-20 animate-bounce"></div>
      </section>

      {/* Contact Form and Information Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("contact_form_title")}</h2>
                <p className="text-lg text-gray-600">{t("contact_form_subtitle")}</p>
              </div>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">{t("message_sent")}</h3>
                  <p className="text-green-700">{t("thank_you_message")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("full_name")} *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 transition-colors"
                        placeholder={t("full_name")}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("email_address")} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 transition-colors"
                        placeholder={t("email_address")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("phone_number")}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 transition-colors"
                        placeholder={t("phone_number")}
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("company_name")}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 transition-colors"
                        placeholder={t("company_name")}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("subject")} *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 transition-colors"
                    >
                      <option value="">{t("select_business_type")}</option>
                      <option value="quote">{t("get_quote")}</option>
                      <option value="tracking">{t("track_shipment")}</option>
                      <option value="support">{t("customer_support")}</option>
                      <option value="partnership">{t("partnership")}</option>
                      <option value="other">{t("other")}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("your_message")} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 transition-colors resize-none"
                      placeholder={t("your_message")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cargo-600 hover:bg-cargo-700 disabled:bg-cargo-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t("sending") : t("send_message")}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("contact_information")}</h2>
                <p className="text-lg text-gray-600">{t("get_in_touch")}</p>
              </div>

              <div className="space-y-8">
                {/* Office Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cargo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-6 h-6 text-cargo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("office_address")}</h3>
                    <p className="text-gray-600">{t("office_address_value")}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cargo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-cargo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("phone")}</h3>
                    <p className="text-gray-600">{t("phone_value")}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cargo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <EnvelopeIcon className="w-6 h-6 text-cargo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("email")}</h3>
                    <p className="text-gray-600">{t("email_value")}</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cargo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-6 h-6 text-cargo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("business_hours")}</h3>
                    <p className="text-gray-600">{t("business_hours_value")}</p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("emergency_contact")}</h3>
                    <p className="text-gray-600">{t("emergency_contact_value")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Contact Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("why_contact_us")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("contact_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("get_quote")}</h3>
              <p className="text-gray-600 text-sm">{t("get_quote_desc")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("track_shipment")}</h3>
              <p className="text-gray-600 text-sm">{t("track_shipment_desc")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("customer_support")}</h3>
              <p className="text-gray-600 text-sm">{t("customer_support_desc")}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-cargo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("partnership")}</h3>
              <p className="text-gray-600 text-sm">{t("partnership_desc")}</p>
            </div>
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
            {t("ready_to_work_with_us_title")}
          </h2>
          <p className="text-xl text-cargo-100 mb-8 max-w-2xl mx-auto">
            {t("ready_to_work_with_us_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white hover:bg-gray-100 text-cargo-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {t("get_started_today")}
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-cargo-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
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

export default ContactPage;