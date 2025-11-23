import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorVerificationRequestDto } from '@/types/backend';
import { TutorVerificationRequestFilter } from '@/types/requests';
import { TutorVerificationRequestStatus } from '@/types/enums';

export class TutorVerificationRequestService {
  // Business Admin gets every verification request with optional status
  static async getAll(
    status?: TutorVerificationRequestStatus
  ): Promise<ApiResponse<TutorVerificationRequestDto[]>> {
    const params = status !== undefined ? { status } : undefined;
    return apiClient.get<TutorVerificationRequestDto[]>(
      API_ENDPOINTS.TUTOR_VERIFICATION_REQUEST.GET_ALL,
      params
    );
  }

  // Filter requests by email or tutorId for role-based dashboards
  static async getByFilters(
    filter: TutorVerificationRequestFilter
  ): Promise<ApiResponse<TutorVerificationRequestDto[]>> {
    return apiClient.get<TutorVerificationRequestDto[]>(
      API_ENDPOINTS.TUTOR_VERIFICATION_REQUEST.GET_BY_EMAIL_OR_TUTOR_ID,
      filter
    );
  }

  // Admin fetches detailed request info by id
  static async getById(
    tutorVerificationRequestId: number
  ): Promise<ApiResponse<TutorVerificationRequestDto>> {
    const url = replaceUrlParams(
      API_ENDPOINTS.TUTOR_VERIFICATION_REQUEST.GET_BY_ID,
      { id: tutorVerificationRequestId.toString() }
    );
    return apiClient.get<TutorVerificationRequestDto>(url);
  }
}



