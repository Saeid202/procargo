import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const threadsRef = useRef<DirectMessageThread[]>([]);
  const isRtl = i18n.dir() === "rtl";

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

  const loadMessages = useCallback(
    async (threadId: string) => {
      setLoadingMessages(true);
      const { data, error } = await MessagingService.fetchMessages(threadId);
      setLoadingMessages(false);

      if (error) {
        console.error("Failed to load messages", error);
        return;
      }

      setMessages(data ?? []);
      MessagingService.markThreadRead(threadId);
    },
    []
  );

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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("messages")}
            </h2>
            <form
              onSubmit={handleCreateThread}
              className="flex flex-col gap-2"
              aria-label={t("start_conversation")}
            >
              <label className="text-sm font-medium text-gray-700">
                {t("new_message")}
              </label>
              <select
                value={newRecipientId}
                onChange={(event) => setNewRecipientId(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            ) : (
              <ul className="divide-y divide-gray-100">
                {threads.map((thread) => {
                  const counterpart = thread.members.find(
                    (member) => member.user_id !== user.id
                  );
                  const displayName = getProfileDisplayName(
                    counterpart?.profile ?? null
                  );
                  const preview = thread.last_message_preview || t("no_messages_yet");
                  const lastActivity = thread.last_message_at || thread.updated_at;

                  return (
                    <li key={thread.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedThreadId(thread.id)}
                        className={`w-full text-left px-4 py-3 transition ${
                          selectedThreadId === thread.id
                            ? "bg-indigo-50"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {displayName}
                          </h3>
                          {lastActivity ? (
                            <span className="text-xs text-gray-400">
                              {new Date(lastActivity).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {preview}
                        </p>
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
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {loadingMessages ? (
                  <div className="text-sm text-gray-500">{t("loading")}</div>
                ) : messages.length === 0 ? (
                  <div className="text-sm text-gray-500">{t("no_messages_yet")}</div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender_id === user.id;
                    const senderName = getProfileDisplayName(
                      message.sender ?? null
                    );
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                            isOwn
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium text-gray-500 mb-1">
                              {senderName}
                            </p>
                          )}
                          <p
                            className={`text-sm whitespace-pre-wrap ${
                              isRtl ? "text-right" : "text-left"
                            }`}
                          >
                            {message.body}
                          </p>
                          <p
                            className={`mt-1 text-[11px] ${
                              isOwn ? "text-indigo-100" : "text-gray-500"
                            } ${isRtl ? "text-right" : "text-left"}`}
                          >
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
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
