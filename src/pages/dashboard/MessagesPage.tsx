import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import {
  DirectMessage,
  DirectMessageThread,
  MessagingProfile,
  MessagingService,
} from "../../services/messagingService";

const getProfileDisplayName = (profile: MessagingProfile | null) => {
  if (!profile) {
    return "Unknown";
  }

  if (profile.first_name || profile.last_name) {
    return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  }

  if (profile.email) {
    return profile.email.split("@")[0];
  }

  return profile.id;
};

const getProfileInitials = (profile: MessagingProfile | null) => {
  if (!profile) {
    return "??";
  }

  const firstInitial = profile.first_name?.[0] ?? "";
  const lastInitial = profile.last_name?.[0] ?? "";
  const initials = `${firstInitial}${lastInitial}`.trim();

  if (initials) {
    return initials.toUpperCase();
  }

  if (profile.email) {
    return profile.email[0]?.toUpperCase() ?? "??";
  }

  return profile.id.slice(0, 2).toUpperCase();
};

const isSameDay = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const MessagesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [threads, setThreads] = useState<DirectMessageThread[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [loadingThreads, setLoadingThreads] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [newRecipientId, setNewRecipientId] = useState<string>("");
  const [recipientOptions, setRecipientOptions] = useState<MessagingProfile[]>([]);
  const [creatingThread, setCreatingThread] = useState<boolean>(false);
  const [threadSearch, setThreadSearch] = useState<string>("");
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const threadsRef = useRef<DirectMessageThread[]>([]);
  const isRtl = i18n.dir() === "rtl";

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [i18n.language]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
      }),
    [i18n.language]
  );

  const formatThreadTimestamp = useCallback(
    (timestamp: string | null | undefined) => {
      if (!timestamp) {
        return "";
      }

      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) {
        return "";
      }

      const now = new Date();
      return isSameDay(date, now)
        ? timeFormatter.format(date)
        : dateFormatter.format(date);
    },
    [dateFormatter, timeFormatter]
  );

  const loadThreads = useCallback(
    async (options: { preserveSelection?: boolean } = {}) => {
      if (!user?.id) {
        return;
      }

      setLoadingThreads(true);
      const { data, error } = await MessagingService.fetchThreads();
      setLoadingThreads(false);

      if (error) {
        console.error("Failed to load threads", error);
        return;
      }

      const list = data ?? [];
      setThreads(list);
      threadsRef.current = list;

      const keepSelection = options.preserveSelection ?? false;

      if (!keepSelection) {
        if (!selectedThreadId && list.length > 0) {
          setSelectedThreadId(list[0].id);
        } else if (
          selectedThreadId &&
          !list.find((thread) => thread.id === selectedThreadId)
        ) {
          setSelectedThreadId(list.length ? list[0].id : null);
        }
      }
    },
    [selectedThreadId, user?.id]
  );

  const loadRecipients = useCallback(async () => {
    if (!user?.id) {
      setRecipientOptions([]);
      return;
    }

    const { data, error } = await MessagingService.listPotentialRecipients(user.id);

    if (error) {
      console.error("Failed to load recipients", error);
      return;
    }

    setRecipientOptions(data ?? []);
  }, [user?.id]);

  const loadMessages = useCallback(async (threadId: string) => {
    setLoadingMessages(true);
    const { data, error } = await MessagingService.fetchMessages(threadId);
    setLoadingMessages(false);

    if (error) {
      console.error("Failed to load messages", error);
      return;
    }

    setMessages(data ?? []);
    MessagingService.markThreadRead(threadId);
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const unsubscribe = MessagingService.subscribeToThreadListUpdates(() => {
      loadThreads({ preserveSelection: true });
    });

    return () => {
      unsubscribe();
    };
  }, [loadThreads, user?.id]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }

    loadMessages(selectedThreadId);

    const unsubscribe = MessagingService.subscribeToThreadMessages(
      selectedThreadId,
      (incoming) => {
        setMessages((prev) => {
          if (prev.find((message) => message.id === incoming.id)) {
            return prev;
          }

          const senderProfile =
            threadsRef.current
              .find((thread) => thread.id === incoming.thread_id)
              ?.members.find((member) => member.user_id === incoming.sender_id)
              ?.profile ?? null;

          const hydratedMessage: DirectMessage = {
            ...incoming,
            metadata: incoming.metadata ?? {},
            sender: senderProfile,
          };

          return [...prev, hydratedMessage];
        });

        loadThreads({ preserveSelection: true });
        MessagingService.markThreadRead(incoming.thread_id);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [loadMessages, loadThreads, selectedThreadId]);

  const handleCreateThread = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newRecipientId) {
      return;
    }

    setCreatingThread(true);
    const { data, error } = await MessagingService.createOrGetDirectThread(
      newRecipientId
    );
    setCreatingThread(false);

    if (error || !data) {
      console.error("Failed to create thread", error);
      toast.error(t("conversation_create_error"));
      return;
    }

    setNewRecipientId("");
    await loadThreads({ preserveSelection: false });
    setSelectedThreadId(data.id);
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedThreadId || sending) {
      return;
    }

    const value = messageInputRef.current?.value?.trim();
    if (!value) {
      return;
    }

    setSending(true);
    const { data: sentMessage, error } = await MessagingService.sendMessage(
      selectedThreadId,
      value
    );
    setSending(false);

    if (error) {
      console.error("Failed to send message", error);
      toast.error(t("message_send_error"));
      return;
    }

    if (sentMessage) {
      setMessages((prev) => {
        if (prev.find((message) => message.id === sentMessage.id)) {
          return prev;
        }
        return [...prev, sentMessage];
      });
    }

    if (messageInputRef.current) {
      messageInputRef.current.value = "";
      messageInputRef.current.style.height = "";
      messageInputRef.current.focus();
    }

    MessagingService.markThreadRead(selectedThreadId);
    loadThreads({ preserveSelection: true });
  };

  const participants = useMemo(() => {
    if (!selectedThreadId) {
      return [];
    }

    const thread = threads.find((item) => item.id === selectedThreadId);
    if (!thread) {
      return [];
    }

    return thread.members;
  }, [selectedThreadId, threads]);

  const groupedMessages = useMemo(() => {
    const groups: Array<{
      id: string;
      label: string;
      items: DirectMessage[];
    }> = [];

    if (!messages.length) {
      return groups;
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    messages.forEach((message) => {
      const createdAt = new Date(message.created_at);
      const groupId = createdAt.toISOString().split("T")[0];

      let group = groups.find((item) => item.id === groupId);
      if (!group) {
        let label = dateFormatter.format(createdAt);
        if (isSameDay(createdAt, today)) {
          label = t("messages_today", { defaultValue: "Today" });
        } else if (isSameDay(createdAt, yesterday)) {
          label = t("messages_yesterday", { defaultValue: "Yesterday" });
        }

        group = {
          id: groupId,
          label,
          items: [],
        };
        groups.push(group);
      }

      group.items.push(message);
    });

    return groups;
  }, [dateFormatter, messages, t]);

  const filteredThreads = useMemo(() => {
    if (!threadSearch.trim()) {
      return threads;
    }

    const query = threadSearch.toLowerCase();
    return threads.filter((thread) => {
      const counterpart = thread.members.find(
        (member) => member.user_id !== user?.id
      );
      const displayName = getProfileDisplayName(counterpart?.profile ?? null);
      const preview = thread.last_message_preview ?? "";

      return (
        displayName.toLowerCase().includes(query) ||
        preview.toLowerCase().includes(query)
      );
    });
  }, [threadSearch, threads, user?.id]);

  useEffect(() => {
    if (!messageListRef.current) {
      return;
    }

    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [groupedMessages, selectedThreadId, loadingMessages]);

  const handleTextareaInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const element = event.currentTarget;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 240)}px`;
  };

  if (!user) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <p className="text-gray-700">{t("login")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-full">
      <aside className="h-full">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("messages")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t("messages_subtitle", {
                    defaultValue: "Stay in sync with your latest conversations.",
                  })}
                </p>
              </div>
              <div className="relative">
                <input
                  type="search"
                  value={threadSearch}
                  onChange={(event) => setThreadSearch(event.target.value)}
                  placeholder={t("search_conversations", {
                    defaultValue: "Search conversations...",
                  })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  dir={isRtl ? "rtl" : "ltr"}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.5 3a5.5 5.5 0 014.383 8.805l3.656 3.656a.75.75 0 11-1.06 1.06l-3.656-3.655A5.5 5.5 0 118.5 3zm0 1.5a4 4 0 100 8 4 4 0 000-8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <form
              onSubmit={handleCreateThread}
              className="mt-4 flex flex-col gap-2"
              aria-label={t("start_conversation")}
            >
              <label className="text-sm font-medium text-gray-700">
                {t("new_message")}
              </label>
              <select
                value={newRecipientId}
                onChange={(event) => setNewRecipientId(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                dir={isRtl ? "rtl" : "ltr"}
              >
                <option value="">{t("select_recipient")}</option>
                {recipientOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {getProfileDisplayName(option)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!newRecipientId || creatingThread}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingThread ? t("loading") : t("start_conversation")}
              </button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="p-4 text-sm text-gray-500">{t("loading")}</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                {t("no_conversations")}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                {t("no_conversations_found", {
                  defaultValue: "No conversations match your search.",
                })}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredThreads.map((thread) => {
                  const counterpart = thread.members.find(
                    (member) => member.user_id !== user.id
                  );
                  const displayName = getProfileDisplayName(
                    counterpart?.profile ?? null
                  );
                  const preview = thread.last_message_preview || t("no_messages_yet");
                  const lastActivity = thread.last_message_at || thread.updated_at;
                  const currentMember = thread.members.find(
                    (member) => member.user_id === user.id
                  );
                  const hasUnread =
                    !!lastActivity &&
                    (!currentMember?.last_read_at ||
                      new Date(lastActivity).getTime() >
                        new Date(currentMember.last_read_at).getTime());
                  const initials = getProfileInitials(counterpart?.profile ?? null);

                  return (
                    <li key={thread.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedThreadId(thread.id)}
                        className={`group w-full text-left px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          selectedThreadId === thread.id
                            ? "bg-indigo-50"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold uppercase ${
                              selectedThreadId === thread.id
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                            aria-hidden="true"
                          >
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {displayName}
                              </h3>
                              {hasUnread ? (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                                  {t("unread", { defaultValue: "New" })}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {preview}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
                            {lastActivity ? (
                              <span>{formatThreadTimestamp(lastActivity)}</span>
                            ) : null}
                            {hasUnread ? (
                              <span
                                className="h-2 w-2 rounded-full bg-indigo-500"
                                aria-hidden="true"
                              />
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </aside>

      <section className="h-full">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col h-[70vh] md:h-[75vh]">
          {!selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm px-6 text-center">
              {t("select_conversation")}
            </div>
          ) : (
            <>
              <header className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {participants
                    .filter((member) => member.user_id !== user.id)
                    .map((member) => getProfileDisplayName(member.profile))
                    .join(", ") || t("messages")}
                </h2>
              </header>
              <div
                ref={messageListRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scroll-smooth"
              >
                {loadingMessages ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex justify-start gap-3"
                        aria-hidden="true"
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-200 opacity-70" />
                        <div className="h-10 w-40 rounded-2xl bg-gray-200 opacity-70" />
                      </div>
                    ))}
                  </div>
                ) : groupedMessages.length === 0 ? (
                  <div className="text-sm text-gray-500">{t("no_messages_yet")}</div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.id} className="space-y-4">
                      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                        <span className="flex-1 border-t border-gray-200" />
                        <span>{group.label}</span>
                        <span className="flex-1 border-t border-gray-200" />
                      </div>

                      <div className="space-y-4">
                        {group.items.map((message) => {
                          const isOwn = message.sender_id === user.id;
                          const senderProfile = message.sender ?? null;
                          const senderName = getProfileDisplayName(senderProfile);
                          const messageTimestamp = new Date(message.created_at);
                          const bubbleAlignment = isOwn
                            ? "justify-end"
                            : "justify-start";

                          return (
                            <div
                              key={message.id}
                              className={`flex ${bubbleAlignment} gap-3`}
                            >
                              {!isOwn ? (
                                <div className="mt-1">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold uppercase text-indigo-600">
                                    {getProfileInitials(senderProfile)}
                                  </div>
                                </div>
                              ) : null}
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition ${
                                  isOwn
                                    ? "rounded-br-md bg-indigo-600 text-white"
                                    : "rounded-bl-md bg-gray-100 text-gray-800"
                                }`}
                                dir={isRtl ? "rtl" : "ltr"}
                                title={new Date(
                                  message.created_at
                                ).toLocaleString()}
                              >
                                {!isOwn && (
                                  <p className="text-xs font-semibold text-gray-600 mb-1">
                                    {senderName}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                  {message.body}
                                </p>
                                <div
                                  className={`mt-2 flex items-center gap-2 text-[11px] ${
                                    isOwn
                                      ? "justify-end text-indigo-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <time dateTime={message.created_at}>
                                    {timeFormatter.format(messageTimestamp)}
                                  </time>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <footer className="border-t border-gray-100 p-4">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <textarea
                    ref={messageInputRef}
                    rows={2}
                    placeholder={t("type_a_message")}
                    className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    dir={isRtl ? "rtl" : "ltr"}
                    onInput={handleTextareaInput}
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? t("loading") : t("send")}
                  </button>
                </form>
              </footer>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default MessagesPage;
