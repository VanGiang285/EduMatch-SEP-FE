import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { NotificationDto } from '@/types/backend';

export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
}

export class NotificationService {
  // Lấy danh sách thông báo của người dùng hiện tại
  static async getNotifications(params?: NotificationQueryParams): Promise<ApiResponse<NotificationDto[]>> {
    return apiClient.get<NotificationDto[]>(API_ENDPOINTS.NOTIFICATIONS.LIST, params);
  }

  // Lấy số lượng thông báo chưa đọc
  static async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return apiClient.get<{ unreadCount: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  }

  // Đánh dấu một thông báo đã đọc
  static async markAsRead(notificationId: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ, { id: notificationId.toString() });
    return apiClient.post<void>(url);
  }

  // Đánh dấu tất cả thông báo đã đọc
  static async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
  }

  // Xóa thông báo
  static async deleteNotification(notificationId: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.NOTIFICATIONS.DELETE, { id: notificationId.toString() });
    return apiClient.delete<void>(url);
  }
}

