import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorProfileDto } from '@/types/backend';

export class FavoriteTutorService {
  // Thêm gia sư vào danh sách yêu thích
  static async addToFavorite(tutorId: number): Promise<ApiResponse<string>> {
    const url = replaceUrlParams(API_ENDPOINTS.FAVORITE_TUTORS.ADD, { tutorId: tutorId.toString() });
    return apiClient.post<string>(url);
  }

  // Xóa gia sư khỏi danh sách yêu thích
  static async removeFromFavorite(tutorId: number): Promise<ApiResponse<string>> {
    const url = replaceUrlParams(API_ENDPOINTS.FAVORITE_TUTORS.REMOVE, { tutorId: tutorId.toString() });
    return apiClient.delete<string>(url);
  }

  // Kiểm tra gia sư có trong danh sách yêu thích không
  static async isFavorite(tutorId: number): Promise<ApiResponse<boolean>> {
    const url = replaceUrlParams(API_ENDPOINTS.FAVORITE_TUTORS.IS_FAVORITE, { tutorId: tutorId.toString() });
    return apiClient.get<boolean>(url);
  }

  // Lấy danh sách gia sư yêu thích
  static async getFavoriteTutors(): Promise<ApiResponse<TutorProfileDto[]>> {
    return apiClient.get<TutorProfileDto[]>(API_ENDPOINTS.FAVORITE_TUTORS.LIST);
  }

  // Toggle trạng thái yêu thích (thêm nếu chưa có, xóa nếu đã có)
  static async toggleFavorite(tutorId: number): Promise<boolean> {
    const isFavResponse = await this.isFavorite(tutorId);
    const isFav = isFavResponse.data;
    if (isFav) {
      await this.removeFromFavorite(tutorId);
      return false;
    } else {
      await this.addToFavorite(tutorId);
      return true;
    }
  }
}
