import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { 
  GetBookingsRequest,
  BookingsResponse,
  CreateBookingRequest,
  BookingResponse,
  UpdateBookingRequest,
  ApiResponse,
  PaginatedApiResponse
} from '@/types/api';
import { Booking, BookingWithDetails } from '@/types';

export class BookingService {
  static async getBookings(params?: GetBookingsRequest): Promise<PaginatedApiResponse<Booking>> {
    return apiClient.get<BookingsResponse>(API_ENDPOINTS.BOOKINGS.LIST, params)
      .then(res => ({
        ...res,
        data: res.data?.bookings?.map(booking => ({
          ...booking,
          startTime: new Date(booking.startTime),
          endTime: new Date(booking.endTime),
          createdAt: new Date(booking.createdAt),
          updatedAt: new Date(booking.updatedAt)
        })),
        pagination: res.data?.pagination
      }));
  }

  static async getBookingById(id: string): Promise<ApiResponse<BookingWithDetails>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKINGS.DETAIL, { id });
    return apiClient.get<BookingResponse>(endpoint)
      .then(res => ({
        ...res,
        data: res.data?.booking ? {
          ...res.data.booking,
          startTime: new Date(res.data.booking.startTime),
          endTime: new Date(res.data.booking.endTime),
          createdAt: new Date(res.data.booking.createdAt),
          updatedAt: new Date(res.data.booking.updatedAt),
          student: {} as any,
          tutor: {} as any,
          reviews: []
        } : undefined
      }));
  }

  static async createBooking(bookingData: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    return apiClient.post<BookingResponse>(API_ENDPOINTS.BOOKINGS.CREATE, bookingData)
      .then(res => ({
        ...res,
        data: res.data?.booking ? {
          ...res.data.booking,
          startTime: new Date(res.data.booking.startTime),
          endTime: new Date(res.data.booking.endTime),
          createdAt: new Date(res.data.booking.createdAt),
          updatedAt: new Date(res.data.booking.updatedAt)
        } : undefined
      }));
  }

  static async updateBooking(id: string, bookingData: UpdateBookingRequest): Promise<ApiResponse<Booking>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKINGS.UPDATE, { id });
    return apiClient.put<BookingResponse>(endpoint, bookingData)
      .then(res => ({
        ...res,
        data: res.data?.booking ? {
          ...res.data.booking,
          startTime: new Date(res.data.booking.startTime),
          endTime: new Date(res.data.booking.endTime),
          createdAt: new Date(res.data.booking.createdAt),
          updatedAt: new Date(res.data.booking.updatedAt)
        } : undefined
      }));
  }

  static async cancelBooking(id: string): Promise<ApiResponse<void>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKINGS.CANCEL, { id });
    return apiClient.post<void>(endpoint);
  }

  static async confirmBooking(id: string): Promise<ApiResponse<void>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKINGS.CONFIRM, { id });
    return apiClient.post<void>(endpoint);
  }

  static async deleteBooking(id: string): Promise<ApiResponse<void>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKINGS.DELETE, { id });
    return apiClient.delete<void>(endpoint);
  }

  static async getUserBookings(userId: string, params?: GetBookingsRequest): Promise<PaginatedApiResponse<Booking>> {
    return apiClient.get<BookingsResponse>(API_ENDPOINTS.BOOKINGS.LIST, { 
      ...params, 
      studentId: userId 
    }).then(res => ({
      ...res,
      data: res.data?.bookings?.map(booking => ({
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getTutorBookings(tutorId: string, params?: GetBookingsRequest): Promise<PaginatedApiResponse<Booking>> {
    return apiClient.get<BookingsResponse>(API_ENDPOINTS.BOOKINGS.LIST, { 
      ...params, 
      tutorId 
    }).then(res => ({
      ...res,
      data: res.data?.bookings?.map(booking => ({
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getBookingsByStatus(status: string, params?: GetBookingsRequest): Promise<PaginatedApiResponse<Booking>> {
    return apiClient.get<BookingsResponse>(API_ENDPOINTS.BOOKINGS.LIST, { 
      ...params, 
      status 
    }).then(res => ({
      ...res,
      data: res.data?.bookings?.map(booking => ({
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getBookingsByDateRange(
    startDate: string, 
    endDate: string, 
    params?: GetBookingsRequest
  ): Promise<PaginatedApiResponse<Booking>> {
    return apiClient.get<BookingsResponse>(API_ENDPOINTS.BOOKINGS.LIST, { 
      ...params, 
      startDate,
      endDate
    }).then(res => ({
      ...res,
      data: res.data?.bookings?.map(booking => ({
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getUpcomingBookings(params?: GetBookingsRequest): Promise<PaginatedApiResponse<Booking>> {
    const now = new Date().toISOString();
    return apiClient.get<BookingsResponse>(API_ENDPOINTS.BOOKINGS.LIST, { 
      ...params, 
      startDate: now,
      status: 'confirmed'
    }).then(res => ({
      ...res,
      data: res.data?.bookings?.map(booking => ({
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getPastBookings(params?: GetBookingsRequest): Promise<PaginatedApiResponse<Booking>> {
    const now = new Date().toISOString();
    return apiClient.get<BookingsResponse>(API_ENDPOINTS.BOOKINGS.LIST, { 
      ...params, 
      endDate: now,
      status: 'completed'
    }).then(res => ({
      ...res,
      data: res.data?.bookings?.map(booking => ({
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }
}
