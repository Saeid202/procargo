import React, { useState, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import {
  LegalAIService,
  LegalChatSession,
} from "../../services/legalAIService";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import clsx from "clsx";

const markdownComponents: Components = {
  p: ({ children, className, ...props }) => (
    <p
      className={clsx("mb-2 last:mb-0 leading-relaxed text-sm", className)}
      {...props}
    >
      {children}
    </p>
  ),
  a: ({ children, className, ...props }) => (
    <a
      className={clsx("text-cargo-600 underline break-all", className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, className, ...props }) => (
    <ul
      className={clsx("list-disc pl-4 mb-2 space-y-1 text-sm", className)}
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }) => (
    <ol
      className={clsx("list-decimal pl-4 mb-2 space-y-1 text-sm", className)}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }) => (
    <li className={clsx("leading-relaxed", className)} {...props}>
      {children}
    </li>
  ),
  strong: ({ children, className, ...props }) => (
    <strong className={clsx("font-semibold", className)} {...props}>
      {children}
    </strong>
  ),
  em: ({ children, className, ...props }) => (
    <em className={clsx("italic", className)} {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, className, ...props }) => (
    <blockquote
      className={clsx(
        "border-l-4 border-gray-300 pl-3 italic text-sm text-gray-700 mb-2",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  h1: ({ children, className, ...props }) => (
    <h1 className={clsx("text-base font-semibold mb-2", className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2 className={clsx("text-base font-semibold mb-2", className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3 className={clsx("text-sm font-semibold mb-1", className)} {...props}>
      {children}
    </h3>
  ),
  code: ({
    inline,
    className,
    children,
    ...props
  }: React.PropsWithChildren<
    { inline?: boolean; className?: string } & React.HTMLAttributes<HTMLElement>
  >) => {
    if (inline) {
      return (
        <code
          className={clsx(
            "bg-gray-200 text-gray-900 px-1 rounded text-xs",
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-gray-900 text-gray-100 text-xs rounded-md p-3 overflow-x-auto mb-2">
        <code className={clsx("text-xs", className)} {...props}>
          {children}
        </code>
      </pre>
    );
  },
};

const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="text-sm leading-relaxed space-y-2">
    <ReactMarkdown components={markdownComponents} skipHtml>
      {content}
    </ReactMarkdown>
  </div>
);

const LegalAssistancePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [chatMessages, setChatMessages] = useState<
    {
      id: string | number;
      type: string;
      message: string;
      timestamp: string;
      suggestions?: string[];
      relatedTopics?: string[];
      confidence?: number;
    }[]
  >([
    {
      id: 1,
      type: "bot",
      message:
        "Hello! I'm your legal assistance AI. I can help you with questions about international trade compliance, customs regulations, and legal requirements for China-Canada trade. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [chatSessions, setChatSessions] = useState<LegalChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [showSessionSidebar, setShowSessionSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load chat sessions and history on component mount
  useEffect(() => {
    if (user) {
      console.log("=== PAGE LOADED - TESTING CONNECTIONS ===");
      console.log("User ID:", user.id);

      // Test both API and database connections
      Promise.all([
        LegalAIService.testAPIConnection(),
        LegalAIService.testDatabaseConnection(),
      ])
        .then(([apiResult, dbResult]) => {
          console.log("=== CONNECTION TEST RESULTS ===");
          console.log("API Result:", apiResult);
          console.log("Database Result:", dbResult);

          if (apiResult.success) {
            console.log("✅ API connection test passed");
          } else {
            console.error("❌ API connection test failed:", apiResult.error);
          }

          if (dbResult.success) {
            console.log("✅ Database connection test passed");
            loadChatSessions();
          } else {
            console.error(
              "❌ Database connection test failed:",
              dbResult.error
            );
          }
        })
        .catch((error) => {
          console.error("❌ Connection test error:", error);
        });
    }
  }, [user]);

  // Load messages when active session changes
  useEffect(() => {
    if (activeSession && user) {
      loadChatHistory();
    }
  }, [activeSession, user]);

  const loadChatSessions = async () => {
    if (!user) return;

    try {
      const { sessions, error } = await LegalAIService.getChatSessions(user.id);
      if (error) {
        console.error("Failed to load chat sessions:", error);
      } else {
        setChatSessions(sessions);
        if (sessions.length > 0 && !activeSession) {
          setActiveSession(sessions[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  const loadChatHistory = async () => {
    if (!user || !activeSession) return;

    try {
      const { messages, error } = await LegalAIService.getChatHistory(
        user.id,
        activeSession
      );
      if (error) {
        console.error("Failed to load chat history:", error);
        // Show welcome message on error
        setChatMessages([
          {
            id: 1,
            type: "bot",
            message:
              "Hello! I'm your legal assistance AI. I can help you with questions about international trade compliance, customs regulations, and legal requirements for China-Canada trade. How can I assist you today?",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else if (messages.length > 0) {
        // Convert database messages to chat format
        const formattedMessages = messages.map((msg) => ({
          id: msg.id,
          type: msg.message_type,
          message: msg.message_type === "user" ? msg.message : msg.response,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          suggestions: msg.suggestions || [],
          relatedTopics: msg.related_topics || [],
          confidence: msg.ai_confidence,
        }));
        setChatMessages(formattedMessages);
      } else {
        // Reset to welcome message if no history
        setChatMessages([
          {
            id: 1,
            type: "bot",
            message:
              "Hello! I'm your legal assistance AI. I can help you with questions about international trade compliance, customs regulations, and legal requirements for China-Canada trade. How can I assist you today?",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Show welcome message on error
      setChatMessages([
        {
          id: 1,
          type: "bot",
          message:
            "Hello! I'm your legal assistance AI. I can help you with questions about international trade compliance, customs regulations, and legal requirements for China-Canada trade. How can I assist you today?",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { session, error } = await LegalAIService.createChatSession(
        user.id,
        `New Legal Chat - ${new Date().toLocaleDateString()}`
      );

      if (error || !session) {
        throw new Error(error || "Failed to create session");
      }

      setChatSessions((prev) => [session, ...prev]);
      setActiveSession(session.id);
      setSessionId(session.id);
      setChatMessages([
        {
          id: 1,
          type: "bot",
          message:
            "Hello! I'm your legal assistance AI. I can help you with questions about international trade compliance, customs regulations, and legal requirements for China-Canada trade. How can I assist you today?",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  };

  const switchToSession = async (sessionId: string) => {
    setActiveSession(sessionId);
    setSessionId(sessionId);
    setShowSessionSidebar(false);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || !user) return;

    setIsLoading(true);
    const currentMessage = inputMessage;
    setInputMessage("");

    console.log("=== USER SENT MESSAGE ===");
    console.log("Message:", currentMessage);
    console.log("User ID:", user.id);
    console.log("Active Session:", activeSession);

    try {
      // Get AI response with memory
      const result = await LegalAIService.sendMessageWithMemory(
        user.id,
        currentMessage,
        activeSession || undefined
      );

      console.log("=== AI SERVICE RESULT ===");
      console.log("Result:", result);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update session ID if new session created
      if (result.newSessionId) {
        setActiveSession(result.newSessionId);
        setSessionId(result.newSessionId);
        // Reload sessions to include the new one
        loadChatSessions();
      }

      // Reload chat history to get the complete conversation
      await loadChatHistory();
    } catch (error) {
      console.error("=== ERROR GETTING AI RESPONSE ===", error);

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        message:
          "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team.",
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const testAPIManually = async () => {
    console.log("=== MANUAL API TEST ===");
    try {
      const result = await LegalAIService.testAPIConnection();
      console.log("Manual API test result:", result);
      alert(
        `API Test Result: ${result.success ? "SUCCESS" : "FAILED"}\n${
          result.error || "No error"
        }`
      );
    } catch (error) {
      console.error("Manual API test error:", error);
      alert(`API Test Error: ${error}`);
    }
  };

  const testSimpleAPI = async () => {
    console.log("=== SIMPLE API TEST ===");
    try {
      const result = await LegalAIService.testSimpleAPI();
      console.log("Simple API test result:", result);
      alert(
        `Simple API Test: ${result.success ? "SUCCESS" : "FAILED"}\nResponse: ${
          result.response || "No response"
        }\nError: ${result.error || "No error"}`
      );
    } catch (error) {
      console.error("Simple API test error:", error);
      alert(`Simple API Test Error: ${error}`);
    }
  };

  const testMinimalAPI = async () => {
    console.log("=== MINIMAL API TEST ===");
    try {
      const result = await LegalAIService.testMinimalAPI();
      console.log("Minimal API test result:", result);
      alert(
        `Minimal API Test: ${
          result.success ? "SUCCESS" : "FAILED"
        }\nResponse: ${result.response || "No response"}\nError: ${
          result.error || "No error"
        }`
      );
    } catch (error) {
      console.error("Minimal API test error:", error);
      alert(`Minimal API Test Error: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Sidebar */}
      {showSessionSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSessionSidebar(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chat History</h3>
                <button
                  onClick={() => setShowSessionSidebar(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={createNewSession}
                className="mt-3 w-full bg-cargo-600 text-white px-4 py-2 rounded-lg hover:bg-cargo-700 flex items-center justify-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Chat
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => switchToSession(session.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeSession === session.id
                      ? "bg-cargo-100 border border-cargo-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <h4 className="font-medium text-sm truncate">
                    {session.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.message_count} messages •{" "}
                    {new Date(session.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legal AI Chatbot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-cargo-100 rounded-lg me-4">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-cargo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("legal_ai_assistant")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(
                    "get_instant_answers_to_your_legal_questions_about_international_trade"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={createNewSession}
                className="bg-cargo-600 text-white px-3 py-2 rounded-lg hover:bg-cargo-700 flex items-center text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New Chat
              </button>
              <button
                onClick={() => setShowSessionSidebar(true)}
                className="text-cargo-600 hover:text-cargo-700 p-2 rounded-lg hover:bg-cargo-50"
                title="Chat History"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Chat Interface */}
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto space-y-4 pr-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === "user"
                        ? "bg-cargo-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.type === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    ) : (
                      <MarkdownMessage content={msg.message || ""} />
                    )}
                    <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cargo-600"></div>
                      <span className="text-sm">{t("ai_is_thinking")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex max-[768px]:flex-col max-[768px]:gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t(
                  "ask_about_export_requirements_customs_procedures_or_legal_compliance"
                )}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 me-2"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-cargo-600 hover:bg-cargo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center max-[768px]:max-w-12"
              >
                <PaperAirplaneIcon className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Chatbot Disclaimer */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5 ml-2" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">
                  {t("ai_legal_assistant_notice")}
                </p>
                <p>
                  {t(
                    "this_ai_provides_general_information_and_guidance_only_it_is_not_a_substitute_for_professional_legal_advice_for_specific_legal_matters_please_consult_with_qualified_legal_professionals_or_schedule_a_consultation"
                  )}
                  {t(
                    "for_specific_legal_matters_please_consult_with_qualified_legal_professionals_or_schedule_a_consultation"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistancePage;
