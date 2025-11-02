import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorAvailabilityDto } from '@/types/backend';
import { TutorAvailabilityCreateRequest, TutorAvailabilityUpdateRequest } from '@/types/requests';
import { TutorAvailabilityStatus } from '@/types/enums';

export class AvailabilityService {
  // Tạo nhiều lịch rảnh cùng lúc
  static async createAvailabilities(requests: TutorAvailabilityCreateRequest[]): Promise<ApiResponse<TutorAvailabilityDto[]>> {
    return apiClient.post<TutorAvailabilityDto[]>(API_ENDPOINTS.AVAILABILITY.CREATE_LIST, requests);
  }

  // Cập nhật nhiều lịch rảnh cùng lúc
  static async updateAvailabilities(requests: TutorAvailabilityUpdateRequest[]): Promise<ApiResponse<TutorAvailabilityDto[]>> {
    return apiClient.put<TutorAvailabilityDto[]>(API_ENDPOINTS.AVAILABILITY.UPDATE_LIST, requests);
  }

  // Xóa nhiều lịch rảnh (chỉ được xóa khi status = Available)
  static async deleteAvailabilities(availabilityIds: number[]): Promise<ApiResponse<number[]>> {
    return apiClient.delete<number[]>(API_ENDPOINTS.AVAILABILITY.DELETE_LIST + `?ids=${availabilityIds.join(',')}`);
  }

  // Lấy tất cả lịch rảnh trong tương lai của gia sư (startDate > now)
  static async getTutorAvailabilities(tutorId: number): Promise<ApiResponse<TutorAvailabilityDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.AVAILABILITY.GET_ALL, { tutorId: tutorId.toString() });
    return apiClient.get<TutorAvailabilityDto[]>(url);
  }

  // Lấy lịch rảnh của gia sư theo trạng thái
  static async getTutorAvailabilitiesByStatus(tutorId: number, status: TutorAvailabilityStatus): Promise<ApiResponse<TutorAvailabilityDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.AVAILABILITY.GET_BY_STATUS, { tutorId: tutorId.toString(), status: status.toString() });
    return apiClient.get<TutorAvailabilityDto[]>(url);
  }

  // Lấy các slot còn trống có thể đặt
  static async getAvailableSlots(tutorId: number): Promise<ApiResponse<TutorAvailabilityDto[]>> {
    return this.getTutorAvailabilitiesByStatus(tutorId, TutorAvailabilityStatus.Available);
  }
}
