import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorProfileDto, TutorCertificateDto, TutorEducationDto } from '@/types/backend';
import { TutorProfileUpdateRequest, UpdateTutorStatusRequest, VerifyUpdateRequest, RejectTutorRequest } from '@/types/requests';
import { TutorStatus } from '@/types/enums';

export class TutorService {
  // Lấy danh sách gia sư theo trạng thái
  static async getTutorsByStatus(status: TutorStatus): Promise<ApiResponse<TutorProfileDto[]>> {
    return apiClient.get<TutorProfileDto[]>(API_ENDPOINTS.TUTORS.GET_BY_STATUS, { status });
  }

  // Lấy tất cả gia sư trong hệ thống
  static async getAllTutors(): Promise<ApiResponse<TutorProfileDto[]>> {
    return apiClient.get<TutorProfileDto[]>(API_ENDPOINTS.TUTORS.GET_ALL);
  }

  // Lấy thông tin chi tiết gia sư theo ID (bao gồm certificates, educations, subjects, availabilities)
  static async getTutorById(tutorId: number): Promise<ApiResponse<TutorProfileDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTORS.GET_BY_ID, { tutorId: tutorId.toString() });
    return apiClient.get<TutorProfileDto>(url);
  }

  // Lấy tất cả chứng chỉ và bằng cấp của gia sư
  static async getTutorVerifications(tutorId: number): Promise<ApiResponse<{
    certificates: TutorCertificateDto[];
    educations: TutorEducationDto[];
  }>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTORS.GET_VERIFICATIONS, { tutorId: tutorId.toString() });
    return apiClient.get<{ certificates: TutorCertificateDto[]; educations: TutorEducationDto[]; }>(url);
  }

  // Cập nhật thông tin cơ bản của gia sư (bio, teaching experience, video, teaching modes)
  static async updateTutorProfile(request: TutorProfileUpdateRequest): Promise<ApiResponse<TutorProfileDto>> {
    return apiClient.put<TutorProfileDto>(API_ENDPOINTS.TUTORS.UPDATE_PROFILE, request);
  }

  // Cập nhật trạng thái gia sư (Pending, Approved, Rejected, Suspended, Deactivated)
  static async updateTutorStatus(tutorId: number, request: UpdateTutorStatusRequest): Promise<ApiResponse<TutorProfileDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTORS.UPDATE_STATUS, { tutorId: tutorId.toString() });
    return apiClient.put<TutorProfileDto>(url, request);
  }

  // Phê duyệt gia sư và xác thực tất cả chứng chỉ, bằng cấp trong một lần
  static async approveAndVerifyAll(tutorId: number): Promise<ApiResponse<TutorProfileDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTORS.APPROVE_AND_VERIFY_ALL, { tutorId: tutorId.toString() });
    return apiClient.put<TutorProfileDto>(url);
  }

  // Từ chối gia sư và reject tất cả chứng chỉ, bằng cấp
  static async rejectAll(tutorId: number, request: RejectTutorRequest): Promise<ApiResponse<TutorProfileDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTORS.REJECT_ALL, { tutorId: tutorId.toString() });
    return apiClient.put<TutorProfileDto>(url, request);
  }

  // Xác thực nhiều chứng chỉ cùng lúc
  static async verifyCertificateBatch(tutorId: number, updates: VerifyUpdateRequest[]): Promise<ApiResponse<TutorCertificateDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTORS.VERIFY_CERTIFICATE_BATCH, { tutorId: tutorId.toString() });
    return apiClient.put<TutorCertificateDto[]>(url, updates);
  }

  // Xác thực nhiều bằng cấp học vấn cùng lúc
  static async verifyEducationBatch(tutorId: number, updates: VerifyUpdateRequest[]): Promise<ApiResponse<TutorEducationDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTORS.VERIFY_EDUCATION_BATCH, { tutorId: tutorId.toString() });
    return apiClient.put<TutorEducationDto[]>(url, updates);
  }

  static async getTutorByEmail(email: string): Promise<ApiResponse<TutorProfileDto>> {
    return apiClient.get<TutorProfileDto>(API_ENDPOINTS.TUTORS.GET_BY_EMAIL, { email });
  }

  // Lấy tutor profile theo ID (full với relations)
  static async getTutorByIdFull(id: number): Promise<ApiResponse<TutorProfileDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.MANAGE_TUTOR_PROFILES.GET_BY_ID, { id: id.toString() });
    return apiClient.get<TutorProfileDto>(url);
  }
}
