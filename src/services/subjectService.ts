import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { SubjectDto, TutorSubjectDto } from '@/types/backend';
import { TutorSubjectCreateRequest, TutorSubjectUpdateRequest } from '@/types/requests';

export class SubjectService {
  // Lấy tất cả môn học trong hệ thống
  static async getAllSubjects(): Promise<ApiResponse<SubjectDto[]>> {
    return apiClient.get<SubjectDto[]>(API_ENDPOINTS.SUBJECTS.GET_ALL);
  }

  // Lấy thông tin môn học theo ID
  static async getSubjectById(id: number): Promise<ApiResponse<SubjectDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.SUBJECTS.GET_BY_ID, { id: id.toString() });
    return apiClient.get<SubjectDto>(url);
  }

  // Lấy danh sách môn học mà gia sư dạy (kèm giá và cấp độ)
  static async getTutorSubjects(tutorId: number): Promise<ApiResponse<TutorSubjectDto[]>> {
    const url = API_ENDPOINTS.SUBJECTS.GET_TUTOR_SUBJECTS.replace(':tutorId', tutorId.toString());
    return apiClient.get<TutorSubjectDto[]>(url);
  }

  // Thêm môn học mới cho gia sư
  static async createTutorSubject(tutorId: number, request: Omit<TutorSubjectCreateRequest, 'tutorId'>): Promise<ApiResponse<TutorSubjectDto>> {
    const url = API_ENDPOINTS.SUBJECTS.CREATE_TUTOR_SUBJECT.replace(':tutorId', tutorId.toString());
    return apiClient.post<TutorSubjectDto>(url, { ...request, tutorId });
  }

  // Cập nhật môn học của gia sư (giá, cấp độ)
  static async updateTutorSubject(tutorId: number, request: TutorSubjectUpdateRequest): Promise<ApiResponse<TutorSubjectDto>> {
    const url = API_ENDPOINTS.SUBJECTS.UPDATE_TUTOR_SUBJECT.replace(':tutorId', tutorId.toString());
    return apiClient.put<TutorSubjectDto>(url, { ...request, tutorId });
  }

  // Xóa môn học của gia sư (nếu không truyền subjectId thì xóa tất cả)
  static async deleteTutorSubject(tutorId: number, subjectId?: number): Promise<ApiResponse<void>> {
    const url = API_ENDPOINTS.SUBJECTS.DELETE_TUTOR_SUBJECT.replace(':tutorId', tutorId.toString());
    return apiClient.delete<void>(url + (subjectId ? `?subjectId=${subjectId}` : ''));
  }
}
