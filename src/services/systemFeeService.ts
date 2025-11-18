import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { SystemFeeDto } from '@/types/backend';
import { SystemFeeCreateRequest, SystemFeeUpdateRequest } from '@/types/requests';
import { PagedResult } from './bookingService';

export interface SystemFeePagingParams {
  page?: number;
  pageSize?: number;
}

export class SystemFeeService {
  // Lấy danh sách System Fee có phân trang
  static async getAllPaging(params?: SystemFeePagingParams): Promise<ApiResponse<PagedResult<SystemFeeDto>>> {
    return apiClient.get<PagedResult<SystemFeeDto>>(API_ENDPOINTS.SYSTEM_FEES.GET_ALL_PAGING, {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    });
  }

  // Lấy danh sách System Fee không phân trang
  static async getAllNoPaging(): Promise<ApiResponse<SystemFeeDto[]>> {
    return apiClient.get<SystemFeeDto[]>(API_ENDPOINTS.SYSTEM_FEES.GET_ALL_NO_PAGING);
  }

  // Tạo mới System Fee
  static async createSystemFee(request: SystemFeeCreateRequest): Promise<ApiResponse<SystemFeeDto>> {
    return apiClient.post<SystemFeeDto>(API_ENDPOINTS.SYSTEM_FEES.CREATE, request);
  }

  // Cập nhật System Fee
  static async updateSystemFee(request: SystemFeeUpdateRequest): Promise<ApiResponse<SystemFeeDto>> {
    return apiClient.put<SystemFeeDto>(API_ENDPOINTS.SYSTEM_FEES.UPDATE, request);
  }
}

