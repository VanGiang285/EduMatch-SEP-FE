import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { BookingDto, ScheduleDto } from '@/types/backend';
import { BookingStatus, PaymentStatus } from '@/types/enums';

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface BookingWithSchedulesCreateRequest {
  booking: {
    learnerEmail: string;
    tutorSubjectId: number;
    totalSessions?: number;
  };
  schedules: Array<{
    availabilitiId: number;
    bookingId?: number; // Will be set by backend
    attendanceNote?: string;
    isOnline?: boolean;
  }>;
}

export interface BookingUpdateRequest {
  id: number;
  learnerEmail?: string;
  tutorSubjectId?: number;
  totalSessions?: number;
}

export class BookingService {
  /**
   * Lấy Booking theo Id
   */
  static async getById(id: number): Promise<ApiResponse<BookingDto>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKINGS.GET_BY_ID, { id: id.toString() });
    return apiClient.get<BookingDto>(endpoint);
  }

  /**
   * Lấy danh sách Booking theo LearnerEmail có phân trang
   */
  static async getAllByLearnerEmailPaging(
    email: string,
    params?: {
      status?: BookingStatus;
      tutorSubjectId?: number;
      page?: number;
      pageSize?: number;
    }
  ): Promise<ApiResponse<PagedResult<BookingDto>>> {
    return apiClient.get<PagedResult<BookingDto>>(
      API_ENDPOINTS.BOOKINGS.GET_ALL_BY_LEARNER_EMAIL_PAGING,
      {
        email,
        status: params?.status,
        tutorSubjectId: params?.tutorSubjectId,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      }
    );
  }

  /**
   * Lấy danh sách Booking theo LearnerEmail (không phân trang)
   */
  static async getAllByLearnerEmailNoPaging(
    email: string,
    params?: {
      status?: BookingStatus;
      tutorSubjectId?: number;
    }
  ): Promise<ApiResponse<BookingDto[]>> {
    return apiClient.get<BookingDto[]>(
      API_ENDPOINTS.BOOKINGS.GET_ALL_BY_LEARNER_EMAIL_NO_PAGING,
      {
        email,
        status: params?.status,
        tutorSubjectId: params?.tutorSubjectId,
      }
    );
  }

  /**
   * Lấy danh sách Booking theo TutorId có phân trang
   */
  static async getAllByTutorIdPaging(
    tutorId: number,
    params?: {
      status?: BookingStatus;
      tutorSubjectId?: number;
      page?: number;
      pageSize?: number;
    }
  ): Promise<ApiResponse<PagedResult<BookingDto>>> {
    return apiClient.get<PagedResult<BookingDto>>(
      API_ENDPOINTS.BOOKINGS.GET_ALL_BY_TUTOR_ID_PAGING,
      {
        tutorId,
        status: params?.status,
        tutorSubjectId: params?.tutorSubjectId,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      }
    );
  }

  /**
   * Lấy danh sách Booking theo TutorId (không phân trang)
   */
  static async getAllByTutorIdNoPaging(
    tutorId: number,
    params?: {
      status?: BookingStatus;
      tutorSubjectId?: number;
    }
  ): Promise<ApiResponse<BookingDto[]>> {
    return apiClient.get<BookingDto[]>(
      API_ENDPOINTS.BOOKINGS.GET_ALL_BY_TUTOR_ID_NO_PAGING,
      {
        tutorId,
        status: params?.status,
        tutorSubjectId: params?.tutorSubjectId,
      }
    );
  }

  /**
   * Tạo Booking mới với Schedules
   */
  static async createBooking(
    request: BookingWithSchedulesCreateRequest
  ): Promise<ApiResponse<BookingDto>> {
    return apiClient.post<BookingDto>(API_ENDPOINTS.BOOKINGS.CREATE, request);
  }

  /**
   * Cập nhật Booking
   */
  static async updateBooking(
    request: BookingUpdateRequest
  ): Promise<ApiResponse<BookingDto>> {
    return apiClient.put<BookingDto>(API_ENDPOINTS.BOOKINGS.UPDATE, request);
  }

  /**
   * Cập nhật PaymentStatus của Booking
   */
  static async updatePaymentStatus(
    id: number,
    paymentStatus: PaymentStatus
  ): Promise<ApiResponse<BookingDto>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKINGS.UPDATE_PAYMENT_STATUS, {
      id: id.toString(),
    });
    return apiClient.put<BookingDto>(endpoint, paymentStatus);
  }

  /**
   * Cập nhật Status của Booking
   */
  static async updateStatus(
    id: number,
    status: BookingStatus
  ): Promise<ApiResponse<BookingDto>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS, {
      id: id.toString(),
    });
    return apiClient.put<BookingDto>(endpoint, status);
  }
}
