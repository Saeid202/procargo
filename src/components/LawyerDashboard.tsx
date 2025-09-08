import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import {
  CalculatorIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import LawyerOverviewPage from '../pages/lawyer-dashboard/LawyerOverviewPage';
import LawyerSettingPage from '../pages/lawyer-dashboard/LawyerSettingPage';
import LawyerCasesPage from '../pages/lawyer-dashboard/LawyerCasesPage';

const LawyerDashboard: React.FC = () => {
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
      case 'lawyer-overview':
        return <LawyerOverviewPage />;
      case 'lawyer-cases':
        return <LawyerCasesPage />;
      case 'lawyer-settings':
        return <LawyerSettingPage />;
      default:
        return <LawyerOverviewPage />;
    }
  };

  const sidebarItems = [
    {
      id: "lawyer-overview",
      name: "Overview",
      icon: HomeIcon,
      color: "text-cargo-600",
    },
    {
      id: "lawyer-cases",
      name: "Cases",
      icon: CalculatorIcon,
      color: "text-green-600",
    },
    {
      id: "lawyer-settings",
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

export default LawyerDashboard;