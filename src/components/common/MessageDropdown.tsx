'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
import { Badge } from '../ui/basic/badge';
import { Button } from '../ui/basic/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/navigation/dropdown-menu';
import { MessageCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '../ui/layout/scroll-area';
import { ChatService } from '@/services/chatService';
import { ChatRoomDto, ChatMessageDto } from '@/types/backend';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { FormatService } from '@/lib/format';
import { useChatContext } from '@/contexts/ChatContext';
interface MessageDropdownProps {
  onMessageClick?: (roomId: number) => void;
  onViewAll?: () => void;
}
export function MessageDropdown({ onMessageClick, onViewAll }: MessageDropdownProps) {
  const { user } = useAuth();
  const { getUserProfile } = useUserProfiles();
  const { openChatWithTutor } = useChatContext();
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoomDto[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, { avatarUrl?: string; userName?: string }>>(new Map());
  const [lastMessages, setLastMessages] = useState<Map<number, ChatMessageDto>>(new Map());
  const [loading, setLoading] = useState(true);
  const currentUserEmail = user?.email || "";
  useEffect(() => {
    if (!currentUserEmail) {
      setLoading(false);
      return;
    }
    const loadChatRooms = async () => {
      setLoading(true);
      try {
        const response = await ChatService.getChatRooms(currentUserEmail);
        if (response.success && response.data) {
          const rooms = Array.isArray(response.data) ? response.data : [];
          console.log('📨 MessageDropdown - Chat rooms loaded:', rooms);
          console.log('📨 MessageDropdown - First room lastMessage:', rooms[0]?.lastMessage);
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
              if (result) {
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
              setLastMessages(prev => {
                const newMap = new Map(prev);
                newMap.set(room.id, room.lastMessage!);
                return newMap;
              });
              return;
            }
            try {
              const messagesResponse = await ChatService.getMessages(room.id);
              if (messagesResponse.success && messagesResponse.data) {
                const messages = Array.isArray(messagesResponse.data) ? messagesResponse.data : [];
                if (messages.length > 0) {
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
        }
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    loadChatRooms();
  }, [currentUserEmail, getUserProfile]);
  const unreadCount = chatRooms.reduce((count, room) => {
    const lastMessage = room.lastMessage;
    if (lastMessage && !lastMessage.isRead && lastMessage.receiverEmail === currentUserEmail) {
      return count + 1;
    }
    return count;
  }, 0);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all">
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 bg-white border border-[#FD8B51]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Tin nhắn</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {unreadCount} chưa đọc
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-8 w-8 text-gray-400 mb-3 animate-spin" />
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">Chưa có tin nhắn nào</p>
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
                const isUnread = lastMessage && !lastMessage.isRead && lastMessage.receiverEmail === currentUserEmail;
                const unreadCount = isUnread ? 1 : 0;
                return (
                  <div
                    key={room.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isUnread ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/profile?tab=messages&roomId=${room.id}`);
                      setTimeout(() => {
                        onMessageClick?.(room.id);
                      }, 100);
                    }}
                  >
                    <div className="flex gap-3">
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
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`truncate text-sm ${isUnread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {otherName}
                          </p>
                          {lastMessage && lastMessage.sentAt ? (
                            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
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
                            <p className={`text-sm text-gray-600 line-clamp-2 flex-1 ${
                              isUnread ? 'font-medium' : ''
                            }`}>
                              {lastMessage.senderEmail === currentUserEmail 
                                ? `Bạn: ${lastMessage.messageText}`
                                : lastMessage.messageText}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic mt-1">Chưa có tin nhắn</p>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <Badge 
                          className="bg-[#257180] text-white h-5 min-w-5 px-1.5 flex-shrink-0 flex items-center justify-center"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <Button 
            variant="ghost" 
            className="w-full text-[#257180] hover:text-[#1e5a66] hover:bg-gray-100" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push('/profile?tab=messages');
              setTimeout(() => {
                onViewAll?.();
              }, 100);
            }}
          >
            Xem tất cả tin nhắn
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
