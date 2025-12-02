import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types/api';

export interface BookingNoteDto {
  id: number;
  bookingId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdByEmail?: string | null;
  createdAt: string;
}

export interface BookingNoteCreateRequest {
  bookingId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface BookingNoteUpdateRequest {
  id: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export class BookingNoteService {
  /**
   * Lấy ghi chú theo Id
   */
  static async getById(id: number): Promise<ApiResponse<BookingNoteDto>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKING_NOTES.GET_BY_ID, {
      id: id.toString(),
    });
    return apiClient.get<BookingNoteDto>(endpoint);
  }

  /**
   * Lấy danh sách ghi chú theo BookingId
   */
  static async getByBookingId(
    bookingId: number
  ): Promise<ApiResponse<BookingNoteDto[]>> {
    const endpoint = replaceUrlParams(
      API_ENDPOINTS.BOOKING_NOTES.GET_BY_BOOKING,
      { bookingId: bookingId.toString() }
    );
    return apiClient.get<BookingNoteDto[]>(endpoint);
  }

  /**
   * Tạo ghi chú mới cho booking
   */
  static async create(
    request: BookingNoteCreateRequest
  ): Promise<ApiResponse<BookingNoteDto>> {
    return apiClient.post<BookingNoteDto>(
      API_ENDPOINTS.BOOKING_NOTES.CREATE,
      request
    );
  }

  /**
   * Cập nhật ghi chú
   */
  static async update(
    request: BookingNoteUpdateRequest
  ): Promise<ApiResponse<BookingNoteDto>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKING_NOTES.UPDATE, {
      id: request.id.toString(),
    });
    return apiClient.put<BookingNoteDto>(endpoint, {
      content: request.content,
      imageUrl: request.imageUrl,
      videoUrl: request.videoUrl,
    });
  }

  /**
   * Xóa ghi chú
   */
  static async delete(id: number): Promise<ApiResponse<string>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.BOOKING_NOTES.DELETE, {
      id: id.toString(),
    });
    return apiClient.delete<string>(endpoint);
  }
}
