import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorStatus, VerifyStatus, TeachingMode } from '@/types';

export interface TutorProfile {
  id: number;
  userEmail: string;
  userName: string;
  bio?: string;
  teachingExp?: string;
  avatarUrl?: string;
  videoIntroUrl?: string;
  videoIntroPublicId?: string;
  teachingModes: TeachingMode;
  status: TutorStatus;
  createdAt: string;
  updatedAt?: string;
  province?: {
    id: number;
    name: string;
  };
  subDistrict?: {
    id: number;
    provinceId: number;
    name: string;
  };
  tutorAvailabilities?: ManagementTutorAvailability[];
  tutorCertificates?: ManagementTutorCertificate[];
  tutorEducations?: ManagementTutorEducation[];
  tutorSubjects?: ManagementTutorSubject[];
}

export interface ManagementTutorEducation {
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

export interface ManagementTutorCertificate {
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

export interface ManagementTutorSubject {
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
  tutor?: TutorProfile;
}

export interface ManagementTutorAvailability {
  id: number;
  tutorId: number;
  slotId: number;
  availabilityType: number;
  date?: string;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  status: number;
  createdAt: string;
  updatedAt?: string;
}

// Create request interfaces matching Backend
export interface TutorProfileCreateRequest {
  userName: string;
  phone: string;
  bio?: string;
  dateOfBirth: string; // ISO date string
  avatarFile?: File;
  provinceId: number;
  subDistrictId: number;
  teachingExp?: string;
  videoIntro?: File;
  videoIntroUrl?: string;
  teachingModes: TeachingMode;
}

export interface TutorEducationCreateRequest {
  tutorId: number; // Will be set by backend
  institutionId: number;
  issueDate?: string; // ISO date string
  certificateEducation?: File;
}

export interface TutorCertificateCreateRequest {
  tutorId: number; // Will be set by backend
  certificateTypeId: number;
  issueDate?: string; // ISO date string
  expiryDate?: string; // ISO date string
  certificate?: File;
}

export interface TutorSubjectCreateRequest {
  tutorId: number; // Will be set by backend
  subjectId: number;
  hourlyRate: number;
  levelId: number;
}

export interface TutorAvailabilityCreateRequest {
  tutorId: number; // Will be set by backend
  slotId: number;
  startDate: string; // ISO date string
}

export interface BecomeTutorRequest {
  tutorProfile: TutorProfileCreateRequest;
  educations?: TutorEducationCreateRequest[];
  certificates?: TutorCertificateCreateRequest[];
  subjects?: TutorSubjectCreateRequest[];
  availabilities: TutorAvailabilityCreateRequest[]; // Required
}

export interface UpdateTutorProfileRequest {
  hourlyRate?: number;
  bio?: string;
  experience?: number;
  teachingMode?: string;
}

export interface TutorEducationUpdateRequest {
  id: number;
  tutorId: number;
  institutionId: number;
  issueDate?: string;
  certificateEducation?: File;
  verified: VerifyStatus;
  rejectReason?: string;
}

export interface TutorCertificateUpdateRequest {
  id: number;
  tutorId: number;
  certificateTypeId: number;
  issueDate?: string;
  expiryDate?: string;
  certificate?: File;
  verified: VerifyStatus;
  rejectReason?: string;
}

export interface TutorSubjectUpdateRequest {
  id: number;
  tutorId: number;
  subjectId: number;
  hourlyRate?: number;
  levelId?: number;
}

export interface VerifyUpdateRequest {
  id: number;
  verified: VerifyStatus;
  rejectReason?: string;
}

// Legacy interface for backward compatibility
export interface LegacyBecomeTutorRequest {
  fullName: string;
  email: string;
  province: string;
  district: string;
  subjects: Array<{
    subjectId: number;
    levelId: number;
    hourlyRate: string;
  }>;
  birthDate: string;
  phone?: string;
  teachingMode?: number;
  profileImage?: File;
  certifications?: Array<{
    subjectId: number;
    certificateTypeId: number;
    issueDate: string;
    expiryDate: string;
    certificateFile?: File;
  }>;
  education?: Array<{
    institutionId: number;
    issueDate: string;
    degreeFile?: File;
  }>;
  introduction?: string;
  teachingExperience?: string;
  attractiveTitle?: string;
  videoFile?: File;
  youtubeLink?: string;
  // New schedule structure - array of availability records
  schedule?: Array<{tutorId: number, slotId: number, startDate: string}>;
  hourlyRate: string;
  priceDescription?: string;
}

// Helper function to convert legacy format to new format
function convertLegacyToNewFormat(legacyData: LegacyBecomeTutorRequest): BecomeTutorRequest {
  // Convert availability to availabilities
  const availabilities: TutorAvailabilityCreateRequest[] = [];
  
  if (legacyData.schedule && Array.isArray(legacyData.schedule)) {
    // Process the new schedule format: Array<{tutorId, slotId, startDate}>
    legacyData.schedule.forEach(availability => {
      availabilities.push({
        tutorId: availability.tutorId, // Will be overridden by backend
        slotId: availability.slotId,
        startDate: availability.startDate
      });
    });
  }
  
  // If no availability provided, add a default availability
  if (availabilities.length === 0) {
    availabilities.push({
      tutorId: 1, // Temporary value, will be set by backend
      slotId: 1,
      startDate: new Date().toISOString()
    });
  }

  return {
    tutorProfile: {
      userName: legacyData.fullName,
      phone: legacyData.phone || '0123456789', // Default phone if empty
      bio: legacyData.introduction,
      dateOfBirth: legacyData.birthDate,
      avatarFile: legacyData.profileImage,
      provinceId: parseInt(legacyData.province) || 1,
      subDistrictId: parseInt(legacyData.district) || 1,
      teachingExp: legacyData.teachingExperience,
      videoIntro: legacyData.videoFile,
      videoIntroUrl: legacyData.youtubeLink,
      teachingModes: (legacyData.teachingMode || 2) as TeachingMode
    },
    educations: legacyData.education?.map(edu => ({
      tutorId: 1, // Temporary value, will be set by backend
      institutionId: edu.institutionId,
      issueDate: edu.issueDate,
      certificateEducation: edu.degreeFile
    })),
    certificates: legacyData.certifications?.map(cert => ({
      tutorId: 1, // Temporary value, will be set by backend
      certificateTypeId: cert.certificateTypeId,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      certificate: cert.certificateFile
    })),
    subjects: legacyData.subjects?.map(subject => ({
      tutorId: 1, // Temporary value, will be set by backend
      subjectId: subject.subjectId,
      hourlyRate: parseFloat(subject.hourlyRate) || 0,
      levelId: subject.levelId
    })),
    availabilities: availabilities.map(av => ({
      ...av,
      tutorId: 1 // Temporary value, will be set by backend
    }))
  };
}

export class TutorManagementService {
  static async becomeTutor(request: BecomeTutorRequest | LegacyBecomeTutorRequest): Promise<ApiResponse<TutorProfile>> {
    // Convert legacy format if needed
    const newRequest = 'tutorProfile' in request ? request : convertLegacyToNewFormat(request);
    const formData = new FormData();
    
    // TutorProfile - handle file uploads separately
    const { avatarFile, videoIntro, ...tutorProfileData } = newRequest.tutorProfile;
    
    // Add profile data
    formData.append('TutorProfile.UserName', tutorProfileData.userName);
    formData.append('TutorProfile.Phone', tutorProfileData.phone);
    if (tutorProfileData.bio) formData.append('TutorProfile.Bio', tutorProfileData.bio);
    formData.append('TutorProfile.DateOfBirth', tutorProfileData.dateOfBirth);
    formData.append('TutorProfile.ProvinceId', tutorProfileData.provinceId.toString());
    formData.append('TutorProfile.SubDistrictId', tutorProfileData.subDistrictId.toString());
    if (tutorProfileData.teachingExp) formData.append('TutorProfile.TeachingExp', tutorProfileData.teachingExp);
    if (tutorProfileData.videoIntroUrl) formData.append('TutorProfile.VideoIntroUrl', tutorProfileData.videoIntroUrl);
    formData.append('TutorProfile.TeachingModes', tutorProfileData.teachingModes.toString());
    
    // Add files
    if (avatarFile) formData.append('TutorProfile.AvatarFile', avatarFile);
    if (videoIntro) formData.append('TutorProfile.VideoIntro', videoIntro);
    
    // Educations
    if (newRequest.educations && newRequest.educations.length > 0) {
      newRequest.educations.forEach((education, index) => {
        formData.append(`Educations[${index}].TutorId`, education.tutorId.toString());
        formData.append(`Educations[${index}].InstitutionId`, education.institutionId.toString());
        if (education.issueDate) formData.append(`Educations[${index}].IssueDate`, education.issueDate);
        if (education.certificateEducation) {
          formData.append(`Educations[${index}].CertificateEducation`, education.certificateEducation);
        }
      });
    }
    
    // Certificates
    if (newRequest.certificates && newRequest.certificates.length > 0) {
      newRequest.certificates.forEach((certificate, index) => {
        formData.append(`Certificates[${index}].TutorId`, certificate.tutorId.toString());
        formData.append(`Certificates[${index}].CertificateTypeId`, certificate.certificateTypeId.toString());
        if (certificate.issueDate) formData.append(`Certificates[${index}].IssueDate`, certificate.issueDate);
        if (certificate.expiryDate) formData.append(`Certificates[${index}].ExpiryDate`, certificate.expiryDate);
        if (certificate.certificate) {
          formData.append(`Certificates[${index}].Certificate`, certificate.certificate);
        }
      });
    }
    
    // Subjects
    if (newRequest.subjects && newRequest.subjects.length > 0) {
      newRequest.subjects.forEach((subject, index) => {
        formData.append(`Subjects[${index}].TutorId`, subject.tutorId.toString());
        formData.append(`Subjects[${index}].SubjectId`, subject.subjectId.toString());
        formData.append(`Subjects[${index}].HourlyRate`, subject.hourlyRate.toString());
        formData.append(`Subjects[${index}].LevelId`, subject.levelId.toString());
      });
    }
    
    // Availabilities (required)
    newRequest.availabilities.forEach((availability, index) => {
      formData.append(`Availabilities[${index}].TutorId`, availability.tutorId.toString());
      formData.append(`Availabilities[${index}].SlotId`, availability.slotId.toString());
      formData.append(`Availabilities[${index}].StartDate`, availability.startDate);
    });

    return apiClient.post<TutorProfile>(
      API_ENDPOINTS.TUTORS.BECOME_TUTOR, 
      formData
    );
  }

  /**
   * Update tutor education
   */
  static async updateEducation(id: number, request: TutorEducationUpdateRequest): Promise<ApiResponse<ManagementTutorEducation>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.UPDATE_EDUCATION, { id: id.toString() });
    const formData = new FormData();
    
    formData.append('Id', request.id.toString());
    formData.append('TutorId', request.tutorId.toString());
    formData.append('InstitutionId', request.institutionId.toString());
    if (request.issueDate) formData.append('IssueDate', request.issueDate);
    if (request.certificateEducation) formData.append('CertificateEducation', request.certificateEducation);
    formData.append('Verified', request.verified.toString());
    if (request.rejectReason) formData.append('RejectReason', request.rejectReason);

    return apiClient.put<ManagementTutorEducation>(endpoint, formData);
  }

  /**
   * Update tutor certificate
   */
  static async updateCertificate(id: number, request: TutorCertificateUpdateRequest): Promise<ApiResponse<ManagementTutorCertificate>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.UPDATE_CERTIFICATE, { id: id.toString() });
    const formData = new FormData();
    
    formData.append('Id', request.id.toString());
    formData.append('TutorId', request.tutorId.toString());
    formData.append('CertificateTypeId', request.certificateTypeId.toString());
    if (request.issueDate) formData.append('IssueDate', request.issueDate);
    if (request.expiryDate) formData.append('ExpiryDate', request.expiryDate);
    if (request.certificate) formData.append('Certificate', request.certificate);
    formData.append('Verified', request.verified.toString());
    if (request.rejectReason) formData.append('RejectReason', request.rejectReason);

    return apiClient.put<ManagementTutorCertificate>(endpoint, formData);
  }

  /**
   * Update tutor subject
   */
  static async updateTutorSubject(id: number, request: TutorSubjectUpdateRequest): Promise<ApiResponse<ManagementTutorSubject>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.UPDATE_TUTOR_SUBJECT, { id: id.toString() });
    return apiClient.put<ManagementTutorSubject>(endpoint, request);
  }

  /**
   * Batch verify education
   */
  static async verifyEducationBatch(tutorId: number, updates: VerifyUpdateRequest[]): Promise<ApiResponse<ManagementTutorEducation[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.VERIFY_EDUCATION_BATCH, { tutorId: tutorId.toString() });
    return apiClient.put<ManagementTutorEducation[]>(endpoint, updates);
  }

  /**
   * Batch verify certificate
   */
  static async verifyCertificateBatch(tutorId: number, updates: VerifyUpdateRequest[]): Promise<ApiResponse<ManagementTutorCertificate[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.VERIFY_CERTIFICATE_BATCH, { tutorId: tutorId.toString() });
    return apiClient.put<ManagementTutorCertificate[]>(endpoint, updates);
  }

  /**
   * Get tutors by status
   */
  static async getTutorsByStatus(status: TutorStatus): Promise<ApiResponse<TutorProfile[]>> {
    return apiClient.get<TutorProfile[]>(`${API_ENDPOINTS.TUTORS.GET_BY_STATUS}?status=${status}`);
  }

  /**
   * Get all tutors
   */
  static async getAllTutors(): Promise<ApiResponse<TutorProfile[]>> {
    return apiClient.get<TutorProfile[]>(API_ENDPOINTS.TUTORS.GET_ALL);
  }

  /**
   * Get tutor verifications (certificates and educations)
   */
  static async getTutorVerifications(tutorId: number): Promise<ApiResponse<{ certificates: ManagementTutorCertificate[], educations: ManagementTutorEducation[] }>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.GET_VERIFICATIONS, { tutorId: tutorId.toString() });
    return apiClient.get<{ certificates: ManagementTutorCertificate[], educations: ManagementTutorEducation[] }>(endpoint);
  }

  /**
   * Get tutor by ID
   */
  static async getTutorById(tutorId: number): Promise<ApiResponse<TutorProfile>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.GET_BY_ID, { tutorId: tutorId.toString() });
    return apiClient.get<TutorProfile>(endpoint);
  }
}

// Note: ManageTutorProfileService đã được tích hợp vào TutorManagementService
// Các methods cũ đã được thay thế bằng các methods mới trong TutorManagementService