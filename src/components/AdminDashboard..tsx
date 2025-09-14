import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import {
  HomeIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import { useTranslation } from 'react-i18next';
import TranslationManagementPage from '../pages/admin/TranslationManagementPage';
import MigrationPage from '../pages/admin/MigrationPage';
import AdminContactPage from '../pages/admin/AdminContactPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSupportPage from '../pages/admin/AdminSupportPage';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('admin-overview');
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
        return <AdminOverviewPage />;
      case 'admin-users':
        return <AdminUsersPage />;
      case 'admin-translations':
        return <TranslationManagementPage />;
      case 'admin-migration':
        return <MigrationPage />;
      case 'admin-contact':
        return <AdminContactPage />;
      case 'admin-support':
        return <AdminSupportPage />;
      default:
        return <AdminOverviewPage />;
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
      id: "admin-users",
      name: t("users_management"),
      icon: UserGroupIcon,
      color: "text-green-600",
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
    {
      id: "admin-contact",
      name: t("contact"),
      icon: QuestionMarkCircleIcon,
      color: "text-indigo-600",
    },
    {
      id: "admin-support",
      name: t("support"),
      icon: ChatBubbleBottomCenterTextIcon,
      color: "text-indigo-600",
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