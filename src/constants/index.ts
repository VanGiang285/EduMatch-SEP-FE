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
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    LOGOUT: '/api/user/logout',
    REFRESH: '/api/user/refresh-token',
    VERIFY_EMAIL: '/api/user/verify-email',
    RESEND_VERIFY: '/api/user/resend-verify',
    GOOGLE_LOGIN: '/api/user/signIn-google',
    GET_CURRENT_USER: '/api/user/me',
  },
  
  USER_PROFILES: {
    GET_BY_EMAIL: '/api/userprofiles/:email',
    UPDATE_BY_EMAIL: '/api/userprofiles/:email',
  },
  
  TUTORS: {
    BECOME_TUTOR: '/api/tutors/become-tutor',
    TEST_SEND_MAIL: '/api/tutors/test-send-mail',
  },
  
  MANAGE_TUTOR_PROFILES: {
    GET_BY_ID: '/api/managetutorprofiles/:id',
    GET_BY_EMAIL: '/api/managetutorprofiles/email/:email',
    UPDATE_BY_EMAIL: '/api/managetutorprofiles/:email',
  },
  
  FIND_TUTORS: {
    GET_ALL: '/api/findtutor',
    SEARCH: '/api/findtutor/search',
  },
  
  ADMIN: {
    GET_USER_BY_ROLE: '/api/admin/role/:roleId',
    DEACTIVATE_USER: '/api/admin/users/:email/deactivate',
    ACTIVATE_USER: '/api/admin/users/:email/activate',
    CREATE_ADMIN: '/api/admin/create-admin',
  },
  
  SUBJECTS: {
    GET_ALL: '/api/Subject/get-all-subject',
  },
  
  LEVELS: {
    GET_ALL: '/api/Level/get-all-level',
  },
  
  CERTIFICATES: {
    GET_ALL_WITH_SUBJECTS: '/api/Certificate/get-all-certificatetypes-with-subjects',
  },
  
  EDUCATION: {
    GET_ALL_INSTITUTIONS: '/api/Education/get-all-education-institution',
  },
  
  TIME_SLOTS: {
    GET_ALL: '/api/TimeSlots/get-all-time-slots',
  },
  
  CLOUD_MEDIA: {
    UPLOAD: '/api/CloudMedia/upload',
    UPLOAD_FROM_URL: '/api/CloudMedia/upload-from-url',
    DELETE: '/api/CloudMedia/:publicId',
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
    PROFILE: '/api/User/me',
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
    MIN: 30,
    MAX: 180,
    DEFAULT: 60,
  },
} as const;
export const PRICING = {
  MIN_HOURLY_RATE: 50000,
  MAX_HOURLY_RATE: 2000000,
  DEFAULT_HOURLY_RATE: 200000,
  CURRENCY: 'VND',
} as const;
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AVATAR_MAX_SIZE: 2 * 1024 * 1024,
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