import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { UserProfileDto } from '@/types/backend';
import { UserProfileUpdateRequest } from '@/types/requests';

export class UserProfileService {
  // Lấy thông tin profile user theo email
  static async getUserProfile(email: string): Promise<ApiResponse<UserProfileDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.USER_PROFILES.GET_BY_EMAIL, { email });
    return apiClient.get<UserProfileDto>(url);
  }

  // Cập nhật thông tin profile user (dob, gender, avatar, address, location)
  static async updateUserProfile(request: UserProfileUpdateRequest): Promise<ApiResponse<UserProfileDto>> {
    return apiClient.put<UserProfileDto>(API_ENDPOINTS.USER_PROFILES.UPDATE, request);
  }
}
