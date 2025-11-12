"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback/dialog";
import { Button } from "@/components/ui/basic/button";
import { Input } from "@/components/ui/form/input";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { sendMessage, markMessagesAsRead } from "@/services/signalRService";
import { ChatService } from "@/services/chatService";
import { ChatRoomDto, ChatMessageDto } from "@/types/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomToast } from "@/hooks/useCustomToast";
import { FormatService } from "@/lib/format";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorId: number;
  tutorEmail: string;
  tutorName?: string;
  tutorAvatar?: string;
}

export function ChatModal({
  open,
  onOpenChange,
  tutorId,
  tutorEmail,
  tutorName,
  tutorAvatar,
}: ChatModalProps) {
  const { user } = useAuth();
  const { showError, showSuccess } = useCustomToast();
  const { messages, setMessages, addMessage, isConnected } = useChat();
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoomDto | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentUserEmail = user?.email || "";

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Load chat room and messages when modal opens
  useEffect(() => {
    if (!open || !currentUserEmail) return;

    let isMounted = true;

    const loadChatRoom = async () => {
      setLoading(true);
      try {
        // Get all chat rooms for current user
        const roomsResponse = await ChatService.getChatRooms(currentUserEmail);
        
        if (!isMounted) return;

        // Debug: Log response structure
        if (process.env.NODE_ENV === 'development') {
          console.log('Chat rooms response:', roomsResponse);
          console.log('Response data type:', typeof roomsResponse.data);
          console.log('Is array:', Array.isArray(roomsResponse.data));
        }

        if (roomsResponse.success && roomsResponse.data) {
          // Ensure data is an array
          const rooms = Array.isArray(roomsResponse.data) 
            ? roomsResponse.data 
            : [];
          
          // Find room with this tutor
          const room = rooms.find(
            (r) => r.tutorId === tutorId
          );

          if (room) {
            setChatRoom(room);
            // Load messages for this room
            const messagesResponse = await ChatService.getMessages(room.id);
            if (messagesResponse.success && messagesResponse.data) {
              const messages = Array.isArray(messagesResponse.data)
                ? messagesResponse.data
                : [];
              setMessages(messages);
              // Mark messages as read
              if (room.id && tutorEmail) {
                try {
                  await markMessagesAsRead(room.id, tutorEmail);
                } catch (err) {
                  console.error("Failed to mark messages as read:", err);
                }
              }
            }
          } else {
            // Room doesn't exist yet, will be created when first message is sent
            setChatRoom(null);
            setMessages([]);
          }
        } else {
          // No rooms found or response failed
          setChatRoom(null);
          setMessages([]);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load chat room:", error);
        showError("Lỗi", "Không thể tải phòng chat. Vui lòng thử lại.");
        setChatRoom(null);
        setMessages([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChatRoom();

    return () => {
      isMounted = false;
    };
  }, [open, currentUserEmail, tutorId, tutorEmail, setMessages, showError]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setChatRoom(null);
      setMessageText("");
    }
  }, [open, setMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || sending) return;
    if (!currentUserEmail) {
      showError("Lỗi", "Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }

    setSending(true);
    try {
      // If room doesn't exist, we'll use tutorId as roomId temporarily
      // Backend should create the room when first message is sent
      // For now, we'll use 0 or a placeholder - backend should handle room creation
      const roomId = chatRoom?.id || 0;

      // Send message via SignalR
      // Note: Backend should create room automatically if it doesn't exist
      await sendMessage(roomId, tutorEmail, messageText.trim());

      // Optimistically add message to UI
      // The actual message will come back via SignalR ReceiveMessage event
      const tempMessage: ChatMessageDto = {
        id: Date.now(), // Temporary ID
        chatRoomId: roomId,
        senderEmail: currentUserEmail,
        receiverEmail: tutorEmail,
        messageText: messageText.trim(),
        sentAt: new Date().toISOString(),
        isRead: false,
      };
      addMessage(tempMessage);

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
      showError("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const displayName = tutorName || tutorEmail || "Gia sư";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl h-[600px] flex flex-col p-0"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F2E5BF]">
                {tutorAvatar ? (
                  <img
                    src={tutorAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback =
                        e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-bold text-[#257180] bg-[#F2E5BF] ${
                    tutorAvatar ? "hidden" : "flex"
                  }`}
                  style={{ display: tutorAvatar ? "none" : "flex" }}
                >
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">{displayName}</DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {isConnected ? "Đang hoạt động" : "Đang kết nối..."}
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Realtime conversation with tutor {displayName}
        </DialogDescription>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[#257180]" />
            </div>
          ) : (
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderEmail === currentUserEmail;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] ${isMine ? "order-2" : "order-1"}`}>
                          <div
                            className={`rounded-lg p-3 ${
                              isMine
                                ? "bg-[#257180] text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm break-words">{msg.messageText}</p>
                          </div>
                          <p
                            className={`text-xs text-gray-500 mt-1 ${
                              isMine ? "text-right" : "text-left"
                            }`}
                          >
                            {FormatService.formatDateTime(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Nhập tin nhắn..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sending || !isConnected}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sending || !messageText.trim() || !isConnected}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

