import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { ClassRequestDto } from '@/types/backend';
import { CreateClassRequestRequest, UpdateClassRequestRequest, IsApprovedClassRequestDto, CancelClassRequestDto } from '@/types/requests';

// Temporary types - sẽ được thêm vào backend.ts sau
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
  expectedStartDate?: string;
  expectedSessions: number;
  targetUnitPriceMin?: number;
  targetUnitPriceMax?: number;
  status: string;
  createdAt: string;
}

export class ClassRequestService {
  // Tạo yêu cầu mở lớp mới (Learner)
  static async createClassRequest(request: CreateClassRequestRequest): Promise<ApiResponse<ClassRequestDto>> {
    return apiClient.post<ClassRequestDto>(API_ENDPOINTS.CLASS_REQUESTS.CREATE, request);
  }

  // Lấy chi tiết yêu cầu theo ID
  static async getClassRequestById(id: number): Promise<ApiResponse<ClassRequestDetailDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.GET_BY_ID, { id: id.toString() });
    return apiClient.get<ClassRequestDetailDto>(url);
  }

  // Lấy danh sách yêu cầu Pending (cho Business Admin)
  static async getPendingClassRequests(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_PENDING);
  }

  // Lấy danh sách yêu cầu đã duyệt (Open) - Public
  static async getOpenClassRequests(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_OPEN);
  }

  // Lấy yêu cầu Pending của learner
  static async getPendingClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_PENDING_BY_LEARNER);
  }

  // Lấy yêu cầu Open của learner
  static async getOpenClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_OPEN_BY_LEARNER);
  }

  // Lấy yêu cầu đã hết hạn của learner
  static async getExpiredClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_EXPIRED_BY_LEARNER);
  }

  // Lấy yêu cầu bị từ chối của learner
  static async getRejectedClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_REJECTED_BY_LEARNER);
  }

  // Lấy yêu cầu đã hủy của learner
  static async getCanceledClassRequestsByLearner(): Promise<ApiResponse<ClassRequestItemDto[]>> {
    return apiClient.get<ClassRequestItemDto[]>(API_ENDPOINTS.CLASS_REQUESTS.LIST_CANCELED_BY_LEARNER);
  }

  // Cập nhật yêu cầu (Learner)
  static async updateClassRequest(id: number, request: UpdateClassRequestRequest): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.UPDATE, { id: id.toString() });
    return apiClient.put<void>(url, request);
  }

  // Hủy yêu cầu (Learner)
  static async cancelClassRequest(id: number, request: CancelClassRequestDto): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.CANCEL, { id: id.toString() });
    return apiClient.put<void>(url, request);
  }

  // Xóa yêu cầu (nếu chưa duyệt) (Learner)
  static async deleteClassRequest(id: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.DELETE, { id: id.toString() });
    return apiClient.delete<void>(url);
  }

  // Duyệt/Từ chối yêu cầu (Business Admin)
  static async approveOrRejectClassRequest(id: number, request: IsApprovedClassRequestDto): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.CLASS_REQUESTS.APPROVE_OR_REJECT, { id: id.toString() });
    return apiClient.put<void>(url, request);
  }
}

