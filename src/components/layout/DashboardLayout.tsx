import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
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
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  sidebarCollapsed,
  onTabChange,
  onToggleCollapse,
  sidebarItems,
  showUserProfile
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <Sidebar
        showUserProfile={showUserProfile}
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        onTabChange={onTabChange}
        onToggleCollapse={onToggleCollapse}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <Header activeTab={activeTab} />
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
