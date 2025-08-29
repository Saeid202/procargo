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
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <InformationCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">AI Analysis Information</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our AI will analyze your product for international trade compliance, identifying required certificates, 
              legal requirements, and estimated timelines.
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
              New Analysis
            </button>
            <button
              onClick={() => setActiveTab('compliance-reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compliance-reports'
                  ? 'border-cargo-500 text-cargo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Compliance Reports
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'new-analysis' ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Compliance Analysis</h3>
                <p className="text-gray-600">Upload your product details and get comprehensive compliance analysis for international trade.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-6">
                    {/* Product Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
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
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </label>
                      </div>
                    </div>

                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                      <input
                        type="text"
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        placeholder="e.g., LED Light Bulb"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      />
                    </div>

                    {/* Product Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                      <select
                        value={formData.productCategory}
                        onChange={(e) => handleInputChange('productCategory', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      >
                        <option value="">Select category</option>
                        {productCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Product Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
                      <textarea
                        value={formData.productDescription}
                        onChange={(e) => handleInputChange('productDescription', e.target.value)}
                        rows={4}
                        placeholder="Describe your product, its specifications, materials, intended use, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      />
                    </div>
                  </div>

                  {/* Right Column - Additional Fields and Info */}
                  <div className="space-y-6">
                    {/* Country Selection */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
                        <select
                          value={formData.originCountry}
                          onChange={(e) => handleInputChange('originCountry', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        >
                          <option value="">Select origin country</option>
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Destination Country</label>
                        <select
                          value={formData.destinationCountry}
                          onChange={(e) => handleInputChange('destinationCountry', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        >
                          <option value="">Select destination country</option>
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
                    <span>Start Compliance Analysis</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Reports</h3>
                <p className="text-gray-600">View and manage your previous compliance analysis reports.</p>
              </div>

              {/* Placeholder for Compliance Reports */}
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                <p className="text-gray-500 mb-4">Start your first compliance analysis to generate reports.</p>
                <button
                  onClick={() => setActiveTab('new-analysis')}
                  className="bg-cargo-600 hover:bg-cargo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Start New Analysis
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
