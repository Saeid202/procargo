import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  CogIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  onTabChange: (tab: string) => void;
  onToggleCollapse: () => void;
  sidebarItems: {
    id: string;
    name: string;
    icon: React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>>;
    color: string;
  }[];
  showUserProfile: boolean;
  showSettings?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  sidebarCollapsed,
  onTabChange,
  onToggleCollapse,
  sidebarItems,
  showUserProfile,
  showSettings = true
}) => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Check if current language is Persian/Farsi for RTL layout
  const currentLanguage = i18n.language;
  const isPersian = currentLanguage === 'fa' || currentLanguage === 'fa-IR';

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
    <div
      className={`bg-white shadow-lg transition-all duration-300 hidden md:block ${sidebarCollapsed ? "w-16" : "w-64"
        }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <Link to="/dashboard" className="flex items-center">
              {/* <div className="w-8 h-8 bg-cargo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div> */}
              <span className="ml-2 text-xl font-bold text-gray-900">
                {t("dashboard")}
              </span>
            </Link>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full h-10 flex items-center ${sidebarCollapsed ? "justify-center p-1" : "px-3"
                } rounded-lg transition-all duration-200 ${activeTab === item.id
                  ? "bg-cargo-50 text-cargo-700 border-r-2 border-cargo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              {isPersian ? (
                // RTL Layout for Persian/Farsi
                <>
                  <Icon
                    className={`h-5 w-5 ${activeTab === item.id ? item.color : "text-gray-400"
                      } ${!sidebarCollapsed ? "ml-3" : ""}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium text-right flex-1">{item.name}</span>
                  )}
                </>
              ) : (
                // LTR Layout for English
                <>
                  {!sidebarCollapsed && (
                    <span className="font-medium text-left flex-1">{item.name}</span>
                  )}
                  <Icon
                    className={`h-5 w-5 ${activeTab === item.id ? item.color : "text-gray-400"
                      } ${!sidebarCollapsed ? "mr-3" : ""}`}
                  />
                </>
              )}
            </button>
          );
        })}
      </nav>

      {
        showUserProfile && (
          <div className="px-4 pt-4 pb-4 border-t border-gray-200 bg-white block md:hidden">
            <div
              className={`flex ${sidebarCollapsed
                ? "flex-col items-center"
                : "items-center space-x-3"
                }`}
            >
              <button
                onClick={() => onTabChange("settings")}
                className="relative flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-cargo-600"
                title="Profile Settings"
              >
                <UserCircleIcon className="h-10 w-10 text-cargo-600" />
              </button>
              {sidebarCollapsed && (
                <div className="flex flex-col items-center mt-2">
                  <button
                    onClick={handleLogout}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                    title="Logout"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
              <div className={`${sidebarCollapsed ? "hidden" : ""} flex-1 min-w-0`}>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "No email"}
                </p>
              </div>
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-2 my-2">
                  {showSettings && <button
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Profile Settings"
                    onClick={() => onTabChange("settings")}
                  >
                    <CogIcon className="h-5 w-5" />
                  </button>}
                </div>
              )}
            </div>
          </div>
        )
      }

    </div>
  );
};

export default Sidebar;
