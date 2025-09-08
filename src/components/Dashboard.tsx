import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import OverviewPage from '../pages/dashboard/OverviewPage';
import OrdersPage from '../pages/dashboard/OrdersPage';
import ShipmentsPage from '../pages/dashboard/ShipmentsPage';
import CompliancePage from '../pages/dashboard/CompliancePage';
import LegalAssistancePage from '../pages/dashboard/LegalAssistancePage';
import SupportPage from '../pages/dashboard/SupportPage';
import SettingsPage from '../pages/account/SettingsPage';
import {
  HomeIcon,
  CalculatorIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import LegalIssuePage from '../pages/dashboard/LegalIssuePage';

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
      case 'legal-issue':
        return <LegalIssuePage />;
      case 'support':
        return <SupportPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  const sidebarItems = [
    {
      id: "overview",
      name: "Overview",
      icon: HomeIcon,
      color: "text-cargo-600",
    },
    {
      id: "orders",
      name: "Orders",
      icon: CalculatorIcon,
      color: "text-green-600",
    },
    {
      id: "shipments",
      name: "Shipments",
      icon: TruckIcon,
      color: "text-blue-600",
    },
    {
      id: "compliance",
      name: "Compliance",
      icon: ClipboardDocumentListIcon,
      color: "text-orange-600",
    },
    {
      id: "legal",
      name: "Legal Assistance",
      icon: CreditCardIcon,
      color: "text-red-600",
    },
    {
      id: "legal-issue",
      name: "Legal Issue",
      icon: ExclamationTriangleIcon,
      color: "text-purple-600",
    },
    {
      id: "support",
      name: "Support",
      icon: QuestionMarkCircleIcon,
      color: "text-indigo-600",
    },
  ];

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
