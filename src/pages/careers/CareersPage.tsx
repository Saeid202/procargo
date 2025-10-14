import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  HeartIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  StarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,

  BuildingOfficeIcon,
  UsersIcon,
  GlobeAltIcon,

  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Footer from '../../components/ui/Footer';

const CareersPage = () => {
  const { t } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const benefits = [
    {
      icon: CurrencyDollarIcon,
      title: t("competitive_salary"),
      description: t("competitive_salary_desc")
    },
    {
      icon: ClockIcon,
      title: t("flexible_work"),
      description: t("flexible_work_desc")
    },
    {
      icon: ChartBarIcon,
      title: t("growth_opportunities"),
      description: t("growth_opportunities_desc")
    },
    {
      icon: HeartIcon,
      title: t("health_benefits"),
      description: t("health_benefits_desc")
    },
    {
      icon: UserGroupIcon,
      title: t("team_culture"),
      description: t("team_culture_desc")
    }
  ];

  const companyValues = [
    {
      icon: LightBulbIcon,
      title: t("innovation"),
      description: t("innovation_desc")
    },
    {
      icon: ShieldCheckIcon,
      title: t("integrity"),
      description: t("integrity_desc")
    },
    {
      icon: StarIcon,
      title: t("excellence"),
      description: t("excellence_desc")
    },
    {
      icon: UsersIcon,
      title: t("collaboration"),
      description: t("collaboration_desc")
    },
    {
      icon: HandRaisedIcon,
      title: t("diversity"),
      description: t("diversity_desc")
    },
    {
      icon: GlobeAltIcon,
      title: t("sustainability"),
      description: t("sustainability_desc")
    }
  ];

  const careerDevelopment = [
    {
      icon: AcademicCapIcon,
      title: t("training_programs"),
      description: t("training_programs_desc")
    },
    {
      icon: UserGroupIcon,
      title: t("mentorship"),
      description: t("mentorship_desc")
    },
    {
      icon: DocumentTextIcon,
      title: t("certification_support"),
      description: t("certification_support_desc")
    },
    {
      icon: ChartBarIcon,
      title: t("leadership_development"),
      description: t("leadership_development_desc")
    }
  ];

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Logistics Coordinator",
      department: t("logistics_operations"),
      location: t("toronto_canada"),
      type: t("full_time"),
      level: t("senior_level"),
      description: "Lead and coordinate complex logistics operations for international shipments between China and Canada.",
      requirements: [
        "Bachelor's degree in Logistics, Supply Chain, or related field",
        "5+ years experience in international logistics",
        "Strong knowledge of customs regulations",
        "Excellent communication and leadership skills"
      ],
      responsibilities: [
        "Manage end-to-end logistics operations",
        "Coordinate with international partners",
        "Ensure compliance with regulations",
        "Lead a team of logistics specialists"
      ]
    },
    {
      id: 2,
      title: "Customer Success Manager",
      department: t("customer_service"),
      location: t("vancouver_canada"),
      type: t("full_time"),
      level: t("mid_level"),
      description: "Build and maintain strong relationships with our key clients, ensuring their success and satisfaction.",
      requirements: [
        "Bachelor's degree in Business or related field",
        "3+ years in customer success or account management",
        "Experience in logistics or international trade",
        "Strong problem-solving and communication skills"
      ],
      responsibilities: [
        "Manage key client accounts",
        "Resolve customer issues and concerns",
        "Identify upselling opportunities",
        "Provide regular account reviews"
      ]
    },
    {
      id: 3,
      title: "Legal Compliance Specialist",
      department: t("legal_compliance"),
      location: t("toronto_canada"),
      type: t("full_time"),
      level: t("mid_level"),
      description: "Ensure compliance with international trade regulations and customs requirements.",
      requirements: [
        "Law degree or related qualification",
        "3+ years in international trade law",
        "Knowledge of customs regulations",
        "Attention to detail and analytical skills"
      ],
      responsibilities: [
        "Monitor regulatory changes",
        "Ensure compliance across operations",
        "Provide legal guidance to teams",
        "Maintain compliance documentation"
      ]
    },
    {
      id: 4,
      title: "Frontend Developer",
      department: t("technology"),
      location: t("remote"),
      type: t("full_time"),
      level: t("mid_level"),
      description: "Develop and maintain our customer-facing web applications and internal tools.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "3+ years React/TypeScript experience",
        "Experience with modern web technologies",
        "Strong problem-solving skills"
      ],
      responsibilities: [
        "Develop user interfaces",
        "Collaborate with design team",
        "Write clean, maintainable code",
        "Participate in code reviews"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Logistics Manager",
      content: "Working at CargoBridge has been an incredible journey. The company truly values its employees and provides amazing growth opportunities.",
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Customer Success Lead",
      content: "The collaborative culture here is unmatched. Every day I learn something new and feel supported by my amazing team.",
      avatar: "MR"
    },
    {
      name: "Lisa Wang",
      role: "Legal Compliance Specialist",
      content: "CargoBridge's commitment to excellence and innovation makes it a fantastic place to build a career in international trade.",
      avatar: "LW"
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
              <span className="mb-2 block">{t("careers_title")}</span>
              <span className="text-cargo-600 block">{t("careers_subtitle")}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t("careers_hero_description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="bg-cargo-600 hover:bg-cargo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {t("apply_now")}
              </button>
              <Link
                to="/contact"
                className="border-2 border-cargo-600 text-cargo-600 hover:bg-cargo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                {t("contact_hr")}
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cargo-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cargo-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cargo-400 rounded-full opacity-20 animate-bounce"></div>
      </section>

      {/* Why Work With Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("why_work_with_us")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("why_work_with_us_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                  <benefit.icon className="w-8 h-8 text-cargo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("company_values")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("company_values_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-cargo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Development Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("career_development")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("career_development_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {careerDevelopment.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-cargo-100 rounded-lg flex items-center justify-center mb-6">
                  <item.icon className="w-8 h-8 text-cargo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("current_openings")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("open_positions_subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                        {job.department}
                      </span>
                      <span className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <BriefcaseIcon className="w-4 h-4 mr-1" />
                        {job.type}
                      </span>
                      <span className="flex items-center">
                        <ChartBarIcon className="w-4 h-4 mr-1" />
                        {job.level}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                    <button
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      className="bg-cargo-600 hover:bg-cargo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      {selectedJob === job.id ? t("hide_details") : t("view_details")}
                    </button>
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="border-2 border-cargo-600 text-cargo-600 hover:bg-cargo-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      {t("apply_now")}
                    </button>
                  </div>
                </div>

                {selectedJob === job.id && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">{t("responsibilities")}</h4>
                        <ul className="space-y-2">
                          {job.responsibilities.map((responsibility, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-1" />
                              {responsibility}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">{t("requirements")}</h4>
                        <ul className="space-y-2">
                          {job.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-1" />
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employee Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("employee_testimonials")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("employee_testimonials_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-cargo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact HR Section */}
      <section className="py-20 bg-cargo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t("contact_hr")}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t("contact_hr_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${t("hr_email")}`}
              className="bg-white hover:bg-gray-100 text-cargo-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              {t("hr_email")}
            </a>
            <a
              href={`tel:${t("hr_phone")}`}
              className="border-2 border-white text-white hover:bg-white hover:text-cargo-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 flex items-center justify-center"
            >
              <PhoneIcon className="w-5 h-5 mr-2" />
              {t("hr_phone")}
            </a>
          </div>
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{t("application_form")}</h3>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronUpIcon className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("job_title")}
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500">
                    <option value="">{t("select_category")}</option>
                    {jobOpenings.map((job) => (
                      <option key={job.id} value={job.title}>{job.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("first_name")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      placeholder={t("first_name")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("last_name")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      placeholder={t("last_name")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("email_address")}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    placeholder={t("email_address")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("phone_number")}
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    placeholder={t("phone_number")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("resume_upload")}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("cover_letter_optional")}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    placeholder={t("cover_letter_optional")}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-cargo-600 hover:bg-cargo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
                  >
                    {t("submit_application")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CareersPage;