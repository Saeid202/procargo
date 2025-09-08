import React from 'react';
import { useTranslation } from 'react-i18next';

const SupportPage: React.FC = () => {

  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Support Page Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("support")}</h2>
        <p className="text-gray-600">{t("support_page_content_will_be_added_here")}</p>
      </div>
    </div>
  );
};

export default SupportPage;
