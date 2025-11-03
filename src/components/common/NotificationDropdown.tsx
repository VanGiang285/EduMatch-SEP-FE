'use client';
import React from 'react';
import { Badge } from '../ui/basic/badge';
import { Button } from '../ui/basic/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/navigation/dropdown-menu';
import { 
  Bell, 
  Wallet, 
  Calendar, 
  MessageCircle, 
  Users,
  BookOpen,
  Settings
} from 'lucide-react';
import { ScrollArea } from '../ui/layout/scroll-area';
import { mockNavbarNotifications } from '@/data/mockNavbarData';

interface NotificationDropdownProps {
  onNotificationClick?: (notificationId: number) => void;
  onViewAll?: () => void;
  onMarkAllRead?: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'class_request':
      return <BookOpen className="h-5 w-5 text-[#257180]" />;
    case 'tutor_application':
      return <Users className="h-5 w-5 text-[#FD8B51]" />;
    case 'payment':
      return <Wallet className="h-5 w-5 text-green-600" />;
    case 'message':
      return <MessageCircle className="h-5 w-5 text-blue-600" />;
    case 'system':
      return <Settings className="h-5 w-5 text-gray-600" />;
    default:
      return <Bell className="h-5 w-5 text-gray-600" />;
  }
};

export function NotificationDropdown({ 
  onNotificationClick, 
  onViewAll,
  onMarkAllRead 
}: NotificationDropdownProps) {
  const unreadCount = mockNavbarNotifications.filter(n => !n.isRead).length;

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-[#257180] text-white border-0"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 bg-white border border-[#FD8B51]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {unreadCount} mới
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onMarkAllRead}
              className="text-xs text-[#257180] hover:text-[#1e5a66] hover:bg-gray-100"
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[500px]">
          {mockNavbarNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {mockNavbarNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => onNotificationClick?.(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-[#257180] rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    </div>
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
            Xem tất cả thông báo
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

