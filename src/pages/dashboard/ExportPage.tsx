import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExportService } from '../../services/exportService';
import { useAuth } from '../../contexts/AuthContext';

const ExportPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isPersian = currentLanguage === 'fa' || currentLanguage === 'fa-IR';

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: '',
    companyIntroduction: '',
    productName: '',
    productDescription: '',
    additionalInfo: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

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
    setIsSubmitting(true);

    try {
      if (!user) {
        console.error("No user authenticated");
        return;
      }

      // Create export request
      const { export: exportRequest, error: exportError } =
        await ExportService.createExportRequest(user.id, {
          company_name: formData.companyName,
          company_type: formData.companyType,
          company_introduction: formData.companyIntroduction,
          product_name: formData.productName,
          product_description: formData.productDescription,
          additional_info: formData.additionalInfo,
        });

      if (exportError || !exportRequest) {
        console.error("Error creating export request:", exportError);
        return;
      }

      console.log("Export request created:", exportRequest);

      // Upload files if any
      for (const file of selectedFiles) {
        const { fileRecord, error: fileError } = await ExportService.uploadFile(
          user.id,
          exportRequest.id,
          file
        );

        if (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
        } else {
          console.log("Uploaded file record:", fileRecord);
        }
      }

      alert("Export request and files uploaded successfully!");

      // Reset form
      setFormData({
        companyName: "",
        companyType: "",
        companyIntroduction: "",
        productName: "",
        productDescription: "",
        additionalInfo: "",
      });
      setSelectedFiles([]);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t("export")}
            </h1>
            <p className="text-gray-600 mb-8">
              صادرات و ارسال کالا به خارج از کشور
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                خدمات صادرات و پشتیبانی ما
              </h2>
              <p className="text-blue-800 leading-relaxed">
                برای کمک به تولید کننده ها تسهیلاتی را فراهم نمودیم که شما می‌توانید با تکمیل این فرم و معرفی محصول خود، از کمک نماینده های ما در چین بهرمند شوید. با تکمیل این فرم و اطلاعات محصول شما، نماینده ما این اطلاعات را بررسی خواهد کرد که چگونه می‌توانیم در زمینه صادرات به شما کمک نماییم.
              </p>
              <p className="text-blue-800 leading-relaxed mt-4">
                لطفا قسمت‌های خالی را به صورت کامل پر کنید و در قسمت توضیحات هر موردی که می‌تواند به ما کمک کند که درباره شما، محصولتان و نحوه کارکرد شما آشنا شویم را برای ما بنویسید و ما در اسرع وقت با شما در ارتباط خواهیم بود.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  خدمات ما
                </h3>
                <ul className="text-green-800 space-y-2">
                  <li>• مشاوره صادرات</li>
                  <li>• معرفی به نمایندگان چین</li>
                  <li>• پشتیبانی در فرآیند صادرات</li>
                  <li>• بررسی محصولات</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">
                  مراحل کار
                </h3>
                <ul className="text-orange-800 space-y-2">
                  <li>• تکمیل فرم درخواست</li>
                  <li>• بررسی توسط نماینده</li>
                  <li>• ارائه راهنمایی</li>
                  <li>• تماس در اسرع وقت</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-2 text-yellow-800">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">
                  توجه: ما فقط درخواست‌ها را از تولید کننده ها قبول می‌کنیم نه شرکت‌های بازرگانی
                </span>
              </div>
            </div>

            {/* Form - Only for Persian */}
            {isPersian && (
              <div className="mt-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    فرم درخواست صادرات
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Company Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">
                        1. معرفی شرکت صادراتی یا تولید کننده
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نام شرکت *
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="نام کامل شرکت خود را وارد کنید"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نوع شرکت *
                          </label>
                          <select
                            name="companyType"
                            value={formData.companyType}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">انتخاب کنید</option>
                            <option value="manufacturer">تولید کننده</option>
                            <option value="exporter">صادر کننده</option>
                            <option value="trading">شرکت بازرگانی</option>
                            <option value="other">سایر</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          معرفی شرکت *
                        </label>
                        <textarea
                          name="companyIntroduction"
                          value={formData.companyIntroduction}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="شرکت خود را معرفی کنید: تاریخ تأسیس، زمینه فعالیت، تجربه کاری، تعداد کارکنان، ظرفیت تولید و سایر اطلاعات مهم..."
                        />
                      </div>
                    </div>

                    {/* 2. Product Information */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">
                        2. معرفی محصول
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نام محصول *
                          </label>
                          <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="نام محصول خود را وارد کنید"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            توضیحات محصول *
                          </label>
                          <textarea
                            name="productDescription"
                            value={formData.productDescription}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="توضیحات کامل محصول، مشخصات، مواد اولیه، کاربرد و ..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Additional Information */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-orange-900 mb-4">
                        3. توضیحات تکمیلی
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اطلاعات اضافی (اختیاری)
                        </label>
                        <textarea
                          name="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="هر اطلاعات اضافی که می‌تواند به ما کمک کند..."
                        />
                      </div>
                    </div>

                    {/* 4. Document Upload */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">
                        4. آپلود مدارک
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          مدارک و فایل‌های مرتبط
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
                        className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                          }`}
                      >
                        {isSubmitting ? 'در حال ارسال...' : 'ارسال درخواست'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
