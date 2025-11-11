"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { MessageCircle, Send, Search, MoreVertical, Loader2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { sendMessage, markMessagesAsRead } from '@/services/signalRService';
import { ChatService } from '@/services/chatService';
import { ChatRoomDto, ChatMessageDto } from '@/types/backend';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomToast } from '@/hooks/useCustomToast';
import { FormatService } from '@/lib/format';

export function MessagesTab() {
  const { user } = useAuth();
  const { showError } = useCustomToast();
  const { messages, setMessages, addMessage, isConnected } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoomDto[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load chat rooms
  useEffect(() => {
    if (!currentUserEmail) return;

    const loadChatRooms = async () => {
      setLoading(true);
      try {
        const response = await ChatService.getChatRooms(currentUserEmail);
        if (response.success && response.data) {
          // Ensure data is an array
          const rooms = Array.isArray(response.data) ? response.data : [];
          setChatRooms(rooms);
          if (rooms.length > 0 && !selectedConversation) {
            setSelectedConversation(rooms[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
        showError("Lỗi", "Không thể tải danh sách phòng chat. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadChatRooms();
  }, [currentUserEmail, showError]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !currentUserEmail) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const response = await ChatService.getMessages(selectedConversation);
        if (response.success && response.data) {
          setMessages(response.data || []);
          
          // Mark messages as read
          const room = chatRooms.find(r => r.id === selectedConversation);
          if (room && room.tutor?.userEmail) {
            try {
              await markMessagesAsRead(selectedConversation, room.tutor.userEmail);
            } catch (err) {
              console.error("Failed to mark messages as read:", err);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        showError("Lỗi", "Không thể tải tin nhắn. Vui lòng thử lại.");
      }
    };

    loadMessages();
  }, [selectedConversation, currentUserEmail, chatRooms, setMessages, showError]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || sending || !selectedConversation) return;
    if (!currentUserEmail) {
      showError("Lỗi", "Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }

    const room = chatRooms.find(r => r.id === selectedConversation);
    if (!room) {
      showError("Lỗi", "Không tìm thấy phòng chat.");
      return;
    }

    const receiverEmail = room.tutor?.userEmail || "";
    if (!receiverEmail) {
      showError("Lỗi", "Không tìm thấy thông tin người nhận.");
      return;
    }

    setSending(true);
    try {
      await sendMessage(selectedConversation, receiverEmail, messageText.trim());
      
      // Optimistically add message
      const tempMessage: ChatMessageDto = {
        id: Date.now(),
        chatRoomId: selectedConversation,
        senderEmail: currentUserEmail,
        receiverEmail: receiverEmail,
        messageText: messageText.trim(),
        sentAt: new Date().toISOString(),
        isRead: false,
      };
      addMessage(tempMessage);
      
      setMessageText('');
    } catch (error) {
      console.error("Failed to send message:", error);
      showError("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Tin nhắn</h2>
        <p className="text-gray-600 mt-1">Trò chuyện với gia sư</p>
      </div>

      <Card className="h-[600px] border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-0 h-full flex">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Tìm kiếm..." 
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#257180]" />
                </div>
              ) : chatRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {chatRooms.map((room) => {
                    const tutorName = room.tutor?.userName || room.tutor?.userEmail || "Gia sư";
                    const tutorAvatar = room.tutor?.avatarUrl;
                    const lastMessage = room.lastMessage;
                    const unreadCount = lastMessage && !lastMessage.isRead && lastMessage.receiverEmail === currentUserEmail ? 1 : 0;
                    
                    return (
                      <div
                        key={room.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation === room.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedConversation(room.id)}
                      >
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2E5BF]">
                              {tutorAvatar ? (
                                <img 
                                  src={tutorAvatar} 
                                  alt={tutorName}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold text-[#257180] bg-[#F2E5BF] ${tutorAvatar ? 'hidden' : 'flex'}`}
                                style={{ display: tutorAvatar ? 'none' : 'flex' }}
                              >
                                {tutorName ? tutorName.slice(0, 2).toUpperCase() : 'GS'}
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`truncate ${unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                                {tutorName}
                              </p>
                              {lastMessage && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {FormatService.formatTime(lastMessage.sentAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm text-gray-600 truncate ${
                                unreadCount > 0 ? 'font-medium' : ''
                              }`}>
                                {lastMessage?.messageText || "Chưa có tin nhắn"}
                              </p>
                              {unreadCount > 0 && (
                                <Badge 
                                  variant="default" 
                                  className="bg-[#257180] text-white h-5 min-w-5 px-1.5 text-xs"
                                >
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F2E5BF]">
                        {(() => {
                          const room = chatRooms.find(r => r.id === selectedConversation);
                          const tutorAvatar = room?.tutor?.avatarUrl;
                          const tutorName = room?.tutor?.userName || room?.tutor?.userEmail || "Gia sư";
                          return (
                            <>
                              {tutorAvatar ? (
                                <img 
                                  src={tutorAvatar} 
                                  alt={tutorName}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-bold text-[#257180] bg-[#F2E5BF] ${tutorAvatar ? 'hidden' : 'flex'}`}
                                style={{ display: tutorAvatar ? 'none' : 'flex' }}
                              >
                                {tutorName ? tutorName.slice(0, 2).toUpperCase() : 'GS'}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {chatRooms.find(r => r.id === selectedConversation)?.tutor?.userName || 
                         chatRooms.find(r => r.id === selectedConversation)?.tutor?.userEmail || 
                         "Gia sư"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isConnected ? "Đang hoạt động" : "Đang kết nối..."}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.senderEmail === currentUserEmail;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-lg p-3 ${
                                  isMine
                                    ? 'bg-[#257180] text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm break-words">{msg.messageText}</p>
                              </div>
                              <p className={`text-xs text-gray-500 mt-1 ${
                                isMine ? 'text-right' : 'text-left'
                              }`}>
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

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sending || !isConnected}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
