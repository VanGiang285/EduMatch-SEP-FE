'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
import { Badge } from '../ui/basic/badge';
import { Button } from '../ui/basic/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/navigation/dropdown-menu';
import { MessageCircle } from 'lucide-react';
import { ScrollArea } from '../ui/layout/scroll-area';
import { mockNavbarMessages } from '@/data/mockNavbarData';

interface MessageDropdownProps {
  onMessageClick?: (messageId: number) => void;
  onViewAll?: () => void;
}

export function MessageDropdown({ onMessageClick, onViewAll }: MessageDropdownProps) {
  const unreadCount = mockNavbarMessages.filter(m => !m.isRead).length;

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
          {mockNavbarMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">Chưa có tin nhắn nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {mockNavbarMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !message.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => onMessageClick?.(message.id)}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={message.tutorAvatar || undefined} alt={message.tutorName} />
                      <AvatarFallback className="bg-[#F2E5BF] text-[#257180]">
                        {message.tutorName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`truncate text-sm ${!message.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {message.tutorName}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm text-gray-600 line-clamp-2 ${
                        !message.isRead ? 'font-medium' : ''
                      }`}>
                        {message.lastMessage}
                      </p>
                    </div>
                    {message.unreadCount > 0 && (
                      <Badge 
                        className="bg-[#257180] text-white h-5 min-w-5 px-1.5 flex-shrink-0 flex items-center justify-center"
                      >
                        {message.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <Button 
            variant="ghost" 
            className="w-full text-[#257180] hover:text-[#1e5a66] hover:bg-gray-100" 
            onClick={onViewAll}
          >
            Xem tất cả tin nhắn
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

