import React, { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import {
  HomeIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  PhotoIcon,
  PencilSquareIcon,
  CogIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import AdminOverviewPage from '../../pages/admin/AdminOverviewPage';
import { useTranslation } from 'react-i18next';
import TranslationManagementPage from '../../pages/admin/TranslationManagementPage';
import MigrationPage from '../../pages/admin/MigrationPage';
import AdminContactPage from '../../pages/admin/AdminContactPage';
import AdminUsersPage from '../../pages/admin/AdminUsersPage';
import AdminSupportPage from '../../pages/admin/AdminSupportPage';
import AdminAIPage from '../../pages/admin/AdminAIPage';
import AdminQuotationPage from '../../pages/admin/AdminQuotationPage';
import AdminOtherRequestPage from '../../pages/admin/AdminOtherRequestPage';
import AdminOrdersPage from '../../pages/admin/AdminOrdersPage';
import AdminPagesPage from '../../pages/admin/AdminPagesPage';
import AdminMediaPage from '../../pages/admin/AdminMediaPage';
import AdminBlogPage from '../../pages/admin/AdminBlogPage';
import AdminSiteSettingsPage from '../../pages/admin/AdminSiteSettingsPage';

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
      case 'admin-pages':
        return <AdminPagesPage />;
      case 'admin-media':
        return <AdminMediaPage />;
      case 'admin-blog':
        return <AdminBlogPage />;
      case 'admin-site-settings':
        return <AdminSiteSettingsPage />;
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
      case 'admin-ai':
        return <AdminAIPage />;
      case 'admin-quotations':
        return <AdminQuotationPage />;
      case 'admin-other-requests':
        return <AdminOtherRequestPage />;
      case 'admin-orders':
        return <AdminOrdersPage />;
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
    // {
    //   id: "admin-pages",
    //   name: t("pages"),
    //   icon: DocumentTextIcon,
    //   color: "text-blue-600",
    // },
    // {
    //   id: "admin-media",
    //   name: t("media_library"),
    //   icon: PhotoIcon,
    //   color: "text-purple-600",
    // },
    // {
    //   id: "admin-blog",
    //   name: t("blog_posts"),
    //   icon: PencilSquareIcon,
    //   color: "text-indigo-600",
    // },
    // {
    //   id: "admin-site-settings",
    //   name: t("site_settings"),
    //   icon: CogIcon,
    //   color: "text-gray-600",
    // },
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
    // {
    //   id: "admin-ai",
    //   name: t("ai_management"),
    //   icon: CogIcon,
    //   color: "text-purple-600",
    // },
    {
      id: "admin-quotations",
      name: t("quotation_management"),
      icon: DocumentTextIcon,
      color: "text-blue-600",
    },
    {
      id: "admin-other-requests",
      name: t("other_requests"),
      icon: QuestionMarkCircleIcon,
      color: "text-purple-600",
    },
    {
      id: "admin-orders",
      name: t("orders_management"),
      icon: TruckIcon,
      color: "text-green-600",
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