import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

// Types for Master Data API
export interface SubjectDto {
  id: number;
  subjectName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LevelDto {
  id: number;
  levelName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTypeDto {
  id: number;
  certificateTypeName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subjects?: CertificateTypeSubjectDto[];
}

export interface CertificateTypeSubjectDto {
  id: number;
  certificateTypeId: number;
  subjectId: number;
  subjectName: string;
}

export interface EducationInstitutionDto {
  id: number;
  institutionName: string;
  institutionType: 'University' | 'College' | 'High School' | 'Other';
  address?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlotDto {
  id: number;
  startTime: string;
  endTime: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class MasterDataService {
  /**
   * Get all subjects
   */
  static async getAllSubjects(): Promise<ApiResponse<SubjectDto[]>> {
    return apiClient.get<SubjectDto[]>(API_ENDPOINTS.SUBJECTS.GET_ALL);
  }

  /**
   * Get all levels
   */
  static async getAllLevels(): Promise<ApiResponse<LevelDto[]>> {
    return apiClient.get<LevelDto[]>(API_ENDPOINTS.LEVELS.GET_ALL);
  }

  /**
   * Get all certificate types with subjects
   */
  static async getAllCertificateTypesWithSubjects(): Promise<ApiResponse<CertificateTypeDto[]>> {
    return apiClient.get<CertificateTypeDto[]>(API_ENDPOINTS.CERTIFICATES.GET_ALL_WITH_SUBJECTS);
  }

  /**
   * Get all education institutions
   */
  static async getAllEducationInstitutions(): Promise<ApiResponse<EducationInstitutionDto[]>> {
    return apiClient.get<EducationInstitutionDto[]>(API_ENDPOINTS.EDUCATION.GET_ALL_INSTITUTIONS);
  }

  /**
   * Get all time slots
   */
  static async getAllTimeSlots(): Promise<ApiResponse<TimeSlotDto[]>> {
    return apiClient.get<TimeSlotDto[]>(API_ENDPOINTS.TIME_SLOTS.GET_ALL);
  }
}

