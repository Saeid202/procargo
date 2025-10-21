import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { CurrencyTransferService, CurrencyTransferRequest, CurrencyTransferResponse } from '../../services/currencyTransferService';
import { MessagingService } from '../../services/messagingService';
import { supabase } from '../../lib/supabase';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const CurrencyTransferPage: React.FC = () => {
  const { t, i18n } = useTranslation();
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
  const [activeView, setActiveView] = useState<'create' | 'history'>('create');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [userTransfers, setUserTransfers] = useState<CurrencyTransferRequest[]>([]);
  const [transferResponses, setTransferResponses] = useState<CurrencyTransferResponse[]>([]);
  const [messageTarget, setMessageTarget] = useState<{
    transferId: string;
    agentId: string;
    agentName?: string | null;
  } | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  const parseDate = useCallback((value?: string | null) => {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }, []);

  const formatDate = useCallback(
    (value?: string | null) => {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    [i18n.language]
  );

  const formatStatus = useCallback(
    (status?: CurrencyTransferRequest['status']) => {
      if (!status) {
        return '-';
      }
      const key = `currency_transfer_status_${status}`;
      const translated = t(key as any);
      if (translated && translated !== key) {
        return translated;
      }
      return status.replace(/_/g, ' ');
    },
    [t]
  );

  const statusBadgeClass = useCallback(
    (status?: CurrencyTransferRequest['status']) => {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'in_review':
          return 'bg-blue-100 text-blue-800';
        case 'processed':
          return 'bg-emerald-100 text-emerald-700';
        case 'rejected':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    },
    []
  );

  const fetchUserTransferHistory = useCallback(async () => {
    if (!user) return;
    try {
      setHistoryLoading(true);
      const { transfers, error } = await CurrencyTransferService.getTransfersByUser(user.id);
      if (error) {
        console.error('Failed to load currency transfers', error);
        setUserTransfers([]);
        setTransferResponses([]);
        return;
      }

      const sortedTransfers = (transfers || []).sort(
        (a, b) =>
          parseDate(b.updated_at || b.created_at) - parseDate(a.updated_at || a.created_at)
      );
      setUserTransfers(sortedTransfers);

      const transferIds = sortedTransfers
        .map((transfer) => transfer.id)
        .filter((value): value is string => Boolean(value));

      if (transferIds.length > 0) {
        const { responses, error: responsesError } =
          await CurrencyTransferService.getResponsesForTransfers(transferIds);
        if (responsesError) {
          console.error('Failed to load transfer responses', responsesError);
          setTransferResponses([]);
        } else {
          setTransferResponses(responses || []);
        }
      } else {
        setTransferResponses([]);
      }
    } catch (err) {
      console.error('Unexpected error loading currency transfer history', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user, parseDate]);

  const responsesByTransfer = useMemo(() => {
    return transferResponses.reduce((acc, response) => {
      if (!response.transfer_id) {
        return acc;
      }
      if (!acc[response.transfer_id]) {
        acc[response.transfer_id] = [];
      }
      acc[response.transfer_id].push(response);
      return acc;
    }, {} as Record<string, CurrencyTransferResponse[]>);
  }, [transferResponses]);

  const handleRefreshHistory = useCallback(() => {
    fetchUserTransferHistory();
  }, [fetchUserTransferHistory]);

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

  const handleMessageAgent = useCallback(
    (transferId: string, agentId?: string | null, agentName?: string | null) => {
      if (!agentId) {
        alert(t('currency_transfer_message_agent_unavailable'));
        return;
      }

      const defaultMessage = t('currency_transfer_message_agent_default', {
        transferId
      });
      setMessageDraft(defaultMessage);
      setMessageTarget({
        transferId,
        agentId,
        agentName
      });
    },
    [t]
  );

  const closeMessageModal = useCallback(() => {
    if (messageSending) {
      return;
    }
    setMessageTarget(null);
    setMessageDraft('');
  }, [messageSending]);

  const handleSendAgentMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageTarget) {
      return;
    }

    const body = messageDraft.trim();
    if (!body) {
      alert(t('currency_transfer_message_agent_empty'));
      return;
    }

    try {
      setMessageSending(true);
      const { data: thread, error: threadError } =
        await MessagingService.createOrGetDirectThread(messageTarget.agentId);
      if (threadError || !thread) {
        throw threadError || new Error('Thread creation failed');
      }

      const { error: sendError } = await MessagingService.sendMessage(thread.id, body);
      if (sendError) {
        throw sendError;
      }

      alert(t('currency_transfer_message_agent_success'));
      setMessageDraft('');
      setMessageTarget(null);
    } catch (error) {
      console.error('Failed to send message to agent', error);
      alert(t('currency_transfer_message_agent_error'));
    } finally {
      setMessageSending(false);
    }
  };

  useEffect(() => {
    if (user && activeView === 'history') {
      fetchUserTransferHistory();
    }
  }, [user, activeView, fetchUserTransferHistory]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const channel = supabase
      .channel(`currency-transfers-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'currency_transfer_requests',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchUserTransferHistory()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'currency_transfer_responses'
        },
        () => fetchUserTransferHistory()
      );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserTransferHistory]);

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
      fetchUserTransferHistory();
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
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveView('create')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                activeView === 'create' ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('currency_transfer_create_tab')}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                activeView === 'history' ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('currency_transfer_history_tab')}
            </button>
          </div>
        </div>

        {activeView === 'create' ? (
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
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('currency_transfer_history_heading')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('currency_transfer_history_subheading')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshHistory}
              disabled={historyLoading}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {historyLoading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-gray-400 border-b-transparent animate-spin" />
                  {t('loading')}
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4" />
                  {t('refresh')}
                </>
              )}
            </button>
          </div>
          <div className="p-6">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                <ArrowPathIcon className="h-6 w-6 animate-spin" />
                <span>{t('loading')}</span>
              </div>
            ) : userTransfers.length === 0 ? (
              <div className="text-center text-gray-600">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  {t('currency_transfer_no_history')}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {t('currency_transfer_no_history_description')}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {userTransfers.map((transfer) => {
                  const responses = responsesByTransfer[transfer.id] || [];
                  const agentNames = Array.from(
                    new Set(
                      responses
                        .map((response) => {
                          if (!response.agent) return null;
                          const fullName = [response.agent.first_name, response.agent.last_name]
                            .filter(Boolean)
                            .join(' ');
                          return fullName || response.agent.email || null;
                        })
                        .filter((value): value is string => Boolean(value))
                    )
                  );
                  return (
                    <article
                      key={transfer.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {transfer.purpose || t('currency_transfer')}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {t('currency_transfer_created_at', {
                              date: formatDate(transfer.created_at)
                            })}
                          </p>
                          {agentNames.length > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                              {t('currency_transfer_responses_from', {
                                agents: agentNames.join(', ')
                              })}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                            transfer.status
                          )}`}
                        >
                          {formatStatus(transfer.status)}
                        </span>
                      </div>
                      <div className="space-y-4 px-6 py-4">
                        <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
                          <div>
                            <span className="font-medium">{t('type')}:</span> {transfer.transfer_type || '-'}
                          </div>
                          <div>
                            <span className="font-medium">{t('amount')}:</span>{' '}
                            {transfer.amount?.toLocaleString()} {transfer.to_currency}
                          </div>
                          <div>
                            <span className="font-medium">{t('currencies')}:</span>{' '}
                            {transfer.from_currency} → {transfer.to_currency}
                          </div>
                          <div>
                            <span className="font-medium">{t('beneficiary')}:</span>{' '}
                            {transfer.beneficiary_name}
                          </div>
                          <div>
                            <span className="font-medium">{t('bank')}:</span>{' '}
                            {transfer.beneficiary_bank}
                          </div>
                          {transfer.admin_notes && (
                            <div className="md:col-span-2">
                              <span className="font-medium">{t('admin_notes')}:</span>{' '}
                              {transfer.admin_notes}
                            </div>
                          )}
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                            <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                            {t('customer_request')}
                          </h4>
                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                            {transfer.customer_request}
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                            {t('currency_transfer_responses')}
                          </h4>
                          {responses.length === 0 ? (
                            <p className="mt-2 text-sm text-gray-600">
                              {t('currency_transfer_no_responses')}
                            </p>
                          ) : (
                            <div className="mt-4 space-y-4">
                              {responses.map((response) => {
                                const agentName = response.agent
                                  ? [response.agent.first_name, response.agent.last_name]
                                      .filter(Boolean)
                                      .join(' ') || response.agent.email
                                  : null;
                                return (
                                  <div
                                    key={response.id}
                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                  >
                                    <div className="flex flex-col items-start justify-between gap-2 text-xs text-gray-500 sm:flex-row sm:items-center">
                                      <span className="font-medium text-gray-700">
                                        {agentName || t('agent')}
                                      </span>
                                      <span>
                                        {response.created_at
                                          ? new Date(response.created_at).toLocaleString(i18n.language)
                                          : '-'}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                      {response.response}
                                    </p>
                                    <dl className="mt-3 grid grid-cols-1 gap-3 text-xs text-gray-600 sm:grid-cols-3">
                                      {response.offered_rate !== null &&
                                        response.offered_rate !== undefined && (
                                          <div>
                                            <dt className="font-medium text-gray-700">
                                              {t('currency_transfer_rate_label') || 'Offered rate'}
                                            </dt>
                                            <dd>{response.offered_rate}</dd>
                                          </div>
                                        )}
                                      {response.fee !== null && response.fee !== undefined && (
                                        <div>
                                          <dt className="font-medium text-gray-700">
                                            {t('currency_transfer_fee_label') || 'Service fee'}
                                          </dt>
                                          <dd>{response.fee}</dd>
                                        </div>
                                      )}
                                      {response.delivery_date && (
                                        <div>
                                          <dt className="font-medium text-gray-700">
                                            {t('currency_transfer_delivery_label') || 'Expected delivery'}
                                          </dt>
                                          <dd>{formatDate(response.delivery_date)}</dd>
                                        </div>
                                      )}
                                    </dl>
                                    {response.agent_id && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleMessageAgent(transfer.id, response.agent_id, agentName)
                                        }
                                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                      >
                                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                        {t('currency_transfer_message_agent_button')}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {messageTarget && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={closeMessageModal}
      >
        <div
          className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('currency_transfer_message_agent_title')}
              </h3>
              {messageTarget.agentName && (
                <p className="mt-1 text-xs text-gray-500">
                  {t('currency_transfer_message_agent_with', { agent: messageTarget.agentName })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={closeMessageModal}
              disabled={messageSending}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSendAgentMessage} className="space-y-4 px-6 py-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('message')}
              </label>
              <textarea
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('currency_transfer_message_agent_placeholder')}
                disabled={messageSending}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeMessageModal}
                disabled={messageSending}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={messageSending}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed"
              >
                {messageSending ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-b-transparent animate-spin" />
                    {t('sending')}
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {t('send')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
  );
};

export default CurrencyTransferPage;
