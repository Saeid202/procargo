import React, { useState } from 'react';
import { 
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  InformationCircleIcon,
  PhotoIcon,
  GlobeAltIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const CompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('new-analysis');
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '',
    productDescription: '',
    originCountry: '',
    destinationCountry: '',
    productImage: null as File | null
  });

  const { t } = useTranslation();

  const productCategories = [
    'Electronics',
    'Textiles & Apparel',
    'Machinery & Equipment',
    'Chemicals',
    'Food & Beverages',
    'Automotive',
    'Pharmaceuticals',
    'Construction Materials',
    'Agricultural Products',
    'Other'
  ];

  const countries = [
    'China',
    'Canada',
    'United States',
    'Germany',
    'Japan',
    'United Kingdom',
    'France',
    'Australia',
    'Brazil',
    'India'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, productImage: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission for compliance analysis
    console.log('Submitting compliance analysis:', formData);
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Information Section - Top of Page */}
      <div className="bg-gradient-to-r from-blue-50 to-cargo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg me-4">
            <InformationCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("ai_analysis_information")}</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {t("ai_analysis_information_description")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('new-analysis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'new-analysis'
                  ? 'border-cargo-500 text-cargo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t("new_analysis")}
            </button>
            <button
              onClick={() => setActiveTab('compliance-reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compliance-reports'
                  ? 'border-cargo-500 text-cargo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t("compliance_reports")}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'new-analysis' ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("product_compliance_analysis")}</h3>
                <p className="text-gray-600">{t("product_compliance_analysis_description")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-6">
                    {/* Product Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("product_image")}</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cargo-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="product-image"
                        />
                        <label htmlFor="product-image" className="cursor-pointer">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm text-gray-600">
                            {t("click_to_upload_or_drag_and_drop")}
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </label>
                      </div>
                    </div>

                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("product_name")}</label>
                      <input
                        type="text"
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        placeholder={t("product_name_placeholder")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      />
                    </div>

                    {/* Product Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("product_category")}</label>
                      <select
                        value={formData.productCategory}
                        onChange={(e) => handleInputChange('productCategory', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      >
                        <option value="">{t("select_category")}</option>
                        {productCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Product Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("product_description")}</label>
                      <textarea
                        value={formData.productDescription}
                        onChange={(e) => handleInputChange('productDescription', e.target.value)}
                        rows={4}
                        placeholder={t("product_description_placeholder")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      />
                    </div>
                  </div>

                  {/* Right Column - Additional Fields and Info */}
                  <div className="space-y-6">
                    {/* Country Selection */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("country_of_origin")}</label>
                        <select
                          value={formData.originCountry}
                          onChange={(e) => handleInputChange('originCountry', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        >
                          <option value="">{t("select_origin_country")}</option>
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("destination_country")}</label>
                        <select
                          value={formData.destinationCountry}
                          onChange={(e) => handleInputChange('destinationCountry', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        >
                          <option value="">{t("select_destination_country")}</option>
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                    </div>


                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-cargo-600 hover:bg-cargo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>{t("start_compliance_analysis")}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("compliance_reports")}</h3>
                <p className="text-gray-600">{t("compliance_reports_description")}</p>
              </div>

              {/* Placeholder for Compliance Reports */}
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("no_reports_yet")}</h3>
                <p className="text-gray-500 mb-4">{t("start_your_first_compliance_analysis_to_generate_reports")}</p>
                <button
                  onClick={() => setActiveTab('new-analysis')}
                  className="bg-cargo-600 hover:bg-cargo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t("start_new_analysis")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
