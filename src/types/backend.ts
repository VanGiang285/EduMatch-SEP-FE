/**
 * Backend DTOs and Types
 * Sync with Backend C# DTOs
 */

import {
  Gender,
  TeachingMode,
  TutorStatus,
  VerifyStatus,
  InstitutionType,
  BookingStatus,
  PaymentStatus,
  ScheduleStatus,
  TutorAvailabilityStatus,
  DayOfWeekEnum,
  BookingRefundRequestStatus,
  TutorVerificationRequestStatus,
  ReportStatus,
  ScheduleCompletionStatus,
  TutorPayoutStatus,
  ScheduleChangeRequestStatus,
  MediaType,
} from './enums';

// ==================== COMMON ====================

export interface ApiResponseBackend<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export interface ProvinceDto {
  id: number;
  name: string;
}

export interface SubDistrictDto {
  id: number;
  provinceId: number;
  name: string;
  province?: ProvinceDto;
}

export interface SubjectDto {
  id: number;
  subjectName: string;
}

export interface LevelDto {
  id: number;
  name: string;
}

export interface TimeSlotDto {
  id: number;
  startTime: string; // time format "HH:mm:ss"
  endTime: string;
  dayOfWeek?: number;
}

// ==================== USER & AUTH ====================

export interface RoleDto {
  id: number;
  roleName: string;
}

export interface UserDto {
  email: string;
  userName?: string;
  passwordHash?: string;
  phone?: string;
  isEmailConfirmed?: boolean;
  loginProvider: string; // "Local" | "Google"
  createdAt: string;
  isActive?: boolean;
  roleId: number;
  role?: RoleDto;
  tutorProfile?: TutorProfileDto;
  userProfile?: UserProfileDto;
}

export interface UserProfileDto {
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
  province?: ProvinceDto;
  subDistrict?: SubDistrictDto;
  userEmailNavigation?: {
    email: string;
    userName?: string;
    phone?: string;
    [key: string]: any;
  };
}

export interface ManageUserDto {
  id?: number;
  email: string;
  userName?: string;
  phone?: string;
  isEmailConfirmed?: boolean;
  loginProvider: string;
  createdAt?: string;
  createAt?: string; // Backend uses createAt (without 'd')
  isActive?: boolean;
  roleId: number;
  roleName: string;
  avatarUrl?: string;
}

// ==================== TUTOR ====================

export interface TutorProfileDto {
  id: number;
  userEmail: string;
  bio?: string;
  avatarUrl?: string;
  dob?: string;
  gender?: Gender;
  addressLine?: string;
  province?: ProvinceDto;
  subDistrict?: SubDistrictDto;
  latitude?: number;
  longitude?: number;
  phone?: string;
  userName?: string;
  teachingExp?: string;
  videoIntroUrl?: string;
  videoIntroPublicId?: string;
  teachingModes: TeachingMode | string;
  status: TutorStatus | string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
  tutorAvailabilities?: TutorAvailabilityDto[];
  tutorCertificates?: TutorCertificateDto[];
  tutorEducations?: TutorEducationDto[];
  tutorSubjects?: TutorSubjectDto[];
}

export interface TutorSubjectDto {
  id: number;
  tutorId: number;
  subjectId?: number; // Có thể không có trong response từ API
  hourlyRate?: number;
  levelId?: number; // Có thể không có trong response từ API
  level?: LevelDto;
  subject?: SubjectDto;
  tutorEmail?: string;
  tutor?: TutorProfileDto;
}

export interface TutorAvailabilityDto {
  id: number;
  tutorId: number;
  slotId: number;
  startDate: string;
  endDate?: string;
  status: TutorAvailabilityStatus;
  createdAt: string;
  updatedAt?: string;
  slot?: TimeSlotDto;
  tutor?: TutorProfileDto;
}

export interface TutorCertificateDto {
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
  certificateType?: CertificateTypeDto;
  tutor?: TutorProfileDto;
}

export interface TutorEducationDto {
  id: number;
  tutorId: number;
  institutionId: number;
  issueDate?: string;
  certificateUrl?: string;
  certificatePublicId?: string;
  createdAt?: string;
  verified: VerifyStatus;
  rejectReason?: string;
  institution?: EducationInstitutionDto;
  tutor?: TutorProfileDto;
}

export interface TutorApplicationItemDto {
  applicationId: number;
  tutorId: number;
  tutorName: string;
  avatarUrl?: string;
  message: string;
  appliedAt: string;
}

export interface TutorAppliedItemDto {
  id: number;
  classRequestId: number;
  learnerName: string;
  avatarUrl?: string;
  title: string;
  subjectName: string;
  level: string;
  mode: string;
  expectedStartDate?: string;
  expectedSessions: number;
  targetUnitPriceMin?: number;
  targetUnitPriceMax?: number;
  message: string;
  classRequestStatus: string;
  tutorApplicationStatus: number;
  appliedAt: string;
}

export interface CertificateTypeDto {
  id: number;
  code: string;
  name: string;
  createdAt?: string;
  verified: VerifyStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  subjects?: SubjectDto[];
}

export interface EducationInstitutionDto {
  id: number;
  code: string;
  name: string;
  institutionType?: InstitutionType;
  createdAt?: string;
  verified: VerifyStatus;
  verifiedBy?: string;
  verifiedAt?: string;
}

// ==================== BOOKING & SCHEDULE ====================

export interface BookingDto {
  id: number;
  learnerEmail: string;
  tutorSubjectId: number;
  bookingDate: string;
  totalSessions: number;
  unitPrice: number;
  totalAmount: number;
  paymentStatus: PaymentStatus | string;
  refundedAmount: number;
  status: BookingStatus | string;
  createdAt: string;
  updatedAt?: string;
  systemFee?: SystemFeeDto;
  systemFeeAmount: number;
  tutorReceiveAmount: number;
  learner?: UserDto;
  tutorSubject?: TutorSubjectDto;
  schedules?: ScheduleDto[];
}

export interface BookingCancelPreviewDto {
  bookingId: number;
  upcomingSchedules: number;
  refundableAmount: number;
}

export interface ScheduleCompletionDto {
  id: number;
  scheduleId: number;
  bookingId: number;
  tutorId: number;
  learnerEmail: string;
  status: ScheduleCompletionStatus | string | number;
  confirmationDeadline: string;
  confirmedAt?: string;
  autoCompletedAt?: string;
  reportId?: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TutorPayoutDto {
  id: number;
  scheduleId: number;
  bookingId: number;
  tutorWalletId: number;
  amount: number;
  systemFeeAmount: number;
  status: TutorPayoutStatus | string | number;
  payoutTrigger: number;
  scheduledPayoutDate: string; // DateOnly format "YYYY-MM-DD"
  releasedAt?: string;
  walletTransactionId?: number;
  holdReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ScheduleDto {
  id: number;
  availabilitiId: number;
  bookingId: number;
  status: ScheduleStatus | string;
  attendanceNote?: string;
  isRefunded: boolean;
  refundedAt?: string;
  createdAt: string;
  updatedAt?: string;
  availability?: TutorAvailabilityDto;
  hasMeetingSession: boolean;
  meetingSession?: MeetingSessionDto;
  scheduleCompletion?: ScheduleCompletionDto;
  tutorPayout?: TutorPayoutDto;
  booking?: BookingDto;
}

export interface ScheduleChangeRequestDto {
  id: number;
  scheduleId: number;
  requesterEmail: string;
  requestedToEmail: string;
  oldAvailabilitiId: number;
  newAvailabilitiId: number;
  reason?: string;
  status: ScheduleChangeRequestStatus | string | number;
  createdAt: string;
  processedAt?: string;
  schedule?: ScheduleDto;
  oldAvailability?: TutorAvailabilityDto;
  newAvailability?: TutorAvailabilityDto;
}

export interface ScheduleAttendanceSummaryDto {
  studied: number;
  notStudiedYet: number;
  cancelled: number;
}

export interface SystemFeeDto {
  id: number;
  name: string;
  percentage?: number;
  fixedAmount?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MeetingSessionDto {
  id: number;
  scheduleId: number;
  meetLink: string;
  meetCode?: string;
  startTime: string;
  endTime: string;
  meetingType: number; // MeetingType enum
  createdAt: string;
  updatedAt?: string;
}

// ==================== REFUNDS & DISPUTES ====================

export interface RefundPolicyDto {
  id: number;
  name: string;
  description?: string;
  refundPercentage: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface RefundRequestEvidenceDto {
  id: number;
  bookingRefundRequestId: number;
  fileUrl: string;
  createdAt: string;
  bookingRefundRequest?: BookingRefundRequestDto;
}

export interface BookingRefundRequestDto {
  id: number;
  bookingId: number;
  learnerEmail: string;
  refundPolicyId: number;
  reason?: string;
  status: BookingRefundRequestStatus;
  approvedAmount?: number;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  booking?: BookingDto;
  refundPolicy?: RefundPolicyDto;
  learner?: UserDto;
  refundRequestEvidences?: RefundRequestEvidenceDto[];
}

export interface BookingNoteMediaDto {
  id: number;
  bookingNoteId: number;
  mediaType: MediaType;
  fileUrl: string;
  filePublicId?: string;
  createdAt: string;
}

export interface BookingNoteDto {
  id: number;
  bookingId: number;
  content: string;
  createdByEmail?: string;
  createdAt: string;
  media?: BookingNoteMediaDto[];
}

export interface TutorVerificationRequestDto {
  id: number;
  userEmail: string;
  tutorId?: number;
  status: TutorVerificationRequestStatus;
  description?: string;
  adminNote?: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  tutor?: TutorProfileDto;
  user?: UserDto;
}

// ==================== AI CHATBOT ====================

export interface ChatRequestDto {
  sessionId?: number;
  message: string;
}

export interface ChatSuggestionTutorDto {
  rank?: number;
  tutorId?: number;
  name: string;
  subjects?: string[];
  levels?: string[];
  teachingExp?: string;
  province?: string;
  subDistrict?: string;
  hourlyRates?: (number | string)[];
  matchScore?: number;
  profileUrl?: string;
}

export interface ChatResponseDto {
  sessionId: number;
  reply: string;
  suggestions?: ChatSuggestionTutorDto[];
}

export interface ChatSessionDto {
  id: number;
  createdAt: string;
  lastMessage?: string;
}

export interface ChatMessageDto {
  sessionId: number;
  role: string;
  message: string;
  createdAt: string;
}

// ==================== REPORTS ====================

export interface ReportListItemDto {
  id: number;
  reporterEmail: string;
  reporterName?: string;
  reporterAvatarUrl?: string;
  reportedUserEmail: string;
  reportedUserName?: string;
  reportedAvatarUrl?: string;
  reason: string;
  status: ReportStatus;
  bookingId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportDetailDto extends ReportListItemDto {
  tutorDefenseNote?: string;
  adminNotes?: string;
  handledByAdminEmail?: string;
  booking?: BookingDto;
}

export interface ReportEvidenceDto {
  id: number;
  reportId: number;
  submittedByEmail?: string;
  mediaType: number;
  evidenceType: number;
  fileUrl: string;
  filePublicId?: string;
  caption?: string;
  createdAt: string;
}

export interface ReportDefenseDto {
  id: number;
  reportId: number;
  tutorEmail: string;
  note: string;
  createdAt: string;
  evidences?: ReportEvidenceDto[];
}

export interface ReportFullDetailDto extends ReportDetailDto {
  defenses?: ReportDefenseDto[];
  reporterEvidences?: ReportEvidenceDto[];
  tutorEvidences?: ReportEvidenceDto[];
  adminEvidences?: ReportEvidenceDto[];
}

// ==================== WALLET & PAYMENT ====================

export enum WalletTransactionType {
  DEBIT = 0, // Rút/Trừ tiền
  CREDIT = 1, // Nạp/Cộng tiền
}

export enum WalletTransactionReason {
  DEPOSIT = 0, // Nạp tiền
  WITHDRAWAL = 1, // Rút tiền
  PAYMENT_BOOKING = 2, // Thanh toán booking
  REFUND_BOOKING = 3, // Hoàn tiền booking
  RECEIVE_FROM_BOOKING = 4, // Nhận tiền từ booking
  PLATFORM_FEE = 5, // Thu phí nền tảng
}

export enum WalletTransactionStatus {
  PENDING = 0,
  COMPLETED = 1,
  FAILED = 2,
}

export enum DepositStatus {
  PENDING = 0,
  COMPLETED = 1,
  FAILED = 2,
}

export enum WithdrawalStatus {
  PENDING = 0, // Chờ duyệt
  APPROVED = 1, // Đã duyệt (Đang xử lý)
  REJECTED = 2, // Bị từ chối
  COMPLETED = 3, // Hoàn thành
  FAILED = 4, // Thất bại
}

export interface WalletDto {
  id: number;
  userEmail: string;
  balance: number;
  lockedBalance: number;
  createdAt: string;
  updatedAt?: string;
}

export interface WalletTransactionDto {
  id: number;
  walletId: number;
  amount: number;
  transactionType: WalletTransactionType;
  reason: WalletTransactionReason;
  status: WalletTransactionStatus;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  referenceCode?: string;
  bookingId?: number;
  depositId?: number;
  withdrawalId?: number;
  wallet?: WalletDto;
  booking?: BookingDto;
}

export interface DepositDto {
  id: number;
  walletId: number;
  amount: number;
  status: DepositStatus;
  paymentGateway?: string; // "PayOS" | "MoMo" | "VNPay"
  gatewayTransactionCode?: string;
  createdAt: string;
  completedAt?: string;
  wallet?: WalletDto;
}

export interface BankDto {
  id: number;
  code: string;
  name: string;
  shortName: string;
  logoUrl?: string;
}

export interface UserBankAccountDto {
  id: number;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
  bank: BankDto;
}

export interface WithdrawalDto {
  id: number;
  walletId: number;
  amount: number;
  status: WithdrawalStatus;
  userBankAccountId: number;
  adminEmail?: string;
  rejectReason?: string;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  wallet?: WalletDto;
  userBankAccount?: UserBankAccountDto;
}

export interface AdminWithdrawalDto {
  id: number;
  amount: number;
  status: WithdrawalStatus | string;
  createdAt: string;
  userBankAccount: UserBankAccountDto;
  wallet: WalletDto;
}

export interface SystemWalletDashboardDto {
  pendingTutorPayoutBalance: number;
  platformRevenueBalance: number;
  totalUserAvailableBalance: number;
}

export interface AdminSummaryStatsDto {
  users: UserStatsDto;
  tutors: TutorStatsDto;
  bookings: BookingStatsDto;
  revenue: RevenueStatsDto;
  refunds: RefundStatsDto;
  reports: ReportStatsDto;
}

export interface BookingStatsDto {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface UserStatsDto {
  total: number;
  active: number;
  learners: number;
  tutors: number;
  newLast30Days: number;
}

export interface TutorStatsDto {
  approved: number;
  pending: number;
  rejected: number;
  suspended: number;
  deactivated: number;
}

export interface RevenueStatsDto {
  platformRevenueBalance: number;
  pendingTutorPayoutBalance: number;
  totalUserAvailableBalance: number;
}

export interface RefundStatsDto {
  pending: number;
  approved: number;
  rejected: number;
}

export interface ReportStatsDto {
  pending: number;
  underReview: number;
  resolved: number;
  dismissed: number;
  overduePending: number;
}

export interface MonthlyAdminStatsDto {
  year: number;
  month: number;
  users: UserStatsDto;
  bookings: BookingStatsDto;
  revenue: MonthlyRevenueStatsDto;
}

export interface MonthlyRevenueStatsDto {
  tutorPayoutAmount: number;
  refundedAmount: number;
  netPlatformRevenueAmount: number;
}

// ==================== NOTIFICATIONS ====================

export interface NotificationDto {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

// ==================== CHAT ====================

export interface ChatRoomDto {
  id: number;
  userEmail: string;
  tutorId: number;
  createdAt: string;
  user?: UserDto;
  tutor?: TutorProfileDto;
  lastMessage?: ChatMessageDto;
}

export interface ChatMessageDto {
  id: number;
  chatRoomId: number;
  senderEmail: string;
  receiverEmail: string;
  messageText: string;
  sentAt: string;
  isRead: boolean;
  chatRoom?: ChatRoomDto;
}

// ==================== FAVORITE ====================

export interface FavoriteTutorDto {
  id: number;
  userEmail: string;
  tutorId: number;
  createdAt: string;
  user?: UserDto;
  tutor?: TutorProfileDto;
}

// ==================== CLASS REQUEST ====================

export interface ClassRequestDto {
  id: number;
  userEmail: string;
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
  status: number; // ClassRequestStatus enum
  createdAt: string;
  updatedAt?: string;
  subject?: SubjectDto;
  level?: LevelDto;
  province?: ProvinceDto;
  subDistrict?: SubDistrictDto;
  slots?: ClassRequestSlotDto[];
  applications?: ClassApplicationDto[];
}

export interface ClassRequestSlotDto {
  id: number;
  classRequestId: number;
  dayOfWeek: DayOfWeekEnum;
  slotId: number;
  slot?: TimeSlotDto;
}

export interface ClassApplicationDto {
  id: number;
  classRequestId: number;
  tutorId: number;
  proposalMessage?: string;
  availabilityNote?: string;
  status: number; // ClassApplicationStatus enum
  createdAt: string;
  updatedAt?: string;
  tutor?: TutorProfileDto;
  classRequest?: ClassRequestDto;
}

// ==================== FEEDBACK (Tutor Feedback) ====================

export interface TutorFeedbackDto {
  id: number;
  tutorId: number;
  bookingId: number;
  learnerEmail: string;
  overallRating: number; // Average of all criteria ratings
  comment?: string;
  createdAt: string;
  updateAt?: string;
  feedbackDetails: TutorFeedbackDetailDto[];
}

export interface TutorFeedbackDetailDto {
  criterionId: number;
  criteriaName?: string;
  rating: number; // 1-5
}

export interface FeedbackCriterion {
  id: number;
  code: string;
  name: string;
  description?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface TutorRatingSummary {
  id: number;
  tutorId: number;
  averageRating: number;
  totalFeedbackCount: number;
  updatedAt: string;
}

// ==================== SEARCH & FILTER ====================

export interface TutorFilterDto {
  keyword?: string;
  gender?: Gender;
  city?: number;
  teachingMode?: TeachingMode;
  statusId?: TutorStatus;
  page?: number;
  pageSize?: number;
}
