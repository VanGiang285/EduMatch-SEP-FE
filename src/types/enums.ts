/**
 * Enums tương ứng với Backend C# enums
 * Đồng bộ với các enum trong Backend EduMatch
 */

/**
 * Enum cho ngày trong tuần
 * Tương ứng với DayOfWeekEnum trong Backend
 */
export enum DayOfWeekEnum {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2,
  Other = 3,
}

export enum InstitutionType {
  Vocational = 0,
  College = 1,
  University = 2,
  Other = 3,
}

export enum TutorAvailabilityStatus {
  Available = 0,
  Booked = 1,
  InProgress = 2,
  Cancelled = 3,
}

export enum TeachingMode {
  Offline = 0,
  Online = 1,
  Hybrid = 2,
}

export enum TutorStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Suspended = 3,
  Deactivated = 4,
}

export enum VerifyStatus {
  Pending = 0,
  Verified = 1,
  Rejected = 2,
  Expired = 3,
  Removed = 4,
}

export enum PaymentStatus {
  Pending = 0, // Chưa thanh toán
  Paid = 1, // Đã thanh toán
  Refunded = 2, // Hoàn tiền
}

export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum ScheduleStatus {
  Upcoming = 0,
  InProgress = 1,
  Pending = 2,
  Processing = 3,
  Completed = 4,
  Cancelled = 5,
}

export enum ScheduleCompletionStatus {
  PendingConfirm = 0,
  LearnerConfirmed = 1,
  AutoCompleted = 2,
  ReportedOnHold = 3,
  Cancelled = 4,
}

export enum ScheduleChangeRequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3,
}

export enum TutorPayoutStatus {
  Pending = 0,
  OnHold = 1,
  ReadyForPayout = 2,
  Paid = 3,
  Cancelled = 4,
}

export enum ClassRequestStatus {
  Open = 0,
  Reviewing = 1,
  Selected = 2,
  Closed = 3,
  Cancelled = 4,
  Expired = 5,
}

export enum ClassApplicationStatus {
  Applied = 0, // Đã ứng tuyển
  UnderReview = 1, // Được xem xét
  Rejected = 2, // Từ chối
  Withdrawn = 3, // Gia sư rút
  Selected = 4, // Được chọn
}

export enum TutorApplicationStatus {
  Applied = 0,
  Canceled = 1,
}

export enum BookingRefundRequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum TutorVerificationRequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum MediaType {
  Image = 0,
  Video = 1,
}

export enum ReportEvidenceType {
  ReporterEvidence = 0,
  TutorDefense = 1,
  AdminAttachment = 2,
}

export enum ReportStatus {
  Pending = 0,
  UnderReview = 1,
  Resolved = 2,
  Dismissed = 3,
}

/**
 * Helper functions để convert enum values
 */
export const EnumHelpers = {
  /**
   * Lấy label tiếng Việt cho Gender
   */
  getGenderLabel: (gender: Gender): string => {
    switch (gender) {
      case Gender.Unknown:
        return 'Không xác định';
      case Gender.Male:
        return 'Nam';
      case Gender.Female:
        return 'Nữ';
      case Gender.Other:
        return 'Giới tính khác';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Convert string enum sang number enum cho TeachingMode
   */
  parseTeachingMode: (mode: TeachingMode | string | number): TeachingMode => {
    if (typeof mode === 'number') return mode;
    switch (mode) {
      case 'Offline':
      case '0':
        return TeachingMode.Offline;
      case 'Online':
      case '1':
        return TeachingMode.Online;
      case 'Hybrid':
      case '2':
        return TeachingMode.Hybrid;
      default:
        return TeachingMode.Offline;
    }
  },

  /**
   * Lấy label tiếng Việt cho TeachingMode
   */
  getTeachingModeLabel: (mode: TeachingMode | string | number): string => {
    const parsedMode = EnumHelpers.parseTeachingMode(mode);
    switch (parsedMode) {
      case TeachingMode.Offline:
        return 'Dạy trực tiếp';
      case TeachingMode.Online:
        return 'Dạy online';
      case TeachingMode.Hybrid:
        return 'Kết hợp';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho TutorStatus
   */
  getTutorStatusLabel: (status: TutorStatus): string => {
    switch (status) {
      case TutorStatus.Pending:
        return 'Chờ duyệt';
      case TutorStatus.Approved:
        return 'Đã duyệt';
      case TutorStatus.Rejected:
        return 'Bị từ chối';
      case TutorStatus.Suspended:
        return 'Tạm khóa';
      case TutorStatus.Deactivated:
        return 'Ngừng hoạt động';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Convert string/number sang VerifyStatus enum
   */
  parseVerifyStatus: (
    status: VerifyStatus | string | number | undefined | null
  ): VerifyStatus => {
    if (typeof status === 'number') {
      return status as VerifyStatus;
    }
    if (typeof status === 'string') {
      const trimmed = status.trim();
      const numeric = Number(trimmed);
      if (!Number.isNaN(numeric)) {
        return numeric as VerifyStatus;
      }
      switch (trimmed.toLowerCase()) {
        case 'pending':
          return VerifyStatus.Pending;
        case 'verified':
          return VerifyStatus.Verified;
        case 'rejected':
          return VerifyStatus.Rejected;
        case 'expired':
          return VerifyStatus.Expired;
        case 'removed':
          return VerifyStatus.Removed;
        default:
          return VerifyStatus.Pending;
      }
    }
    return VerifyStatus.Pending;
  },

  /**
   * Lấy label tiếng Việt cho VerifyStatus
   */
  getVerifyStatusLabel: (
    status: VerifyStatus | string | number | undefined | null
  ): string => {
    const parsedStatus = EnumHelpers.parseVerifyStatus(status);
    switch (parsedStatus) {
      case VerifyStatus.Pending:
        return 'Chờ duyệt';
      case VerifyStatus.Verified:
        return 'Đã xác minh';
      case VerifyStatus.Rejected:
        return 'Bị từ chối';
      case VerifyStatus.Expired:
        return 'Hết hạn';
      case VerifyStatus.Removed:
        return 'Đã xóa/thu hồi';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho InstitutionType
   */
  getInstitutionTypeLabel: (type: InstitutionType): string => {
    switch (type) {
      case InstitutionType.Vocational:
        return 'Trung cấp';
      case InstitutionType.College:
        return 'Cao đẳng';
      case InstitutionType.University:
        return 'Đại học';
      case InstitutionType.Other:
        return 'Khác';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho DayOfWeekEnum
   */
  getDayOfWeekLabel: (day: DayOfWeekEnum): string => {
    switch (day) {
      case DayOfWeekEnum.Sunday:
        return 'Chủ nhật';
      case DayOfWeekEnum.Monday:
        return 'Thứ hai';
      case DayOfWeekEnum.Tuesday:
        return 'Thứ ba';
      case DayOfWeekEnum.Wednesday:
        return 'Thứ tư';
      case DayOfWeekEnum.Thursday:
        return 'Thứ năm';
      case DayOfWeekEnum.Friday:
        return 'Thứ sáu';
      case DayOfWeekEnum.Saturday:
        return 'Thứ bảy';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Convert string/number enum sang TutorAvailabilityStatus enum
   */
  parseTutorAvailabilityStatus: (
    status: TutorAvailabilityStatus | string | number
  ): TutorAvailabilityStatus => {
    if (typeof status === 'number') return status;
    switch (status) {
      case 'Available':
      case '0':
        return TutorAvailabilityStatus.Available;
      case 'Booked':
      case '1':
        return TutorAvailabilityStatus.Booked;
      case 'InProgress':
      case '2':
        return TutorAvailabilityStatus.InProgress;
      case 'Cancelled':
      case '3':
        return TutorAvailabilityStatus.Cancelled;
      default:
        return TutorAvailabilityStatus.Available;
    }
  },

  /**
   * Lấy label tiếng Việt cho TutorAvailabilityStatus
   */
  getAvailabilityStatusLabel: (status: TutorAvailabilityStatus): string => {
    switch (status) {
      case TutorAvailabilityStatus.Available:
        return 'Trống';
      case TutorAvailabilityStatus.Booked:
        return 'Đã đặt';
      case TutorAvailabilityStatus.InProgress:
        return 'Đang học';
      case TutorAvailabilityStatus.Cancelled:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Convert từ API sang PaymentStatus enum
   */
  parsePaymentStatus: (
    status: PaymentStatus | string | number
  ): PaymentStatus => {
    if (typeof status === 'number') {
      return status as PaymentStatus;
    }
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending':
          return PaymentStatus.Pending;
        case 'Paid':
          return PaymentStatus.Paid;
        case 'Refunded':
          return PaymentStatus.Refunded;
        default:
          return PaymentStatus.Pending;
      }
    }
    return PaymentStatus.Pending;
  },

  /**
   * Lấy label tiếng Việt cho PaymentStatus
   */
  getPaymentStatusLabel: (status: PaymentStatus | string): string => {
    const parsedStatus = EnumHelpers.parsePaymentStatus(status);
    switch (parsedStatus) {
      case PaymentStatus.Pending:
        return 'Chưa thanh toán';
      case PaymentStatus.Paid:
        return 'Đã thanh toán';
      case PaymentStatus.Refunded:
        return 'Hoàn tiền';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Convert string enum sang number enum cho BookingStatus
   */
  parseBookingStatus: (status: BookingStatus | string): BookingStatus => {
    if (typeof status === 'number') return status;
    switch (status) {
      case 'Pending':
      case '0':
        return BookingStatus.Pending;
      case 'Confirmed':
      case '1':
        return BookingStatus.Confirmed;
      case 'Completed':
      case '2':
        return BookingStatus.Completed;
      case 'Cancelled':
      case '3':
        return BookingStatus.Cancelled;
      default:
        return BookingStatus.Pending;
    }
  },

  /**
   * Lấy label tiếng Việt cho BookingStatus
   */
  getBookingStatusLabel: (status: BookingStatus | string): string => {
    const parsedStatus = EnumHelpers.parseBookingStatus(status);
    switch (parsedStatus) {
      case BookingStatus.Pending:
        return 'Chờ xác nhận';
      case BookingStatus.Confirmed:
        return 'Đã xác nhận';
      case BookingStatus.Completed:
        return 'Hoàn thành';
      case BookingStatus.Cancelled:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Convert string enum sang number enum cho ScheduleStatus
   */
  parseScheduleStatus: (status: ScheduleStatus | string): ScheduleStatus => {
    if (typeof status === 'number') return status;
    switch (status) {
      case 'Upcoming':
      case '0':
        return ScheduleStatus.Upcoming;
      case 'InProgress':
      case '1':
        return ScheduleStatus.InProgress;
      case 'Pending':
      case '2':
        return ScheduleStatus.Pending;
      case 'Processing':
      case '3':
        return ScheduleStatus.Processing;
      case 'Completed':
      case '4':
        return ScheduleStatus.Completed;
      case 'Cancelled':
      case '5':
        return ScheduleStatus.Cancelled;
      default:
        return ScheduleStatus.Upcoming;
    }
  },

  /**
   * Lấy label tiếng Việt cho ScheduleStatus
   */
  getScheduleStatusLabel: (status: ScheduleStatus | string): string => {
    const parsedStatus = EnumHelpers.parseScheduleStatus(status);
    switch (parsedStatus) {
      case ScheduleStatus.Upcoming:
        return 'Sắp diễn ra';
      case ScheduleStatus.InProgress:
        return 'Đang học';
      case ScheduleStatus.Completed:
        return 'Hoàn thành';
      case ScheduleStatus.Cancelled:
        return 'Đã hủy';
      case ScheduleStatus.Pending:
        return 'Chờ xử lý';
      case ScheduleStatus.Processing:
        return 'Đang xử lý';
      default:
        return 'Không xác định';
    }
  },

  parseTutorApplicationStatus: (
    status: TutorApplicationStatus | string | number
  ): TutorApplicationStatus => {
    if (typeof status === 'number') {
      return status as TutorApplicationStatus;
    }
    if (typeof status === 'string') {
      if (status === 'Applied' || status === '0') {
        return TutorApplicationStatus.Applied;
      }
      if (status === 'Canceled' || status === 'Cancelled' || status === '1') {
        return TutorApplicationStatus.Canceled;
      }
    }
    return TutorApplicationStatus.Applied;
  },

  getTutorApplicationStatusLabel: (
    status: TutorApplicationStatus | string | number
  ): string => {
    const parsedStatus = EnumHelpers.parseTutorApplicationStatus(status);
    if (parsedStatus === TutorApplicationStatus.Applied) {
      return 'Đang ứng tuyển';
    }
    return 'Đã hủy';
  },

  /**
   * Convert string/number sang TutorVerificationRequestStatus
   */
  parseTutorVerificationRequestStatus: (
    status: TutorVerificationRequestStatus | string | number | undefined | null
  ): TutorVerificationRequestStatus => {
    if (typeof status === 'number') {
      return status as TutorVerificationRequestStatus;
    }
    if (typeof status === 'string') {
      const trimmed = status.trim();
      const numeric = Number(trimmed);
      if (!Number.isNaN(numeric)) {
        return numeric as TutorVerificationRequestStatus;
      }
      switch (trimmed.toLowerCase()) {
        case 'pending':
          return TutorVerificationRequestStatus.Pending;
        case 'approved':
          return TutorVerificationRequestStatus.Approved;
        case 'rejected':
          return TutorVerificationRequestStatus.Rejected;
        default:
          return TutorVerificationRequestStatus.Pending;
      }
    }
    return TutorVerificationRequestStatus.Pending;
  },

  /**
   * Convert string/number sang BookingRefundRequestStatus
   */
  parseBookingRefundRequestStatus: (
    status: BookingRefundRequestStatus | string | number | undefined | null
  ): BookingRefundRequestStatus => {
    if (typeof status === 'number') {
      return status as BookingRefundRequestStatus;
    }
    if (typeof status === 'string') {
      const trimmed = status.trim();
      const numeric = Number(trimmed);
      if (!Number.isNaN(numeric)) {
        return numeric as BookingRefundRequestStatus;
      }
      switch (trimmed.toLowerCase()) {
        case 'pending':
          return BookingRefundRequestStatus.Pending;
        case 'approved':
          return BookingRefundRequestStatus.Approved;
        case 'rejected':
          return BookingRefundRequestStatus.Rejected;
        default:
          return BookingRefundRequestStatus.Pending;
      }
    }
    return BookingRefundRequestStatus.Pending;
  },

  /**
   * Convert từ API sang ScheduleCompletionStatus enum
   */
  parseScheduleCompletionStatus: (
    status: ScheduleCompletionStatus | string | number
  ): ScheduleCompletionStatus => {
    if (typeof status === 'number') {
      return status as ScheduleCompletionStatus;
    }
    if (typeof status === 'string') {
      switch (status) {
        case 'PendingConfirm':
          return ScheduleCompletionStatus.PendingConfirm;
        case 'LearnerConfirmed':
          return ScheduleCompletionStatus.LearnerConfirmed;
        case 'AutoCompleted':
          return ScheduleCompletionStatus.AutoCompleted;
        case 'ReportedOnHold':
          return ScheduleCompletionStatus.ReportedOnHold;
        case 'Cancelled':
          return ScheduleCompletionStatus.Cancelled;
        default:
          return ScheduleCompletionStatus.PendingConfirm;
      }
    }
    return ScheduleCompletionStatus.PendingConfirm;
  },

  /**
   * Convert từ API sang ScheduleChangeRequestStatus enum
   */
  parseScheduleChangeRequestStatus: (
    status: ScheduleChangeRequestStatus | string | number
  ): ScheduleChangeRequestStatus => {
    if (typeof status === 'number') {
      return status as ScheduleChangeRequestStatus;
    }
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending':
          return ScheduleChangeRequestStatus.Pending;
        case 'Approved':
          return ScheduleChangeRequestStatus.Approved;
        case 'Rejected':
          return ScheduleChangeRequestStatus.Rejected;
        case 'Cancelled':
          return ScheduleChangeRequestStatus.Cancelled;
        default:
          return ScheduleChangeRequestStatus.Pending;
      }
    }
    return ScheduleChangeRequestStatus.Pending;
  },

  /**
   * Lấy label tiếng Việt cho ScheduleChangeRequestStatus
   */

  /**
   * Lấy label tiếng Việt cho ScheduleCompletionStatus
   */
  getScheduleCompletionStatusLabel: (
    status: ScheduleCompletionStatus | string | number
  ): string => {
    const parsedStatus = EnumHelpers.parseScheduleCompletionStatus(status);
    switch (parsedStatus) {
      case ScheduleCompletionStatus.PendingConfirm:
        return 'Chờ xác nhận';
      case ScheduleCompletionStatus.LearnerConfirmed:
        return 'Học viên đã xác nhận';
      case ScheduleCompletionStatus.AutoCompleted:
        return 'Tự động hoàn thành';
      case ScheduleCompletionStatus.ReportedOnHold:
        return 'Báo cáo/Tạm giữ';
      case ScheduleCompletionStatus.Cancelled:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho ScheduleChangeRequestStatus
   */
  getScheduleChangeRequestStatusLabel: (
    status: ScheduleChangeRequestStatus | string | number
  ): string => {
    const parsedStatus = EnumHelpers.parseScheduleChangeRequestStatus(status);
    switch (parsedStatus) {
      case ScheduleChangeRequestStatus.Pending:
        return 'Chờ xử lý';
      case ScheduleChangeRequestStatus.Approved:
        return 'Đã chấp nhận';
      case ScheduleChangeRequestStatus.Rejected:
        return 'Đã từ chối';
      case ScheduleChangeRequestStatus.Cancelled:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Convert từ API sang TutorPayoutStatus enum
   */
  parseTutorPayoutStatus: (
    status: TutorPayoutStatus | string | number
  ): TutorPayoutStatus => {
    if (typeof status === 'number') {
      return status as TutorPayoutStatus;
    }
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending':
          return TutorPayoutStatus.Pending;
        case 'OnHold':
          return TutorPayoutStatus.OnHold;
        case 'ReadyForPayout':
          return TutorPayoutStatus.ReadyForPayout;
        case 'Paid':
          return TutorPayoutStatus.Paid;
        case 'Cancelled':
          return TutorPayoutStatus.Cancelled;
        default:
          return TutorPayoutStatus.Pending;
      }
    }
    return TutorPayoutStatus.Pending;
  },

  /**
   * Lấy label tiếng Việt cho TutorPayoutStatus
   */
  getTutorPayoutStatusLabel: (
    status: TutorPayoutStatus | string | number
  ): string => {
    const parsedStatus = EnumHelpers.parseTutorPayoutStatus(status);
    switch (parsedStatus) {
      case TutorPayoutStatus.Pending:
        return 'Chờ thanh toán';
      case TutorPayoutStatus.OnHold:
        return 'Tạm giữ';
      case TutorPayoutStatus.ReadyForPayout:
        return 'Sẵn sàng thanh toán';
      case TutorPayoutStatus.Paid:
        return 'Đã thanh toán';
      case TutorPayoutStatus.Cancelled:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  },
};

/**
 * Type definitions cho các enum arrays
 */
export type GenderType = keyof typeof Gender;
export type TeachingModeType = keyof typeof TeachingMode;
export type TutorStatusType = keyof typeof TutorStatus;
export type VerifyStatusType = keyof typeof VerifyStatus;
export type InstitutionTypeType = keyof typeof InstitutionType;
export type DayOfWeekType = keyof typeof DayOfWeekEnum;
export type TutorAvailabilityStatusType = keyof typeof TutorAvailabilityStatus;
