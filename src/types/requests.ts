/**
 * Backend Request Models
 * Tương ứng với C# Request classes trong Backend
 */

import {
  Gender,
  TeachingMode,
  TutorStatus,
  VerifyStatus,
  InstitutionType,
  TutorAvailabilityStatus
} from './enums';

// ==================== AUTH REQUESTS ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface CreateAdminAccDto {
  email: string;
  password: string;
}

// ==================== USER PROFILE REQUESTS ====================

export interface UserProfileUpdateRequest {
  userEmail: string;
  dob?: string;
  gender?: Gender;
  avatarUrl?: string;
  avatarUrlPublicId?: string;
  cityId?: number;
  subDistrictId?: number;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
}

// ==================== TUTOR PROFILE REQUESTS ====================

export interface TutorProfileCreateRequest {
  userEmail: string;
  bio?: string;
  teachingExp?: string;
  videoIntroUrl?: string;
  videoIntroPublicId?: string;
  teachingModes: TeachingMode;
}

export interface TutorProfileUpdateRequest {
  id: number;
  bio?: string;
  teachingExp?: string;
  videoIntroUrl?: string;
  videoIntroPublicId?: string;
  teachingModes?: TeachingMode;
  status?: TutorStatus;
}

export interface UpdateTutorStatusRequest {
  status: TutorStatus;
}

// ==================== TUTOR SUBJECT REQUESTS ====================

export interface TutorSubjectCreateRequest {
  tutorId: number;
  subjectId: number;
  hourlyRate?: number;
  levelId?: number;
}

export interface TutorSubjectUpdateRequest {
  id: number;
  tutorId: number;
  subjectId: number;
  hourlyRate?: number;
  levelId?: number;
}

// ==================== TUTOR EDUCATION REQUESTS ====================

export interface TutorEducationCreateRequest {
  tutorId: number;
  institutionId: number;
  issueDate?: string;
  certificateUrl?: string;
  certificatePublicId?: string;
}

export interface TutorEducationUpdateRequest {
  id: number;
  tutorId: number;
  institutionId: number;
  issueDate?: string;
  certificateUrl?: string;
  certificatePublicId?: string;
  verified?: VerifyStatus;
  rejectReason?: string;
}

export interface EducationInstitutionCreateRequest {
  code: string;
  name: string;
  institutionType?: InstitutionType;
}

export interface EducationInstitutionUpdateRequest {
  id: number;
  code?: string;
  name?: string;
  institutionType?: InstitutionType;
  verified?: VerifyStatus;
  verifiedBy?: string;
  verifiedAt?: string;
}

// ==================== TUTOR CERTIFICATE REQUESTS ====================

export interface TutorCertificateCreateRequest {
  tutorId: number;
  certificateTypeId: number;
  issueDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
  certificatePublicId?: string;
}

export interface TutorCertificateUpdateRequest {
  id: number;
  tutorId: number;
  certificateTypeId: number;
  issueDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
  certificatePublicId?: string;
  verified?: VerifyStatus;
  rejectReason?: string;
}

export interface CertificateTypeCreateRequest {
  code: string;
  name: string;
}

export interface CertificateTypeUpdateRequest {
  id: number;
  code?: string;
  name?: string;
  verified?: VerifyStatus;
  verifiedBy?: string;
  verifiedAt?: string;
}

// ==================== TUTOR AVAILABILITY REQUESTS ====================

export interface TutorAvailabilityCreateRequest {
  tutorId: number;
  slotId: number;
  startDate: string; // ISO 8601 date-time
  endDate?: string;
  status?: TutorAvailabilityStatus;
}

export interface TutorAvailabilityUpdateRequest {
  id: number;
  tutorId?: number;
  slotId?: number;
  startDate?: string;
  endDate?: string;
  status?: TutorAvailabilityStatus;
}

// ==================== BECOME TUTOR REQUEST ====================

export interface BecomeTutorRequest {
  tutorProfile: TutorProfileCreateRequest;
  educations: TutorEducationCreateRequest[];
  certificates?: TutorCertificateCreateRequest[];
  subjects?: TutorSubjectCreateRequest[];
  availabilities: TutorAvailabilityCreateRequest[];
}

// ==================== VERIFY REQUESTS ====================

export interface VerifyUpdateRequest {
  id: number;
  verified: VerifyStatus;
  rejectReason?: string;
}

// ==================== LEVEL REQUESTS ====================

export interface LevelCreateRequest {
  name: string;
}

export interface LevelUpdateRequest {
  id: number;
  name: string;
}

// ==================== SUBJECT REQUESTS ====================

export interface SubjectCreateRequest {
  subjectName: string;
}

export interface SubjectUpdateRequest {
  id: number;
  subjectName: string;
}

// ==================== TIME SLOT REQUESTS ====================

export interface TimeSlotCreateRequest {
  startTime: string; // "HH:mm:ss"
  endTime: string;
}

export interface TimeSlotUpdateRequest {
  id: number;
  startTime: string;
  endTime: string;
}

// ==================== BOOKING REQUESTS ====================

export interface CreateBookingRequest {
  tutorSubjectId: number;
  bookingDate: string;
  totalSessions: number;
  notes?: string;
}

export interface UpdateBookingRequest {
  id: number;
  status?: number; // BookingStatus
  paymentStatus?: number; // PaymentStatus
}

// ==================== WALLET REQUESTS ====================

export interface CreateDepositRequest {
  amount: number;
  paymentGateway: string; // "PayOS" | "MoMo" | "VNPay"
}

export interface CreateWithdrawalRequest {
  amount: number;
  userBankAccountId: number;
}

export interface CreateUserBankAccountRequest {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault?: boolean;
}

export interface ProcessWithdrawalRequest {
  withdrawalId: number;
  status: number; // WithdrawalStatus
  rejectReason?: string;
}

// ==================== CLASS REQUEST REQUESTS ====================

export interface CreateClassRequestRequest {
  subjectId: number;
  levelId?: number;
  teachingMode: TeachingMode;
  provinceId?: number;
  subDistrictId?: number;
  addressLine?: string;
  expectedTotalSessions: number;
  targetUnitPriceMin?: number;
  targetUnitPriceMax?: number;
  description?: string;
  slots: CreateClassRequestSlotRequest[];
}

export interface CreateClassRequestSlotRequest {
  dayOfWeek: number; // 0-6
  slotId: number;
}

export interface UpdateClassRequestRequest {
  id: number;
  status?: number; // ClassRequestStatus
}

export interface CreateClassApplicationRequest {
  classRequestId: number;
  tutorId: number;
  proposalMessage?: string;
  availabilityNote?: string;
}

export interface UpdateClassApplicationRequest {
  id: number;
  status?: number; // ClassApplicationStatus
}

// ==================== GOOGLE MEETING REQUESTS ====================

export interface CreateMeetingRequest {
  summary: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;
  attendeeEmails?: string[];
  timeZone?: string;
}

