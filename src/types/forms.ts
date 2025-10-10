export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
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

export interface BecomeTutorFormData {
  subjects: string[];
  hourlyRate: number;
  bio: string;
  
  experience: number;
  education: string;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  
  availability: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  
  location: {
    province: string;
    district: string;
  };
  phone: string;
  
  teachingMethod: string;
  specializations: string[];
  languages: string[];
}

export interface TutorProfileFormData {
  subjects: string[];
  hourlyRate: number;
  bio: string;
  experience: number;
  education: string;
  certifications: string[];
  isActive: boolean;
}

export interface BookingFormData {
  tutorId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface BookingSearchFormData {
  subject?: string;
  location?: string;
  minRating?: number;
  maxHourlyRate?: number;
  experience?: number;
  availability?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
}

export interface ReviewFormData {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface UserProfileFormData {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  bio?: string;
  avatar?: File;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TutorSearchFormData {
  query?: string;
  subjects?: string[];
  location?: string;
  minRating?: number;
  maxHourlyRate?: number;
  experience?: number;
  sortBy?: 'rating' | 'price' | 'experience' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: FormFieldError[];
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
  isValid: boolean;
}

export interface MultiStepFormState<T = any> {
  currentStep: number;
  steps: FormStep[];
  data: T;
  errors: FormFieldError[];
  isSubmitting: boolean;
}

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'time' 
  | 'datetime-local' 
  | 'textarea' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'file';

export interface FormFieldConfig {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}
