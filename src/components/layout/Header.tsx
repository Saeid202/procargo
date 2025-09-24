import React from 'react';
import { BellIcon, CogIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getTabDescription = () => {
    switch (activeTab) {
      case 'overview': return t("overview_description");
      case 'shipments': return t("shipments_description");
      case 'orders': return t("orders_description");
      case 'compliance': return t("compliance_description");
      case 'legal': return t("legal_description");
      case 'support': return t("support_description");
      case 'settings': return t("settings_description");
      case 'agent-orders': return t("agent_orders_description");
      case 'agent-logistics': return t("agent_logistics_description");
      case 'agent-settings': return t("agent_settings_description");
      case 'admin-translations': return t("admin_translations_descripton");
      case 'admin-migration': return t("admin_migration_description");
      case 'admin-users': return t("admin_users_description");
      case 'admin-support': return t("admin_support_description");
      case 'admin-documents': return t("admin_documents_description");
      default: return t("overview_description");
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return t("overview");
      case 'shipments': return t("shipments");
      case 'orders': return t("orders");
      case 'compliance': return t("compliance");
      case 'legal': return t("legal");
      case 'support': return t("support");
      case 'settings': return t("settings");
      case 'agent-orders': return t("agent_orders");
      case 'agent-logistics': return t("agent_logistics");
      case 'agent-settings': return t("agent_settings");
      case 'admin-translations': return t("admin_translations");
      case 'admin-migration': return t("admin_migration");
      case 'admin-users': return t("admin_users");
      case 'admin-support': return t("admin_support");
      default: return t("overview");
    }
  };

  const handleLogout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 m-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-cargo-600 via-cargo-500 to-cargo-300 bg-clip-text text-transparent [-webkit-background-clip:text] capitalize">
            {getTabTitle()}
          </h1>

          <p className="text-gray-900 text-sm font-medium">{getTabDescription()}</p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500 relative">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
            title="Logout"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
