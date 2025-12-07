import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { ClassRequestDto } from '@/types/backend';
import { CreateClassRequestRequest, UpdateClassRequestRequest, IsApprovedClassRequestDto, CancelClassRequestDto } from '@/types/requests';

export interface ClassRequestSlotDto {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ClassRequestDetailDto {
  id: number;
  learnerEmail: string;
  title: string;
  description?: string; // Mô tả chi tiết yêu cầu
  subjectName: string;
  level: string;
  learningGoal: string;
  tutorRequirement: string;
  mode: string;
  teachingMode?: number | string; // Backend có thể trả về field này
  provinceName?: string;
  subDistrictName?: string;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
  expectedStartDate?: string;
  expectedSessions: number;
  targetUnitPriceMin?: number;
  targetUnitPriceMax?: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  cancelReason?: string;
  slots?: ClassRequestSlotDto[];
}

export interface ClassRequestItemDto {
  id: number;
  learnerName: string;
  learnerEmail?: string; // Email của learner (nếu có)
  avatarUrl?: string;
  title: string;
  subjectName: string;
  level: string;
  mode: string;
  teachingMode?: number | string; // Backend có thể trả về field này
  expectedStartDate?: string;
  expectedSessions: number;
  targetUnitPriceMin?: number;
  targetUnitPriceMax?: number;
  status: string;
  createdAt: string;
}

export class ClassRequestService {
  static async createClassRequest(request: CreateClassRequestRequest): Promise<ApiResponse<ClassRequestDto>> {
    return apiClient.post<ClassRequestDto>(API_ENDPOINTS.CLASS_REQUESTS.CREATE, request);
  }

  static async getClassRequestById(id: number): Promise<ApiResponse<ClassRequestDetailDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.GET_BY_ID, { id: id.toString() });
    return apiClient.get<ClassRequestDetailDto>(url);
  }

  static async getPendingClassRequests(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_PENDING);
  }

  static async getOpenClassRequests(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_OPEN);
  }

  static async getPendingClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_PENDING_BY_LEARNER);
  }

  static async getOpenClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_OPEN_BY_LEARNER);
  }

  static async getExpiredClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_EXPIRED_BY_LEARNER);
  }

  static async getRejectedClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_REJECTED_BY_LEARNER);
  }

  static async getCanceledClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_CANCELED_BY_LEARNER);
  }

  static async updateClassRequest(id: number, request: UpdateClassRequestRequest): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.UPDATE, { id: id.toString() });
    return apiClient.put<void>(url, request);
  }

  static async cancelClassRequest(id: number, request: CancelClassRequestDto): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.CANCEL, { id: id.toString() });
    return apiClient.put<void>(url, request);
  }

  static async deleteClassRequest(id: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.DELETE, { id: id.toString() });
    return apiClient.delete<void>(url);
  }

  static async approveOrRejectClassRequest(id: number, request: IsApprovedClassRequestDto): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.APPROVE_OR_REJECT, { id: id.toString() });
    return apiClient.put<void>(url, request);
  }
}

