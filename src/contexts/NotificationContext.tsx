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
import { CaseData, CaseResponse, SupabaseService } from "../services/supabaseService";

export type NotificationType = "message" | "export" | "currency" | "order" | "case";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  metadata?: Record<string, unknown>;
}

type AgentOrder = {
  id: string;
  order_number: string;
  created_at: string | null;
  status?: string | null;
  priority?: string | null;
  origin_country?: string | null;
  destination_country?: string | null;
  total_value?: number | null;
  currency?: string | null;
};

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
  lastSeen: Partial<Record<string, string>>;
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
  const [cases, setCases] = useState<CaseData[]>([]);
  const [caseResponses, setCaseResponses] = useState<CaseResponse[]>([]);
  const [orders, setOrders] = useState<AgentOrder[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [currencyTransfers, setCurrencyTransfers] = useState<
    CurrencyTransferRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAgent = user?.role === RolesEnum.AGENT;
  const isLawyer = user?.role === RolesEnum.LAWYER;
  const isUser = user?.role === RolesEnum.USER;
  const caseIdsRef = useRef<Set<string>>(new Set());

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

  const computeOrderNotifications = useCallback(() => {
    if (!isAgent) {
      return [] as AppNotification[];
    }

    const lastSeen = parseDate(stateRef.current.lastSeen["order"]);

    return orders
      .filter((order) => parseDate(order.created_at) > lastSeen)
      .map((order) => {
        const origin =
          order.origin_country || t("notifications_order_unknown_location");
        const destination =
          order.destination_country || t("notifications_order_unknown_location");
        const amount =
          typeof order.total_value === "number"
            ? new Intl.NumberFormat(i18n.language).format(order.total_value)
            : null;

        const summaryParts = [
          order.origin_country || order.destination_country
            ? t("notifications_order_route", { origin, destination })
            : null,
          amount && order.currency
            ? t("notifications_order_value", {
                amount,
                currency: order.currency,
              })
            : null,
          order.status
            ? t("notifications_order_status", { status: order.status })
            : null,
        ].filter((part): part is string => Boolean(part));

        return {
          id: `order-${order.id}-${order.created_at}`,
          type: "order" as const,
          title: order.order_number
            ? t("notifications_order_title", { orderNumber: order.order_number })
            : t("notifications_order_new"),
          description:
            summaryParts.join(" • ") || t("notifications_order_new"),
          createdAt: order.created_at || new Date().toISOString(),
          read: false,
          metadata: {
            orderId: order.id,
            orderNumber: order.order_number,
          },
        };
      });
  }, [i18n.language, isAgent, orders, stateRef, t]);

  const formatCaseStatus = useCallback(
    (status?: string | null) => {
      if (!status) {
        return "";
      }
      const key = `case_status_${status.toLowerCase()}`;
      const translated = t(key as any);
      if (translated && translated !== key) {
        return translated;
      }
      return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    [t]
  );

  const computeLawyerCaseNotifications = useCallback(() => {
    if (!isLawyer) {
      return [] as AppNotification[];
    }
    const lastSeen = parseDate(stateRef.current.lastSeen["case:lawyer"]);

    return cases
      .filter((caseItem) => parseDate(caseItem.created_at) > lastSeen)
      .map((caseItem) => {
        const caseIdentifier =
          caseItem.id || caseItem.created_at || Math.random().toString(36);
        const statusLabel = caseItem.status
          ? caseItem.status
              .toLowerCase()
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : null;

        const defendant = caseItem.defendant_name?.trim()
          ? t("notifications_case_against", { name: caseItem.defendant_name })
          : t("notifications_case_unknown_defendant");

        const summaryParts = [
          defendant,
          statusLabel
            ? t("notifications_case_status", { status: statusLabel })
            : null,
        ].filter((part): part is string => Boolean(part));

        return {
          id: `case-${caseIdentifier}-${caseItem.created_at}`,
          type: "case" as const,
          title: caseItem.subject
            ? t("notifications_case_title", { subject: caseItem.subject })
            : t("notifications_case_new"),
          description:
            summaryParts.join(" • ") || t("notifications_case_fallback"),
          createdAt: caseItem.created_at || new Date().toISOString(),
          read: false,
          metadata: {
            caseId: caseItem.id,
            status: caseItem.status,
            notificationCategory: "case:lawyer",
          },
        };
      });
  }, [cases, isLawyer, stateRef, t]);

  const computeUserCaseNotifications = useCallback(() => {
    if (!isUser) {
      return [] as AppNotification[];
    }

    const statusLastSeen = parseDate(stateRef.current.lastSeen["case:status"]);
    const responseLastSeen = parseDate(stateRef.current.lastSeen["case:response"]);

    const caseMap = new Map(
      cases
        .filter((item): item is CaseData & { id: string } => Boolean(item.id))
        .map((item) => [item.id as string, item])
    );

    const statusNotifications = cases
      .filter((caseItem): caseItem is CaseData & { id: string } => Boolean(caseItem.id))
      .filter((caseItem) => {
        const updatedTime = parseDate(caseItem.updated_at || caseItem.created_at);
        return updatedTime > statusLastSeen && updatedTime > parseDate(caseItem.created_at);
      })
      .map((caseItem) => {
        const statusLabel = formatCaseStatus(caseItem.status);
        const subject = caseItem.subject?.trim()
          ? caseItem.subject
          : t("notifications_case_unknown_subject");

        return {
          id: `case-status-${caseItem.id}-${caseItem.status}`,
          type: "case" as const,
          title: t("notifications_case_status_title", { subject }),
          description: statusLabel
            ? t("notifications_case_status_update", { status: statusLabel })
            : t("notifications_case_status_update_generic"),
          createdAt: caseItem.updated_at || new Date().toISOString(),
          read: false,
          metadata: {
            caseId: caseItem.id,
            status: caseItem.status,
            notificationCategory: "case:status",
          },
        };
      });

    const responseNotifications = caseResponses
      .filter((response) => {
        const createdTime = parseDate(response.created_at);
        return createdTime > responseLastSeen && caseMap.has(response.case_id);
      })
      .map((response) => {
        const caseItem = caseMap.get(response.case_id);
        const subject = caseItem?.subject?.trim()
          ? caseItem.subject
          : t("notifications_case_unknown_subject");
        const title = t("notifications_case_response_title", { subject });
        const price =
          typeof response.price === "number"
            ? t("notifications_case_response_price", {
                price: new Intl.NumberFormat(i18n.language, {
                  maximumFractionDigits: 2,
                }).format(response.price || 0),
              })
            : null;
        const delivery = response.delivery_date
          ? t("notifications_case_response_delivery", {
              deliveryDate: new Date(response.delivery_date).toLocaleDateString(i18n.language),
            })
          : null;

        const detailParts = [price, delivery].filter(
          (part): part is string => Boolean(part)
        );
        const preview = response.response
          ? response.response.slice(0, 140)
          : t("notifications_case_response_generic");

        return {
          id: `case-response-${response.id}`,
          type: "case" as const,
          title,
          description: [...detailParts, preview].filter(Boolean).join(" • "),
          createdAt: response.created_at || new Date().toISOString(),
          read: false,
          metadata: {
            caseId: response.case_id,
            notificationCategory: "case:response",
          },
        };
      });

    return [...statusNotifications, ...responseNotifications];
  }, [caseResponses, cases, formatCaseStatus, i18n.language, isUser, stateRef, t]);

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
      ...computeOrderNotifications(),
      ...computeLawyerCaseNotifications(),
      ...computeUserCaseNotifications(),
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
    computeLawyerCaseNotifications,
    computeUserCaseNotifications,
    computeOrderNotifications,
    computeMessageNotifications,
    syncPersistedReadState,
  ]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setCases([]);
      setCaseResponses([]);
      setOrders([]);
      setExportRequests([]);
      setCurrencyTransfers([]);
      return;
    }

    setIsLoading(true);
    try {
      let persistChanged = false;
      const [threadRes, exportRes, currencyRes, ordersRes, casesRes] = await Promise.all([
        MessagingService.fetchThreads(),
        isAgent ? ExportService.getAllExportRequests() : Promise.resolve({ exports: [] }),
        isAgent
          ? CurrencyTransferService.getAllTransfers()
          : Promise.resolve({ transfers: [] }),
        isAgent
          ? SupabaseService.getAgentOrders()
          : Promise.resolve({ orders: [] as AgentOrder[], error: null }),
        isLawyer
          ? SupabaseService.getCases()
          : isUser
          ? SupabaseService.getCasesByUser(userId)
          : Promise.resolve({ cases: [] as CaseData[], error: null }),
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
      if ("error" in ordersRes && ordersRes.error) {
        console.error("Failed to load orders notifications", ordersRes.error);
      }
      if ("orders" in ordersRes) {
        setOrders((ordersRes.orders as AgentOrder[]) || []);
        if (isAgent && !stateRef.current.lastSeen["order"] && ordersRes.orders) {
          const latest = (ordersRes.orders as AgentOrder[])
            .map((item) => parseDate(item.created_at))
            .reduce((max, value) => (value > max ? value : max), 0);
          if (latest > 0) {
            stateRef.current.lastSeen["order"] = new Date(latest).toISOString();
          } else {
            stateRef.current.lastSeen["order"] = new Date().toISOString();
          }
          persistChanged = true;
        }
      }
      if ("error" in casesRes && casesRes.error) {
        console.error("Failed to load case notifications", casesRes.error);
      }
      if ("cases" in casesRes) {
        const caseList = ((casesRes.cases as CaseData[]) || []).sort(
          (a, b) => parseDate(b.updated_at || b.created_at) - parseDate(a.updated_at || a.created_at)
        );
        setCases(caseList);

        if (isLawyer && !stateRef.current.lastSeen["case:lawyer"] && caseList.length > 0) {
          const latest = caseList
            .map((item) => parseDate(item.created_at))
            .reduce((max, value) => (value > max ? value : max), 0);
          if (latest > 0) {
            stateRef.current.lastSeen["case:lawyer"] = new Date(latest).toISOString();
          } else {
            stateRef.current.lastSeen["case:lawyer"] = new Date().toISOString();
          }
          persistChanged = true;
        }

        if (isUser) {
          if (!stateRef.current.lastSeen["case:status"] && caseList.length > 0) {
            const latestUpdate = caseList
              .map((item) => parseDate(item.updated_at || item.created_at))
              .reduce((max, value) => (value > max ? value : max), 0);
            stateRef.current.lastSeen["case:status"] =
              latestUpdate > 0 ? new Date(latestUpdate).toISOString() : new Date().toISOString();
            persistChanged = true;
          }

          const caseIds = caseList
            .map((item) => item.id)
            .filter((id): id is string => Boolean(id));
          if (caseIds.length > 0) {
            const responsesRes = await SupabaseService.getCaseResponsesByCaseIds(caseIds);
            if (responsesRes.error) {
              console.error("Failed to load case responses", responsesRes.error);
            }
            if (responsesRes.responses) {
              setCaseResponses(responsesRes.responses);
              if (!stateRef.current.lastSeen["case:response"] && responsesRes.responses.length > 0) {
                const latestResponse = responsesRes.responses
                  .map((item) => parseDate(item.created_at))
                  .reduce((max, value) => (value > max ? value : max), 0);
                stateRef.current.lastSeen["case:response"] =
                  latestResponse > 0
                    ? new Date(latestResponse).toISOString()
                    : new Date().toISOString();
                persistChanged = true;
              }
            }
          } else {
            setCaseResponses([]);
          }
        } else {
          setCaseResponses([]);
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
  }, [isAgent, isLawyer, isUser, savePersisted, stateRef, userId]);

  useEffect(() => {
    loadPersisted();
    setNotifications([]);
    if (!userId) {
      return;
    }

    refresh();
  }, [loadPersisted, refresh, userId]);

  useEffect(() => {
    caseIdsRef.current = new Set(
      cases
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id))
    );
  }, [cases]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    rebuildNotifications();
  }, [caseResponses, cases, currencyTransfers, exportRequests, orders, rebuildNotifications, threads, userId]);

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
          table: "orders",
        },
        (payload) => {
          const order = payload.new as AgentOrder | null;
          if (!order) {
            return;
          }
          setOrders((prev) => {
            const exists = prev.find((item) => item.id === order.id);
            if (exists) {
              return prev
                .map((item) => (item.id === order.id ? { ...item, ...order } : item))
                .sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
            }
            return [order, ...prev].sort(
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
    if (isLawyer || isUser) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cases",
        },
        (payload) => {
          const caseRecord = payload.new as CaseData | null;
          const oldRecord = payload.old as CaseData | null;
          if (payload.eventType === "DELETE" && oldRecord?.id) {
            setCases((prev) => prev.filter((item) => item.id !== oldRecord.id));
            return;
          }
          if (!caseRecord) {
            return;
          }
          if (isUser && caseRecord.user_id !== userId) {
            return;
          }
          const enrichedRecord: CaseData = {
            ...caseRecord,
            updated_at: caseRecord.updated_at || payload.commit_timestamp || caseRecord.updated_at,
          };
          setCases((prev) => {
            const exists = prev.find((item) => item.id === enrichedRecord.id);
            if (exists) {
              return prev
                .map((item) =>
                  item.id === enrichedRecord.id ? { ...item, ...enrichedRecord } : item
                )
                .sort(
                  (a, b) =>
                    parseDate(b.updated_at || b.created_at) -
                    parseDate(a.updated_at || a.created_at)
                );
            }
            return [enrichedRecord, ...prev].sort(
              (a, b) =>
                parseDate(b.updated_at || b.created_at) -
                parseDate(a.updated_at || a.created_at)
            );
          });
        }
      );
    }
    if (isUser) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "case_response",
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldResponse = payload.old as CaseResponse | null;
            if (!oldResponse?.id) {
              return;
            }
            setCaseResponses((prev) =>
              prev.filter((item) => item.id !== oldResponse.id)
            );
            return;
          }

          const response = payload.new as CaseResponse | null;
          if (!response) {
            return;
          }
          if (!caseIdsRef.current.has(response.case_id)) {
            return;
          }
          const enrichedResponse: CaseResponse = {
            ...response,
            created_at: response.created_at || payload.commit_timestamp || response.created_at,
          };
          setCaseResponses((prev) => {
            const exists = prev.find((item) => item.id === enrichedResponse.id);
            if (exists) {
              return prev
                .map((item) =>
                  item.id === enrichedResponse.id ? { ...item, ...enrichedResponse } : item
                )
                .sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
            }
            return [enrichedResponse, ...prev].sort(
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
  }, [isAgent, isLawyer, isUser, userId]);

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
      if (
        notification.type === "export" ||
        notification.type === "currency" ||
        notification.type === "order" ||
        notification.type === "case"
      ) {
        if (
          notification.type === "case" &&
          typeof notification.metadata?.notificationCategory === "string"
        ) {
          stateRef.current.lastSeen[notification.metadata.notificationCategory] = nowIso;
        } else {
          stateRef.current.lastSeen[notification.type] = nowIso;
        }
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
