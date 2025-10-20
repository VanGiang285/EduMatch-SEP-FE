"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Bell, Check, X, Filter, Search, Calendar, MessageSquare, CreditCard, Star, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Input } from '@/components/ui/form/input';

// Mock data - in real app, this would come from API
const mockNotifications = [
  {
    id: 1,
    type: 'booking',
    title: 'Lịch học mới được đặt',
    message: 'Bạn có một buổi học mới với Nguyễn Văn A vào ngày 16/01/2024 lúc 14:00-15:30',
    date: '2024-01-15T10:30:00',
    isRead: false,
    priority: 'high'
  },
  {
    id: 2,
    type: 'payment',
    title: 'Thanh toán thành công',
    message: 'Bạn đã thanh toán thành công 200,000 VND cho buổi học với Trần Thị B',
    date: '2024-01-15T09:15:00',
    isRead: false,
    priority: 'medium'
  },
  {
    id: 3,
    type: 'review',
    title: 'Đánh giá mới',
    message: 'Bạn nhận được đánh giá 5 sao từ Lê Văn C cho buổi học môn Hóa học',
    date: '2024-01-14T20:45:00',
    isRead: true,
    priority: 'low'
  },
  {
    id: 4,
    type: 'message',
    title: 'Tin nhắn mới',
    message: 'Bạn có tin nhắn mới từ Nguyễn Thị D',
    date: '2024-01-14T18:20:00',
    isRead: true,
    priority: 'medium'
  },
  {
    id: 5,
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống sẽ được bảo trì từ 02:00-04:00 ngày 16/01/2024',
    date: '2024-01-14T16:00:00',
    isRead: true,
    priority: 'low'
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'payment': return CreditCard;
      case 'review': return Star;
      case 'message': return MessageSquare;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-600 bg-blue-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'message': return 'text-purple-600 bg-purple-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'read' && notification.isRead) ||
      (statusFilter === 'unread' && !notification.isRead);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="h-8 w-8 mr-3 text-[#257180]" />
              Thông báo
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông báo và cập nhật từ hệ thống
            </p>
          </div>
          <div className="flex space-x-3">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="border-[#FD8B51] text-[#257180] hover:bg-[#F2E5BF]"
              >
                <Check className="h-4 w-4 mr-2" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thông báo chưa đọc</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{unreadCount}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng thông báo</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{notifications.length}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã đọc</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {notifications.filter(n => n.isRead).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Loại thông báo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="booking">Lịch học</SelectItem>
                <SelectItem value="payment">Thanh toán</SelectItem>
                <SelectItem value="review">Đánh giá</SelectItem>
                <SelectItem value="message">Tin nhắn</SelectItem>
                <SelectItem value="system">Hệ thống</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="unread">Chưa đọc</SelectItem>
                <SelectItem value="read">Đã đọc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Bell className="h-5 w-5 mr-2 text-gray-600" />
            Danh sách thông báo ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      <NotificationIcon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Badge className={`${getPriorityColor(notification.priority)} border`}>
                              {getPriorityLabel(notification.priority)}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {formatTime(notification.date)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteNotification(notification.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không tìm thấy thông báo nào</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


