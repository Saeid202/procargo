import React, { useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import OverviewPage from "../../pages/dashboard/OverviewPage";
import OrdersPage from "../../pages/dashboard/OrdersPage";
import ShipmentsPage from "../../pages/dashboard/ShipmentsPage";
import CompliancePage from "../../pages/dashboard/CompliancePage";
import LegalAssistancePage from "../../pages/dashboard/LegalAssistancePage";
import SupportPage from "../../pages/dashboard/SupportPage";
import SettingsPage from "../../pages/account/SettingsPage";
import ExportPage from "../../pages/dashboard/ExportPage";
import {
  HomeIcon,
  ShoppingCartIcon,
  ArrowUpTrayIcon,
  TruckIcon,
  DocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import LegalIssuePage from "../../pages/dashboard/LegalIssuePage";
import CompanyVerificationPage from "../../pages/dashboard/CompanyVerificationPage";
import LegalServicesPage from "../../pages/dashboard/LegalServicesPage";
import CurrencyTransferPage from "../../pages/dashboard/CurrencyTransferPage";
import { useTranslation } from "react-i18next";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isPersian = currentLanguage === "fa" || currentLanguage === "fa-IR";

  // Tab change handler
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Sidebar collapse handler
  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Render the appropriate page content based on active tab
  const renderPageContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPage />;
      case "profile":
        return <SettingsPage />;
      case "orders":
        return <OrdersPage />;
      case "export":
        return <ExportPage />;
      case "shipments":
        return <ShipmentsPage />;
      case "compliance":
        return <CompliancePage />;
      case "legal":
        return <LegalAssistancePage />;
      case "legal-issue":
        return <LegalIssuePage />;
      case "company-verification":
        return <CompanyVerificationPage />;
      case "currency-transfer":
        return <CurrencyTransferPage />;
      case "legal-services":
        return <LegalServicesPage />;
      case "support":
        return <SupportPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  // Base sidebar items for all languages
  const baseSidebarItems = [
    {
      id: "overview",
      name: t("overview"),
      icon: HomeIcon,
      color: "text-blue-600",
    },
    {
      id: "orders",
      name: t("orders"),
      icon: ShoppingCartIcon,
      color: "text-green-600",
    },
  ];

  // Profile item (only for Persian)
  const profileItem = {
    id: "profile",
    name: "پروفایل",
    icon: HomeIcon,
    color: "text-cyan-600",
  };

  // Export item (only for Persian)
  const exportItem = {
    id: "export",
    name: t("export"),
    icon: ArrowUpTrayIcon,
    color: "text-emerald-600",
  };

  // Legal services main item (only for Persian)
  const legalServicesMainItem = {
    id: "legal-services",
    name: "خدمات حقوقی و الزامات قوانین و مقررات گمرک",
    icon: ScaleIcon,
    color: "text-indigo-600",
  };

  // Legal services section (only for Persian)
  const legalServicesItems = [
    {
      id: "compliance",
      name: t("compliance"),
      icon: DocumentCheckIcon,
      color: "text-orange-600",
    },
    {
      id: "legal",
      name: t("legal_assistance"),
      icon: ChatBubbleLeftRightIcon,
      color: "text-purple-600",
    },
    {
      id: "legal-issue",
      name: t("legal_issue"),
      icon: ScaleIcon,
      color: "text-red-600",
    },
    {
      id: "company-verification",
      name: "اعتبار سنجی شرکت‌های چینی",
      icon: DocumentCheckIcon,
      color: "text-teal-600",
    },
    {
      id: "currency-transfer",
      name: "نقل و انتقال ارز",
      icon: DocumentCheckIcon,
      color: "text-amber-600",
    },
  ];

  // Rest of sidebar items
  const restSidebarItems = [
    {
      id: "shipments",
      name: t("shipments"),
      icon: TruckIcon,
      color: "text-indigo-600",
    },
    {
      id: "support",
      name: t("support"),
      icon: QuestionMarkCircleIcon,
      color: "text-gray-600",
    },
    {
      id: "compliance",
      name: t("compliance"),
      icon: QuestionMarkCircleIcon,
      color: "text-gray-600",
    },
    {
      id: "legal",
      name: t("legal_assistance"),
      icon: QuestionMarkCircleIcon,
      color: "text-gray-600",
    },
    {
      id: "legal-issue",
      name: t("legal"),
      icon: QuestionMarkCircleIcon,
      color: "text-gray-600",
    },
  ];

  // Combine items based on language
  const sidebarItems = isPersian
    ? [
        baseSidebarItems[0],
        profileItem,
        baseSidebarItems[1],
        exportItem,
        ...restSidebarItems.slice(0, 1),
        legalServicesMainItem,
        ...legalServicesItems,
        ...restSidebarItems.slice(1),
      ]
    : [...baseSidebarItems, ...restSidebarItems];

  return (
    <DashboardLayout
      showUserProfile
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

export default Dashboard;
