import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import OverviewPage from "../../pages/dashboard/OverviewPage";
import OrdersPage from "../../pages/dashboard/OrdersPage";
import ShipmentsPage from "../../pages/dashboard/ShipmentsPage";
import CompliancePage from "../../pages/dashboard/CompliancePage";
import LegalAssistancePage from "../../pages/dashboard/LegalAssistancePage";
import SupportPage from "../../pages/dashboard/SupportPage";
import SettingsPage from "../../pages/account/SettingsPage";
import ExportPage from "../../pages/dashboard/ExportPage";
import {
  HomeIcon,
  ShoppingCartIcon,
  ArrowUpTrayIcon,
  TruckIcon,
  DocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ScaleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import LegalIssuePage from "../../pages/dashboard/LegalIssuePage";
import CompanyVerificationPage from "../../pages/dashboard/CompanyVerificationPage";
import LegalServicesPage from "../../pages/dashboard/LegalServicesPage";
import CurrencyTransferPage from "../../pages/dashboard/CurrencyTransferPage";
import MessagesPage from "../../pages/dashboard/MessagesPage";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

type DashboardRouteDefinition = {
  id: string;
  path: string;
  fullPath: string;
  element: React.ReactElement;
};

const DASHBOARD_BASE_PATH = "/dashboard";

const DASHBOARD_ROUTES: DashboardRouteDefinition[] = [
  {
    id: "overview",
    path: "overview",
    fullPath: `${DASHBOARD_BASE_PATH}/overview`,
    element: <OverviewPage />,
  },
  {
    id: "orders",
    path: "orders",
    fullPath: `${DASHBOARD_BASE_PATH}/orders`,
    element: <OrdersPage />,
  },
  {
    id: "export",
    path: "export",
    fullPath: `${DASHBOARD_BASE_PATH}/export`,
    element: <ExportPage />,
  },
  {
    id: "shipments",
    path: "shipments",
    fullPath: `${DASHBOARD_BASE_PATH}/shipments`,
    element: <ShipmentsPage />,
  },
  {
    id: "compliance",
    path: "compliance",
    fullPath: `${DASHBOARD_BASE_PATH}/compliance`,
    element: <CompliancePage />,
  },
  {
    id: "legal",
    path: "legal",
    fullPath: `${DASHBOARD_BASE_PATH}/legal`,
    element: <LegalAssistancePage />,
  },
  {
    id: "legal-issue",
    path: "legal-issue",
    fullPath: `${DASHBOARD_BASE_PATH}/legal-issue`,
    element: <LegalIssuePage />,
  },
  {
    id: "legal-services",
    path: "legal-services",
    fullPath: `${DASHBOARD_BASE_PATH}/legal-services`,
    element: <LegalServicesPage />,
  },
  {
    id: "company-verification",
    path: "company-verification",
    fullPath: `${DASHBOARD_BASE_PATH}/company-verification`,
    element: <CompanyVerificationPage />,
  },
  {
    id: "currency-transfer",
    path: "currency-transfer",
    fullPath: `${DASHBOARD_BASE_PATH}/currency-transfer`,
    element: <CurrencyTransferPage />,
  },
  {
    id: "support",
    path: "support",
    fullPath: `${DASHBOARD_BASE_PATH}/support`,
    element: <SupportPage />,
  },
  {
    id: "messages",
    path: "messages",
    fullPath: `${DASHBOARD_BASE_PATH}/messages`,
    element: <MessagesPage />,
  },
  {
    id: "profile",
    path: "profile",
    fullPath: `${DASHBOARD_BASE_PATH}/profile`,
    element: <SettingsPage />,
  },
  {
    id: "settings",
    path: "settings",
    fullPath: `${DASHBOARD_BASE_PATH}/settings`,
    element: <SettingsPage />,
  },
];

const ROUTE_INDEX = DASHBOARD_ROUTES.reduce<Record<string, DashboardRouteDefinition>>(
  (acc, route) => {
    acc[route.id] = route;
    return acc;
  },
  {}
);

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isPersian = currentLanguage === "fa" || currentLanguage === "fa-IR";
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    const normalizedPath =
      location.pathname.replace(/\/+$/, "") || `${DASHBOARD_BASE_PATH}/overview`;

    const matchedRoute = [...DASHBOARD_ROUTES]
      .sort((a, b) => b.fullPath.length - a.fullPath.length)
      .find((route) => {
        if (route.fullPath === `${DASHBOARD_BASE_PATH}/overview`) {
          return (
            normalizedPath === route.fullPath ||
            normalizedPath === DASHBOARD_BASE_PATH
          );
        }
        return (
          normalizedPath === route.fullPath ||
          normalizedPath.startsWith(`${route.fullPath}/`)
        );
      });

    return matchedRoute?.id ?? "overview";
  }, [location.pathname]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const target = ROUTE_INDEX[tab];
      if (!target) {
        console.warn("No dashboard route registered for tab:", tab);
        return;
      }
      navigate(target.fullPath, { replace: false });
    },
    [navigate]
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ tabId?: string }>;
      const tabId = customEvent.detail?.tabId;
      if (!tabId) {
        return;
      }
      const target = ROUTE_INDEX[tabId];
      if (!target) {
        return;
      }
      navigate(target.fullPath, { replace: false });
    };

    window.addEventListener(
      "procargo:navigate-dashboard-tab",
      handler as EventListener
    );
    return () => {
      window.removeEventListener(
        "procargo:navigate-dashboard-tab",
        handler as EventListener
      );
    };
  }, [navigate]);

  // Sidebar collapse handler
  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Base sidebar items for all languages
  const baseSidebarItems = [
    {
      id: "overview",
      name: t("overview"),
      icon: HomeIcon,
      color: "text-blue-600",
    },
    {
      id: "orders",
      name: t("orders"),
      icon: ShoppingCartIcon,
      color: "text-green-600",
    },
    {
      id: "compliance",
      name: t("compliance"),
      icon: DocumentCheckIcon,
      color: "text-orange-600",
    },
    {
      id: "legal",
      name: t("legal_assistance"),
      icon: ChatBubbleLeftRightIcon,
      color: "text-purple-600",
    },
    {
      id: "legal-issue",
      name: t("legal_issue"),
      icon: ScaleIcon,
      color: "text-red-600",
    },
  ];

  // Profile item (only for Persian)
  const profileItem = {
    id: "profile",
    name: "پروفایل",
    icon: HomeIcon,
    color: "text-cyan-600",
  };

  // Export item (only for Persian)
  const exportItem = {
    id: "export",
    name: t("export"),
    icon: ArrowUpTrayIcon,
    color: "text-emerald-600",
  };

  // Legal services main item (only for Persian)
  const legalServicesMainItem = {
    id: "legal-services",
    name: "خدمات حقوقی و الزامات قوانین و مقررات گمرک",
    icon: ScaleIcon,
    color: "text-indigo-600",
  };

  // Legal services section (only for Persian)
  const legalServicesItems = [
    {
      id: "compliance",
      name: t("compliance"),
      icon: DocumentCheckIcon,
      color: "text-orange-600",
    },
    {
      id: "legal",
      name: t("legal_assistance"),
      icon: ChatBubbleLeftRightIcon,
      color: "text-purple-600",
    },
    {
      id: "legal-issue",
      name: t("legal_issue"),
      icon: ScaleIcon,
      color: "text-red-600",
    },
    {
      id: "company-verification",
      name: "اعتبار سنجی شرکت‌های چینی",
      icon: DocumentCheckIcon,
      color: "text-teal-600",
    },
    {
      id: "currency-transfer",
      name: "نقل و انتقال ارز",
      icon: DocumentCheckIcon,
      color: "text-amber-600",
    },
  ];

  // Rest of sidebar items
  const restSidebarItems = [
    {
      id: "shipments",
      name: t("shipments"),
      icon: TruckIcon,
      color: "text-indigo-600",
    },
    {
      id: "messages",
      name: t("messages"),
      icon: ChatBubbleOvalLeftEllipsisIcon,
      color: "text-blue-600",
    },
    {
      id: "support",
      name: t("support"),
      icon: QuestionMarkCircleIcon,
      color: "text-gray-600",
    },
  ];

  // Combine items based on language
  const sidebarItems = isPersian
    ? [
        baseSidebarItems[0],
        profileItem,
        baseSidebarItems[1],
        exportItem,
        ...restSidebarItems.slice(0, 1),
        legalServicesMainItem,
        ...legalServicesItems,
        ...restSidebarItems.slice(1),
      ]
    : [...baseSidebarItems, ...restSidebarItems];

  return (
    <DashboardLayout
      showUserProfile
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      sidebarCollapsed={sidebarCollapsed}
      onTabChange={handleTabChange}
      onToggleCollapse={handleToggleCollapse}
    >
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        {DASHBOARD_ROUTES.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={route.element}
          />
        ))}
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
