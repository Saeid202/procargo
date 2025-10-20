import React, { useMemo, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  EnvelopeOpenIcon,
  DocumentArrowUpIcon,
  BanknotesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNotifications } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";
import { MessagingService } from "../../services/messagingService";
import { RolesEnum } from "../../abstractions/enums/roles.enum";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

const iconByType = {
  message: EnvelopeOpenIcon,
  export: DocumentArrowUpIcon,
  currency: BanknotesIcon,
};

const badgeColors = {
  message: "bg-blue-100 text-blue-700",
  export: "bg-emerald-100 text-emerald-700",
  currency: "bg-amber-100 text-amber-700",
};

const formatRelativeTime = (locale: string, timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff = date.getTime() - Date.now();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const formatter = new Intl.RelativeTimeFormat(locale || "en", {
    numeric: "auto",
  });

  const absDiff = Math.abs(diff);

  if (absDiff < minute) {
    return formatter.format(Math.round(diff / 1000), "second");
  }
  if (absDiff < hour) {
    return formatter.format(Math.round(diff / minute), "minute");
  }
  if (absDiff < day) {
    return formatter.format(Math.round(diff / hour), "hour");
  }
  return formatter.format(Math.round(diff / day), "day");
};

const dispatchDashboardEvent = (tabId: string) => {
  window.dispatchEvent(
    new CustomEvent("procargo:navigate-dashboard-tab", {
      detail: { tabId },
    })
  );
};

const dispatchAgentOrdersEvent = (view: "orders" | "export" | "currency") => {
  window.dispatchEvent(
    new CustomEvent("procargo:agent-orders-view", {
      detail: { view },
    })
  );
};

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const sortedNotifications = useMemo(() => notifications, [notifications]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const closeDropdown = () => setOpen(false);

  const handleNotificationClick = async (
    id: string,
    type: "message" | "export" | "currency",
    metadata?: Record<string, unknown>
  ) => {
    markAsRead(id);
    closeDropdown();

    if (type === "message" && metadata?.threadId && typeof metadata.threadId === "string") {
      if (user?.role === RolesEnum.AGENT) {
        dispatchDashboardEvent("agent-messages");
      } else {
        dispatchDashboardEvent("messages");
      }
      try {
        await MessagingService.markThreadRead(metadata.threadId);
      } catch (error) {
        console.warn("Failed to mark thread read", error);
      }
      return;
    }

    if (type === "export") {
      dispatchDashboardEvent("agent-orders");
      dispatchAgentOrdersEvent("export");
      return;
    }

    if (type === "currency") {
      dispatchDashboardEvent("agent-orders");
      dispatchAgentOrdersEvent("currency");
    }
  };

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    removeNotification(id);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={clsx(
          "p-2 text-gray-500 hover:text-cargo-600 transition-colors relative rounded-full focus:outline-none focus:ring-2 focus:ring-cargo-500"
        )}
        aria-label={t("notifications_panel_title")}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-h-[420px] overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {t("notifications_panel_title")}
              </p>
              <p className="text-xs text-gray-500">
                {t("notifications_unread", { count: unreadCount })}
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-cargo-600 hover:text-cargo-700"
              >
                <CheckIcon className="h-4 w-4" />
                {t("notifications_mark_all")}
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
            {sortedNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                {t("notifications_empty")}
              </div>
            ) : (
              sortedNotifications.map((notification) => {
                const Icon = iconByType[notification.type];
                const badgeClass = badgeColors[notification.type];
                return (
                  <button
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(
                        notification.id,
                        notification.type,
                        notification.metadata
                      )
                    }
                    className={clsx(
                      "w-full px-4 py-3 text-left transition-colors flex gap-3 items-start",
                      notification.read ? "bg-white hover:bg-gray-50" : "bg-blue-50/60 hover:bg-blue-100/70"
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-flex items-center justify-center h-9 w-9 rounded-full",
                        badgeClass
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={clsx(
                            "text-sm font-semibold text-gray-900",
                            notification.read ? "text-gray-600" : "text-gray-900"
                          )}
                        >
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {notification.createdAt
                            ? formatRelativeTime(i18n.language, notification.createdAt)
                            : ""}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {notification.description}
                      </p>
                    </div>
                    <button
                      onClick={(event) => handleRemove(event, notification.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={t("notifications_dismiss")}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
