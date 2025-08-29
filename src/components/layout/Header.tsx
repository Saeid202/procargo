import React from 'react';
import { BellIcon, CogIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const getTabDescription = () => {
    switch (activeTab) {
      case 'overview': return "Welcome back! Here's what's happening with your shipments.";
      case 'shipments': return "Manage and track all your cargo shipments.";
      case 'orders': return "Track order history, manage status updates, and monitor cargo shipments from China to Canada.";
      case 'compliance': return "Manage regulatory compliance, customs documentation, and shipping requirements.";
      case 'legal': return "Access legal assistance and regulatory guidance for international shipping.";
      case 'support': return "Get help and submit support tickets.";
      case 'settings': return "Manage your account settings and preferences.";
      default: return "Welcome to CargoBridge dashboard.";
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>
          <p className="text-gray-600">{getTabDescription()}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500 relative">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <CogIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
