// Global type definitions

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface Availability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
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
