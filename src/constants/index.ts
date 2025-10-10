export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  BECOME_TUTOR: '/become-tutor',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  BOOKINGS: '/bookings',
  TUTORS: '/tutors',
  TUTOR_DETAIL: '/tutors/:id',
  REVIEWS: '/reviews',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SUBJECTS = {
  MATH: 'Toán học',
  PHYSICS: 'Vật lý',
  CHEMISTRY: 'Hóa học',
  BIOLOGY: 'Sinh học',
  LITERATURE: 'Ngữ văn',
  HISTORY: 'Lịch sử',
  GEOGRAPHY: 'Địa lý',
  ENGLISH: 'Tiếng Anh',
  CHINESE: 'Tiếng Trung',
  JAPANESE: 'Tiếng Nhật',
  CIVICS: 'GDCD',
  COMPUTER_SCIENCE: 'Tin học',
} as const;

export const SUBJECT_CATEGORIES = {
  NATURAL_SCIENCES: 'Khoa học Tự nhiên',
  SOCIAL_SCIENCES: 'Khoa học Xã hội',
  LANGUAGES: 'Ngoại ngữ',
  TEST_PREP: 'Luyện thi',
} as const;

export const SUBJECT_LEVELS = {
  ELEMENTARY: 'Tiểu học',
  MIDDLE_SCHOOL: 'THCS',
  HIGH_SCHOOL: 'THPT',
  UNIVERSITY: 'Đại học',
  ADULT: 'Người lớn',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  TUTORS: {
    LIST: '/api/tutors',
    DETAIL: '/api/tutors/:id',
    CREATE: '/api/tutors',
    UPDATE: '/api/tutors/:id',
    DELETE: '/api/tutors/:id',
    SEARCH: '/api/tutors/search',
    AVAILABILITY: '/api/tutors/:id/availability',
  },
  BOOKINGS: {
    LIST: '/api/bookings',
    DETAIL: '/api/bookings/:id',
    CREATE: '/api/bookings',
    UPDATE: '/api/bookings/:id',
    DELETE: '/api/bookings/:id',
    CANCEL: '/api/bookings/:id/cancel',
    CONFIRM: '/api/bookings/:id/confirm',
  },
  REVIEWS: {
    LIST: '/api/reviews',
    DETAIL: '/api/reviews/:id',
    CREATE: '/api/reviews',
    UPDATE: '/api/reviews/:id',
    DELETE: '/api/reviews/:id',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    UPLOAD_AVATAR: '/api/users/upload-avatar',
  },
  UPLOAD: {
    IMAGE: '/api/upload/image',
    DOCUMENT: '/api/upload/document',
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+84|84|0)[1-9][0-9]{8,9}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 1000,
  COMMENT_MAX_LENGTH: 500,
} as const;

export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 0,
} as const;

export const TIME = {
  DAYS_OF_WEEK: [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ],
  TIME_SLOTS: [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
  ],
  SESSION_DURATION: {
    MIN: 30, // minutes
    MAX: 180, // minutes
    DEFAULT: 60, // minutes
  },
} as const;

export const PRICING = {
  MIN_HOURLY_RATE: 50000, // VND
  MAX_HOURLY_RATE: 2000000, // VND
  DEFAULT_HOURLY_RATE: 200000, // VND
  CURRENCY: 'VND',
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  PROFILE_UPDATED: 'Cập nhật thông tin thành công',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công',
  BOOKING_CREATED: 'Đặt lịch thành công',
  BOOKING_CANCELLED: 'Hủy lịch thành công',
  REVIEW_CREATED: 'Đánh giá thành công',
  TUTOR_PROFILE_CREATED: 'Tạo hồ sơ gia sư thành công',
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  INVALID_TOKEN: 'Token không hợp lệ',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  SERVER_ERROR: 'Lỗi máy chủ',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  UNAUTHORIZED: 'Không có quyền truy cập',
  FORBIDDEN: 'Bị cấm truy cập',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  CONFLICT: 'Dữ liệu bị xung đột',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  REMEMBER_ME: 'remember_me',
} as const;

export const APP_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  APP_NAME: 'EduMatch',
  DEFAULT_LOCALE: 'vi-VN',
  DEFAULT_CURRENCY: 'VND',
  MAX_FILE_SIZE_MB: 10,
  MAX_VIDEO_DURATION_MIN: 5,
} as const;

export const QUERY_KEYS = {
  AUTH: {
    USER: ['auth', 'user'],
    LOGIN: ['auth', 'login'],
    REGISTER: ['auth', 'register'],
  },
  TUTORS: {
    LIST: ['tutors', 'list'],
    DETAIL: ['tutors', 'detail'],
    SEARCH: ['tutors', 'search'],
  },
  BOOKINGS: {
    LIST: ['bookings', 'list'],
    DETAIL: ['bookings', 'detail'],
  },
  REVIEWS: {
    LIST: ['reviews', 'list'],
    DETAIL: ['reviews', 'detail'],
  },
  USERS: {
    PROFILE: ['users', 'profile'],
  },
} as const;