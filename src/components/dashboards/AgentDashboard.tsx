import React, { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import {
  CalculatorIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import AgentOverviewPage from '../../pages/agent-dashboard/AgentOverviewPage';
import AgentOrdersPage from '../../pages/agent-dashboard/AgentOrdersPage';
import AgentLogisticsPage from '../../pages/agent-dashboard/AgentLogisticsPage';
import AgentSettingPage from '../../pages/agent-dashboard/AgentSettingPage';
import { useTranslation } from 'react-i18next';

const AgentDashboard: React.FC = () => {
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
      case 'agent-overview':
        return <AgentOverviewPage />;
      case 'agent-orders':
        return <AgentOrdersPage />;
      case 'agent-logistics':
        return <AgentLogisticsPage />;
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
      id: "agent-logistics",
      name: t("logistics"),
      icon: TruckIcon,
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
