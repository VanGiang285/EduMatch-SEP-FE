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

export enum Gender {
  Unknown = 0,
  Male = 1,   
  Female = 2,  
  Other = 3   
}

export enum InstitutionType {
  Vocational = 0,  
  College = 1,     
  University = 2,  
  Other = 3        
}

export enum TutorAvailabilityStatus {
  Available = 0,   
  Booked = 1,      
  InProgress = 2,  
  Cancelled = 3    
}

export enum TeachingMode {
  Offline = 0, 
  Online = 1, 
  Hybrid = 2   
}

export enum TutorStatus {
  Pending = 0,     
  Approved = 1,    
  Rejected = 2,    
  Suspended = 3,   
  Deactivated = 4  
}

export enum VerifyStatus {
  Pending = 0,   
  Verified = 1,  
  Rejected = 2,  
  Expired = 3,  
  Removed = 4    
}

export enum PaymentStatus {
  Unpaid = 0,    
  Paid = 1,      
  Refunded = 2   
}

export enum BookingStatus {
  Pending = 0,   
  Confirmed = 1, 
  Completed = 2,  
  Cancelled = 3   
}

export enum ScheduleStatus {
  Upcoming = 0,  
  InProgress = 1, 
  Completed = 2,  
  Cancelled = 3, 
  Absent = 4     
}

export enum ClassRequestStatus {
  Open = 0,       
  Reviewing = 1,  
  Selected = 2,   
  Closed = 3,    
  Cancelled = 4, 
  Expired = 5    
}

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
