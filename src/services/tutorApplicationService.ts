import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorApplyRequest, TutorApplicationEditRequest } from '@/types/requests';
import { TutorApplicationItemDto, TutorAppliedItemDto } from '@/types/backend';

export class TutorApplicationService {
  static async applyToClassRequest(request: TutorApplyRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.TUTOR_APPLICATIONS.APPLY, request);
  }

  static async getApplicationsByClassRequest(classRequestId: number): Promise<ApiResponse<TutorApplicationItemDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTOR_APPLICATIONS.GET_BY_CLASS_REQUEST, { classRequestId: classRequestId.toString() });
    return apiClient.get<TutorApplicationItemDto[]>(url);
  }

  static async getTutorAppliedApplications(): Promise<ApiResponse<TutorAppliedItemDto[]>> {
    return apiClient.get<TutorAppliedItemDto[]>(API_ENDPOINTS.TUTOR_APPLICATIONS.GET_TUTOR_APPLIED);
  }

  static async getTutorCanceledApplications(): Promise<ApiResponse<TutorAppliedItemDto[]>> {
    return apiClient.get<TutorAppliedItemDto[]>(API_ENDPOINTS.TUTOR_APPLICATIONS.GET_TUTOR_CANCELED);
  }

  static async editApplication(request: TutorApplicationEditRequest): Promise<ApiResponse<void>> {
    return apiClient.put<void>(API_ENDPOINTS.TUTOR_APPLICATIONS.EDIT, request);
  }

  static async cancelApplication(id: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTOR_APPLICATIONS.CANCEL, { id: id.toString() });
    return apiClient.put<void>(url);
  }
}

