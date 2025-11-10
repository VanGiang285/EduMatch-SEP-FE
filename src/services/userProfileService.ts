import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { UserProfileDto } from '@/types/backend';
import { UserProfileUpdateRequest } from '@/types/requests';
import { MediaService, UploadToCloudResponse } from '@/services/mediaService';

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

  // Upload avatar image
  static async uploadAvatar(file: File, ownerEmail: string): Promise<ApiResponse<{ avatarUrl: string; avatarUrlPublicId?: string }>> {
    try {
      // Thử endpoint cũ trước (như BecomeTutorPage đang dùng)
      // Nếu không hoạt động, có thể backend đã thay đổi endpoint
      const response = await MediaService.uploadFile({
        file,
        ownerEmail,
        mediaType: 'Image',
      });

      if (response.success && response.data) {
        // ApiClient unwraps response.data, so response.data is UploadToCloudResponse
        // UploadToCloudResponse has structure: { success, message, data?: { secureUrl, ... } }
        const uploadData = response.data as any;
        let avatarUrl = '';
        let avatarUrlPublicId = '';

        if (uploadData.data?.secureUrl) {
          avatarUrl = uploadData.data.secureUrl;
          avatarUrlPublicId = uploadData.data.publicId;
        } else if (uploadData.data?.originalUrl) {
          avatarUrl = uploadData.data.originalUrl;
          avatarUrlPublicId = uploadData.data.publicId;
        } else if (uploadData.secureUrl) {
          avatarUrl = uploadData.secureUrl;
          avatarUrlPublicId = uploadData.publicId;
        } else if (uploadData.originalUrl) {
          avatarUrl = uploadData.originalUrl;
          avatarUrlPublicId = uploadData.publicId;
        }

        if (avatarUrl) {
          return {
            success: true,
            data: {
              avatarUrl,
              avatarUrlPublicId: avatarUrlPublicId || undefined,
            },
            error: undefined,
            message: response.message || 'Upload thành công',
          };
        } else {
          return {
            success: false,
            data: { avatarUrl: '', avatarUrlPublicId: '' },
            error: 'Không tìm thấy URL ảnh trong response',
            message: 'Upload thất bại: Không tìm thấy URL ảnh',
          };
        }
      } else {
        return {
          success: false,
          data: { avatarUrl: '', avatarUrlPublicId: '' },
          error: response.error || 'Upload failed',
          message: response.message || 'Upload thất bại',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        data: { avatarUrl: '', avatarUrlPublicId: '' },
        error: error.message || 'Upload thất bại',
        message: error.message || 'Upload thất bại',
      };
    }
  }
}
