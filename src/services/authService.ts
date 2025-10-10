import { apiClient } from '@/lib/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ApiResponse
} from '@/types/api';
import { User } from '@/types';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  static async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  }

  static async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH);
  }

  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> {
    return apiClient.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> {
    return apiClient.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  static async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  }

  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.USERS.PROFILE);
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static storeUserData(user: User, token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  static clearStoredData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}