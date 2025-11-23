import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { RefundPolicyDto } from '@/types/backend';
import { RefundPolicyCreateRequest, RefundPolicyUpdateRequest } from '@/types/requests';

export class RefundPolicyService {
  // Business Admin or public users get policy list with optional active filter
  static async getAll(
    isActive?: boolean
  ): Promise<ApiResponse<RefundPolicyDto[]>> {
    const params = isActive === undefined ? undefined : { isActive };
    return apiClient.get<RefundPolicyDto[]>(API_ENDPOINTS.REFUND_POLICY.GET_ALL, params);
  }

  // Fetch policy detail by id
  static async getById(id: number): Promise<ApiResponse<RefundPolicyDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REFUND_POLICY.GET_BY_ID, {
      id: id.toString(),
    });
    return apiClient.get<RefundPolicyDto>(url);
  }

  // Business Admin creates a new policy
  static async create(
    request: RefundPolicyCreateRequest
  ): Promise<ApiResponse<RefundPolicyDto>> {
    return apiClient.post<RefundPolicyDto>(
      API_ENDPOINTS.REFUND_POLICY.CREATE,
      request
    );
  }

  // Business Admin updates policy content
  static async update(
    request: RefundPolicyUpdateRequest
  ): Promise<ApiResponse<RefundPolicyDto>> {
    return apiClient.put<RefundPolicyDto>(
      API_ENDPOINTS.REFUND_POLICY.UPDATE,
      request
    );
  }

  // Business Admin toggles policy active state
  static async updateIsActive(
    id: number,
    isActive: boolean
  ): Promise<ApiResponse<RefundPolicyDto>> {
    const baseUrl = replaceUrlParams(
      API_ENDPOINTS.REFUND_POLICY.UPDATE_IS_ACTIVE,
      { id: id.toString() }
    );
    const url = `${baseUrl}?isActive=${isActive}`;
    return apiClient.put<RefundPolicyDto>(url);
  }
}



