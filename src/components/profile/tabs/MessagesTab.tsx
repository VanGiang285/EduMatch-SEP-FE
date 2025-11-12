"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { MessageCircle, Send, Search, MoreVertical, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { sendMessage, markMessagesAsRead } from '@/services/signalRService';
import { ChatService } from '@/services/chatService';
import { ChatRoomDto, ChatMessageDto } from '@/types/backend';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { FormatService } from '@/lib/format';
export function MessagesTab() {
  const { user } = useAuth();
  const { showError } = useCustomToast();
  const { messages, setMessages, addMessage, isConnected } = useChat();
  const { getUserProfile } = useUserProfiles();
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoomDto[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, { userName?: string; avatarUrl?: string }>>(new Map());
  const [lastMessages, setLastMessages] = useState<Map<number, ChatMessageDto>>(new Map());
  const [conversationMessages, setConversationMessages] = useState<ChatMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const showErrorRef = useRef(showError);
  const currentUserEmail = user?.email || "";
  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current && selectedConversation && conversationMessages.length > 0) {
      setTimeout(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector(
          '[data-radix-scroll-area-viewport]'
        ) as HTMLElement;
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 100);
    }
  }, [conversationMessages, selectedConversation]);
  useEffect(() => {
    if (selectedConversation && messageInputRef.current) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 200);
    }
  }, [selectedConversation]);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);
  const areRoomsDifferent = (prevRooms: ChatRoomDto[], nextRooms: ChatRoomDto[]) => {
    if (prevRooms.length !== nextRooms.length) {
      return true;
    }
    for (let i = 0; i < prevRooms.length; i += 1) {
      const prev = prevRooms[i];
      const next = nextRooms[i];
      if (prev.id !== next.id) {
        return true;
      }
      const prevLast = prev.lastMessage;
      const nextLast = next.lastMessage;
      if (!!prevLast !== !!nextLast) {
        return true;
      }
      if (prevLast && nextLast) {
        if (
          prevLast.id !== nextLast.id ||
          prevLast.isRead !== nextLast.isRead ||
          prevLast.messageText !== nextLast.messageText ||
          prevLast.sentAt !== nextLast.sentAt
        ) {
          return true;
        }
      }
    }
    return false;
  };
  useEffect(() => {
    if (!currentUserEmail) return;
    let isMounted = true;
    const loadChatRooms = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const response = await ChatService.getChatRooms(currentUserEmail);
        if (response.success && response.data) {
          const rooms = Array.isArray(response.data) ? response.data : [];
          if (!isMounted) return;
          setChatRooms((prevRooms) => {
            if (!areRoomsDifferent(prevRooms, rooms)) {
              return prevRooms;
            }
            return rooms;
          });
          const emailsToFetch = new Set<string>();
          rooms.forEach(room => {
            if (room.userEmail === currentUserEmail) {
              if (room.tutor?.userEmail) {
                emailsToFetch.add(room.tutor.userEmail);
              }
            } else {
              if (room.userEmail) {
                emailsToFetch.add(room.userEmail);
              }
            }
          });
          if (emailsToFetch.size > 0) {
            const profilePromises = Array.from(emailsToFetch).map(async (email) => {
              const result = await getUserProfile(email);
              const userName = result?.userName;
              if (result && isMounted) {
                setUserProfiles(prev => {
                  const newMap = new Map(prev);
                  newMap.set(email, {
                    avatarUrl: result.profile.avatarUrl,
                    userName: userName,
                  });
                  return newMap;
                });
              }
            });
            await Promise.all(profilePromises);
          }
          const lastMessagePromises = rooms.map(async (room) => {
            if (room.lastMessage && room.lastMessage.messageText) {
              if (isMounted) {
                setLastMessages(prev => {
                  const newMap = new Map(prev);
                  newMap.set(room.id, room.lastMessage!);
                  return newMap;
                });
              }
              return;
            }
            try {
              const messagesResponse = await ChatService.getMessages(room.id);
              if (messagesResponse.success && messagesResponse.data) {
                const messages = Array.isArray(messagesResponse.data) ? messagesResponse.data : [];
                if (messages.length > 0 && isMounted) {
                  const sortedMessages = [...messages].sort((a, b) => {
                    const timeA = new Date(a.sentAt).getTime();
                    const timeB = new Date(b.sentAt).getTime();
                    return timeB - timeA; 
                  });
                  const lastMsg = sortedMessages[0]; 
                  setLastMessages(prev => {
                    const newMap = new Map(prev);
                    newMap.set(room.id, lastMsg);
                    return newMap;
                  });
                }
              }
            } catch (error) {
              console.error(`Failed to fetch messages for room ${room.id}:`, error);
            }
          });
          await Promise.all(lastMessagePromises);
          if (isMounted) {
            setSelectedConversation((prevSelected) => {
              if (rooms.length === 0) {
                return null;
              }
              const roomIdFromUrl = searchParams.get('roomId');
              if (roomIdFromUrl) {
                const roomId = parseInt(roomIdFromUrl, 10);
                if (!isNaN(roomId) && rooms.some((room) => room.id === roomId)) {
                  return roomId;
                }
              }
              if (prevSelected && rooms.some((room) => room.id === prevSelected)) {
                return prevSelected;
              }
              return rooms[0].id;
            });
          }
        }
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
        if (isMounted) {
          showErrorRef.current("Lỗi", "Không thể tải danh sách phòng chat. Vui lòng thử lại.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadChatRooms();
    return () => {
      isMounted = false;
    };
  }, [currentUserEmail, searchParams]);
  useEffect(() => {
    const roomIdFromUrl = searchParams.get('roomId');
    if (roomIdFromUrl) {
      const roomId = parseInt(roomIdFromUrl, 10);
      if (!isNaN(roomId) && chatRooms.length > 0) {
        const roomExists = chatRooms.some((room) => room.id === roomId);
        if (roomExists && selectedConversation !== roomId) {
          setSelectedConversation(roomId);
        }
      }
    }
  }, [searchParams, chatRooms, selectedConversation]);
  useEffect(() => {
    if (!selectedConversation) {
      setConversationMessages([]);
      return;
    }
    const filtered = messages.filter(msg => msg.chatRoomId === selectedConversation);
    setConversationMessages(filtered);
  }, [messages, selectedConversation]);
  useEffect(() => {
    if (messages.length > 0) {
      const messagesByRoom = new Map<number, ChatMessageDto>();
      messages.forEach(msg => {
        if (msg.chatRoomId) {
          const existing = messagesByRoom.get(msg.chatRoomId);
          if (!existing || new Date(msg.sentAt) > new Date(existing.sentAt)) {
            messagesByRoom.set(msg.chatRoomId, msg);
          }
        }
      });
      setLastMessages(prev => {
        const newMap = new Map(prev);
        messagesByRoom.forEach((msg, roomId) => {
          newMap.set(roomId, msg);
        });
        return newMap;
      });
    }
  }, [messages]);
  useEffect(() => {
    if (!selectedConversation || !currentUserEmail) {
      setConversationMessages([]);
      return;
    }
    let isMounted = true;
    const loadMessages = async () => {
      try {
        const response = await ChatService.getMessages(selectedConversation);
        if (response.success && response.data && isMounted) {
          const messagesData = Array.isArray(response.data) ? response.data : [];
          const messagesWithRoomId = messagesData.map(msg => ({
            ...msg,
            chatRoomId: selectedConversation
          }));
          setMessages(prev => {
            const otherRoomMessages = prev.filter(msg => msg.chatRoomId !== selectedConversation);
            return [...otherRoomMessages, ...messagesWithRoomId];
          });
          if (messagesWithRoomId.length > 0 && isMounted) {
            const sortedMessages = [...messagesWithRoomId].sort((a, b) => {
              const timeA = new Date(a.sentAt).getTime();
              const timeB = new Date(b.sentAt).getTime();
              return timeB - timeA;
            });
            const lastMsg = sortedMessages[0];
            setLastMessages(prev => {
              const newMap = new Map(prev);
              newMap.set(selectedConversation, lastMsg);
              return newMap;
            });
          }
          const room = chatRooms.find(r => r.id === selectedConversation);
          if (room && room.tutor?.userEmail && isMounted) {
            try {
              await markMessagesAsRead(selectedConversation, room.tutor.userEmail);
            } catch (err) {
              console.error("Failed to mark messages as read:", err);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        if (isMounted) {
          showErrorRef.current("Lỗi", "Không thể tải tin nhắn. Vui lòng thử lại.");
        }
      }
    };
    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedConversation, currentUserEmail, chatRooms, setMessages]);
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || sending || !selectedConversation) return;
    if (!currentUserEmail) {
      showErrorRef.current("Lỗi", "Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }
    const room = chatRooms.find(r => r.id === selectedConversation);
    if (!room) {
      showErrorRef.current("Lỗi", "Không tìm thấy phòng chat.");
      return;
    }
    const receiverEmail = room.tutor?.userEmail || "";
    if (!receiverEmail) {
      showErrorRef.current("Lỗi", "Không tìm thấy thông tin người nhận.");
      return;
    }
    setSending(true);
    try {
      await sendMessage(selectedConversation, currentUserEmail, receiverEmail, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error("Failed to send message:", error);
      showErrorRef.current("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
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
                {}
                <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Tìm kiếm theo tên..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  {chatRooms
                    .filter((room) => {
                      if (!searchQuery.trim()) return true;
                      const otherEmail = room.userEmail === currentUserEmail
                        ? (room.tutor?.userEmail || "")
                        : room.userEmail;
                      const profileData = otherEmail ? userProfiles.get(otherEmail) : null;
                      const otherName = profileData?.userName && profileData.userName !== otherEmail && profileData.userName.trim() !== ''
                        ? profileData.userName
                        : (room.userEmail === currentUserEmail
                            ? (room.tutor?.userName && room.tutor.userName !== room.tutor.userEmail && room.tutor.userName.trim() !== ''
                                ? room.tutor.userName
                                : room.tutor?.userEmail || "Gia sư")
                            : (room.user?.userName && room.user.userName !== room.userEmail && room.user.userName.trim() !== ''
                                ? room.user.userName
                                : room.userEmail || "Người dùng"));
                      const searchLower = searchQuery.toLowerCase().trim();
                      return otherName.toLowerCase().includes(searchLower) || 
                             otherEmail.toLowerCase().includes(searchLower);
                    })
                    .map((room) => {
                    const otherEmail = room.userEmail === currentUserEmail
                      ? (room.tutor?.userEmail || "")
                      : room.userEmail;
                    const profileData = otherEmail ? userProfiles.get(otherEmail) : null;
                    const otherName = profileData?.userName && profileData.userName !== otherEmail && profileData.userName.trim() !== ''
                      ? profileData.userName
                      : (room.userEmail === currentUserEmail
                          ? (room.tutor?.userName && room.tutor.userName !== room.tutor.userEmail && room.tutor.userName.trim() !== ''
                              ? room.tutor.userName
                              : room.tutor?.userEmail || "Gia sư")
                          : (room.user?.userName && room.user.userName !== room.userEmail && room.user.userName.trim() !== ''
                              ? room.user.userName
                              : room.userEmail || "Người dùng"));
                    const otherAvatar = (profileData?.avatarUrl && profileData.avatarUrl.trim() !== '')
                      ? profileData.avatarUrl
                      : (room.userEmail === currentUserEmail
                          ? (room.tutor?.avatarUrl && room.tutor.avatarUrl.trim() !== '' ? room.tutor.avatarUrl : null)
                          : (room.user?.userProfile?.avatarUrl && room.user.userProfile.avatarUrl.trim() !== '' ? room.user.userProfile.avatarUrl : null));
                    const lastMessage = lastMessages.get(room.id) || room.lastMessage;
                    const unreadCount = lastMessage && !lastMessage.isRead && lastMessage.receiverEmail === currentUserEmail ? 1 : 0;
                    return (
                      <div
                        key={room.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation === room.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedConversation(room.id);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2E5BF]">
                              {otherAvatar ? (
                                <img 
                                  src={otherAvatar} 
                                  alt={otherName}
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
                                className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold text-[#257180] bg-[#F2E5BF] ${otherAvatar ? 'hidden' : 'flex'}`}
                                style={{ display: otherAvatar ? 'none' : 'flex' }}
                              >
                                {otherName ? otherName.slice(0, 2).toUpperCase() : 'GS'}
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`truncate ${unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                                {otherName}
                              </p>
                              {lastMessage && lastMessage.sentAt ? (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {FormatService.formatTime(lastMessage.sentAt)}
                                </span>
                              ) : null}
                            </div>
                            {lastMessage && lastMessage.messageText ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                {lastMessage.senderEmail === currentUserEmail ? (
                                  <ArrowRight className="h-3 w-3 text-[#257180] flex-shrink-0" />
                                ) : (
                                  <ArrowLeft className="h-3 w-3 text-[#FD8B51] flex-shrink-0" />
                                )}
                                <p className={`text-sm text-gray-600 truncate flex-1 ${
                                  unreadCount > 0 ? 'font-medium' : ''
                                }`}>
                                  {lastMessage.senderEmail === currentUserEmail 
                                    ? `Bạn: ${lastMessage.messageText}`
                                    : lastMessage.messageText}
                                </p>
                                {unreadCount > 0 && (
                                  <Badge 
                                    variant="default" 
                                    className="bg-[#257180] text-white h-5 min-w-5 px-1.5 text-xs flex-shrink-0"
                                  >
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-end mt-1">
                                {unreadCount > 0 && (
                                  <Badge 
                                    variant="default" 
                                    className="bg-[#257180] text-white h-5 min-w-5 px-1.5 text-xs"
                                  >
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
          {}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 h-full">
                    <div className="space-y-4">
                      {conversationMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                      ) : (
                        conversationMessages.map((msg) => {
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
                </div>
                {}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      ref={messageInputRef}
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
