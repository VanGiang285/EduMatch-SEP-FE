import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types/api';

export interface TrialLessonCreateRequest {
  tutorId: number;
  subjectId: number;
}

export interface TrialLessonSubjectStatusDto {
  subjectId: number;
  subjectName: string;
  hasTrialed: boolean;
}

export class LearnerTrialLessonService {
  /**
   * Ghi nhận buổi học thử (dùng email từ token ở BE)
   */
  static async recordTrialLesson(
    request: TrialLessonCreateRequest
  ): Promise<ApiResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.TRIAL_LESSONS.RECORD, request);
  }

  /**
   * Kiểm tra learner hiện tại đã học thử môn này với gia sư chưa
   */
  static async hasTrialLesson(
    tutorId: number,
    subjectId: number
  ): Promise<ApiResponse<boolean>> {
    return apiClient.get<boolean>(API_ENDPOINTS.TRIAL_LESSONS.EXISTS, {
      tutorId,
      subjectId,
    });
  }

  /**
   * Lấy danh sách môn của gia sư + trạng thái đã/ chưa học thử của learner hiện tại
   */
  static async getSubjectTrialStatuses(
    tutorId: number
  ): Promise<ApiResponse<TrialLessonSubjectStatusDto[]>> {
    return apiClient.get<TrialLessonSubjectStatusDto[]>(
      API_ENDPOINTS.TRIAL_LESSONS.SUBJECTS,
      { tutorId }
    );
  }
}
