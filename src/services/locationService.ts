import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

// Types for Location API
export interface ProvinceDto {
  id: number;
  name: string;
  code?: string;
}

export interface SubDistrictDto {
  id: number;
  name: string;
  code?: string;
  provinceId: number;
}

export class LocationService {
  /**
   * Get all provinces
   */
  static async getAllProvinces(): Promise<ApiResponse<ProvinceDto[]>> {
    return apiClient.get<ProvinceDto[]>(API_ENDPOINTS.USER_PROFILES.GET_PROVINCES);
  }

  /**
   * Get all sub-districts by province ID
   */
  static async getSubDistrictsByProvinceId(provinceId: number): Promise<ApiResponse<SubDistrictDto[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.USER_PROFILES.GET_SUB_DISTRICTS, { 
      provinceId: provinceId.toString() 
    });
    return apiClient.get<SubDistrictDto[]>(endpoint);
  }
}

