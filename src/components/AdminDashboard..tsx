import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import {
  HomeIcon,
  GlobeAltIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import LawyerOverviewPage from '../pages/lawyer-dashboard/LawyerOverviewPage';
import { useTranslation } from 'react-i18next';
import TranslationManagementPage from '../pages/admin/TranslationManagementPage';
import MigrationPage from '../pages/admin/MigrationPage';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agent-overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { t } = useTranslation();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderPageContent = () => {
    switch (activeTab) {
      case 'admin-overview':
        return <LawyerOverviewPage />;
      case 'admin-translations':
        return <TranslationManagementPage />;
      case 'admin-migration':
        return <MigrationPage />;
      default:
        return <LawyerOverviewPage />;
    }
  };

  const sidebarItems = [
    {
      id: "admin-overview",
      name: t("overview"),
      icon: HomeIcon,
      color: "text-cargo-600",
    },
    {
      id: "admin-translations",
      name: t("translations"),
      icon: GlobeAltIcon,
      color: "text-green-600",
    },
    {
      id: "admin-migration",
      name: t("migration"),
      icon: ArrowPathIcon,
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout
      showUserProfile={true}
      showSettings={false}
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      sidebarCollapsed={sidebarCollapsed}
      onTabChange={handleTabChange}
      onToggleCollapse={handleToggleCollapse}
    >
      {renderPageContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;