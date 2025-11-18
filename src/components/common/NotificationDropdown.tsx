'use client';
import React, { useState, useRef } from 'react';
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
  MessageCircle, 
  Users,
  BookOpen,
  Settings
} from 'lucide-react';
import { ScrollArea } from '../ui/layout/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationDto } from '@/types/backend';
import { useRouter } from 'next/navigation';

interface NotificationDropdownProps {
  onNotificationClick?: (notificationId: number) => void;
  onViewAll?: () => void;
  onMarkAllRead?: () => void;
}

// Helper function to determine notification type from linkUrl or message
const getNotificationType = (notification: NotificationDto): string => {
  if (notification.linkUrl) {
    if (notification.linkUrl.includes('classRequest') || notification.linkUrl.includes('class-request')) {
      return 'class_request';
    }
    if (notification.linkUrl.includes('tutorApplication') || notification.linkUrl.includes('tutor-application')) {
      return 'tutor_application';
    }
    if (notification.linkUrl.includes('wallet') || notification.linkUrl.includes('payment')) {
      return 'payment';
    }
    if (notification.linkUrl.includes('message') || notification.linkUrl.includes('chat')) {
      return 'message';
    }
  }
  // Default to system if cannot determine
  return 'system';
};

// Helper function to extract title from message (first line or first 50 chars)
const getNotificationTitle = (message: string): string => {
  const firstLine = message.split('\n')[0];
  if (firstLine.length > 50) {
    return firstLine.substring(0, 50) + '...';
  }
  return firstLine;
};

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
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications(true, 10);
  
  // Swipe state for delete functionality
  const [swipeStates, setSwipeStates] = useState<Record<number, { startX: number; currentX: number; isDragging: boolean }>>({});

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

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      if (onMarkAllRead) {
        onMarkAllRead();
      }
    } catch (error) {
      // Error already handled in hook
    }
  };

  // Handle view all - navigate to profile notifications tab
  const handleViewAll = () => {
    router.push('/profile?tab=notifications');
    if (onViewAll) {
      onViewAll();
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: NotificationDto) => {
    if (onNotificationClick) {
      onNotificationClick(notification.id);
    }
    // Navigate if has linkUrl
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  };

  // Handle hover - mark as read if unread
  const handleMouseEnter = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  // Swipe to delete handlers
  const handleMouseDown = (e: React.MouseEvent, notificationId: number) => {
    const startX = e.clientX;
    setSwipeStates(prev => ({
      ...prev,
      [notificationId]: { startX, currentX: startX, isDragging: true }
    }));
  };

  const handleMouseMove = (e: React.MouseEvent, notificationId: number) => {
    const state = swipeStates[notificationId];
    if (state?.isDragging) {
      const currentX = e.clientX;
      const diffX = currentX - state.startX;
      
      // Only allow swipe right (positive diffX)
      if (diffX > 0) {
        setSwipeStates(prev => ({
          ...prev,
          [notificationId]: { ...prev[notificationId], currentX }
        }));
      }
    }
  };

  const handleMouseUp = async (notificationId: number) => {
    const state = swipeStates[notificationId];
    if (state) {
      const diffX = state.currentX - state.startX;
      // If swiped more than 100px to the right, delete
      if (diffX > 100) {
        try {
          await deleteNotification(notificationId);
        } catch (error) {
          // Error already handled in hook
        }
      }
      // Reset swipe state
      setSwipeStates(prev => {
        const newState = { ...prev };
        delete newState[notificationId];
        return newState;
      });
    }
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
              onClick={handleMarkAllRead}
              className="text-xs text-[#257180] hover:text-[#1e5a66] hover:bg-gray-100"
              disabled={loading}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#257180] mb-3"></div>
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const type = getNotificationType(notification);
                const title = getNotificationTitle(notification.message);
                const swipeState = swipeStates[notification.id];
                const swipeOffset = swipeState ? Math.max(0, swipeState.currentX - swipeState.startX) : 0;

                return (
                  <div
                    key={notification.id}
                    className={`relative p-4 hover:bg-gray-50 cursor-pointer transition-all ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter(notification)}
                    onMouseDown={(e) => handleMouseDown(e, notification.id)}
                    onMouseMove={(e) => handleMouseMove(e, notification.id)}
                    onMouseUp={() => handleMouseUp(notification.id)}
                    onMouseLeave={() => {
                      // Reset swipe if mouse leaves
                      if (swipeStates[notification.id]) {
                        setSwipeStates(prev => {
                          const newState = { ...prev };
                          delete newState[notification.id];
                          return newState;
                        });
                      }
                    }}
                    style={{
                      transform: swipeOffset > 0 ? `translateX(${Math.min(swipeOffset, 100)}px)` : 'translateX(0)',
                      transition: swipeState?.isDragging ? 'none' : 'transform 0.2s ease-out'
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {title}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-[#257180] rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatNotificationDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    {swipeOffset > 50 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 text-sm font-medium">
                        Xóa
                      </div>
                    )}
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
            onClick={handleViewAll}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
