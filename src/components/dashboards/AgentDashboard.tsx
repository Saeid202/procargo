import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import {
  CalculatorIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
  HomeIcon,
  TruckIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import AgentOverviewPage from '../../pages/agent-dashboard/AgentOverviewPage';
import AgentOrdersPage from '../../pages/agent-dashboard/AgentOrdersPage';
import AgentExportPage from '../../pages/agent-dashboard/AgentExportPage';
import AgentCurrencyPage from '../../pages/agent-dashboard/AgentCurrencyPage';
import AgentLogisticsPage from '../../pages/agent-dashboard/AgentLogisticsPage';
import AgentSettingPage from '../../pages/agent-dashboard/AgentSettingPage';
import MessagesPage from '../../pages/dashboard/MessagesPage';
import { useTranslation } from 'react-i18next';

const AgentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agent-overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { t } = useTranslation();

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderPageContent = () => {
    switch (activeTab) {
      case 'agent-overview':
        return <AgentOverviewPage />;
      case 'agent-orders':
        return <AgentOrdersPage />;
      case 'agent-exports':
        return <AgentExportPage />;
      case 'agent-currency':
        return <AgentCurrencyPage />;
      case 'agent-logistics':
        return <AgentLogisticsPage />;
      case 'agent-messages':
        return <MessagesPage />;
      case 'agent-settings':
        return <AgentSettingPage />;
      default:
        return <AgentOverviewPage />;
    }
  };

  const sidebarItems = [
    {
      id: "agent-overview",
      name: t("overview"),
      icon: HomeIcon,
      color: "text-cargo-600",
    },
    {
      id: "agent-orders",
      name: t("orders"),
      icon: CalculatorIcon,
      color: "text-green-600",
    },
    {
      id: "agent-exports",
      name: t("export"),
      icon: DocumentArrowUpIcon,
      color: "text-blue-600",
    },
    {
      id: "agent-currency",
      name: t("currency_transfer"),
      icon: CurrencyDollarIcon,
      color: "text-amber-600",
    },
    {
      id: "agent-logistics",
      name: t("logistics"),
      icon: TruckIcon,
      color: "text-blue-600",
    },
    {
      id: "agent-messages",
      name: t("messages"),
      icon: ChatBubbleOvalLeftEllipsisIcon,
      color: "text-blue-600",
    },
    {
      id: "agent-settings",
      name: t("settings"),
      icon: ClipboardDocumentListIcon,
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

export default AgentDashboard;
