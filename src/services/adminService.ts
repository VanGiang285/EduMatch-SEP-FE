import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

// Types for Admin API
export interface ManageUserDto {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  loginProvider?: string;
  avatarUrl?: string;
}

export interface CreateAdminAccDto {
  email: string;
}

export class AdminService {
  /**
   * Get users by role ID
   */
  static async getUsersByRole(roleId: number): Promise<ApiResponse<ManageUserDto[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ADMIN.GET_USER_BY_ROLE, { roleId });
    return apiClient.get<ManageUserDto[]>(endpoint);
  }

  /**
   * Deactivate user by email
   */
  static async deactivateUser(email: string): Promise<ApiResponse<string>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ADMIN.DEACTIVATE_USER, { email });
    return apiClient.put<string>(endpoint);
  }

  /**
   * Activate user by email
   */
  static async activateUser(email: string): Promise<ApiResponse<string>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.ADMIN.ACTIVATE_USER, { email });
    return apiClient.put<string>(endpoint);
  }

  /**
   * Create admin account
   */
  static async createAdminAccount(adminData: CreateAdminAccDto): Promise<ApiResponse<any>> {
    return apiClient.post<any>(API_ENDPOINTS.ADMIN.CREATE_ADMIN, adminData);
  }
}

