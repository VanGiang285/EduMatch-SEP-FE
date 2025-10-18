export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  constructor({ status, message, code, details }: {
    status: number;
    message: string;
    code?: string;
    details?: any;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'UNKNOWN_ERROR';
    this.details = details;
  }
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface RequestConfig {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: any;
  params?: Record<string, string | number | boolean>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | undefined;
  error: ApiError | undefined;
  message: string | undefined;
}
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
  } | undefined;
}
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  tokenType: string;
  message: string;
}
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}
export interface RegisterResponse {
  message: string;
}
export interface ForgotPasswordRequest {
  email: string;
}
export interface ForgotPasswordResponse {
  message: string;
}
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}
export interface ResetPasswordResponse {
  message: string;
}
export interface GoogleLoginRequest {
  idToken: string;
}
export interface GoogleLoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
}
export interface VerifyEmailRequest {
  token: string;
}
export interface VerifyEmailResponse {
  message: string;
}
export interface ResendVerificationRequest {
  email: string;
}
export interface ResendVerificationResponse {
  message: string;
}
export interface CurrentUserResponse {
  email: string;
  name: string;
  roleId: string;
  loginProvider: string;
  createdAt: string;
  avatarUrl?: string;
}
export interface GetTutorsRequest {
  page?: number;
  limit?: number;
  search?: string;
  subjects?: string[];
  minRating?: number;
  maxHourlyRate?: number;
  experience?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface TutorResponse {
  tutor: {
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
    availability: any[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
export interface TutorsResponse {
  tutors: TutorResponse['tutor'][];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}
export interface CreateTutorRequest {
  subjects: string[];
  hourlyRate: number;
  bio: string;
  experience: number;
  education: string;
  certifications: string[];
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}
export interface UpdateTutorRequest extends Partial<CreateTutorRequest> {}
export interface GetBookingsRequest {
  page?: number;
  limit?: number;
  status?: string;
  tutorId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}
export interface BookingResponse {
  booking: {
    id: string;
    studentId: string;
    tutorId: string;
    subject: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    price: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
}
export interface BookingsResponse {
  bookings: BookingResponse['booking'][];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}
export interface CreateBookingRequest {
  tutorId: string;
  subject: string;
  startTime: string;
  endTime: string;
  notes?: string;
}
export interface UpdateBookingRequest {
  status?: string;
  notes?: string;
}
export interface GetReviewsRequest {
  page?: number;
  limit?: number;
  tutorId?: string;
  studentId?: string;
  bookingId?: string;
}
export interface ReviewResponse {
  review: {
    id: string;
    bookingId: string;
    studentId: string;
    tutorId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
}
export interface ReviewsResponse {
  reviews: ReviewResponse['review'][];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}
export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment: string;
}
export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}
export interface GetUserProfileResponse {
  userProfile: any;
}
export interface UserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'tutor' | 'admin';
    avatar?: string;
  };
}
export interface UsersResponse {
  users: UserResponse['user'][];
}
export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  avatar?: string;
}
export interface UpdateUserProfileResponse {
  userProfile: any;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface ChangePasswordResponse {
  message: string;
}