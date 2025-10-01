import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { CurrencyTransferService } from '../../services/currencyTransferService';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const CurrencyTransferPage: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isPersian = currentLanguage === 'fa' || currentLanguage === 'fa-IR';
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    transferType: '',
    amount: '',
    fromCurrency: '',
    toCurrency: '',
    purpose: '',
    beneficiaryName: '',
    beneficiaryAccount: '',
    beneficiaryBank: '',
    additionalInfo: '',
    customerRequest: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show for Persian language
  if (!isPersian) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if customer request is provided
    if (!formData.customerRequest.trim()) {
      alert('لطفاً درخواست خود را به تفصیل بنویسید.');
      return;
    }
    
    if (!user) {
      alert('برای ثبت درخواست نقل و انتقال، ابتدا وارد حساب کاربری شوید.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { transfer, error } = await CurrencyTransferService.createTransfer(user.id, {
        transfer_type: formData.transferType,
        amount: Number(formData.amount || 0),
        from_currency: formData.fromCurrency,
        to_currency: formData.toCurrency,
        purpose: formData.purpose,
        beneficiary_name: formData.beneficiaryName,
        beneficiary_account: formData.beneficiaryAccount,
        beneficiary_bank: formData.beneficiaryBank,
        additional_info: formData.additionalInfo || undefined,
        customer_request: formData.customerRequest,
      });

      if (error || !transfer) {
        console.error('Error creating currency transfer:', error);
        alert('خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.');
        return;
      }

      alert('درخواست نقل و انتقال ارز با موفقیت ثبت شد. تیم ما در اسرع وقت با شما تماس خواهد گرفت.');
      // Optionally reset form
      setFormData({
        transferType: '',
        amount: '',
        fromCurrency: '',
        toCurrency: '',
        purpose: '',
        beneficiaryName: '',
        beneficiaryAccount: '',
        beneficiaryBank: '',
        additionalInfo: '',
        customerRequest: ''
      });
    } catch (err) {
      console.error('Unexpected error creating currency transfer:', err);
      alert('خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const transferTypes = [
    { value: 'business', label: 'انتقال تجاری' },
    { value: 'personal', label: 'انتقال شخصی' },
    { value: 'investment', label: 'انتقال سرمایه‌گذاری' },
    { value: 'education', label: 'انتقال تحصیلی' },
    { value: 'medical', label: 'انتقال درمانی' }
  ];

  const currencies = [
    { value: 'USD', label: 'دلار آمریکا (USD)' },
    { value: 'EUR', label: 'یورو (EUR)' },
    { value: 'CNY', label: 'یوان چین (CNY)' },
    { value: 'GBP', label: 'پوند انگلیس (GBP)' },
    { value: 'CAD', label: 'دلار کانادا (CAD)' },
    { value: 'IRR', label: 'ریال ایران (IRR)' }
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              نقل و انتقال ارز
            </h1>
            <p className="text-gray-600 text-lg">
              خدمات امن و مطمئن برای نقل و انتقال ارز بین‌المللی
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              خدمات نقل و انتقال ارز
            </h2>
            <p className="text-blue-800 leading-relaxed">
              ما خدمات کامل نقل و انتقال ارز را با نرخ‌های رقابتی و امنیت بالا ارائه می‌دهیم. 
              از انتقال تجاری تا شخصی، ما در تمام مراحل در کنار شما هستیم.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                نرخ‌های رقابتی
              </h3>
              <p className="text-green-800 text-sm">
                بهترین نرخ‌های ارز در بازار با شفافیت کامل
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">
                امنیت بالا
              </h3>
              <p className="text-purple-800 text-sm">
                انتقال امن با پشتیبانی کامل بانکی
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">
                سرعت بالا
              </h3>
              <p className="text-orange-800 text-sm">
                انتقال سریع در کمترین زمان ممکن
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center space-x-2 text-yellow-800">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <span className="font-semibold">
                توجه: تمامی نقل و انتقالات طبق قوانین بانک مرکزی انجام می‌شود
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transfer Type */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 ml-2" />
                  نوع انتقال
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع انتقال *
                  </label>
                  <select
                    name="transferType"
                    value={formData.transferType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">انتخاب نوع انتقال</option>
                    {transferTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount and Currency */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 ml-2" />
                  مبلغ و ارز
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مبلغ *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="مبلغ را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ارز مبدا *
                    </label>
                    <select
                      name="fromCurrency"
                      value={formData.fromCurrency}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">انتخاب ارز مبدا</option>
                      {currencies.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ارز مقصد *
                    </label>
                    <select
                      name="toCurrency"
                      value={formData.toCurrency}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">انتخاب ارز مقصد</option>
                      {currencies.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      هدف انتقال *
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="هدف از انتقال را مشخص کنید"
                    />
                  </div>
                </div>
              </div>

              {/* Beneficiary Information */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 ml-2" />
                  اطلاعات ذی‌نفع
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام ذی‌نفع *
                    </label>
                    <input
                      type="text"
                      name="beneficiaryName"
                      value={formData.beneficiaryName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="نام کامل ذی‌نفع"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره حساب *
                    </label>
                    <input
                      type="text"
                      name="beneficiaryAccount"
                      value={formData.beneficiaryAccount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="شماره حساب ذی‌نفع"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام بانک *
                    </label>
                    <input
                      type="text"
                      name="beneficiaryBank"
                      value={formData.beneficiaryBank}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="نام بانک ذی‌نفع"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Request */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 ml-2" />
                  درخواست مشتری
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    درخواست خود را به تفصیل بنویسید *
                  </label>
                  <textarea
                    name="customerRequest"
                    value={formData.customerRequest}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="لطفاً درخواست خود را به طور کامل و دقیق بنویسید. شامل: نوع انتقال مورد نظر، مبلغ تقریبی، زمان مورد نیاز، شرایط خاص، و هر گونه اطلاعات دیگری که فکر می‌کنید مهم است..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    هرچه اطلاعات بیشتری ارائه دهید، بهتر می‌توانیم به شما کمک کنیم.
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  اطلاعات تکمیلی
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات اضافی
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="هر گونه اطلاعات اضافی که فکر می‌کنید مفید است..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <ClockIcon className="w-5 h-5 animate-spin" />
                      <span>در حال ارسال...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>ثبت درخواست نقل و انتقال</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              مراحل نقل و انتقال
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">ثبت درخواست</h4>
                <p className="text-sm text-gray-600">تکمیل فرم و ارسال مدارک</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">بررسی مدارک</h4>
                <p className="text-sm text-gray-600">تأیید مدارک و اطلاعات</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">انجام انتقال</h4>
                <p className="text-sm text-gray-600">اجرای نقل و انتقال ارز</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">تأیید نهایی</h4>
                <p className="text-sm text-gray-600">ارسال تأییدیه و رسید</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyTransferPage;
