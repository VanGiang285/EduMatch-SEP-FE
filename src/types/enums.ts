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
  Saturday = 6
}

/**
 * Enum cho giới tính
 * Tương ứng với Gender enum trong Backend
 */
export enum Gender {
  Unknown = 0, // Không xác định
  Male = 1,    // Nam
  Female = 2,  // Nữ
  Other = 3    // Giới tính khác
}

/**
 * Enum cho loại trường học
 * Tương ứng với InstitutionType enum trong Backend
 */
export enum InstitutionType {
  Vocational = 0,  // Trung cấp / Vocational
  College = 1,     // Cao đẳng / College
  University = 2,  // Đại học / University
  Other = 3        // Khác / Other types
}

/**
 * Enum cho trạng thái lịch trống của gia sư
 * Tương ứng với TutorAvailabilityStatus enum trong Backend
 */
export enum TutorAvailabilityStatus {
  Available = 0,   // Lịch trống, có thể được đặt
  Booked = 1,      // Lịch đã được học viên đặt nhưng chưa diễn ra
  InProgress = 2,  // Đang có buổi học diễn ra hoặc đã được xác nhận học
  Cancelled = 3    // Lịch đã bị hủy bởi tutor hoặc hệ thống
}

/**
 * Enum cho phương thức dạy
 * Tương ứng với TeachingMode enum trong Backend
 */
export enum TeachingMode {
  Offline = 0, // Dạy trực tiếp
  Online = 1,  // Dạy online
  Hybrid = 2   // Kết hợp
}

/**
 * Enum cho trạng thái gia sư
 * Tương ứng với TutorStatus enum trong Backend
 */
export enum TutorStatus {
  Pending = 0,     // Chờ duyệt
  Approved = 1,    // Đã duyệt
  Rejected = 2,    // Bị từ chối
  Suspended = 3,   // Tạm khóa
  Deactivated = 4  // Ngừng hoạt động
}

/**
 * Enum cho trạng thái xác minh
 * Tương ứng với VerifyStatus enum trong Backend
 */
export enum VerifyStatus {
  Pending = 0,   // Chờ duyệt
  Verified = 1,  // Đã xác minh
  Rejected = 2,  // Bị từ chối
  Expired = 3,   // Hết hạn
  Removed = 4    // Đã xóa / thu hồi
}

/**
 * Enum cho trạng thái thanh toán
 * Tương ứng với PaymentStatus trong DB
 */
export enum PaymentStatus {
  Unpaid = 0,    // Chưa thanh toán
  Paid = 1,      // Đã thanh toán
  Refunded = 2   // Hoàn tiền
}

/**
 * Enum cho trạng thái booking
 * Tương ứng với BookingStatus trong DB
 */
export enum BookingStatus {
  Pending = 0,    // Chờ xác nhận
  Confirmed = 1,  // Đã xác nhận
  Completed = 2,  // Hoàn thành
  Cancelled = 3   // Đã hủy
}

/**
 * Enum cho trạng thái schedule
 * Tương ứng với ScheduleStatus trong DB
 */
export enum ScheduleStatus {
  Upcoming = 0,   // Sắp diễn ra
  InProgress = 1, // Đang học
  Completed = 2,  // Hoàn thành
  Cancelled = 3,  // Đã hủy
  Absent = 4      // Vắng mặt
}

/**
 * Enum cho trạng thái class request
 * Tương ứng với ClassRequestStatus trong DB
 */
export enum ClassRequestStatus {
  Open = 0,       // Mở
  Reviewing = 1,  // Đang xem xét
  Selected = 2,   // Đã chọn
  Closed = 3,     // Đóng
  Cancelled = 4,  // Hủy
  Expired = 5     // Hết hạn
}

/**
 * Enum cho trạng thái class application
 * Tương ứng với ClassApplicationStatus trong DB
 */
export enum ClassApplicationStatus {
  Applied = 0,    // Đã ứng tuyển
  UnderReview = 1, // Được xem xét
  Rejected = 2,   // Từ chối
  Withdrawn = 3,  // Gia sư rút
  Selected = 4    // Được chọn
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
      case Gender.Unknown: return 'Không xác định';
      case Gender.Male: return 'Nam';
      case Gender.Female: return 'Nữ';
      case Gender.Other: return 'Giới tính khác';
      default: return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho TeachingMode
   */
  getTeachingModeLabel: (mode: TeachingMode): string => {
    switch (mode) {
      case TeachingMode.Offline: return 'Dạy trực tiếp';
      case TeachingMode.Online: return 'Dạy online';
      case TeachingMode.Hybrid: return 'Kết hợp';
      default: return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho TutorStatus
   */
  getTutorStatusLabel: (status: TutorStatus): string => {
    switch (status) {
      case TutorStatus.Pending: return 'Chờ duyệt';
      case TutorStatus.Approved: return 'Đã duyệt';
      case TutorStatus.Rejected: return 'Bị từ chối';
      case TutorStatus.Suspended: return 'Tạm khóa';
      case TutorStatus.Deactivated: return 'Ngừng hoạt động';
      default: return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho VerifyStatus
   */
  getVerifyStatusLabel: (status: VerifyStatus): string => {
    switch (status) {
      case VerifyStatus.Pending: return 'Chờ duyệt';
      case VerifyStatus.Verified: return 'Đã xác minh';
      case VerifyStatus.Rejected: return 'Bị từ chối';
      case VerifyStatus.Expired: return 'Hết hạn';
      case VerifyStatus.Removed: return 'Đã xóa/thu hồi';
      default: return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho InstitutionType
   */
  getInstitutionTypeLabel: (type: InstitutionType): string => {
    switch (type) {
      case InstitutionType.Vocational: return 'Trung cấp';
      case InstitutionType.College: return 'Cao đẳng';
      case InstitutionType.University: return 'Đại học';
      case InstitutionType.Other: return 'Khác';
      default: return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho DayOfWeekEnum
   */
  getDayOfWeekLabel: (day: DayOfWeekEnum): string => {
    switch (day) {
      case DayOfWeekEnum.Sunday: return 'Chủ nhật';
      case DayOfWeekEnum.Monday: return 'Thứ hai';
      case DayOfWeekEnum.Tuesday: return 'Thứ ba';
      case DayOfWeekEnum.Wednesday: return 'Thứ tư';
      case DayOfWeekEnum.Thursday: return 'Thứ năm';
      case DayOfWeekEnum.Friday: return 'Thứ sáu';
      case DayOfWeekEnum.Saturday: return 'Thứ bảy';
      default: return 'Không xác định';
    }
  },

  /**
   * Lấy label tiếng Việt cho TutorAvailabilityStatus
   */
  getAvailabilityStatusLabel: (status: TutorAvailabilityStatus): string => {
    switch (status) {
      case TutorAvailabilityStatus.Available: return 'Trống';
      case TutorAvailabilityStatus.Booked: return 'Đã đặt';
      case TutorAvailabilityStatus.InProgress: return 'Đang học';
      case TutorAvailabilityStatus.Cancelled: return 'Đã hủy';
      default: return 'Không xác định';
    }
  }
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
