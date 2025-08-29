import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import OverviewPage from '../pages/dashboard/OverviewPage';
import OrdersPage from '../pages/dashboard/OrdersPage';
import ShipmentsPage from '../pages/dashboard/ShipmentsPage';
import CompliancePage from '../pages/dashboard/CompliancePage';
import LegalAssistancePage from '../pages/dashboard/LegalAssistancePage';
import SupportPage from '../pages/dashboard/SupportPage';
import SettingsPage from '../pages/account/SettingsPage';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
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
      case 'overview':
        return <OverviewPage />;
      case 'orders':
        return <OrdersPage />;
      case 'shipments':
        return <ShipmentsPage />;
      case 'compliance':
        return <CompliancePage />;
      case 'legal':
        return <LegalAssistancePage />;
      case 'support':
        return <SupportPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <DashboardLayout
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
