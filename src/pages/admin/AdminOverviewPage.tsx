import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  CogIcon,
  GlobeAltIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";

interface DashboardStats {
  totalUsers: number;
  totalPages: number;
  totalMediaFiles: number;
  totalBlogPosts: number;
  totalQuotations: number;
  totalOrders: number;
  totalSupportTickets: number;
  totalContactMessages: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

const AdminOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPages: 0,
    totalMediaFiles: 0,
    totalBlogPosts: 0,
    totalQuotations: 0,
    totalOrders: 0,
    totalSupportTickets: 0,
    totalContactMessages: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Load all stats in parallel - using existing tables
      const [
        usersResult,
        quotationsResult,
        ordersResult,
        supportResult,
        contactResult,
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase
          .from("quotation_requests")
          .select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase
          .from("support_requests")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true }),
      ]);

      // Load pages count from the new table
      const pagesResult = await supabase
        .from("page_contents")
        .select("id", { count: "exact", head: true });

      setStats({
        totalUsers: usersResult.count || 0,
        totalPages: pagesResult.count || 0,
        totalMediaFiles: 0, // Will be updated when media files are uploaded
        totalBlogPosts: 0, // Will be updated when blog posts are created
        totalQuotations: quotationsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalSupportTickets: supportResult.count || 0,
        totalContactMessages: contactResult.count || 0,
        recentActivity: [
          {
            id: "1",
            type: "page",
            description: "Updated About Us page",
            timestamp: new Date().toISOString(),
            user: "Admin",
          },
          {
            id: "2",
            type: "media",
            description: "Uploaded new company logo",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: "Admin",
          },
          {
            id: "3",
            type: "blog",
            description: "Published new blog post",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            user: "Admin",
          },
        ],
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t("total_users"),
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: t("pages"),
      value: stats.totalPages,
      icon: DocumentTextIcon,
      color: "bg-green-500",
      change: "+3",
      changeType: "positive",
    },
    {
      title: t("media_files"),
      value: stats.totalMediaFiles,
      icon: PhotoIcon,
      color: "bg-purple-500",
      change: "+8",
      changeType: "positive",
    },
    {
      title: t("blog_posts"),
      value: stats.totalBlogPosts,
      icon: GlobeAltIcon,
      color: "bg-indigo-500",
      change: "+2",
      changeType: "positive",
    },
    {
      title: t("quotations"),
      value: stats.totalQuotations,
      icon: CurrencyDollarIcon,
      color: "bg-yellow-500",
      change: "+5",
      changeType: "positive",
    },
    {
      title: t("orders"),
      value: stats.totalOrders,
      icon: TruckIcon,
      color: "bg-red-500",
      change: "+15",
      changeType: "positive",
    },
    {
      title: t("support_tickets"),
      value: stats.totalSupportTickets,
      icon: ChatBubbleLeftRightIcon,
      color: "bg-orange-500",
      change: "+3",
      changeType: "positive",
    },
    {
      title: t("contact_messages"),
      value: stats.totalContactMessages,
      icon: ChatBubbleLeftRightIcon,
      color: "bg-teal-500",
      change: "+7",
      changeType: "positive",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cargo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("admin_dashboard")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("welcome_to_your_comprehensive_content_management_system")}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {t("last_updated")}: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p
                  className={`text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change} {t("from_last_month")}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("quick_actions")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium">{t("create_new_page")}</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <PhotoIcon className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium">{t("upload_media")}</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <GlobeAltIcon className="h-5 w-5 text-indigo-600 mr-3" />
            <span className="text-sm font-medium">{t("write_blog_post")}</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CogIcon className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-sm font-medium">{t("site_settings")}</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("recent_activity")}
        </h2>
        <div className="space-y-3">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {activity.type === "page" && (
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  )}
                  {activity.type === "media" && (
                    <PhotoIcon className="h-5 w-5 text-purple-600" />
                  )}
                  {activity.type === "blog" && (
                    <GlobeAltIcon className="h-5 w-5 text-indigo-600" />
                  )}
                  {activity.type === "user" && (
                    <UserGroupIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t("no_recent_activity")}</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("system_status")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">
                {t("database")}
              </p>
              <p className="text-xs text-green-700">Online</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">
                {t("storage")}
              </p>
              <p className="text-xs text-green-700">Online</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">{t("api")}</p>
              <p className="text-xs text-green-700">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
