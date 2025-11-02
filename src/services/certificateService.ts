import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { CertificateTypeDto, EducationInstitutionDto, TutorEducationDto, LevelDto } from '@/types/backend';
import { CertificateTypeCreateRequest, EducationInstitutionCreateRequest, TutorEducationCreateRequest, TutorEducationUpdateRequest } from '@/types/requests';
import { VerifyStatus } from '@/types/enums';

export class CertificateService {
  // Lấy tất cả loại chứng chỉ
  static async getAllCertificateTypes(): Promise<ApiResponse<CertificateTypeDto[]>> {
    return apiClient.get<CertificateTypeDto[]>(API_ENDPOINTS.CERTIFICATES.GET_ALL);
  }

  // Lấy loại chứng chỉ theo trạng thái verify
  static async getCertificateTypesByVerifyStatus(verifyStatus: VerifyStatus): Promise<ApiResponse<CertificateTypeDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.CERTIFICATES.GET_BY_VERIFY_STATUS, { verifyStatus: verifyStatus.toString() });
    return apiClient.get<CertificateTypeDto[]>(url);
  }

  // Tạo loại chứng chỉ mới (status = Pending)
  static async createCertificateType(request: CertificateTypeCreateRequest): Promise<ApiResponse<CertificateTypeDto>> {
    return apiClient.post<CertificateTypeDto>(API_ENDPOINTS.CERTIFICATES.CREATE, request);
  }

  // Thêm các môn học vào loại chứng chỉ
  static async addSubjectsToCertificateType(certificateTypeId: number, subjectIds: number[]): Promise<ApiResponse<CertificateTypeDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.CERTIFICATES.ADD_SUBJECTS, { certificateTypeId: certificateTypeId.toString() });
    return apiClient.post<CertificateTypeDto>(url, subjectIds);
  }

  // Xác thực loại chứng chỉ (Pending -> Verified)
  static async verifyCertificateType(certificateTypeId: number): Promise<ApiResponse<CertificateTypeDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.CERTIFICATES.VERIFY, { certificateTypeId: certificateTypeId.toString() });
    return apiClient.put<CertificateTypeDto>(url);
  }

  // Xóa loại chứng chỉ
  static async deleteCertificateType(certificateTypeId: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CERTIFICATES.DELETE, { certificateTypeId: certificateTypeId.toString() });
    return apiClient.delete<void>(url);
  }

  // Lấy tất cả cơ sở giáo dục
  static async getAllInstitutions(): Promise<ApiResponse<EducationInstitutionDto[]>> {
    return apiClient.get<EducationInstitutionDto[]>(API_ENDPOINTS.EDUCATION.GET_ALL_INSTITUTIONS);
  }

  // Lấy cơ sở giáo dục theo trạng thái verify
  static async getInstitutionsByVerifyStatus(verifyStatus: VerifyStatus): Promise<ApiResponse<EducationInstitutionDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.EDUCATION.GET_INSTITUTIONS_BY_VERIFY_STATUS, { verifyStatus: verifyStatus.toString() });
    return apiClient.get<EducationInstitutionDto[]>(url);
  }

  // Tạo cơ sở giáo dục mới (status = Pending)
  static async createInstitution(request: EducationInstitutionCreateRequest): Promise<ApiResponse<EducationInstitutionDto>> {
    return apiClient.post<EducationInstitutionDto>(API_ENDPOINTS.EDUCATION.CREATE_INSTITUTION, request);
  }

  // Xác thực cơ sở giáo dục (Pending -> Verified)
  static async verifyInstitution(institutionId: number): Promise<ApiResponse<EducationInstitutionDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.EDUCATION.VERIFY_INSTITUTION, { educationInstitutionId: institutionId.toString() });
    return apiClient.put<EducationInstitutionDto>(url);
  }

  // Lấy danh sách bằng cấp học vấn của gia sư
  static async getTutorEducations(tutorId: number): Promise<ApiResponse<TutorEducationDto[]>> {
    const url = API_ENDPOINTS.EDUCATION.GET_TUTOR_EDUCATIONS.replace(':tutorId', tutorId.toString());
    return apiClient.get<TutorEducationDto[]>(url);
  }

  // Thêm bằng cấp học vấn cho gia sư
  static async createTutorEducation(tutorId: number, request: Omit<TutorEducationCreateRequest, 'tutorId'>): Promise<ApiResponse<TutorEducationDto>> {
    const url = API_ENDPOINTS.EDUCATION.CREATE_TUTOR_EDUCATION.replace(':tutorId', tutorId.toString());
    return apiClient.post<TutorEducationDto>(url, { ...request, tutorId });
  }

  // Cập nhật bằng cấp học vấn của gia sư
  static async updateTutorEducation(tutorId: number, request: TutorEducationUpdateRequest): Promise<ApiResponse<TutorEducationDto>> {
    const url = API_ENDPOINTS.EDUCATION.UPDATE_TUTOR_EDUCATION.replace(':tutorId', tutorId.toString());
    return apiClient.put<TutorEducationDto>(url, { ...request, tutorId });
  }

  // Xóa bằng cấp học vấn (nếu không truyền educationId thì xóa tất cả)
  static async deleteTutorEducation(tutorId: number, educationId?: number): Promise<ApiResponse<void>> {
    const url = API_ENDPOINTS.EDUCATION.DELETE_TUTOR_EDUCATION.replace(':tutorId', tutorId.toString());
    return apiClient.delete<void>(url + (educationId ? `?educationId=${educationId}` : ''));
  }

  // Lấy tất cả cấp độ học tập
  static async getAllLevels(): Promise<ApiResponse<LevelDto[]>> {
    return apiClient.get<LevelDto[]>(API_ENDPOINTS.LEVELS.GET_ALL);
  }
}
