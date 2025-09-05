import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import OverviewPage from '../pages/dashboard/OverviewPage';
import OrdersPage from '../pages/dashboard/OrdersPage';
import ShipmentsPage from '../pages/dashboard/ShipmentsPage';
import CompliancePage from '../pages/dashboard/CompliancePage';
import {
  CalculatorIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import AgentOverviewPage from '../pages/agent-dashboard/AgentOverviewPage';
import AgentOrdersPage from '../pages/agent-dashboard/AgentOrdersPage';
import AgentLogisticsPage from '../pages/agent-dashboard/AgentLogisticsPage';
import AgentSettingPage from '../pages/agent-dashboard/AgentSettingPage';

const AgentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agent-overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      name: "Overview",
      icon: HomeIcon,
      color: "text-cargo-600",
    },
    {
      id: "agent-orders",
      name: "Orders",
      icon: CalculatorIcon,
      color: "text-green-600",
    },
    {
      id: "agent-logistics",
      name: "Logistics",
      icon: TruckIcon,
      color: "text-blue-600",
    },
    {
      id: "agent-settings",
      name: "Settings",
      icon: ClipboardDocumentListIcon,
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout
      showUserProfile={false}
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
