import {
  Gender,
  TeachingMode,
  TutorStatus,
  VerifyStatus,
  InstitutionType,
  TutorAvailabilityStatus,
  TutorVerificationRequestStatus,
} from './enums';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
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

export interface UserProfileUpdateRequest {
  userEmail: string;
  userName?: string;
  phone?: string;
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

export interface TutorProfileCreateRequest {
  userEmail: string;
  userName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
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
  phone: string;
  userName: string;
  userEmail: string;
  dateOfBirth: string;
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

export interface TutorSubjectCreateRequest {
  tutorId?: number;
  subjectId: number;
  hourlyRate: number;
  levelId: number;
}

export interface TutorSubjectUpdateRequest {
  id: number;
  tutorId: number;
  subjectId: number;
  hourlyRate?: number;
  levelId?: number;
}

export interface TutorEducationCreateRequest {
  tutorId?: number;
  institutionId: number;
  issueDate?: string;
  certificateEducationUrl?: string;
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

export interface TutorCertificateCreateRequest {
  tutorId?: number;
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

export interface TutorAvailabilityCreateRequest {
  tutorId?: number;
  slotId: number;
  startDate: string;
}

export interface TutorAvailabilityUpdateRequest {
  id: number;
  tutorId?: number;
  slotId?: number;
  startDate?: string;
  endDate?: string;
  status?: TutorAvailabilityStatus;
}

export interface BecomeTutorRequest {
  tutorProfile: TutorProfileCreateRequest;
  educations: TutorEducationCreateRequest[];
  certificates?: TutorCertificateCreateRequest[];
  subjects?: TutorSubjectCreateRequest[];
  availabilities: TutorAvailabilityCreateRequest[];
}

export interface VerifyUpdateRequest {
  id: number;
  verified: VerifyStatus;
  rejectReason?: string;
}

export interface LevelCreateRequest {
  name: string;
}

export interface LevelUpdateRequest {
  id: number;
  name: string;
}

export interface SubjectCreateRequest {
  subjectName: string;
}

export interface SubjectUpdateRequest {
  id: number;
  subjectName: string;
}

export interface TimeSlotCreateRequest {
  startTime: string;
  endTime: string;
}

export interface TimeSlotUpdateRequest {
  id: number;
  startTime: string;
  endTime: string;
}

export interface CreateBookingRequest {
  tutorSubjectId: number;
  bookingDate: string;
  totalSessions: number;
  notes?: string;
}

export interface UpdateBookingRequest {
  id: number;
  status?: number;
  paymentStatus?: number;
}

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

export interface CreateDepositRequest {
  amount: number;
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
  status: number;
  rejectReason?: string;
}

export interface CreateClassRequestRequest {
  subjectId: number;
  levelId?: number;
  teachingMode: TeachingMode;
  provinceId?: number;
  subDistrictId?: number;
  addressLine?: string;
  expectedTotalSessions: number;
  expectedSessions?: number;
  targetUnitPriceMin?: number;
  targetUnitPriceMax?: number;
  description?: string;
  title?: string;
  learningGoal?: string;
  tutorRequirement?: string;
  expectedStartDate?: string;
  slots: CreateClassRequestSlotRequest[];
}

export interface CreateClassRequestSlotRequest {
  dayOfWeek: number;
  slotId: number;
}

export interface UpdateClassRequestRequest {
  id: number;
  subjectId: number;
  levelId: number;
  mode: TeachingMode;
  expectedSessions: number;
  targetUnitPriceMin: number;
  targetUnitPriceMax: number;
  title: string;
  learningGoal: string;
  tutorRequirement: string;
  expectedStartDate: string;
  addressLine?: string;
  provinceId?: number;
  subDistrictId?: number;
  latitude?: number;
  longitude?: number;
  slots: CreateClassRequestSlotRequest[];
  status?: number;
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

export interface IsApprovedClassRequestDto {
  isApproved: boolean;
  rejectionReason?: string;
}

export interface CancelClassRequestDto {
  reason: string;
}

export interface TutorApplyRequest {
  classRequestId: number;
  message: string;
}

export interface TutorApplicationEditRequest {
  tutorApplicationId: number;
  message: string;
}

export interface CreateMeetingRequest {
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendeeEmails?: string[];
  timeZone?: string;
}

export interface BookingRefundRequestCreateRequest {
  bookingId: number;
  learnerEmail: string;
  refundPolicyId: number;
  reason?: string;
  fileUrls?: string[];
}

export interface RefundPolicyCreateRequest {
  name: string;
  description?: string;
  refundPercentage: number;
}

export interface RefundPolicyUpdateRequest {
  id: number;
  name?: string;
  description?: string;
  refundPercentage?: number;
}

export interface TutorVerificationRequestFilter {
  email?: string;
  tutorId?: number;
  status?: TutorVerificationRequestStatus;
}

export interface RejectTutorRequest {
  reason: string;
}

export interface ChatRequest {
  sessionId?: number;
  message: string;
}

export interface ReportEvidenceCreateRequest {
  mediaType: number;
  evidenceType?: number;
  defenseId?: number;
  fileUrl: string;
  filePublicId?: string;
  caption?: string;
}

export interface ReportEvidenceUpdateRequest {
  mediaType?: number;
  evidenceType?: number;
  fileUrl?: string;
  filePublicId?: string;
  caption?: string;
}

export interface BasicEvidenceRequest {
  mediaType: number;
  fileUrl: string;
  filePublicId?: string;
  caption?: string;
}

export interface ReportDefenseCreateRequest {
  note: string;
  evidences?: BasicEvidenceRequest[];
}

export interface ReportDefenseUpdateRequest {
  note: string;
}

export interface ReportCreateRequest {
  reportedUserEmail: string;
  reason: string;
  evidences?: BasicEvidenceRequest[];
}

export interface ReportUpdateByLearnerRequest {
  reason: string;
}

export interface ReportUpdateRequest {
  status: number;
  adminNotes?: string;
}

export interface TutorComplaintRequest {
  defenseNote: string;
}

export interface CreateTutorFeedbackRequest {
  bookingId: number;
  tutorId: number;
  comment?: string;
  feedbackDetails: CreateTutorFeedbackDetailRequest[];
}

export interface CreateTutorFeedbackDetailRequest {
  criterionId: number;
  rating: number;
}

export interface UpdateTutorFeedbackRequest {
  bookingId: number;
  tutorId: number;
  comment?: string;
  feedbackDetails: import('./backend').TutorFeedbackDetailDto[];
}
