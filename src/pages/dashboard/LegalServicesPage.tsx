import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon,
  BuildingOfficeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LegalServicesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isPersian = currentLanguage === 'fa' || currentLanguage === 'fa-IR';

  // Only show for Persian language
  if (!isPersian) {
    return null;
  }

  const legalServices = [
    {
      id: 'compliance',
      title: 'الزامات قوانین و مقررات گمرک',
      description: 'مدیریت منطبق با قوانین، مدارک گمرک و مقررات حمل و نقل',
      icon: DocumentCheckIcon,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      iconColor: 'text-orange-600'
    },
    {
      id: 'legal',
      title: 'چت بات حقوقی هوش مصنوعی',
      description: 'دسترسی به کمک در قانون و راهنمای مقررات حمل و نقل بین‌المللی',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      iconColor: 'text-purple-600'
    },
    {
      id: 'legal-issue',
      title: 'ارتباط با وکیل چین، ثبت پرونده حقوقی',
      description: 'ارتباط مستقیم با وکلای متخصص در چین برای حل مسائل حقوقی',
      icon: ScaleIcon,
      color: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-600'
    },
    {
      id: 'company-verification',
      title: 'اعتبار سنجی شرکت‌های چینی',
      description: 'تأیید اعتبار و صلاحیت شرکت‌های چینی برای همکاری تجاری',
      icon: BuildingOfficeIcon,
      color: 'bg-teal-50 border-teal-200 text-teal-800',
      iconColor: 'text-teal-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              خدمات حقوقی و الزامات قوانین و مقررات گمرک
            </h1>
            <p className="text-gray-600 text-lg">
              مجموعه کاملی از خدمات حقوقی و مشاوره برای تجارت بین‌المللی
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              خدمات حقوقی ما
            </h2>
            <p className="text-blue-800 leading-relaxed">
              ما مجموعه کاملی از خدمات حقوقی و مشاوره را برای تجارت بین‌المللی ارائه می‌دهیم. 
              از الزامات قوانین و مقررات گمرک گرفته تا ارتباط مستقیم با وکلای متخصص در چین، 
              ما در تمام مراحل تجاری در کنار شما هستیم.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {legalServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className={`${service.color} rounded-lg p-6 border-2 hover:shadow-lg transition-shadow cursor-pointer`}
                  onClick={() => {
                    // Navigate to the specific service
                    window.location.hash = `#${service.id}`;
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${service.iconColor} p-3 rounded-lg bg-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center text-sm font-medium">
                        <span>مشاهده جزئیات</span>
                        <ArrowRightIcon className="w-4 h-4 mr-2" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              چرا خدمات حقوقی ما را انتخاب کنید؟
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <DocumentCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">تخصص حقوقی</h4>
                <p className="text-sm text-gray-600">تیم متخصص در قوانین تجارت بین‌المللی</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">پشتیبانی ۲۴/۷</h4>
                <p className="text-sm text-gray-600">دسترسی دائمی به مشاوره حقوقی</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <ScaleIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">شبکه وکلای چین</h4>
                <p className="text-sm text-gray-600">ارتباط مستقیم با وکلای متخصص در چین</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalServicesPage;
