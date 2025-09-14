import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

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
  showSettings?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  sidebarCollapsed,
  onTabChange,
  onToggleCollapse,
  sidebarItems,
  showUserProfile,
  showSettings = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-auto">
      {/* Left Sidebar - Hidden on mobile */}
      <Sidebar
        showUserProfile={showUserProfile}
        showSettings={showSettings}
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        onTabChange={onTabChange}
        onToggleCollapse={onToggleCollapse}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col pb-[100px] md:pb-0" style={{maxWidth:"100vw"}}>
        {/* Top Header */}
        <Header activeTab={activeTab} />
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <MobileBottomNav
        showUserProfile={showUserProfile}
        showSettings={showSettings}
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};

export default DashboardLayout;
