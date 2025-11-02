import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorProfileDto, TutorFilterDto } from '@/types/backend';

export class FindTutorService {
  // Lấy tất cả gia sư (public browsing)
  static async getAllTutors(): Promise<ApiResponse<TutorProfileDto[]>> {
    return apiClient.get<TutorProfileDto[]>(API_ENDPOINTS.FIND_TUTORS.GET_ALL);
  }

  // Tìm kiếm gia sư với bộ lọc (keyword, gender, city, teaching mode, pagination)
  static async searchTutors(filter: TutorFilterDto): Promise<ApiResponse<TutorProfileDto[]>> {
    const cleanFilter = Object.fromEntries(
      Object.entries(filter).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ) as TutorFilterDto;
    return apiClient.post<TutorProfileDto[]>(API_ENDPOINTS.FIND_TUTORS.SEARCH, cleanFilter);
  }

  // Lấy thông tin chi tiết gia sư theo ID (public view)
  static async getTutorById(tutorId: number): Promise<ApiResponse<TutorProfileDto>> {
    const url = API_ENDPOINTS.TUTORS.GET_BY_ID.replace(':tutorId', tutorId.toString());
    return apiClient.get<TutorProfileDto>(url);
  }
}
