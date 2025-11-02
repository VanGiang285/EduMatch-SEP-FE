import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { ManageUserDto } from '@/types/backend';
import { CreateAdminAccDto } from '@/types/requests';

export class AdminService {
  // Lấy danh sách user theo role (1=Learner, 2=Tutor, 3=Business Admin, 4=System Admin)
  static async getUsersByRole(roleId: number): Promise<ApiResponse<ManageUserDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.ADMIN.GET_USER_BY_ROLE, { roleId: roleId.toString() });
    return apiClient.get<ManageUserDto[]>(url);
  }

  // Lấy tất cả user trong hệ thống
  static async getAllUsers(): Promise<ApiResponse<ManageUserDto[]>> {
    return apiClient.get<ManageUserDto[]>(API_ENDPOINTS.ADMIN.GET_ALL_USERS);
  }

  // Vô hiệu hóa tài khoản user (isActive = false)
  static async deactivateUser(email: string): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.ADMIN.DEACTIVATE_USER, { email });
    return apiClient.put<void>(url);
  }

  // Kích hoạt tài khoản user (isActive = true)
  static async activateUser(email: string): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.ADMIN.ACTIVATE_USER, { email });
    return apiClient.put<void>(url);
  }

  // Cập nhật role của user
  static async updateUserRole(email: string, roleId: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE, { email, roleId: roleId.toString() });
    return apiClient.put<void>(url);
  }

  // Tạo tài khoản admin
  static async createAdmin(data: CreateAdminAccDto): Promise<ApiResponse<ManageUserDto>> {
    return apiClient.post<ManageUserDto>(API_ENDPOINTS.ADMIN.CREATE_ADMIN, data);
  }

  // Lấy danh sách học viên
  static async getAllLearners(): Promise<ApiResponse<ManageUserDto[]>> {
    return this.getUsersByRole(1);
  }

  // Lấy danh sách gia sư
  static async getAllTutors(): Promise<ApiResponse<ManageUserDto[]>> {
    return this.getUsersByRole(2);
  }

  // Lấy danh sách business admin
  static async getAllBusinessAdmins(): Promise<ApiResponse<ManageUserDto[]>> {
    return this.getUsersByRole(3);
  }

  // Lấy danh sách system admin
  static async getAllSystemAdmins(): Promise<ApiResponse<ManageUserDto[]>> {
    return this.getUsersByRole(4);
  }
}
