import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { CompanyVerificationService } from '../../services/companyVerificationService';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const CompanyVerificationPage: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isPersian = currentLanguage === 'fa' || currentLanguage === 'fa-IR';
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    companyNameEnglish: '',
    companyNameChinese: '',
    businessLicense: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if file is uploaded
    if (selectedFiles.length === 0) {
      alert('لطفاً مدارک شرکت چینی را آپلود کنید.');
      return;
    }
    
    if (!user) {
      alert('برای ارسال درخواست، ابتدا وارد حساب کاربری خود شوید.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { request, error } = await CompanyVerificationService.createVerificationRequest(user.id, {
        company_name_english: formData.companyNameEnglish || undefined,
        company_name_chinese: formData.companyNameChinese || undefined,
        business_license: formData.businessLicense || undefined
      });

      if (error || !request) {
        console.error('Error creating verification request:', error);
        alert('خطا در ایجاد درخواست اعتبارسنجی. لطفاً دوباره تلاش کنید.');
        return;
      }

      for (const file of selectedFiles) {
        const { error: fileError } = await CompanyVerificationService.uploadFile(
          user.id,
          request.id,
          file
        );
        if (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
        }
      }

      alert('درخواست اعتبار سنجی شرکت چینی با موفقیت ثبت و فایل‌ها آپلود شد!');
      setFormData({
        companyNameEnglish: '',
        companyNameChinese: '',
        businessLicense: ''
      });
      setSelectedFiles([]);
    } catch (err) {
      console.error('Unexpected error submitting verification:', err);
      alert('خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show for Persian language
  if (!isPersian) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              اعتبار سنجی شرکت‌های چینی
            </h1>
            <p className="text-gray-600 mb-8">
              تأیید اعتبار و صلاحیت شرکت‌های چینی برای همکاری تجاری
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                خدمات اعتبار سنجی شرکت‌های چینی
              </h2>
              <p className="text-blue-800 leading-relaxed">
                برای اطمینان از اعتبار و صلاحیت شرکت‌های چینی، خدمات اعتبار سنجی ارائه می‌دهیم. این خدمات شامل بررسی بیزینس لایسنس و تأیید هویت قانونی شرکت‌های چینی می‌باشد.
              </p>
              <p className="text-blue-800 leading-relaxed mt-4">
                با ارسال مدارک شرکت چینی (اجباری) و در صورت تمایل، نام شرکت به انگلیسی و چینی (اختیاری)، تیم متخصص ما در اسرع وقت اعتبار شرکت را بررسی و تأیید خواهد کرد.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  مزایای اعتبار سنجی
                </h3>
                <ul className="text-green-800 space-y-2">
                  <li>• تأیید اعتبار شرکت‌های چینی</li>
                  <li>• بررسی بیزینس لایسنس</li>
                  <li>• تسهیل در همکاری‌های تجاری</li>
                  <li>• افزایش اعتماد در معاملات</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">
                  مراحل اعتبار سنجی
                </h3>
                <ul className="text-orange-800 space-y-2">
                  <li>• آپلود مدارک شرکت چینی (اجباری)</li>
                  <li>• تکمیل نام شرکت (اختیاری)</li>
                  <li>• بررسی مدارک شرکت چینی</li>
                  <li>• صدور گواهی اعتبار</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center space-x-2 text-yellow-800">
                <ExclamationTriangleIcon className="w-6 h-6" />
                <span className="font-semibold">
                  توجه: تمامی مدارک باید به صورت واضح و خوانا اسکن شده باشند
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="mt-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  فرم درخواست اعتبار سنجی شرکت چینی
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 ml-2" />
                      اطلاعات شرکت چینی (اختیاری)
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نام شرکت به انگلیسی
                        </label>
                        <input
                          type="text"
                          name="companyNameEnglish"
                          value={formData.companyNameEnglish}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="نام شرکت به زبان انگلیسی (اختیاری)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نام شرکت به چینی
                        </label>
                        <input
                          type="text"
                          name="companyNameChinese"
                          value={formData.companyNameChinese}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="نام شرکت به زبان چینی (اختیاری)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 ml-2" />
                      آپلود مدارک
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مدارک شرکت چینی * (اجباری)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        فرمت‌های مجاز: PDF, DOC, DOCX, JPG, PNG (حداکثر 10MB هر فایل)
                      </p>
                      
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          مدارک مورد نیاز:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• بیزینس لایسنس رسمی شرکت چینی</li>
                          <li>• مدارک ثبت شرکت</li>
                          <li>• مدارک مالی و حسابداری</li>
                          <li>• مدارک هویتی مسئول شرکت</li>
                          <li>• سایر مدارک مرتبط</li>
                        </ul>
                      </div>
                      
                      {selectedFiles.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            فایل‌های انتخاب شده:
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {selectedFiles.map((file, index) => (
                              <li key={index}>• {file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center mx-auto ${
                        isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <ClockIcon className="w-5 h-5 ml-2" />
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5 ml-2" />
                          ارسال درخواست اعتبار سنجی شرکت چینی
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyVerificationPage;
