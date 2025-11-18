"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/basic/button";
import { Input } from "@/components/ui/form/input";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Send, Loader2, Sparkles, Bot, Plus, Trash2, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomToast } from "@/hooks/useCustomToast";
import { EduAIRobot } from "./EduAIRobot";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function AIChatPage() {
  const { user } = useAuth();
  const { showError, showSuccess } = useCustomToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (hasMessages && messagesEndRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping, hasMessages]);

  useEffect(() => {
    if (!hasMessages && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasMessages]);

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("tìm gia sư") || lowerMessage.includes("gia sư")) {
      return "Tôi có thể giúp bạn tìm gia sư phù hợp! Bạn có thể sử dụng tính năng 'Tìm gia sư' trên thanh menu để tìm kiếm theo môn học, địa điểm, hoặc giá cả. Bạn muốn tìm gia sư cho môn học nào?";
    } else if (lowerMessage.includes("đăng ký") || lowerMessage.includes("trở thành gia sư")) {
      return "Để trở thành gia sư trên EduMatch, bạn cần đăng ký và hoàn thiện hồ sơ gia sư. Hãy truy cập 'Trở thành gia sư' trên menu để bắt đầu quá trình đăng ký. Bạn cần cung cấp thông tin về trình độ học vấn, kinh nghiệm giảng dạy, và các chứng chỉ liên quan.";
    } else if (lowerMessage.includes("giá") || lowerMessage.includes("phí") || lowerMessage.includes("tiền")) {
      return "Giá cả trên EduMatch rất linh hoạt và phụ thuộc vào từng gia sư. Bạn có thể xem giá của từng gia sư trong phần thông tin chi tiết. Ngoài ra, nền tảng có hệ thống ví điện tử để bạn dễ dàng thanh toán và quản lý tài chính.";
    } else if (lowerMessage.includes("cảm ơn") || lowerMessage.includes("thanks")) {
      return "Không có gì! Tôi rất vui được giúp đỡ bạn. Nếu bạn có thêm câu hỏi nào khác, đừng ngần ngại hỏi tôi nhé! 😊";
    } else if (lowerMessage.includes("xin chào") || lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Xin chào! Rất vui được gặp bạn. Tôi có thể giúp gì cho bạn hôm nay?";
    } else {
      return "Cảm ơn bạn đã hỏi! Tôi hiểu bạn đang quan tâm đến: \"" + userMessage + "\". Để tôi có thể hỗ trợ tốt hơn, bạn có thể:\n\n1. Sử dụng tính năng 'Tìm gia sư' để tìm kiếm gia sư phù hợp\n2. Xem thông tin chi tiết về các gia sư\n3. Liên hệ trực tiếp với gia sư qua tin nhắn\n\nBạn muốn tìm hiểu thêm về điều gì?";
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || isTyping) return;

    if (!user) {
      showError("Lỗi", "Vui lòng đăng nhập để sử dụng AI Chat.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageText("");
    setIsTyping(true);

    try {
      const aiResponse = await simulateAIResponse(userMessage.text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      showError("Lỗi", "Không thể nhận phản hồi từ AI. Vui lòng thử lại.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setMessageText("");
    showSuccess("Thành công", "Đã tạo cuộc trò chuyện mới");
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    setMessages([]);
    setMessageText("");
    showSuccess("Thành công", "Đã xóa lịch sử chat");
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!hasMessages) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F9FAFB] pt-16 flex flex-col">
        <div className="w-full border-b border-[#E5E7EB] bg-white">
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
              <Plus className="w-4 h-4 mr-2" />
              Cuộc trò chuyện mới
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
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

            <div className="relative">
              <form onSubmit={handleSendMessage} className="relative">
                <Input
                  ref={inputRef}
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
                  className="w-full pr-12 h-14 text-base border-[#D1D5DB] focus:border-[#257180] focus:ring-[#257180]"
                />
                <Button
                  type="submit"
                  disabled={isTyping || !messageText.trim()}
                  size="lg"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#257180] hover:bg-[#1e5a66] text-white h-10 w-10 p-0"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F9FAFB] pt-16 flex flex-col overflow-hidden">
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
          <div className="flex items-center gap-2">
            <Button
              onClick={handleNewChat}
              variant="ghost"
              size="sm"
              className="text-[#257180] hover:bg-[#F2E5BF]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Mới
            </Button>
            <Button
              onClick={handleClearChat}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    {!isUser && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#F2E5BF] flex items-center justify-center">
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
                          {msg.text}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                    {isUser && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#257180] flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
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
                    <div className="w-8 h-8 rounded-full bg-[#F2E5BF] flex items-center justify-center">
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
        </ScrollArea>
      </div>

      <div className="w-full border-t border-[#E5E7EB] bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              className="w-full pr-12 h-12 text-base border-[#D1D5DB] focus:border-[#257180] focus:ring-[#257180]"
            />
            <Button
              type="submit"
              disabled={isTyping || !messageText.trim()}
              size="lg"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#257180] hover:bg-[#1e5a66] text-white h-8 w-8 p-0"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
          </p>
        </div>
      </div>
    </div>
  );
}
