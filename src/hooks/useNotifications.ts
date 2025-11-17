"use client";

import { useState, useEffect, useCallback } from "react";
import { NotificationService } from "@/services/notificationService";
import { NotificationDto } from "@/types/backend";
import { ErrorHandler } from "@/lib/error-handler";
import { toast } from "sonner";

export interface UseNotificationsReturn {
  notifications: NotificationDto[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationDto[]>>;
  unreadCount: number;
  loading: boolean;
  error: any | null;
  fetchNotifications: (params?: { page?: number; pageSize?: number }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(
  autoFetch: boolean = true,
  initialPageSize: number = 10
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (params?: { page?: number; pageSize?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await NotificationService.getNotifications({
        page: params?.page || 1,
        pageSize: params?.pageSize || initialPageSize,
      });
      
      if (response.success && response.data) {
        setNotifications(response.data);
        // Calculate unread count from fetched notifications
        const unread = response.data.filter(n => !n.isRead).length;
        // Note: This is local unread count, should also fetch from API
      } else {
        throw new Error(response.error?.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      setError(appError);
      ErrorHandler.logError(err, 'useNotifications.fetchNotifications');
      toast.error(ErrorHandler.getUserFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  }, [initialPageSize]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      // Don't show error toast for unread count, just log
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      setError(appError);
      ErrorHandler.logError(err, 'useNotifications.markAsRead');
      toast.error(ErrorHandler.getUserFriendlyMessage(err));
      throw err;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      setError(appError);
      ErrorHandler.logError(err, 'useNotifications.markAllAsRead');
      toast.error(ErrorHandler.getUserFriendlyMessage(err));
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotifications(prev => {
        const deleted = prev.find(n => n.id === id);
        if (deleted && !deleted.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== id);
      });
      toast.success('Đã xóa thông báo');
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      setError(appError);
      ErrorHandler.logError(err, 'useNotifications.deleteNotification');
      toast.error(ErrorHandler.getUserFriendlyMessage(err));
      throw err;
    }
  }, []);

  // Refetch both notifications and unread count
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [autoFetch, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    setNotifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  };
}

