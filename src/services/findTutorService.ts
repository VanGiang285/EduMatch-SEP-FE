import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorStatus, VerifyStatus, TeachingMode, Gender, TutorAvailabilityStatus } from '@/types';

export interface FindTutorProfile {
  id: number;
  userEmail: string;
  bio?: string;
  teachingExp?: string;
  videoIntroUrl?: string;
  videoIntroPublicId?: string;
  teachingModes: TeachingMode;
  status: TutorStatus;
  createdAt: string;
  updatedAt?: string;
  tutorAvailabilities?: FindTutorAvailability[];
  tutorCertificates?: FindTutorCertificate[];
  tutorEducations?: FindTutorEducation[];
  tutorSubjects?: FindTutorSubject[];
}

export interface FindTutorEducation {
  id: number;
  tutorId: number;
  institutionId: number;
  issueDate?: string;
  certificateUrl?: string;
  certificatePublicId?: string;
  createdAt?: string;
  verified: VerifyStatus;
  rejectReason?: string;
  institution?: {
    id: number;
    code: string;
    name: string;
    institutionType: number;
    createdAt: string;
  };
}

export interface FindTutorCertificate {
  id: number;
  tutorId: number;
  certificateTypeId: number;
  issueDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
  certificatePublicId?: string;
  createdAt?: string;
  verified: VerifyStatus;
  rejectReason?: string;
  certificateType?: {
    id: number;
    code: string;
    name: string;
    createdAt: string;
  };
}

export interface FindTutorSubject {
  id: number;
  tutorId: number;
  subjectId: number;
  hourlyRate?: number;
  levelId?: number;
  level?: {
    id: number;
    levelName: string;
  };
  subject?: {
    id: number;
    subjectName: string;
  };
  tutor?: FindTutorProfile;
}

export interface FindTutorAvailability {
  id: number;
  tutorId: number;
  slotId: number;
  availabilityType: number;
  date?: string;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  status: TutorAvailabilityStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface TutorFilter {
  keyword?: string;
  gender?: Gender;
  city?: number;
  teachingMode?: TeachingMode;
  statusId?: TutorStatus;
  page?: number;
  pageSize?: number;
}

export class FindTutorService {
  static async getAllTutors(): Promise<ApiResponse<FindTutorProfile[]>> {
    return apiClient.get<FindTutorProfile[]>(API_ENDPOINTS.FIND_TUTORS.GET_ALL);
  }

  static async searchTutors(filter: TutorFilter): Promise<ApiResponse<FindTutorProfile[]>> {
    return apiClient.post<FindTutorProfile[]>(API_ENDPOINTS.FIND_TUTORS.SEARCH, filter);
  }
}