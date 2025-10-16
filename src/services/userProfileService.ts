import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

// Types for User Profile API
export interface UserProfile {
  id: number;
  userEmail: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  bio?: string;
  avatarUrl?: string;
}

export class UserProfileService {
  /**
   * Get user profile by email
   */
  static async getUserProfileByEmail(email: string): Promise<ApiResponse<UserProfile>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.USER_PROFILES.GET_BY_EMAIL, { email });
    return apiClient.get<UserProfile>(endpoint);
  }

  /**
   * Update user profile by email
   */
  static async updateUserProfileByEmail(
    email: string, 
    userData: UpdateUserProfileRequest
  ): Promise<ApiResponse<string>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.USER_PROFILES.UPDATE_BY_EMAIL, { email });
    return apiClient.put<string>(endpoint, userData);
  }
}

