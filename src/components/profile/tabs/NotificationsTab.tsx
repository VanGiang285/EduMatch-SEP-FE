"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
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
import { mockNotifications } from '@/data/mockLearnerData';
import { toast } from 'sonner';

export function NotificationsTab() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
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

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    toast.success('Đã đánh dấu là đã đọc');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Đã xóa thông báo');
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Note: Navigation functionality would require parent component callback
    // For now, we just mark as read and show a toast
    if (notification.link) {
      toast.info('Vui lòng sử dụng menu để điều hướng đến trang tương ứng');
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
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
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
          <TabsTrigger value="class_request">
            <BookOpen className="h-4 w-4 mr-1" />
            Yêu cầu
          </TabsTrigger>
          <TabsTrigger value="tutor_application">
            <Users className="h-4 w-4 mr-1" />
            Ứng tuyển
          </TabsTrigger>
          <TabsTrigger value="payment">
            <Wallet className="h-4 w-4 mr-1" />
            Thanh toán
          </TabsTrigger>
          <TabsTrigger value="message">
            <MessageSquare className="h-4 w-4 mr-1" />
            Tin nhắn
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-1" />
            Hệ thống
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Không có thông báo nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-l-4 border-l-[#257180] bg-blue-50/30' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-lg ${
                        !notification.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-base ${
                                !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-900'
                              }`}>
                                {notification.title}
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
                                {getNotificationTypeName(notification.type)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {notification.link && (
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
