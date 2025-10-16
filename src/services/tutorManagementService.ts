import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

// Types for Tutor Management API
export interface TutorProfile {
  id: number;
  userEmail: string;
  hourlyRate: number;
  bio?: string;
  experience?: number;
  teachingMode?: 'Online' | 'Offline' | 'Both';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  // Related data
  educations?: ManagementTutorEducation[];
  certificates?: ManagementTutorCertificate[];
  subjects?: ManagementTutorSubject[];
  availabilities?: ManagementTutorAvailability[];
}

export interface ManagementTutorEducation {
  id?: number;
  tutorId?: number;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface ManagementTutorCertificate {
  id?: number;
  tutorId?: number;
  certificateTypeId: number;
  certificateName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ManagementTutorSubject {
  id?: number;
  tutorId?: number;
  subjectId: number;
  levelId: number;
  hourlyRate: number;
  experience: number;
  description?: string;
}

export interface ManagementTutorAvailability {
  tutorId?: number;
  monday: ManagementTimeSlot[];
  tuesday: ManagementTimeSlot[];
  wednesday: ManagementTimeSlot[];
  thursday: ManagementTimeSlot[];
  friday: ManagementTimeSlot[];
  saturday: ManagementTimeSlot[];
  sunday: ManagementTimeSlot[];
}

export interface ManagementTimeSlot {
  startTime: string;
  endTime: string;
}

export interface BecomeTutorRequest {
  tutorProfile: {
    userEmail: string;
    hourlyRate: number;
    bio?: string;
    experience?: number;
    teachingMode?: 'Online' | 'Offline' | 'Both';
  };
  educations?: ManagementTutorEducation[];
  certificates?: ManagementTutorCertificate[];
  subjects?: ManagementTutorSubject[];
  availabilities?: ManagementTutorAvailability;
}

export interface UpdateTutorProfileRequest {
  hourlyRate?: number;
  bio?: string;
  experience?: number;
  teachingMode?: 'Online' | 'Offline' | 'Both';
}

export class TutorManagementService {
  /**
   * Become a tutor - create tutor profile
   */
  static async becomeTutor(request: BecomeTutorRequest): Promise<ApiResponse<{ profile: TutorProfile }>> {
    const formData = new FormData();
    
    // Add tutor profile data
    formData.append('TutorProfile', JSON.stringify(request.tutorProfile));
    
    // Add educations if provided
    if (request.educations && request.educations.length > 0) {
      formData.append('Educations', JSON.stringify(request.educations));
    }
    
    // Add certificates if provided
    if (request.certificates && request.certificates.length > 0) {
      formData.append('Certificates', JSON.stringify(request.certificates));
    }
    
    // Add subjects if provided
    if (request.subjects && request.subjects.length > 0) {
      formData.append('Subjects', JSON.stringify(request.subjects));
    }
    
    // Add availabilities if provided
    if (request.availabilities) {
      formData.append('Availabilities', JSON.stringify(request.availabilities));
    }

    return apiClient.post<{ profile: TutorProfile }>(
      API_ENDPOINTS.TUTORS.BECOME_TUTOR, 
      formData,
      { 'Content-Type': 'multipart/form-data' }
    );
  }

  /**
   * Test send mail (development only)
   */
  static async testSendMail(): Promise<ApiResponse<string>> {
    return apiClient.get<string>(API_ENDPOINTS.TUTORS.TEST_SEND_MAIL);
  }
}

export class ManageTutorProfileService {
  /**
   * Get tutor profile by ID
   */
  static async getTutorProfileById(id: number): Promise<ApiResponse<TutorProfile>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.MANAGE_TUTOR_PROFILES.GET_BY_ID, { id });
    return apiClient.get<TutorProfile>(endpoint);
  }

  /**
   * Get tutor profile by email
   */
  static async getTutorProfileByEmail(email: string): Promise<ApiResponse<TutorProfile>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.MANAGE_TUTOR_PROFILES.GET_BY_EMAIL, { email });
    return apiClient.get<TutorProfile>(endpoint);
  }

  /**
   * Update tutor profile by email
   */
  static async updateTutorProfileByEmail(
    email: string, 
    tutorData: UpdateTutorProfileRequest
  ): Promise<ApiResponse<string>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.MANAGE_TUTOR_PROFILES.UPDATE_BY_EMAIL, { email });
    return apiClient.put<string>(endpoint, tutorData);
  }
}
