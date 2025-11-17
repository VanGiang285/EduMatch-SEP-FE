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
}

export interface ManageUserDto {
  email: string;
  userName?: string;
  phone?: string;
  isEmailConfirmed?: boolean;
  loginProvider: string;
  createdAt: string;
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
  subjectId: number;
  hourlyRate?: number;
  levelId?: number;
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
  learner?: UserDto;
  tutorSubject?: TutorSubjectDto;
  schedules?: ScheduleDto[];
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
  booking?: BookingDto;
  hasMeetingSession?: boolean;
  meetingSession?: MeetingSessionDto;
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

export interface UserBankAccountDto {
  id: number;
  userEmail: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
  createdAt: string;
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
