import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { BecomeTutorRequest } from '@/types/requests';
import { TutorProfileDto } from '@/types/backend';

export interface BecomeTutorResponse {
  profile: TutorProfileDto;
}

export class BecomeTutorService {
  // Đăng ký trở thành gia sư (tạo profile, educations, certificates, subjects, availabilities trong 1 transaction)
  static async becomeTutor(data: BecomeTutorRequest): Promise<ApiResponse<BecomeTutorResponse>> {
    return apiClient.post<BecomeTutorResponse>(API_ENDPOINTS.TUTORS.BECOME_TUTOR, data);
  }
}
