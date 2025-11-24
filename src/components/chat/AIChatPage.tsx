"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/basic/button";
import { Input } from "@/components/ui/form/input";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Card } from "@/components/ui/layout/card";
import { Send, Loader2, Sparkles, Bot, Plus, Trash2, MessageSquare, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomToast } from "@/hooks/useCustomToast";
import { EduAIRobot } from "./EduAIRobot";
import { AIChatbotService } from "@/services/aiChatbotService";
import { ChatSessionDto, ChatMessageDto, ChatSuggestionsDto } from "@/types/backend";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  text?: string;
  reply?: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestions?: ChatSuggestionsDto;
}

export function AIChatPage() {
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useCustomToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    } else {
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (hasMessages && messagesEndRef.current) {
      const scrollContainer = messagesEndRef.current.closest('.overflow-y-auto');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages, isTyping, hasMessages]);

  useEffect(() => {
    if (!hasMessages && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasMessages]);

  const loadSessions = async () => {
    if (!isAuthenticated) return;
    setLoadingSessions(true);
    try {
      const response = await AIChatbotService.listSessions();
      if (response.success && response.data) {
        setSessions(response.data);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadChatHistory = async (sessionId: number) => {
    setLoadingHistory(true);
    try {
      const response = await AIChatbotService.getChatHistory(sessionId);
      if (response.success && response.data) {
        const historyMessages: Message[] = response.data.map((msg: ChatMessageDto) => ({
          id: `${sessionId}-${msg.createdAt}`,
          text: msg.message,
          sender: msg.role === "user" ? "user" : "ai",
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(historyMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      showError("Lỗi", "Không thể tải lịch sử chat");
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateSession = async () => {
    if (!isAuthenticated) {
      showError("Lỗi", "Vui lòng đăng nhập để tạo session mới");
      return;
    }
    setIsCreatingSession(true);
    try {
      const response = await AIChatbotService.createSession();
      if (response.success && response.data) {
        const newSessionId = response.data.sessionId;
        setCurrentSessionId(newSessionId);
        setMessages([]);
        setMessageText("");
        await loadSessions();
        showSuccess("Thành công", "Đã tạo cuộc trò chuyện mới");
      } else {
        showError("Lỗi", response.message || "Không thể tạo session mới");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      showError("Lỗi", "Không thể tạo session mới");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSelectSession = async (sessionId: number) => {
    if (currentSessionId === sessionId) return;
    setCurrentSessionId(sessionId);
    await loadChatHistory(sessionId);
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setIsDeletingSession(sessionId);
    try {
      const response = await AIChatbotService.deleteSession(sessionId);
      if (response.success) {
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
          setMessageText("");
        }
        await loadSessions();
        showSuccess("Thành công", "Đã xóa session");
      } else {
        showError("Lỗi", response.message || "Không thể xóa session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      showError("Lỗi", "Không thể xóa session");
    } finally {
      setIsDeletingSession(null);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = messageText.trim();
    setMessageText("");
    setIsTyping(true);

    try {
      let sessionId = currentSessionId;
      if (isAuthenticated && !sessionId) {
        const createResponse = await AIChatbotService.createSession();
        if (createResponse.success && createResponse.data) {
          sessionId = createResponse.data.sessionId;
          setCurrentSessionId(sessionId);
          await loadSessions();
        }
      }

      const response = await AIChatbotService.chat({
        sessionId: sessionId || undefined,
        message: messageToSend,
      });

      if (response.success && response.data) {
        const newSessionId = response.data.sessionId;
        if (newSessionId !== currentSessionId) {
          setCurrentSessionId(newSessionId);
          if (isAuthenticated) {
            await loadSessions();
          }
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.reply,
          reply: response.data.reply,
          suggestions: response.data.suggestions,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || "Không thể nhận phản hồi từ AI");
      }
    } catch (error: any) {
      console.error("Failed to get AI response:", error);
      showError("Lỗi", error.message || "Không thể nhận phản hồi từ AI. Vui lòng thử lại.");
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    if (isAuthenticated) {
      handleCreateSession();
    } else {
      setCurrentSessionId(null);
      setMessages([]);
      setMessageText("");
      showSuccess("Thành công", "Đã tạo cuộc trò chuyện mới");
    }
  };

  const handleTutorClick = useCallback(
    (profileUrl?: string) => {
      if (!profileUrl) return;
      if (profileUrl.startsWith("http")) {
        try {
          if (typeof window !== "undefined") {
            const currentOrigin = window.location.origin;
            if (profileUrl.startsWith(currentOrigin)) {
              const relative = profileUrl.replace(currentOrigin, "") || "/";
              router.push(relative);
            } else {
              window.open(profileUrl, "_blank", "noopener,noreferrer");
            }
          } else {
            router.push(profileUrl);
          }
        } catch {
          router.push(profileUrl);
        }
      } else {
        router.push(profileUrl);
      }
    },
    [router]
  );

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    }
  };

  return (
    <div className="fixed inset-0 top-16 bg-[#F9FAFB] flex overflow-hidden">
      {isAuthenticated && (
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-[#E5E7EB] bg-white flex-shrink-0 flex flex-col transition-all duration-300 h-full`}>
          <div className="p-4 border-b border-[#E5E7EB]">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <EduAIRobot size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-semibold text-[#257180] flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Edu AI
                    </h1>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="ai-status-dot"></span>
                      Sẵn sàng hỗ trợ
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-1 h-6 w-6 text-gray-600 hover:bg-gray-100 flex-shrink-0"
                    title="Thu nhỏ sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleCreateSession}
                  disabled={isCreatingSession}
                  className="w-full bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Cuộc trò chuyện mới
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-between w-full">
                  <div className="relative flex-shrink-0">
                    <EduAIRobot size={32} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-1 h-6 w-6 text-gray-600 hover:bg-gray-100"
                    title="Mở rộng sidebar"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleCreateSession}
                  disabled={isCreatingSession}
                  size="sm"
                  className="w-full bg-[#257180] hover:bg-[#257180]/90 text-white p-2"
                  title="Tạo cuộc trò chuyện mới"
                >
                  {isCreatingSession ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-2 space-y-1">
              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#257180]" />
                </div>
              ) : sessions.length === 0 ? (
                <div className={`text-center py-8 text-sm text-gray-500 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
                  {sidebarCollapsed ? '...' : 'Chưa có cuộc trò chuyện nào'}
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSessionId === session.id
                        ? "bg-[#257180] text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {!sidebarCollapsed ? (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              currentSessionId === session.id ? "text-white" : "text-gray-900"
                            }`}>
                              {session.lastMessage || "Cuộc trò chuyện mới"}
                            </p>
                            <p className={`text-xs mt-1 ${
                              currentSessionId === session.id ? "text-white/70" : "text-gray-500"
                            }`}>
                              {formatSessionDate(session.createdAt)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            disabled={isDeletingSession === session.id}
                            className={`p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                              currentSessionId === session.id
                                ? "hover:bg-white/20 text-white"
                                : "hover:bg-red-100 text-red-600"
                            }`}
                            title="Xóa session"
                          >
                            {isDeletingSession === session.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <div className="w-full flex flex-col items-center justify-center">
                          <MessageSquare className={`h-5 w-5 ${
                            currentSessionId === session.id ? "text-white" : "text-[#257180]"
                          }`} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {!isAuthenticated && (
          <div className="w-full border-b border-[#E5E7EB] bg-white flex-shrink-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <EduAIRobot size={48} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-[#257180] flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Edu AI
                  </h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="ai-status-dot"></span>
                    Sẵn sàng hỗ trợ
                  </p>
                </div>
              </div>
              <Button
                onClick={handleNewChat}
                variant="ghost"
                size="sm"
                className="text-[#257180] hover:bg-[#F2E5BF]"
              >
                <Plus className="w-4 w-4 mr-2" />
                Cuộc trò chuyện mới
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : !hasMessages ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 min-h-full">
              <div className="max-w-2xl w-full space-y-8">
                <div className="flex justify-center">
                  <EduAIRobot size={300} />
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-[#257180]">
                    Chào mừng đến với Edu AI
                  </h2>
                  <p className="text-gray-600">
                    Tôi có thể giúp bạn tìm gia sư, giải đáp thắc mắc về nền tảng EduMatch, hoặc hỗ trợ bạn trong quá trình học tập.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Làm thế nào để tìm gia sư phù hợp?",
                    "Giá cả trên EduMatch như thế nào?",
                    "Làm sao để trở thành gia sư?",
                    "Cách thanh toán trên nền tảng?",
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setMessageText(question)}
                      className="p-4 text-left bg-white border border-[#D1D5DB] rounded-lg hover:border-[#257180] hover:bg-[#F2E5BF]/30 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-[#257180]" />
                        <span className="text-sm text-gray-700 group-hover:text-[#257180]">
                          {question}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div ref={scrollAreaRef} className="min-h-full">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
                <div className="space-y-6">
                  {messages.map((msg) => {
                    const isUser = msg.sender === "user";
                    const displayText = msg.reply ?? msg.text ?? "";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      >
                        {!isUser && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-[#F2E5BF] flex items-center justify-center">
                              <Bot className="w-5 h-5 text-[#257180]" />
                            </div>
                          </div>
                        )}
                        <div className={`flex-1 max-w-[80%] ${isUser ? "flex flex-col items-end" : "flex flex-col items-start"}`}>
                          <div
                            className={`rounded-lg px-4 py-3 ${
                              isUser
                                ? "bg-[#257180] text-white"
                                : "bg-white border border-[#D1D5DB] text-gray-900"
                            }`}
                          >
                            <p className="text-sm break-words whitespace-pre-line leading-relaxed">
                              {displayText}
                            </p>
                          </div>
                          {!isUser && msg.suggestions && (
                            <div className="w-full mt-3 space-y-3">
                              {msg.suggestions.message && (
                                <div className="rounded-lg border border-[#F2E5BF] bg-[#FFF8EC] px-4 py-3 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                                  {msg.suggestions.message}
                                </div>
                              )}
                              {msg.suggestions.tutors && msg.suggestions.tutors.length > 0 && (
                                <div className="space-y-3 w-full">
                                  {msg.suggestions.tutors.map((tutor, index) => (
                                    <div
                                      key={`${tutor.tutorId ?? tutor.rank ?? index}`}
                                      className="border border-[#E5E7EB] rounded-lg bg-white p-4 shadow-sm space-y-2"
                                    >
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <button
                                          type="button"
                                          onClick={() => handleTutorClick(tutor.profileUrl)}
                                          className="text-[#257180] font-semibold hover:underline"
                                        >
                                          {tutor.name}
                                        </button>
                                        {typeof tutor.matchScore === "number" && (
                                          <span className="text-xs text-gray-500 font-medium">
                                            Điểm phù hợp {(tutor.matchScore * 100).toFixed(0)}%
                                          </span>
                                        )}
                                      </div>
                                      {tutor.subjects && tutor.subjects.length > 0 && (
                                        <p className="text-xs text-gray-600">
                                          Môn: <span className="font-medium">{tutor.subjects.join(", ")}</span>
                                        </p>
                                      )}
                                      {tutor.levels && tutor.levels.length > 0 && (
                                        <p className="text-xs text-gray-600">
                                          Cấp độ: <span className="font-medium">{tutor.levels.join(", ")}</span>
                                        </p>
                                      )}
                                      {(tutor.province || tutor.subDistrict) && (
                                        <p className="text-xs text-gray-600">
                                          Khu vực:{" "}
                                          <span className="font-medium">
                                            {[tutor.subDistrict, tutor.province].filter(Boolean).join(", ") || "Không rõ"}
                                          </span>
                                        </p>
                                      )}
                                      {tutor.hourlyRates && tutor.hourlyRates.length > 0 && (
                                        <p className="text-xs text-gray-600">
                                          Học phí:{" "}
                                          <span className="font-medium">
                                            {tutor.hourlyRates.map((rate) => `${Number(rate).toLocaleString("vi-VN")}đ/h`).join(" · ")}
                                          </span>
                                        </p>
                                      )}
                                      {tutor.teachingExp && (
                                        <p className="text-xs text-gray-600 whitespace-pre-line">
                                          Kinh nghiệm: <span className="font-medium">{tutor.teachingExp}</span>
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1.5">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                        {isUser && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-[#F2E5BF] flex items-center justify-center">
                              <span className="text-[#257180] text-xs font-bold">
                                {user?.name?.[0]?.toUpperCase() || "U"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F2E5BF] flex items-center justify-center">
                          <Bot className="w-5 h-5 text-[#257180]" />
                        </div>
                      </div>
                      <div className="flex-1 max-w-[80%]">
                        <div className="bg-white border border-[#D1D5DB] rounded-lg px-4 py-3">
                          <div className="flex gap-1">
                            <div className="ai-typing-dot ai-typing-dot-1"></div>
                            <div className="ai-typing-dot ai-typing-dot-2"></div>
                            <div className="ai-typing-dot ai-typing-dot-3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full bg-[#F9FAFB] border-t border-[#E5E7EB] z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <form onSubmit={handleSendMessage} className="relative">
              <Input
                placeholder="Nhập câu hỏi của bạn..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isTyping}
                className="w-full pr-12 h-12 text-base border-[#D1D5DB] bg-white focus:border-[#257180] focus:ring-[#257180]"
              />
              <Button
                type="submit"
                disabled={isTyping || !messageText.trim()}
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#257180] hover:bg-[#257180]/90 text-white h-8 w-8 p-0"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-1.5 text-center">
              AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
