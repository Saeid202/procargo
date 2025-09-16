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
  FlagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { ImageUploadService } from '../../services/imageUploadService';
import { GPTService } from '../../services/gptService';
import { ComplianceService } from '../../services/complianceService';

const CompliancePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('new-analysis');
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '',
    productDescription: '',
    originCountry: '',
    destinationCountry: '',
    productImage: undefined as File | undefined
  });
  
  // New states for image handling
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [savedAnalysis, setSavedAnalysis] = useState<any>(null);
  
  // States for Compliance Reports
  const [userAnalyses, setUserAnalyses] = useState<any[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);

  const { t } = useTranslation();

  // Load user analyses when Compliance Reports tab is active
  const loadUserAnalyses = async () => {
    if (!user) return;
    
    setLoadingAnalyses(true);
    try {
      const result = await ComplianceService.getUserAnalyses(user.id);
      if (result.error) {
        console.error('Failed to load analyses:', result.error);
      } else {
        setUserAnalyses(result.analyses);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  // Load analyses when Compliance Reports tab becomes active
  React.useEffect(() => {
    if (activeTab === 'compliance-reports' && user) {
      loadUserAnalyses();
    }
  }, [activeTab, user]);

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
      // Validate image
      const validation = ImageUploadService.validateImage(file);
      if (!validation.isValid) {
        setImageError(validation.error || 'Invalid image');
        return;
      }

      // Clear previous errors
      setImageError(null);
      
      // Update form data
      setFormData(prev => ({ ...prev, productImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, productImage: undefined }));
    setImagePreview(null);
    setImageError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setImageError('Please log in to submit analysis');
      return;
    }

    setIsUploading(true);
    setAnalysisResult(null);
    setSavedAnalysis(null);

    try {
      // Use ComplianceService to handle the complete flow
      const result = await ComplianceService.createAnalysis(user.id, formData);
      
      if (result.error) {
        setImageError(result.error);
        return;
      }

      if (result.analysis) {
        setSavedAnalysis(result.analysis);
        setAnalysisResult({
          hsCode: result.analysis.hsCode,
          tariffRate: result.analysis.tariffRate,
          requirements: result.analysis.requirements,
          restrictions: result.analysis.restrictions,
          documentation: result.analysis.documentation,
          estimatedProcessingTime: result.analysis.estimatedProcessingTime,
          confidence: result.analysis.confidence,
          analysis: result.analysis.analysis
        });
        
        // Navigate to Compliance Reports tab after successful analysis
        setActiveTab('compliance-reports');
        // Refresh the analyses list
        loadUserAnalyses();
      }
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setImageError('Analysis failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      productCategory: '',
      productDescription: '',
      originCountry: '',
      destinationCountry: '',
      productImage: undefined
    });
    setImagePreview(null);
    setImageError(null);
    setAnalysisResult(null);
    setSavedAnalysis(null);
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
                    {/* Enhanced Product Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("product_image")}</label>
                      
                      {!imagePreview ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cargo-400 transition-colors">
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="product-image"
                          />
                          <label htmlFor="product-image" className="cursor-pointer">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm text-gray-600">
                              {t("click_to_upload_or_drag_and_drop")}
                            </p>
                            <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {imageError && (
                        <p className="text-red-500 text-sm mt-2">{imageError}</p>
                      )}
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
                    disabled={isUploading}
                    className="w-full bg-cargo-600 hover:bg-cargo-700 disabled:bg-cargo-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="h-5 w-5" />
                        <span>{t("start_compliance_analysis")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Analysis Results */}
              {analysisResult && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-green-900">Analysis Results</h3>
                    <button
                      onClick={resetForm}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      New Analysis
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>HS Code:</strong> {analysisResult.hsCode}</p>
                      <p><strong>Tariff Rate:</strong> {analysisResult.tariffRate}%</p>
                      <p><strong>Confidence:</strong> {(analysisResult.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p><strong>Processing Time:</strong> {analysisResult.estimatedProcessingTime}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold text-green-900 mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-green-800">
                      {analysisResult.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-green-900 mb-2">Required Documentation:</h4>
                    <ul className="list-disc list-inside text-sm text-green-800">
                      {analysisResult.documentation.map((doc: string, index: number) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-green-900 mb-2">Analysis:</h4>
                    <p className="text-sm text-green-800">{analysisResult.analysis}</p>
                  </div>

                  {savedAnalysis && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Analysis saved!</strong> Your compliance analysis has been stored and can be viewed in the Compliance Reports tab.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("compliance_reports")}</h3>
                <p className="text-gray-600">{t("compliance_reports_description")}</p>
              </div>

              {/* Compliance Reports List */}
              {loadingAnalyses ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cargo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your compliance reports...</p>
                </div>
              ) : userAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {userAnalyses.map((analysis) => (
                    <div key={analysis.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{analysis.productName}</h4>
                          <p className="text-sm text-gray-600">{analysis.productCategory} • {analysis.originCountry} → {analysis.destinationCountry}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            analysis.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : analysis.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : analysis.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {analysis.status}
                          </span>
                        </div>
                      </div>

                      {analysis.status === 'completed' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">HS Code</p>
                            <p className="text-lg font-bold text-blue-700">{analysis.hsCode}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-green-900">Tariff Rate</p>
                            <p className="text-lg font-bold text-green-700">{analysis.tariffRate}%</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-purple-900">Confidence</p>
                            <p className="text-lg font-bold text-purple-700">{(analysis.confidence * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      )}

                      {analysis.productImageUrl && (
                        <div className="mb-4">
                          <img 
                            src={analysis.productImageUrl} 
                            alt="Product" 
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => {
                            // Show detailed analysis in a modal or expand the card
                            setAnalysisResult({
                              hsCode: analysis.hsCode,
                              tariffRate: analysis.tariffRate,
                              requirements: analysis.requirements,
                              restrictions: analysis.restrictions,
                              documentation: analysis.documentation,
                              estimatedProcessingTime: analysis.estimatedProcessingTime,
                              confidence: analysis.confidence,
                              analysis: analysis.analysis
                            });
                            setActiveTab('new-analysis');
                          }}
                          className="text-cargo-600 hover:text-cargo-700 font-medium text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            // Delete analysis
                            if (window.confirm('Are you sure you want to delete this analysis?')) {
                              ComplianceService.deleteAnalysis(analysis.id).then(() => {
                                loadUserAnalyses(); // Reload the list
                              });
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
