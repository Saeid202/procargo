import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { MessagingService, DirectMessageThread } from "../services/messagingService";
import { ExportRequest, ExportService } from "../services/exportService";
import {
  CurrencyTransferRequest,
  CurrencyTransferService,
} from "../services/currencyTransferService";
import { RolesEnum } from "../abstractions/enums/roles.enum";
import { useTranslation } from "react-i18next";

export type NotificationType = "message" | "export" | "currency";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  metadata?: Record<string, unknown>;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

const STORAGE_PREFIX = "procargo:notifications:v1";
const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

interface PersistedState {
  readMap: Record<string, string>;
  lastSeen: Partial<Record<NotificationType, string>>;
}

const defaultPersistedState: PersistedState = {
  readMap: {},
  lastSeen: {},
};

const parseDate = (value?: string | null) =>
  value ? new Date(value).getTime() : 0;

const sortByNewest = (a: AppNotification, b: AppNotification) =>
  parseDate(b.createdAt) - parseDate(a.createdAt);

const usePersistedState = (userId: string | null) => {
  const stateRef = useRef<PersistedState>(defaultPersistedState);

  const load = useCallback(() => {
    if (!userId) {
      stateRef.current = defaultPersistedState;
      return;
    }
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        stateRef.current = {
          readMap: parsed.readMap || {},
          lastSeen: parsed.lastSeen || {},
        };
      } else {
        stateRef.current = defaultPersistedState;
      }
    } catch (error) {
      console.warn("Failed to load notifications state", error);
      stateRef.current = defaultPersistedState;
    }
  }, [userId]);

  const save = useCallback(() => {
    if (!userId) {
      return;
    }
    try {
      localStorage.setItem(
        getStorageKey(userId),
        JSON.stringify(stateRef.current)
      );
    } catch (error) {
      console.warn("Failed to persist notifications state", error);
    }
  }, [userId]);

  return { stateRef, load, save };
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const userId = user?.id ?? null;
  const { stateRef, load: loadPersisted, save: savePersisted } =
    usePersistedState(userId);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [threads, setThreads] = useState<DirectMessageThread[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [currencyTransfers, setCurrencyTransfers] = useState<
    CurrencyTransferRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAgent = user?.role === RolesEnum.AGENT;

  const syncPersistedReadState = useCallback(
    (items: AppNotification[]) => {
      const readMap = stateRef.current.readMap || {};
      return items.map((item) => ({
        ...item,
        read: Boolean(readMap[item.id]),
      }));
    },
    [stateRef]
  );

  const computeMessageNotifications = useCallback(() => {
    if (!userId) {
      return [] as AppNotification[];
    }

    const notifications: AppNotification[] = [];

    threads.forEach((thread) => {
      const membership = thread.members.find((member) => member.user_id === userId);
      if (!membership || !thread.last_message_at) {
        return;
      }

      const lastMessageTime = parseDate(thread.last_message_at);
      const lastReadTime = parseDate(membership.last_read_at);
      if (lastMessageTime <= lastReadTime) {
        return;
      }

      const otherParticipants = thread.members
        .filter((member) => member.user_id !== userId)
        .map((member) => {
          const profile = member.profile;
          if (!profile) {
            return t("notifications_unknown_user");
          }
          if (profile.first_name || profile.last_name) {
            return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
          }
          if (profile.email) {
            return profile.email.split("@")[0];
          }
          return profile.id;
        })
        .filter((participant): participant is string => Boolean(participant));

      const counterpart =
        otherParticipants.length > 0
          ? otherParticipants.join(", ")
          : thread.title || t("notifications_conversation");

      const description =
        thread.last_message_preview ||
        t("notifications_new_message", "New message received");

      notifications.push({
        id: `message-${thread.id}-${thread.last_message_at}`,
        type: "message",
        title: counterpart,
        description,
        createdAt: thread.last_message_at,
        read: false,
        metadata: {
          threadId: thread.id,
        },
      });
    });

    return notifications;
  }, [threads, userId]);

  const computeExportNotifications = useCallback(() => {
    if (!isAgent) {
      return [] as AppNotification[];
    }
    const lastSeen = parseDate(stateRef.current.lastSeen["export"]);

    return exportRequests
      .filter((request) => parseDate(request.created_at) > lastSeen)
      .map((request) => ({
        id: `export-${request.id}-${request.created_at}`,
        type: "export" as const,
        title: request.company_name || t("notifications_export_new"),
        description: request.product_name
          ? t("notifications_export_product", {
              product: request.product_name,
            })
          : t("notifications_export_generic"),
        createdAt: request.created_at || new Date().toISOString(),
        read: false,
        metadata: {
          exportId: request.id,
          status: request.status,
        },
      }));
  }, [exportRequests, isAgent, stateRef]);

  const computeCurrencyNotifications = useCallback(() => {
    if (!isAgent) {
      return [] as AppNotification[];
    }
    const lastSeen = parseDate(stateRef.current.lastSeen["currency"]);

    return currencyTransfers
      .filter((transfer) => parseDate(transfer.created_at) > lastSeen)
      .map((transfer) => ({
        id: `currency-${transfer.id}-${transfer.created_at}`,
        type: "currency" as const,
        title: transfer.beneficiary_name || t("notifications_currency_new"),
        description: t("notifications_currency_amount", {
          amount: new Intl.NumberFormat(i18n.language).format(
            transfer.amount || 0
          ),
          from: transfer.from_currency,
          to: transfer.to_currency,
        }),
        createdAt: transfer.created_at || new Date().toISOString(),
        read: false,
        metadata: {
          transferId: transfer.id,
          status: transfer.status,
        },
      }));
  }, [currencyTransfers, isAgent, stateRef]);

  const rebuildNotifications = useCallback(() => {
    const next = [
      ...computeMessageNotifications(),
      ...computeExportNotifications(),
      ...computeCurrencyNotifications(),
    ];

    const deduped = new Map<string, AppNotification>();
    next.forEach((item) => {
      if (!deduped.has(item.id)) {
        deduped.set(item.id, item);
      }
    });

    const list = Array.from(deduped.values()).sort(sortByNewest);
    setNotifications(syncPersistedReadState(list));
  }, [
    computeCurrencyNotifications,
    computeExportNotifications,
    computeMessageNotifications,
    syncPersistedReadState,
  ]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      let persistChanged = false;
      const [threadRes, exportRes, currencyRes] = await Promise.all([
        MessagingService.fetchThreads(),
        isAgent ? ExportService.getAllExportRequests() : Promise.resolve({ exports: [] }),
        isAgent
          ? CurrencyTransferService.getAllTransfers()
          : Promise.resolve({ transfers: [] }),
      ]);

      if (threadRes.data) {
        setThreads(threadRes.data);
      }
      if (exportRes.exports) {
        setExportRequests(exportRes.exports);
        if (isAgent && !stateRef.current.lastSeen["export"]) {
          const latest = exportRes.exports
            .map((item) => parseDate(item.created_at))
            .reduce((max, value) => (value > max ? value : max), 0);
          if (latest > 0) {
            stateRef.current.lastSeen["export"] = new Date(latest).toISOString();
          } else {
            stateRef.current.lastSeen["export"] = new Date().toISOString();
          }
          persistChanged = true;
        }
      }
      if ("transfers" in currencyRes && currencyRes.transfers) {
        setCurrencyTransfers(currencyRes.transfers);
        if (isAgent && !stateRef.current.lastSeen["currency"]) {
          const latest = currencyRes.transfers
            .map((item) => parseDate(item.created_at))
            .reduce((max, value) => (value > max ? value : max), 0);
          if (latest > 0) {
            stateRef.current.lastSeen["currency"] = new Date(latest).toISOString();
          } else {
            stateRef.current.lastSeen["currency"] = new Date().toISOString();
          }
          persistChanged = true;
        }
      }
      if (persistChanged) {
        savePersisted();
      }
    } catch (error) {
      console.error("Failed to refresh notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAgent, savePersisted, stateRef, userId]);

  useEffect(() => {
    loadPersisted();
    setNotifications([]);
    if (!userId) {
      return;
    }

    refresh();
  }, [loadPersisted, refresh, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    rebuildNotifications();
  }, [currencyTransfers, exportRequests, rebuildNotifications, threads, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const unsubscribeThreads = MessagingService.subscribeToThreadListUpdates(() =>
      MessagingService.fetchThreads().then((res) => {
        if (res.data) {
          setThreads(res.data);
        }
      })
    );

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const message = payload.new as { thread_id: string; sender_id: string } | null;
          if (!message || message.sender_id === userId) {
            return;
          }
          MessagingService.fetchThreadById(message.thread_id).then((res) => {
            const thread = res.data;
            if (!thread) {
              return;
            }
            setThreads((prev) => {
              const filtered = prev.filter((item) => item.id !== thread.id);
              return [thread, ...filtered];
            });
          });
        }
      );

    if (isAgent) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "export_requests",
        },
        (payload) => {
          const request = payload.new as ExportRequest | null;
          if (!request) {
            return;
          }
          setExportRequests((prev) => {
            const exists = prev.find((item) => item.id === request.id);
            if (exists) {
              return prev
                .map((item) => (item.id === request.id ? { ...item, ...request } : item))
                .sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
            }
            return [request, ...prev].sort(
              (a, b) => parseDate(b.created_at) - parseDate(a.created_at)
            );
          });
        }
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "currency_transfer_requests",
        },
        (payload) => {
          const transfer = payload.new as CurrencyTransferRequest | null;
          if (!transfer) {
            return;
          }
          setCurrencyTransfers((prev) => {
            const exists = prev.find((item) => item.id === transfer.id);
            if (exists) {
              return prev
                .map((item) => (item.id === transfer.id ? { ...item, ...transfer } : item))
                .sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
            }
            return [transfer, ...prev].sort(
              (a, b) => parseDate(b.created_at) - parseDate(a.created_at)
            );
          });
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      unsubscribeThreads();
    };
  }, [isAgent, userId]);

  const markAsRead = useCallback(
    (id: string) => {
      if (!userId) {
        return;
      }
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );

      stateRef.current = {
        ...stateRef.current,
        readMap: {
          ...stateRef.current.readMap,
          [id]: new Date().toISOString(),
        },
      };
      savePersisted();
    },
    [savePersisted, stateRef, userId]
  );

  const markAllAsRead = useCallback(() => {
    if (!userId) {
      return;
    }
    const nowIso = new Date().toISOString();
    const nextReadMap = { ...stateRef.current.readMap };
    notifications.forEach((notification) => {
      nextReadMap[notification.id] = nowIso;
      if (notification.type === "export" || notification.type === "currency") {
        stateRef.current.lastSeen[notification.type] = nowIso;
      }
    });

    stateRef.current = {
      ...stateRef.current,
      readMap: nextReadMap,
    };
    savePersisted();
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, [notifications, savePersisted, stateRef, userId]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      removeNotification,
      refresh,
    }),
    [notifications, unreadCount, isLoading, markAsRead, markAllAsRead, removeNotification, refresh]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
