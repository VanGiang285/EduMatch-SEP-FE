import { apiClient } from '@/lib/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  VerifyEmailResponse,
  ResendVerificationResponse,
  CurrentUserResponse,
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
  static async getCurrentUser(): Promise<ApiResponse<CurrentUserResponse>> {
    return apiClient.get<CurrentUserResponse>(API_ENDPOINTS.AUTH.GET_CURRENT_USER);
  }
  static async googleLogin(data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponse>> {
    console.log('🔍 Sending Google login request:', {
      endpoint: API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      data: { idToken: data.idToken.substring(0, 50) + '...' }
    });
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, data);
  }
  static async verifyEmail(token: string): Promise<ApiResponse<VerifyEmailResponse>> {
    return apiClient.get<VerifyEmailResponse>(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);
  }
  static async resendVerification(email: string): Promise<ApiResponse<ResendVerificationResponse>> {
    return apiClient.post<ResendVerificationResponse>(API_ENDPOINTS.AUTH.RESEND_VERIFY, email);
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