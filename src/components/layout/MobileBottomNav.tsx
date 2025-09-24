import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  CogIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
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

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  sidebarItems,
  showUserProfile,
  showSettings = true
}) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const mainNavItems = sidebarItems.filter(item =>
    item.id !== "settings" && item.id !== "profile"
  );

  const primaryNavItems = mainNavItems.slice(0, 4);
  const overflowNavItems = mainNavItems.slice(4);

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    setShowOverflowMenu(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-pb">
        <div className={`flex items-center py-2 px-2 ${overflowNavItems.length > 0 ? 'justify-around' : 'justify-evenly'}`}>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 touch-manipulation ${activeTab === item.id
                    ? "text-cargo-600"
                    : "text-gray-500 active:text-gray-700"
                  }`}
              >
                <Icon
                  className={`h-6 w-6 mb-1 ${activeTab === item.id ? item.color : "text-gray-400"
                    }`}
                />
                <span className="text-xs font-medium truncate max-w-full">
                  {item.name}
                </span>
              </button>
            );
          })}

          {overflowNavItems.length > 0 && (
            <button
              onClick={() => setShowOverflowMenu(!showOverflowMenu)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 touch-manipulation ${showOverflowMenu
                  ? "text-cargo-600"
                  : "text-gray-500 active:text-gray-700"
                }`}
            >
              <EllipsisHorizontalIcon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">More</span>
            </button>
          )}

        </div>

        {showUserProfile && (
          <div className="flex items-center justify-center space-x-4 py-2 px-4 border-t border-gray-100">
            {showSettings && (
              <button
                onClick={() => handleItemClick("settings")}
                className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 touch-manipulation ${activeTab === "settings"
                    ? "text-cargo-600 bg-cargo-50"
                    : "text-gray-500 active:text-gray-700 active:bg-gray-50"
                  }`}
              >
                <CogIcon className="h-5 w-5" />
              </button>
            )}

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="truncate max-w-32">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split("@")[0] || "User"}
              </span>
            </div>


          </div>
        )}

        {showOverflowMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setShowOverflowMenu(false)}>
            <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">More Options</h3>
                  <button
                    onClick={() => setShowOverflowMenu(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-2">
                  {overflowNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 touch-manipulation ${activeTab === item.id
                            ? "bg-cargo-50 text-cargo-700"
                            : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${activeTab === item.id ? item.color : "text-gray-400"
                            }`}
                        />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileBottomNav;