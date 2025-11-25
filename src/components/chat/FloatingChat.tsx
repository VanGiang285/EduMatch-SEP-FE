"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/basic/button";
import { Input } from "@/components/ui/form/input";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { Card } from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/basic/badge";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { sendMessage, markMessagesAsRead } from "@/services/signalRService";
import { ChatService } from "@/services/chatService";
import { ChatRoomDto, ChatMessageDto } from "@/types/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useChatContext } from "@/contexts/ChatContext";
import { useCustomToast } from "@/hooks/useCustomToast";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { FormatService } from "@/lib/format";
import { USER_ROLES } from "@/constants";
export function FloatingChat() {
  const { isFloatingChatOpen, setIsFloatingChatOpen, selectedRoomId, setSelectedRoomId } = useChatContext();
  const { user } = useAuth();
  const { getUserProfile } = useUserProfiles();
  const { showError } = useCustomToast();
  const { messages, setMessages, addMessage, isConnected } = useChat();
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoomDto[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, { avatarUrl?: string; userName?: string }>>(new Map());
  const [lastMessages, setLastMessages] = useState<Map<number, ChatMessageDto>>(new Map());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [roomMessages, setRoomMessages] = useState<ChatMessageDto[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const showErrorRef = useRef(showError);
  const currentUserEmail = user?.email || "";
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);
  useEffect(() => {
    if (!isMinimized && selectedRoom && roomMessages.length > 0) {
      setTimeout(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector(
          '[data-radix-scroll-area-viewport]'
        ) as HTMLElement;
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 100);
    }
  }, [roomMessages, isMinimized, selectedRoom]);
  useEffect(() => {
    if (!currentUserEmail) return;
    let isMounted = true;
    const loadChatRooms = async () => {
      setLoading(true);
      try {
        const response = await ChatService.getChatRooms(currentUserEmail);
        if (response.success && response.data) {
          const rooms = Array.isArray(response.data) ? response.data : [];
          if (isMounted) {
            setChatRooms(rooms);
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
                if (isMounted && result) {
                  setUserProfiles(prev => {
                    const newMap = new Map(prev);
                    newMap.set(email, {
                      avatarUrl: result.profile?.avatarUrl,
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
            if (rooms.length > 0) {
              if (selectedRoomId && rooms.some(r => r.id === selectedRoomId)) {
                setSelectedRoom(selectedRoomId);
                setSelectedRoomId(null); 
              } else if (!selectedRoom) {
                setSelectedRoom(rooms[0].id);
              }
            }
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
  }, [currentUserEmail, selectedRoomId, setSelectedRoomId, getUserProfile]);
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
    if (!selectedRoom) {
      setRoomMessages([]);
      return;
    }
    const filtered = messages.filter(msg => msg.chatRoomId === selectedRoom);
    setRoomMessages(filtered);
  }, [messages, selectedRoom]);
  useEffect(() => {
    if (!selectedRoom || !currentUserEmail) {
      setMessages([]);
      setRoomMessages([]);
      return;
    }
    const loadMessages = async () => {
      try {
        const response = await ChatService.getMessages(selectedRoom);
        if (response.success && response.data) {
          const messagesData = Array.isArray(response.data) ? response.data : [];
          const messagesWithRoomId = messagesData.map(msg => ({
            ...msg,
            chatRoomId: selectedRoom
          }));
          setMessages(prev => {
            const otherRoomMessages = prev.filter(msg => msg.chatRoomId !== selectedRoom);
            return [...otherRoomMessages, ...messagesWithRoomId];
          });
          if (messagesWithRoomId.length > 0) {
            const sortedMessages = [...messagesWithRoomId].sort((a, b) => {
              const timeA = new Date(a.sentAt).getTime();
              const timeB = new Date(b.sentAt).getTime();
              return timeB - timeA;
            });
            const lastMsg = sortedMessages[0];
            setLastMessages(prev => {
              const newMap = new Map(prev);
              newMap.set(selectedRoom, lastMsg);
              return newMap;
            });
          }
          const room = chatRooms.find(r => r.id === selectedRoom);
          if (room && currentUserEmail) {
            try {
              await markMessagesAsRead(selectedRoom, currentUserEmail);
              setMessages(prev => prev.map(msg => {
                if (msg.chatRoomId === selectedRoom && msg.receiverEmail === currentUserEmail && !msg.isRead) {
                  return { ...msg, isRead: true };
                }
                return msg;
              }));
              setLastMessages(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(selectedRoom);
                if (existing && existing.receiverEmail === currentUserEmail && !existing.isRead) {
                  newMap.set(selectedRoom, { ...existing, isRead: true });
                }
                return newMap;
              });
            } catch (err) {
              console.error("Failed to mark messages as read:", err);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        showErrorRef.current("Lỗi", "Không thể tải tin nhắn. Vui lòng thử lại.");
      }
    };
    loadMessages();
  }, [selectedRoom, currentUserEmail, chatRooms, setMessages]);
  useEffect(() => {
    if (selectedRoom && isFloatingChatOpen && !isMinimized && messageInputRef.current) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 200);
    }
  }, [selectedRoom, isFloatingChatOpen, isMinimized]);
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || sending || !selectedRoom) return;
    if (!currentUserEmail) {
      showErrorRef.current("Lỗi", "Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }
    const room = chatRooms.find(r => r.id === selectedRoom);
    if (!room) {
      showErrorRef.current("Lỗi", "Không tìm thấy phòng chat.");
      return;
    }
    const receiverEmail = room.userEmail === currentUserEmail 
      ? (room.tutor?.userEmail || "")
      : room.userEmail;
    if (!receiverEmail) {
      showErrorRef.current("Lỗi", "Không tìm thấy thông tin người nhận.");
      return;
    }
    const messageContent = messageText.trim();
    setSending(true);
    
    // Optimistic update: Add temporary message immediately
    // Use negative ID to easily identify temporary messages
    const tempMessage: ChatMessageDto = {
      id: -Date.now(), // Negative ID for temporary messages
      chatRoomId: selectedRoom,
      senderEmail: currentUserEmail,
      receiverEmail: receiverEmail,
      messageText: messageContent,
      sentAt: new Date().toISOString(), // Use current local time, will be replaced by server response
      isRead: false,
    };
    addMessage(tempMessage);
    setMessageText("");
    
    try {
      await sendMessage(selectedRoom, currentUserEmail, receiverEmail, messageContent);
      // Message will be replaced by the real one from server via SignalR
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessageText(messageContent); // Restore message text
      showErrorRef.current("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };
  const handleToggle = () => {
    if (isFloatingChatOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsFloatingChatOpen(true);
      setIsMinimized(false);
    }
  };
  const handleClose = () => {
    setIsFloatingChatOpen(false);
    setIsMinimized(false);
    setSelectedRoom(null);
    setMessages([]);
  };
  const currentRoom = chatRooms.find(r => r.id === selectedRoom);
  const otherEmail = currentRoom
    ? (currentRoom.userEmail === currentUserEmail
        ? (currentRoom.tutor?.userEmail || "")
        : currentRoom.userEmail)
    : "";
  const profileData = otherEmail ? userProfiles.get(otherEmail) : null;
  const displayName = currentRoom
    ? (profileData?.userName && profileData.userName !== otherEmail && profileData.userName.trim() !== ''
        ? profileData.userName
        : (currentRoom.userEmail === currentUserEmail
            ? (currentRoom.tutor?.userName && currentRoom.tutor.userName !== currentRoom.tutor.userEmail && currentRoom.tutor.userName.trim() !== ''
                ? currentRoom.tutor.userName
                : currentRoom.tutor?.userEmail || "Gia sư")
            : (currentRoom.user?.userName && currentRoom.user.userName !== currentRoom.userEmail && currentRoom.user.userName.trim() !== ''
                ? currentRoom.user.userName
                : currentRoom.userEmail || "Người dùng")))
    : "";
  const displayAvatar = (profileData?.avatarUrl && profileData.avatarUrl.trim() !== '') 
    ? profileData.avatarUrl
    : (currentRoom
        ? (currentRoom.userEmail === currentUserEmail
            ? (currentRoom.tutor?.avatarUrl && currentRoom.tutor.avatarUrl.trim() !== '' ? currentRoom.tutor.avatarUrl : null)
            : (currentRoom.user?.userProfile?.avatarUrl && currentRoom.user.userProfile.avatarUrl.trim() !== '' ? currentRoom.user.userProfile.avatarUrl : null))
        : null);
  if (!user || (user.role !== USER_ROLES.LEARNER && user.role !== USER_ROLES.TUTOR)) {
    return null;
  }
  if (!isFloatingChatOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggle}
          size="lg"
          className="rounded-full w-14 h-14 bg-[#257180] hover:bg-[#257180]/90 text-white shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80">
        <Card className="shadow-2xl border border-gray-200">
          <div className="p-3 flex items-center justify-between bg-[#257180] text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#F2E5BF] border-2 border-white/30 flex-shrink-0">
                      {displayAvatar ? (
                        <img 
                          src={displayAvatar} 
                          alt={displayName} 
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
                        className={`w-full h-full rounded-lg flex items-center justify-center text-[10px] font-bold text-[#257180] bg-[#F2E5BF] ${displayAvatar ? 'hidden' : 'flex'}`}
                        style={{ display: displayAvatar ? 'none' : 'flex' }}
                      >
                        {displayName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
              <span className="font-semibold text-base">{displayName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={handleToggle}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div 
      className="fixed bottom-6 right-6 z-50 w-[700px] h-[600px] flex flex-col"
      onWheel={(e) => {
        const target = e.currentTarget;
        const scrollContainer = target.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          const isAtTop = scrollTop === 0;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
          if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
            e.stopPropagation();
          }
        }
      }}
    >
      <Card className="shadow-2xl border border-gray-200 flex flex-col h-full overflow-hidden rounded-lg gap-0">
        {}
        <div className="p-4 flex items-center justify-between bg-[#257180] text-white flex-shrink-0 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F2E5BF] border-2 border-white/30 flex-shrink-0">
              {displayAvatar ? (
                <img 
                  src={displayAvatar} 
                  alt={displayName} 
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
                className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-bold text-[#257180] bg-[#F2E5BF] ${displayAvatar ? 'hidden' : 'flex'}`}
                style={{ display: displayAvatar ? 'none' : 'flex' }}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <p className="font-semibold text-base">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleToggle}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {}
        <div className="flex-1 flex overflow-hidden bg-white min-h-0">
          {}
          <div className="w-[220px] border-r border-gray-200 flex flex-col bg-gray-50">
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#257180]" />
                </div>
              ) : chatRooms.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chưa có cuộc trò chuyện</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {chatRooms.map((room) => {
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
                        className={`p-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                          selectedRoom === room.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (room.id !== selectedRoom) {
                            setSelectedRoom(room.id);
                          }
                        }}
                      >
                        <div className="flex gap-2">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F2E5BF] border-2 border-gray-200 flex-shrink-0">
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
                              className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-bold text-[#257180] bg-[#F2E5BF] ${otherAvatar ? 'hidden' : 'flex'}`}
                              style={{ display: otherAvatar ? 'none' : 'flex' }}
                            >
                              {otherName.slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className={`text-sm font-medium truncate ${unreadCount > 0 ? 'font-semibold' : ''}`}>
                                  {otherName}
                                </p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {lastMessage && lastMessage.sentAt ? (
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                      {FormatService.formatTime(lastMessage.sentAt)}
                                    </span>
                                  ) : null}
                                  {unreadCount > 0 && (
                                    <Badge className="bg-[#257180] text-white h-4 min-w-4 px-1 text-xs">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {lastMessage && lastMessage.messageText ? (
                                <div className="flex items-center gap-1 mt-0.5">
                                  {lastMessage.senderEmail === currentUserEmail ? (
                                    <ArrowRight className="h-3 w-3 text-[#257180] flex-shrink-0" />
                                  ) : (
                                    <ArrowLeft className="h-3 w-3 text-[#FD8B51] flex-shrink-0" />
                                  )}
                                  <p className={`text-xs text-gray-500 truncate flex-1 ${
                                    unreadCount > 0 ? 'font-medium' : ''
                                  }`}>
                                    {lastMessage.senderEmail === currentUserEmail 
                                      ? `Bạn: ${lastMessage.messageText}`
                                      : lastMessage.messageText}
                                  </p>
                                </div>
                              ) : null}
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
          <div className="flex-1 flex flex-col bg-white">
            {selectedRoom ? (
              <>
                {}
                <div className="flex-1 overflow-hidden flex flex-col bg-white min-h-0">
                  <ScrollArea 
                    ref={scrollAreaRef} 
                    className="flex-1 p-4 bg-white h-full"
                    onWheel={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div className="space-y-3">
                      {roomMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <MessageCircle className="h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-base text-gray-500">Chưa có tin nhắn nào</p>
                        </div>
                      ) : (
                        roomMessages.map((msg) => {
                          const isMine = msg.senderEmail === currentUserEmail;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[75%] ${isMine ? 'order-2' : 'order-1'}`}>
                                <div
                                  className={`rounded-lg px-3 py-2 ${
                                    isMine
                                      ? 'bg-[#257180] text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <p className="text-base break-words">{msg.messageText}</p>
                                </div>
                                <p className={`text-xs text-gray-400 mt-0.5 ${
                                  isMine ? 'text-right' : 'text-left'
                                }`}>
                                  {FormatService.formatTime(msg.sentAt)}
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
                <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
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
                      className="text-base"
                    />
                    <Button
                      type="submit"
                      disabled={sending || !messageText.trim() || !isConnected}
                      size="sm"
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
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-base text-gray-500">Chọn một cuộc trò chuyện</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
