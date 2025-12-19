import { apiClient } from '@/lib/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { User } from '@/types';
import { TokenManager } from '@/lib/tokenManager';
import {
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
  ChangePasswordRequest,
} from '@/types/requests';
import { ApiResponseBackend, UserDto } from '@/types/backend';

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  tokenType: string;
  message: string;
}

export interface RegisterResponse {
  message: string;
}

export interface GoogleLoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
  requiresLogout?: boolean;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface CurrentUserResponse {
  email: string;
  name: string;
  roleId?: string; // Optional - API may not return this
  roleName?: string; // API returns this instead of roleId
  loginProvider: string;
  createdAt: string;
  avatarUrl?: string;
}

export class AuthService {
  // Đăng nhập bằng email và mật khẩu
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  // Đăng ký tài khoản mới
  static async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  // Đăng xuất (revoke refresh token)
  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  }

  // Làm mới access token từ refresh token trong cookie
  static async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH);
  }

  // Lấy thông tin user hiện tại từ JWT token
  static async getCurrentUser(): Promise<ApiResponse<CurrentUserResponse>> {
    return apiClient.get<CurrentUserResponse>(API_ENDPOINTS.AUTH.GET_CURRENT_USER);
  }

  // Đăng nhập bằng Google OAuth
  static async googleLogin(data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponse>> {
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, data);
  }

  // Xác thực email với token
  static async verifyEmail(token: string): Promise<ApiResponse<VerifyEmailResponse>> {
    return apiClient.get<VerifyEmailResponse>(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);
  }

  // Gửi lại email xác thực
  static async resendVerification(email: string): Promise<ApiResponse<ResendVerificationResponse>> {
    return apiClient.post<ResendVerificationResponse>(API_ENDPOINTS.AUTH.RESEND_VERIFY, JSON.stringify(email));
  }

  static async changePassword(
    request: ChangePasswordRequest
  ): Promise<ApiResponse<ChangePasswordResponse>> {
    return apiClient.put<ChangePasswordResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      request
    );
  }

  static async resetPassword(
    email: string
  ): Promise<ApiResponse<ResetPasswordResponse>> {
    return apiClient.post<ResetPasswordResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      email
    );
  }

  static async checkEmailAvailable(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.get<{ message: string }>(
      API_ENDPOINTS.AUTH.CHECK_EMAIL_AVAILABLE,
      { email }
    );
  }

  // Kiểm tra user đã đăng nhập chưa
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;
    return !TokenManager.isTokenExpired(token);
  }

  // Lấy thông tin user từ localStorage
  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Lưu thông tin user và token
  static storeUserData(user: User, token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  // Xóa tất cả dữ liệu xác thực
  static clearStoredData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}