
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 50;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;
export const MIN_BIO_LENGTH = 100;
export const MAX_BIO_LENGTH = 1000;
export const MIN_HOURLY_RATE = 50000;
export const MAX_HOURLY_RATE = 1000000;

export const VALIDATION_RULES = {
  USER: {
    EMAIL: {
      PATTERN: EMAIL_REGEX,
      MAX_LENGTH: 255,
    },
    PASSWORD: {
      MIN_LENGTH: MIN_PASSWORD_LENGTH,
      MAX_LENGTH: MAX_PASSWORD_LENGTH,
      PATTERN: PASSWORD_REGEX,
    },
    NAME: {
      MIN_LENGTH: MIN_NAME_LENGTH,
      MAX_LENGTH: MAX_NAME_LENGTH,
      PATTERN: /^[a-zA-ZÀ-ỹ\s]+$/,
    },
    PHONE: {
      PATTERN: /^(\+84|84|0)[1-9][0-9]{8,9}$/,
    },
  },
  TUTOR: {
    BIO: {
      MIN_LENGTH: MIN_BIO_LENGTH,
      MAX_LENGTH: MAX_BIO_LENGTH,
    },
    HOURLY_RATE: {
      MIN: MIN_HOURLY_RATE,
      MAX: MAX_HOURLY_RATE,
    },
    EXPERIENCE: {
      MIN: 0,
      MAX: 50,
    },
    EDUCATION: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 500,
    },
  },
  REVIEW: {
    RATING: {
      MIN: 1,
      MAX: 5,
    },
    COMMENT: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 500,
    },
  },
  FILE: {
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
} as const;

export const VALIDATION_MESSAGES = {
  USER: {
    EMAIL_REQUIRED: 'Email là bắt buộc',
    EMAIL_INVALID: 'Email không hợp lệ',
    EMAIL_TOO_LONG: 'Email quá dài',
    PASSWORD_REQUIRED: 'Mật khẩu là bắt buộc',
    PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 8 ký tự',
    PASSWORD_TOO_LONG: 'Mật khẩu quá dài',
    PASSWORD_WEAK: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
    NAME_REQUIRED: 'Tên là bắt buộc',
    NAME_TOO_SHORT: 'Tên phải có ít nhất 2 ký tự',
    NAME_TOO_LONG: 'Tên quá dài',
    NAME_INVALID: 'Tên chỉ được chứa chữ cái và khoảng trắng',
    PHONE_REQUIRED: 'Số điện thoại là bắt buộc',
    PHONE_INVALID: 'Số điện thoại không hợp lệ',
  },
  TUTOR: {
    SUBJECTS_REQUIRED: 'Phải chọn ít nhất 1 môn học',
    HOURLY_RATE_REQUIRED: 'Mức lương theo giờ là bắt buộc',
    HOURLY_RATE_TOO_LOW: 'Mức lương theo giờ quá thấp',
    HOURLY_RATE_TOO_HIGH: 'Mức lương theo giờ quá cao',
    BIO_REQUIRED: 'Giới thiệu bản thân là bắt buộc',
    BIO_TOO_SHORT: 'Giới thiệu phải có ít nhất 100 ký tự',
    BIO_TOO_LONG: 'Giới thiệu quá dài',
    EXPERIENCE_INVALID: 'Kinh nghiệm phải từ 0 đến 50 năm',
    EDUCATION_REQUIRED: 'Học vấn là bắt buộc',
    EDUCATION_TOO_SHORT: 'Thông tin học vấn quá ngắn',
    EDUCATION_TOO_LONG: 'Thông tin học vấn quá dài',
  },
  REVIEW: {
    RATING_REQUIRED: 'Đánh giá là bắt buộc',
    RATING_INVALID: 'Đánh giá phải từ 1 đến 5 sao',
    COMMENT_REQUIRED: 'Bình luận là bắt buộc',
    COMMENT_TOO_SHORT: 'Bình luận phải có ít nhất 10 ký tự',
    COMMENT_TOO_LONG: 'Bình luận quá dài',
  },
  FILE: {
    TOO_LARGE: 'File quá lớn',
    INVALID_TYPE: 'Loại file không được hỗ trợ',
  },
  FORM: {
    TERMS_REQUIRED: 'Bạn phải đồng ý với điều khoản sử dụng',
  },
} as const;