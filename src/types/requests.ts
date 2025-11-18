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
  userName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string; // ISO date string
  avatarUrl?: string;
  provinceId?: number;
  subDistrictId?: number;
  teachingExp?: string;
  videoIntroUrl?: string;
  latitude?: number;
  longitude?: number;
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
  provinceId?: number;
  subDistrictId?: number;
}

export interface UpdateTutorStatusRequest {
  status: TutorStatus;
}

// ==================== TUTOR SUBJECT REQUESTS ====================

export interface TutorSubjectCreateRequest {
  tutorId: number; // Backend sẽ set, truyền 0
  subjectId: number;
  hourlyRate: number; // Required
  levelId: number; // Required
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
  tutorId: number; // Backend sẽ set, truyền 0
  institutionId: number;
  issueDate?: string;
  certificateEducationUrl?: string; // Backend dùng tên này
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
  tutorId: number; // Backend sẽ set, truyền 0
  certificateTypeId: number;
  issueDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
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
  tutorId: number; // Backend sẽ set, truyền 0
  slotId: number; // Required
  startDate: string; // Required, ISO 8601 date-time
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

// ==================== SYSTEM FEE REQUESTS ====================

export interface SystemFeeCreateRequest {
  name: string;
  percentage?: number;
  fixedAmount?: number;
  isActive?: boolean;
}

export interface SystemFeeUpdateRequest {
  id: number;
  name: string;
  percentage?: number;
  fixedAmount?: number;
  isActive?: boolean;
}

// ==================== WALLET REQUESTS ====================

export interface CreateDepositRequest {
  amount: number; // Range: 50,000 - 5,000,000 VND
}

export interface CreateWithdrawalRequest {
  amount: number;
  userBankAccountId: number;
}

export interface CreateUserBankAccountRequest {
  bankId: number;
  accountNumber: string;
  accountHolderName: string;
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
  expectedSessions?: number; // Alias for expectedTotalSessions (backend may use this)
  targetUnitPriceMin?: number;
  targetUnitPriceMax?: number;
  description?: string;
  title?: string; // Required by backend
  learningGoal?: string; // Required by backend
  tutorRequirement?: string; // Required by backend
  expectedStartDate?: string; // Required by backend (ISO date string)
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

// ==================== CLASS REQUEST ADDITIONAL REQUESTS ====================

export interface IsApprovedClassRequestDto {
  isApproved: boolean;
  rejectionReason?: string; // null nếu duyệt
}

export interface CancelClassRequestDto {
  reason: string;
}

// ==================== TUTOR APPLICATION REQUESTS ====================

export interface TutorApplyRequest {
  classRequestId: number;
  message: string; // Required
}

export interface TutorApplicationEditRequest {
  tutorApplicationId: number; // Required
  message: string; // Required
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

