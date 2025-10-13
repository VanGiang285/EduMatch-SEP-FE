import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { 
  GetUserProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ApiResponse
} from '@/types/api';
import { UserProfile } from '@/types';
export class UserService {
  static async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<GetUserProfileResponse>(API_ENDPOINTS.USERS.PROFILE)
      .then(res => ({
        ...res,
        data: res.data?.userProfile
      }));
  }
  static async updateUserProfile(userData: UpdateUserProfileRequest): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UpdateUserProfileResponse>(API_ENDPOINTS.USERS.UPDATE, userData)
      .then(res => ({
        ...res,
        data: res.data?.userProfile
      }));
  }
  static async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse>> {
    return apiClient.post<ChangePasswordResponse>(API_ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
  }
  static async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    return apiClient.uploadFile<{ avatarUrl: string }>(API_ENDPOINTS.USERS.UPLOAD_AVATAR, file, 'avatar');
  }
  static async deleteAccount(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.USERS.PROFILE);
  }
  static async getUserStats(): Promise<ApiResponse<{
    totalBookings: number;
    completedBookings: number;
    totalReviews: number;
    averageRating: number;
  }>> {
    return apiClient.get(`${API_ENDPOINTS.USERS.PROFILE}/stats`);
  }
  static async getUserActivity(limit = 20): Promise<ApiResponse<any[]>> {
    return apiClient.get(`${API_ENDPOINTS.USERS.PROFILE}/activity`, { limit });
  }
  static async updatePreferences(preferences: Record<string, any>): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${API_ENDPOINTS.USERS.PROFILE}/preferences`, preferences);
  }
  static async getNotifications(): Promise<ApiResponse<any[]>> {
    return apiClient.get(`${API_ENDPOINTS.USERS.PROFILE}/notifications`);
  }
  static async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${API_ENDPOINTS.USERS.PROFILE}/notifications/${notificationId}/read`);
  }
  static async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${API_ENDPOINTS.USERS.PROFILE}/notifications/read-all`);
  }
}