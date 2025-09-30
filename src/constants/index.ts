// Application constants

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  BOOKINGS: '/bookings',
  TUTORS: '/tutors',
  SUBJECTS: '/subjects',
} as const;

export const SUBJECTS = [
  'Toán học',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Văn học',
  'Lịch sử',
  'Địa lý',
  'Tiếng Anh',
  'Tiếng Trung',
  'Tiếng Nhật',
  'GDCD',
] as const;

export const EDUCATION_LEVELS = [
  'Tiểu học',
  'THCS',
  'THPT',
  'Đại học',
] as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
} as const;
