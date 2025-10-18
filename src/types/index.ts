export type UserRole = 'student' | 'tutor' | 'admin';
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface UserProfile extends User {
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  bio?: string;
}
export interface Tutor {
  id: string;
  userId: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalStudents: number;
  bio: string;
  experience: number;
  education: string;
  certifications: string[];
  availability: Availability[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface TutorProfile extends Tutor {
  user: User;
  reviews: Review[];
  bookings: Booking[];
}
export interface CreateTutorData {
  userId: string;
  subjects: string[];
  hourlyRate: number;
  bio: string;
  experience: number;
  education: string;
  certifications: string[];
  availability: Omit<Availability, 'id'>[];
}
export interface Availability {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  price: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface BookingWithDetails extends Booking {
  student: User;
  tutor: User;
  reviews: Review[];
}
export interface CreateBookingData {
  tutorId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}
export interface Review {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
export interface ReviewWithDetails extends Review {
  student: User;
  tutor: User;
  booking: Booking;
}
export interface CreateReviewData {
  bookingId: string;
  rating: number;
  comment: string;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}
export interface ForgotPasswordFormData {
  email: string;
}
export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}
export interface TutorSearchFilters {
  subjects?: string[];
  minRating?: number;
  maxHourlyRate?: number;
  experience?: number;
  location?: string;
  availability?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
}
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface AppError {
  code: string;
  message: string;
  details?: any;
}
export interface ValidationError {
  field: string;
  message: string;
}
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}
export interface Subject {
  id: string;
  name: string;
  category: string;
  level: string[];
}
export interface Location {
  code: string;
  name: string;
  type: string;
  districts?: Location[];
}
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Export all enums from enums.ts
export * from './enums';