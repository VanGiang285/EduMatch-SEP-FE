import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

// Types for Find Tutor API
export interface FindTutorProfile {
  id?: number;
  userEmail: string;
  bio?: string;
  teachingExp?: string;
  videoIntroUrl?: string;
  teachingModes: number; // 0: Offline, 1: Online, 2: Hybrid
  status: number; // 0: Pending, 1: Approved, 2: Rejected
  createdAt: string;
  updatedAt?: string;
  // User information
  userName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  // Related data
  educations?: FindTutorEducation[];
  certificates?: FindTutorCertificate[];
  subjects?: FindTutorSubject[];
}

export interface FindTutorEducation {
  id: number;
  tutorId: number;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface FindTutorCertificate {
  id: number;
  tutorId: number;
  certificateTypeId: number;
  certificateName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface FindTutorSubject {
  id: number;
  tutorId: number;
  subjectId: number;
  levelId: number;
  hourlyRate: number;
  experience: number;
  description?: string;
  subject?: {
    id: number;
    subjectName: string;
  };
  level?: {
    id: number;
    levelName: string;
  };
}

export interface FindTutorAvailability {
  tutorId: number;
  monday: FindTimeSlot[];
  tuesday: FindTimeSlot[];
  wednesday: FindTimeSlot[];
  thursday: FindTimeSlot[];
  friday: FindTimeSlot[];
  saturday: FindTimeSlot[];
  sunday: FindTimeSlot[];
}

export interface FindTimeSlot {
  startTime: string;
  endTime: string;
}

export interface TutorFilter {
  keyword?: string;
  gender?: number; // 1: Male, 2: Female, 3: Other
  city?: string;
  teachingMode?: 'Online' | 'Offline' | 'Both';
  statusId?: 'Pending' | 'Approved' | 'Rejected';
  page?: number;
  pageSize?: number;
}

export class FindTutorService {
  /**
   * Get all tutors (for public browsing)
   */
  static async getAllTutors(): Promise<ApiResponse<FindTutorProfile[]>> {
    return apiClient.get<FindTutorProfile[]>(API_ENDPOINTS.FIND_TUTORS.GET_ALL);
  }

  /**
   * Search and filter tutors using multiple criteria
   */
  static async searchTutors(filter: TutorFilter): Promise<ApiResponse<FindTutorProfile[]>> {
    return apiClient.post<FindTutorProfile[]>(API_ENDPOINTS.FIND_TUTORS.SEARCH, filter);
  }
}
