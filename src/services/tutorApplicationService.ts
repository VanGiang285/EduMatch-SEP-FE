import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorApplyRequest, TutorApplicationEditRequest } from '@/types/requests';

// Temporary types - sẽ được thêm vào backend.ts sau
export interface TutorApplicationItemDto {
  applicationId: number;
  tutorId: number;
  tutorName: string;
  avatarUrl: string;
  message: string;
  appliedAt: string;
}

export class TutorApplicationService {
  // Gia sư ứng tuyển vào class request
  static async applyToClassRequest(request: TutorApplyRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.TUTOR_APPLICATIONS.APPLY, request);
  }

  // Lấy danh sách gia sư ứng tuyển theo class request (Learner)
  static async getApplicationsByClassRequest(classRequestId: number): Promise<ApiResponse<TutorApplicationItemDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTOR_APPLICATIONS.GET_BY_CLASS_REQUEST, { classRequestId: classRequestId.toString() });
    return apiClient.get<TutorApplicationItemDto[]>(url);
  }

  // Lấy danh sách class request mà tutor đã ứng tuyển (Tutor)
  static async getTutorAppliedApplications(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(API_ENDPOINTS.TUTOR_APPLICATIONS.GET_TUTOR_APPLIED);
  }

  // Lấy danh sách ứng tuyển đã hủy của tutor (Tutor)
  static async getTutorCanceledApplications(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(API_ENDPOINTS.TUTOR_APPLICATIONS.GET_TUTOR_CANCELED);
  }

  // Chỉnh sửa ứng tuyển (Tutor)
  static async editApplication(request: TutorApplicationEditRequest): Promise<ApiResponse<void>> {
    return apiClient.put<void>(API_ENDPOINTS.TUTOR_APPLICATIONS.EDIT, request);
  }

  // Hủy ứng tuyển (Tutor)
  static async cancelApplication(id: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTOR_APPLICATIONS.CANCEL, { id: id.toString() });
    return apiClient.put<void>(url);
  }
}

