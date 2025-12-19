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
  // Admin routes
  SYSTEM_ADMIN: '/system-admin',
  SYSTEM_ADMIN_DASHBOARD: '/system-admin/dashboard',
  SYSTEM_ADMIN_USERS: '/system-admin/users',
  SYSTEM_ADMIN_TUTORS: '/system-admin/tutors',
  SYSTEM_ADMIN_REVIEWS: '/system-admin/reviews',
  SYSTEM_ADMIN_SETTINGS: '/system-admin/settings',
  BUSINESS_ADMIN: '/business-admin',
  BUSINESS_ADMIN_DASHBOARD: '/business-admin/dashboard',
  BUSINESS_ADMIN_USERS: '/business-admin/users',
  BUSINESS_ADMIN_TUTORS: '/business-admin/tutors',
  BUSINESS_ADMIN_REVIEWS: '/business-admin/reviews',
  BUSINESS_ADMIN_SETTINGS: '/business-admin/settings',
} as const;
export const USER_ROLES = {
  GUEST: 'guest',
  LEARNER: 'learner', // roleId: 1
  TUTOR: 'tutor', // roleId: 2
  BUSINESS_ADMIN: 'business_admin', // roleId: 3
  SYSTEM_ADMIN: 'system_admin', // roleId: 4
} as const;

export const ROLE_ID_MAP = {
  1: 'learner',
  2: 'tutor',
  3: 'business_admin',
  4: 'system_admin',
} as const;

export const ROLE_LABELS = {
  guest: 'Khách',
  learner: 'Học viên',
  tutor: 'Gia sư',
  business_admin: 'Quản trị viên kinh doanh',
  system_admin: 'Quản trị viên hệ thống',
} as const;

// Map từ roleName (API) sang role string (system)
export const ROLE_NAME_TO_ROLE_MAP: Record<string, string> = {
  'Học viên': 'learner',
  Learner: 'learner',
  'Gia sư': 'tutor',
  Tutor: 'tutor',
  'Business Admin': 'business_admin',
  'Quản trị viên kinh doanh': 'business_admin',
  'System Admin': 'system_admin',
  'Quản trị viên hệ thống': 'system_admin',
  'System Administrator': 'system_admin',
};

// Enum constants tương ứng với Backend
export const GENDER_OPTIONS = [
  { value: 0, label: 'Không xác định' },
  { value: 1, label: 'Nam' },
  { value: 2, label: 'Nữ' },
  { value: 3, label: 'Giới tính khác' },
] as const;

export const TEACHING_MODE_OPTIONS = [
  { value: 0, label: 'Dạy trực tiếp' },
  { value: 1, label: 'Dạy online' },
  { value: 2, label: 'Kết hợp' },
] as const;

export const TUTOR_STATUS_OPTIONS = [
  { value: 0, label: 'Chờ duyệt' },
  { value: 1, label: 'Đã duyệt' },
  { value: 2, label: 'Bị từ chối' },
  { value: 3, label: 'Tạm khóa' },
  { value: 4, label: 'Ngừng hoạt động' },
] as const;

export const VERIFY_STATUS_OPTIONS = [
  { value: 0, label: 'Chờ duyệt' },
  { value: 1, label: 'Đã xác minh' },
  { value: 2, label: 'Bị từ chối' },
  { value: 3, label: 'Hết hạn' },
  { value: 4, label: 'Đã xóa/thu hồi' },
] as const;

export const INSTITUTION_TYPE_OPTIONS = [
  { value: 0, label: 'Trung cấp' },
  { value: 1, label: 'Cao đẳng' },
  { value: 2, label: 'Đại học' },
  { value: 3, label: 'Khác' },
] as const;

export const DAY_OF_WEEK_OPTIONS = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ hai' },
  { value: 2, label: 'Thứ ba' },
  { value: 3, label: 'Thứ tư' },
  { value: 4, label: 'Thứ năm' },
  { value: 5, label: 'Thứ sáu' },
  { value: 6, label: 'Thứ bảy' },
] as const;

export const AVAILABILITY_STATUS_OPTIONS = [
  { value: 0, label: 'Trống' },
  { value: 1, label: 'Đã đặt' },
  { value: 2, label: 'Đang học' },
  { value: 3, label: 'Đã hủy' },
] as const;
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
  // ==================== AUTH ====================
  AUTH: {
    LOGIN: '/api/auth/login', // Use Next.js API route proxy
    REGISTER: '/api/user/register',
    LOGOUT: '/api/user/logout',
    REFRESH: '/api/auth/refresh-token', // Use Next.js API route proxy
    VERIFY_EMAIL: '/api/user/verify-email',
    RESEND_VERIFY: '/api/user/resend-verify',
    GOOGLE_LOGIN: '/api/user/signIn-google',
    GET_CURRENT_USER: '/api/user/me',
    CHANGE_PASSWORD: '/api/user/change-password',
    RESET_PASSWORD: '/api/user/reset-password',
    CHECK_EMAIL_AVAILABLE: '/api/User/check-email-available',
  },

  // ==================== USER PROFILES ====================
  USER_PROFILES: {
    GET_BY_EMAIL: '/api/userprofiles/:email',
    UPDATE: '/api/userprofiles/update-user-profile',
    GET_PROVINCES: '/api/UserProfiles/provinves',
    GET_SUB_DISTRICTS: '/api/UserProfiles/subDistricts/:provinceId',
  },

  // ==================== TUTORS ====================
  TUTORS: {
    // Become Tutor
    BECOME_TUTOR: '/api/Tutors/become-tutor',

    // Get Tutors
    GET_BY_STATUS: '/api/Tutors/get-all-tutor-by-status',
    GET_ALL: '/api/Tutors/get-all-tutor',
    GET_BY_ID: '/api/Tutors/get-tutor-by-id/:tutorId',
    GET_BY_EMAIL: '/api/Tutors/get-tutor-by-email',
    GET_VERIFICATIONS:
      '/api/Tutors/get-all-tutor-certificate-education/:tutorId',

    // Update Tutor
    UPDATE_PROFILE: '/api/Tutors/update-tutor-profile',
    UPDATE_STATUS: '/api/Tutors/update-tutor-status/:tutorId',
    APPROVE_AND_VERIFY_ALL: '/api/Tutors/approve-and-verify-all/:tutorId',
    REJECT_ALL: '/api/Tutors/reject-all/:tutorId',

    // Verify batch
    VERIFY_EDUCATION_BATCH: '/api/Tutors/verify-list-education/:tutorId',
    VERIFY_CERTIFICATE_BATCH: '/api/Tutors/verify-list-certificate/:tutorId',
  },

  // ==================== MANAGE TUTOR PROFILES ====================
  MANAGE_TUTOR_PROFILES: {
    GET_BY_ID: '/api/ManageTutorProfiles/:id',
    GET_BY_EMAIL: '/api/ManageTutorProfiles/email/:email',
  },

  // ==================== FIND TUTORS ====================
  FIND_TUTORS: {
    GET_ALL: '/api/findtutor',
    SEARCH: '/api/findtutor/search',
  },

  // ==================== ADMIN ====================
  ADMIN: {
    GET_USER_BY_ROLE: '/api/admin/role/:roleId',
    GET_ALL_USERS: '/api/admin/getAllUsers',
    DEACTIVATE_USER: '/api/admin/users/:email/deactivate',
    ACTIVATE_USER: '/api/admin/users/:email/activate',
    UPDATE_USER_ROLE: '/api/admin/users/:email/:roleId',
    CREATE_ADMIN: '/api/admin/create-admin',
  },

  // ==================== ADMIN WALLET ====================
  ADMIN_WALLET: {
    GET_SYSTEM_WALLET: '/api/admin/wallet/system',
    GET_SYSTEM_TRANSACTIONS: '/api/admin/wallet/system-transactions',
    GET_DASHBOARD: '/api/admin/wallet/dashboard',
  },

  // ==================== ADMIN STATS ====================
  ADMIN_STATS: {
    SUMMARY: '/api/admin-stats/summary',
    MONTHLY: '/api/admin-stats/monthly',
  },

  // ==================== SUBJECTS ====================
  SUBJECTS: {
    GET_ALL: '/api/Subject/get-all-subject',
    GET_BY_ID: '/api/Subject/get-subject-by-id/:id',
    GET_TUTOR_SUBJECTS: '/api/Subject/get-:tutorId-list-subject',
    CREATE_TUTOR_SUBJECT: '/api/Subject/create-:tutorId-subject',
    UPDATE_TUTOR_SUBJECT: '/api/Subject/update-:tutorId-subject',
    DELETE_TUTOR_SUBJECT: '/api/Subject/delete-:tutorId-subject',
  },

  // ==================== LEVELS ====================
  LEVELS: {
    GET_ALL: '/api/Level/get-all-level',
  },

  // ==================== CERTIFICATES ====================
  CERTIFICATES: {
    // Certificate Type endpoints
    GET_ALL: '/api/CertificateType/get-all-certificate-types',
    GET_BY_VERIFY_STATUS:
      '/api/CertificateType/get-certificate-types-by-verify-status/:verifyStatus',
    CREATE: '/api/CertificateType/create-certificate-type',
    ADD_SUBJECTS:
      '/api/CertificateType/add-subjects-to-certificate-type/:certificateTypeId',
    VERIFY: '/api/CertificateType/verify-certificate-type/:certificateTypeId',
    DELETE: '/api/CertificateType/delete-certificate-type/:certificateTypeId',

    // Tutor Certificate endpoints
    GET_TUTOR_CERTIFICATES: '/api/Certificate/get-:tutorId-list-certificate',
    CREATE_TUTOR_CERTIFICATE: '/api/Certificate/create-:tutorId-certificate',
    UPDATE_TUTOR_CERTIFICATE: '/api/Certificate/update-:tutorId-certificate',
    DELETE_TUTOR_CERTIFICATE: '/api/Certificate/delete-:tutorId-certificate',
    GET_ALL_WITH_SUBJECTS:
      '/api/Certificate/get-all-certificatetypes-with-subjects',
  },

  // ==================== EDUCATION ====================
  EDUCATION: {
    GET_ALL_INSTITUTIONS: '/api/Education/get-all-education-institution',
    GET_INSTITUTIONS_BY_VERIFY_STATUS:
      '/api/Education/get-education-institutions-by-verify-status/:verifyStatus',
    CREATE_INSTITUTION: '/api/Education/create-education-institution',
    VERIFY_INSTITUTION:
      '/api/Education/verify-education-institution/:educationInstitutionId',

    GET_TUTOR_EDUCATIONS: '/api/Education/get-:tutorId-list-education',
    CREATE_TUTOR_EDUCATION: '/api/Education/create-:tutorId-education',
    UPDATE_TUTOR_EDUCATION: '/api/Education/update-:tutorId-education',
    DELETE_TUTOR_EDUCATION: '/api/Education/delete-:tutorId-education',
  },

  // ==================== TUTOR AVAILABILITY ====================
  AVAILABILITY: {
    CREATE_LIST: '/api/TutorAvailability/tutor-availability-create-list',
    UPDATE_LIST: '/api/TutorAvailability/tutor-availability-update-list',
    DELETE_LIST: '/api/TutorAvailability/tutor-availability-delete-list',
    GET_ALL: '/api/TutorAvailability/tutor-availability-get-all/:tutorId',
    GET_BY_STATUS:
      '/api/TutorAvailability/tutor-availability-get-list-by-status/:tutorId/:status',
  },

  // ==================== TIME SLOTS ====================
  TIME_SLOTS: {
    GET_ALL: '/api/TimeSlots/get-all-time-slots',
  },

  // ==================== CLASS REQUESTS ====================
  CLASS_REQUESTS: {
    CREATE: '/api/ClassRequests/Create',
    GET_BY_ID: '/api/ClassRequests/:id',
    LIST_PENDING: '/api/ClassRequests/ListPending',
    LIST_OPEN: '/api/ClassRequests/ListOpen',
    LIST_PENDING_BY_LEARNER: '/api/ClassRequests/ListPendingByLearnerEmail',
    LIST_OPEN_BY_LEARNER: '/api/ClassRequests/ListOpenByLearnerEmail',
    LIST_EXPIRED_BY_LEARNER: '/api/ClassRequests/ListExpiredByLearnerEmail',
    LIST_REJECTED_BY_LEARNER: '/api/ClassRequests/ListRejectedByLearnerEmail',
    LIST_CANCELED_BY_LEARNER: '/api/ClassRequests/ListCanceledByLearnerEmail',
    UPDATE: '/api/ClassRequests/Update/:id',
    CANCEL: '/api/ClassRequests/Cancel/:id',
    DELETE: '/api/ClassRequests/Delete/:id',
    APPROVE_OR_REJECT: '/api/ClassRequests/ApproveOrReject/:id',
  },

  // ==================== TUTOR APPLICATIONS ====================
  TUTOR_APPLICATIONS: {
    APPLY: '/api/TutorApplications/apply',
    GET_BY_CLASS_REQUEST:
      '/api/TutorApplications/class-request/:classRequestId',
    GET_TUTOR_APPLIED: '/api/TutorApplications/tutor/applied',
    GET_TUTOR_CANCELED: '/api/TutorApplications/tutor/canceled',
    EDIT: '/api/TutorApplications/edit',
    CANCEL: '/api/TutorApplications/cancel/:id',
  },

  // ==================== CHAT ====================
  CHAT: {
    GET_ROOMS: '/api/chat/rooms/:email',
    GET_MESSAGES: '/api/chat/messages/:roomId',
    GET_OR_CREATE_ROOM: '/api/chat/room',
  },

  // ==================== FAVORITE TUTORS ====================
  FAVORITE_TUTORS: {
    ADD: '/api/favoritetutor/add/:tutorId',
    REMOVE: '/api/favoritetutor/remove/:tutorId',
    IS_FAVORITE: '/api/favoritetutor/is-favorite/:tutorId',
    LIST: '/api/favoritetutor/list',
  },

  // ==================== GOOGLE AUTH (for Meeting) ====================
  GOOGLE_AUTH: {
    AUTHORIZE: '/api/googleauth/authorize',
    CALLBACK: '/api/googleauth/callback',
    CREATE_MEETING: '/api/googleauth/create',
  },

  // ==================== CLOUD MEDIA ====================
  CLOUD_MEDIA: {
    UPLOAD: '/api/cloudmedia/upload',
    UPLOAD_FROM_URL: '/api/cloudmedia/upload-from-url',
    DELETE: '/api/cloudmedia/:publicId',
  },

  // ==================== BOOKINGS ====================
  BOOKINGS: {
    GET_BY_ID: '/api/Booking/get-by-id/:id',
    GET_ALL_BY_LEARNER_EMAIL_PAGING:
      '/api/Booking/get-all-by-learner-email-paging',
    GET_ALL_BY_LEARNER_EMAIL_NO_PAGING:
      '/api/Booking/get-all-by-learner-email-no-paging',
    GET_ALL_BY_TUTOR_ID_PAGING: '/api/Booking/get-all-by-tutor-id-paging',
    GET_ALL_BY_TUTOR_ID_NO_PAGING: '/api/Booking/get-all-by-tutor-id-no-paging',
    CREATE: '/api/Booking/create-booking',
    UPDATE: '/api/Booking/update-booking',
    UPDATE_PAYMENT_STATUS: '/api/Booking/update-payment-status/:id',
    UPDATE_STATUS: '/api/Booking/update-status/:id',
    PAY: '/api/Booking/:id/pay',
    LEARNER_CANCEL: '/api/Booking/:id/learner-cancel',
    CANCEL_PREVIEW: '/api/Booking/:id/cancel-preview',
  },

  // ==================== NOTIFICATIONS ====================
  NOTIFICATIONS: {
    LIST: '/api/Notification',
    UNREAD_COUNT: '/api/Notification/unread-count',
    MARK_AS_READ: '/api/Notification/:id/read',
    MARK_ALL_AS_READ: '/api/Notification/read-all',
    DELETE: '/api/Notification/:id',
  },

  // ==================== SCHEDULES ====================
  SCHEDULES: {
    GET_BY_ID: '/api/Schedule/get-by-id/:id',
    GET_BY_AVAILABILITY_ID:
      '/api/Schedule/get-by-availability-id/:availabilitiId',
    GET_ALL_PAGING: '/api/Schedule/get-all-paging',
    GET_ALL_NO_PAGING: '/api/Schedule/get-all-no-paging',
    CREATE: '/api/Schedule/create-schedule',
    CREATE_LIST: '/api/Schedule/create-schedule-list',
    UPDATE: '/api/Schedule/update-schedule',
    UPDATE_STATUS: '/api/Schedule/update-status/:id',
    CANCEL_ALL_BY_BOOKING: '/api/Schedule/cancel-all-by-booking/:bookingId',
    GET_ALL_BY_LEARNER_EMAIL: '/api/Schedule/get-all-by-learner-email',
    GET_ALL_BY_TUTOR_EMAIL: '/api/Schedule/get-all-by-tutor-email',
    GET_BY_TUTOR_EMAIL_AND_STATUS: '/api/Schedule/get-by-tutor-email-and-status',
    FINISH: '/api/Schedule/:id/finish',
    CANCEL: '/api/Schedule/:id/cancel',
    REPORT: '/api/Schedule/:id/report/:reportId',
    RESOLVE_REPORT: '/api/Schedule/:id/resolve-report',
    ATTENDANCE_SUMMARY: '/api/Schedule/:bookingId/attendance-summary',
    ADMIN_FINISH: '/api/Schedule/:id/admin/finish',
    ADMIN_CANCEL: '/api/Schedule/:id/admin/cancel',
  },
  // ==================== SCHEDULE CHANGE REQUESTS ====================
  SCHEDULE_CHANGE_REQUESTS: {
    GET_BY_ID: '/api/ScheduleChangeRequest/get-by-id/:id',
    CREATE: '/api/ScheduleChangeRequest/create',
    UPDATE_STATUS: '/api/ScheduleChangeRequest/update-status/:id',
    GET_ALL_BY_REQUESTER_EMAIL:
      '/api/ScheduleChangeRequest/get-all-by-requester-email',
    GET_ALL_BY_REQUESTED_TO_EMAIL:
      '/api/ScheduleChangeRequest/get-all-by-requested-to-email',
    GET_ALL_BY_SCHEDULE_ID:
      '/api/ScheduleChangeRequest/get-all-by-schedule-id/:scheduleId',
  },

  // ==================== WALLET & PAYMENT (MỚI) ====================
  WALLET: {
    // Wallets
    GET_BALANCE: '/api/Wallets/my-wallet',
    GET_TRANSACTIONS: '/api/Wallets/my-transactions',

    // Deposits
    CREATE_DEPOSIT_VNPAY: '/api/Deposits/create-vnpay-request',
    CANCEL_DEPOSIT: '/api/Deposits/:id/cancel',
    CLEANUP_EXPIRED_DEPOSITS: '/api/Deposits/admin/cleanup-expired',

    // Withdrawals
    CREATE_WITHDRAWAL: '/api/Withdrawals/create-request',
    GET_MY_WITHDRAWALS: '/api/Withdrawals/my-requests',
    GET_PENDING_WITHDRAWALS: '/api/Withdrawals/pending',
    APPROVE_WITHDRAWAL: '/api/Withdrawals/:id/approve',
    REJECT_WITHDRAWAL: '/api/Withdrawals/:id/reject',

    // Bank Accounts
    GET_BANKS: '/api/Banks',
    GET_BANK_ACCOUNTS: '/api/UserBankAccounts/my-accounts',
    CREATE_BANK_ACCOUNT: '/api/UserBankAccounts',
    DELETE_BANK_ACCOUNT: '/api/UserBankAccounts/:id',
  },

  // ==================== SYSTEM FEES ====================
  SYSTEM_FEES: {
    GET_ALL_PAGING: '/api/SystemFee/get-all-paging',
    GET_ALL_NO_PAGING: '/api/SystemFee/get-all-no-paging',
    CREATE: '/api/SystemFee/create-systemfee',
    UPDATE: '/api/SystemFee/update-systemfee',
  },

  // ==================== BOOKING REFUND REQUESTS ====================
  BOOKING_REFUND_REQUEST: {
    GET_ALL: '/api/BookingRefundRequest/get-all',
    GET_BY_EMAIL: '/api/BookingRefundRequest/get-all-by-email',
    GET_BY_ID: '/api/BookingRefundRequest/get-by-id/:id',
    CREATE: '/api/BookingRefundRequest/create',
    UPDATE_STATUS: '/api/BookingRefundRequest/update-status/:id',
  },

  // ==================== REFUND POLICY ====================
  REFUND_POLICY: {
    GET_ALL: '/api/RefundPolicy/get-all',
    GET_BY_ID: '/api/RefundPolicy/get-by-id/:id',
    CREATE: '/api/RefundPolicy/create',
    UPDATE: '/api/RefundPolicy/update',
    UPDATE_IS_ACTIVE: '/api/RefundPolicy/update-is-active/:id',
  },

  // ==================== TUTOR VERIFICATION REQUEST ====================
  TUTOR_VERIFICATION_REQUEST: {
    GET_ALL: '/api/TutorVerificationRequest/get-all',
    GET_BY_EMAIL_OR_TUTOR_ID:
      '/api/TutorVerificationRequest/get-by-email-or-tutor-id',
    GET_BY_ID: '/api/TutorVerificationRequest/get-by-id/:id',
  },

  // ==================== AI CHATBOT ====================
  AI_CHATBOT: {
    CREATE_SESSION: '/api/AIChatbot/session',
    LIST_SESSIONS: '/api/AIChatbot/listSessionByUserEmail',
    DELETE_SESSION: '/api/AIChatbot/session/:sessionId',
    CHAT: '/api/AIChatbot/chat',
    CHAT_HISTORY: '/api/AIChatbot/chatHistory',
    SYNC_TUTORS: '/api/AIChatbot/sync-tutors',
  },

  // ==================== REPORTS ====================
  REPORTS: {
    CREATE: '/api/Reports',
    GET_ALL: '/api/Reports', // Admin only - get all reports
    GET_LEARNER_REPORTS: '/api/Reports/learner',
    UPDATE_LEARNER_REPORT: '/api/Reports/:id/learner',
    CANCEL_LEARNER_REPORT: '/api/Reports/:id/learner',
    GET_TUTOR_REPORTS: '/api/Reports/tutor',
    GET_DETAIL: '/api/Reports/:id',
    GET_FULL_DETAIL: '/api/Reports/:id/full',
    CAN_DEFENSE: '/api/Reports/:id/can-defense',
    IS_RESOLVED: '/api/Reports/:id/is-resolved',
    UPDATE_BY_ADMIN: '/api/Reports/:id',
    ADD_EVIDENCE: '/api/Reports/:id/evidence',
    GET_EVIDENCE: '/api/Reports/:id/evidence',
    UPDATE_EVIDENCE: '/api/Reports/:id/evidence/:evidenceId',
    DELETE_EVIDENCE: '/api/Reports/:id/evidence/:evidenceId',
    ADD_DEFENSE: '/api/Reports/:id/defenses',
    GET_DEFENSES: '/api/Reports/:id/defenses',
    UPDATE_DEFENSE: '/api/Reports/:id/defenses/:defenseId',
    DELETE_DEFENSE: '/api/Reports/:id/defenses/:defenseId',
  },

  // ==================== FEEDBACK (Tutor Feedback) ====================
  FEEDBACK: {
    CREATE: '/api/Feedback/Create-Feedback',
    GET_BY_ID: '/api/Feedback/Get-Feedback-By-Id/:feedbackId',
    GET_BY_LEARNER: '/api/Feedback/Get-Feedback-By-Learner',
    GET_BY_TUTOR: '/api/Feedback/Get-Feedback-By-Tutor',
    GET_ALL_CRITERIA: '/api/Feedback/Get-All-Criteria',
    GET_ALL: '/api/Feedback/Get-All-Feedbacks',
    UPDATE: '/api/Feedback/Update-Feedback',
    GET_RATING_SUMMARY: '/api/Feedback/summary/:tutorId',
  },

  // ==================== UPLOAD ====================
  UPLOAD: {
    IMAGE: '/api/upload/image',
    DOCUMENT: '/api/upload/document',
  },

  // ==================== TRIAL LESSONS ====================
  TRIAL_LESSONS: {
    RECORD: '/api/TrialLessons',
    EXISTS: '/api/TrialLessons/exists',
    SUBJECTS: '/api/TrialLessons/subjects',
  },

  // ==================== BOOKING NOTES ====================

  BOOKING_NOTES: {
    GET_BY_ID: '/api/BookingNotes/:id',
    GET_BY_BOOKING: '/api/BookingNotes/by-booking/:bookingId',
    CREATE: '/api/BookingNotes',
    UPDATE: '/api/BookingNotes/:id',
    DELETE: '/api/BookingNotes/:id',
  },

  // ==================== TUTOR PAYOUTS ====================
  TUTOR_PAYOUTS: {
    GET_BY_BOOKING: '/api/TutorPayouts/by-booking/:bookingId',
  },

  // ==================== MEETING SESSIONS ====================
  MEETING_SESSIONS: {
    GET_BY_ID: '/api/MeetingSessions/get-by-id/:id',
    GET_BY_SCHEDULE_ID: '/api/MeetingSessions/get-by-schedule-id/:scheduleId',
  },

  // ==================== TUTOR DASHBOARD ====================
  TUTOR_DASHBOARD: {
    GET_UPCOMING_LESSONS: '/api/tutor-dashboard/upcoming-lessons',
    GET_TODAY_SCHEDULES: '/api/tutor-dashboard/today-schedules',
    GET_PENDING_BOOKINGS: '/api/tutor-dashboard/pending-bookings',
    GET_MONTHLY_EARNINGS: '/api/tutor-dashboard/earnings/monthly',
    GET_CURRENT_MONTH_EARNING: '/api/tutor-dashboard/earnings/current-month',
    GET_REPORTS_PENDING_DEFENSE: '/api/tutor-dashboard/reports/pending-defense',
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
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
    '22:30',
    '23:00',
    '23:30',
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
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
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
  USERS: {
    PROFILE: ['users', 'profile'],
  },
} as const;
