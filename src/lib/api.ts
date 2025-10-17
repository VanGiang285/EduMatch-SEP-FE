import { ApiResponse, ApiError } from '@/types/api';
import { APP_CONFIG } from '@/constants/config';
import { STORAGE_KEYS } from '@/constants';
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  constructor() {
    this.baseURL = APP_CONFIG.API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('API Base URL:', this.baseURL);
    }
  }
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  private getHeaders(customHeaders?: Record<string, string>, isFormData?: boolean): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type'];
    }
    
    const token = this.getAuthToken();
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth token:', token ? `${token.substring(0, 20)}...` : 'No token');
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      throw new ApiError({
        status: response.status,
        message: 'Failed to parse response',
        code: 'PARSE_ERROR',
      });
    }
    // Debug logging for response data
    if (process.env.NODE_ENV === 'development') {
      console.log('Response data:', data);
    }
    if (!response.ok) {
      const error = new ApiError({
        status: response.status,
        message: data.message || data.error || 'An error occurred',
        code: data.code || 'UNKNOWN_ERROR',
        details: data.details,
      });
      // Debug logging for error
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', error);
      }
      throw error;
    }
           return {
             success: true,
             data: data.data || data,
             error: undefined,
             message: data.message,
           };
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const headers = this.getHeaders(options.headers as Record<string, string>, isFormData);
    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    };
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Making request to:', url);
      console.log('Request config:', config);
      console.log('Authorization header:', (config.headers as any)?.Authorization);
    }
    try {
      const response = await fetch(url, config);
      // Debug logging for response
      if (process.env.NODE_ENV === 'development') {
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      }
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Debug logging for error
      if (process.env.NODE_ENV === 'development') {
        console.error('Request error:', error);
      }
      throw new ApiError({
        status: 0,
        message: 'Network error or request failed',
        code: 'NETWORK_ERROR',
        details: error,
      });
    }
  }
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search, {
      method: 'GET',
    });
  }
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : null,
    });
  }
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : null,
    });
  }
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    });
  }
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
  async uploadFile<T>(endpoint: string, file: File, fieldName = 'file'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }
}
export const apiClient = new ApiClient();
export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(`${APP_CONFIG.API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
};
export const replaceUrlParams = (endpoint: string, params: Record<string, string>): string => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  return url;
};
export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.status === 'number' && typeof error.message === 'string';
};
export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
export const getErrorCode = (error: any): string => {
  if (isApiError(error)) {
    return error.code || 'UNKNOWN_ERROR';
  }
  return 'UNKNOWN_ERROR';
};
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (isApiError(error) && error.status >= 400 && error.status < 500) {
        throw error;
      }
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
};