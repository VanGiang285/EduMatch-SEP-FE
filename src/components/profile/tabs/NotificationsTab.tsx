"use client";

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { 
  Bell, 
  CheckCheck, 
  BookOpen, 
  Users, 
  Wallet, 
  MessageSquare, 
  Settings,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationDto } from '@/types/backend';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
  return 'system';
};

// Helper function to extract title from message
const getNotificationTitle = (message: string): string => {
  const firstLine = message.split('\n')[0];
  if (firstLine.length > 50) {
    return firstLine.substring(0, 50) + '...';
  }
  return firstLine;
};

export function NotificationsTab() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications(true, 20);
  const [filter, setFilter] = useState<string>('all');
  
  // Swipe state for delete functionality
  const [swipeStates, setSwipeStates] = useState<Record<number, { startX: number; currentX: number; isDragging: boolean }>>({});

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications;
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
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeName = (type: string) => {
    switch (type) {
      case 'class_request':
        return 'Yêu cầu mở lớp';
      case 'tutor_application':
        return 'Ứng tuyển gia sư';
      case 'payment':
        return 'Thanh toán';
      case 'message':
        return 'Tin nhắn';
      case 'system':
        return 'Hệ thống';
      default:
        return 'Khác';
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleNotificationClick = (notification: NotificationDto) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Thông báo</h2>
          <p className="text-gray-600 mt-1">
            Quản lý thông báo và cập nhật
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-[#257180] text-white border-[#257180]">
            {unreadCount} chưa đọc
          </Badge>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            Tất cả
            <Badge variant="secondary" className="ml-2 h-5 px-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Chưa đọc
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-2 bg-[#257180] text-white">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#257180] mb-4"></div>
                <p className="text-gray-600">Đang tải thông báo...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Không có thông báo nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const type = getNotificationType(notification);
                const title = getNotificationTitle(notification.message);
                const swipeState = swipeStates[notification.id];
                const swipeOffset = swipeState ? Math.max(0, swipeState.currentX - swipeState.startX) : 0;

                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-all hover:shadow-md relative ${
                      !notification.isRead ? 'border-l-4 border-l-[#257180] bg-blue-50/30' : ''
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
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-lg ${
                          !notification.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-base ${
                                  !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-900'
                                }`}>
                                  {title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-[#257180] rounded-full" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs">
                                  {getNotificationTypeName(type)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {notification.linkUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <CheckCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(notification.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {swipeOffset > 50 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 text-sm font-medium">
                          Xóa
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
