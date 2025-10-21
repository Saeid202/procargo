import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import {
  CalculatorIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import LawyerOverviewPage from "../../pages/lawyer-dashboard/LawyerOverviewPage";
import LawyerSettingPage from "../../pages/lawyer-dashboard/LawyerSettingPage";
import LawyerCasesPage from "../../pages/lawyer-dashboard/LawyerCasesPage";
import { useTranslation } from "react-i18next";
import MessagesPage from "../../pages/dashboard/MessagesPage";

const LawyerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("lawyer-overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { t } = useTranslation();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ tabId?: string }>;
      const tabId = customEvent.detail?.tabId;
      if (!tabId) {
        return;
      }
      setActiveTab(tabId);
    };

    window.addEventListener(
      "procargo:navigate-dashboard-tab",
      handler as EventListener
    );
    return () => {
      window.removeEventListener(
        "procargo:navigate-dashboard-tab",
        handler as EventListener
      );
    };
  }, []);

  const renderPageContent = () => {
    switch (activeTab) {
      case "lawyer-overview":
        return <LawyerOverviewPage />;
      case "lawyer-cases":
        return <LawyerCasesPage />;
      case "lawyer-messages":
        return <MessagesPage />;
      case "lawyer-settings":
        return <LawyerSettingPage />;
      default:
        return <LawyerOverviewPage />;
    }
  };

  const sidebarItems = [
    {
      id: "lawyer-overview",
      name: t("overview"),
      icon: HomeIcon,
      color: "text-cargo-600",
    },
    {
      id: "lawyer-cases",
      name: t("cases"),
      icon: CalculatorIcon,
      color: "text-green-600",
    },
    {
      id: "lawyer-messages",
      name: t("messages"),
      icon: ChatBubbleOvalLeftEllipsisIcon,
      color: "text-blue-600",
    },
    {
      id: "lawyer-settings",
      name: t("settings"),
      icon: ClipboardDocumentListIcon,
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout
      showUserProfile
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

export default LawyerDashboard;

