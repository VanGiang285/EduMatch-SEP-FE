import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { BookingRefundRequestDto } from '@/types/backend';
import { BookingRefundRequestCreateRequest } from '@/types/requests';
import { BookingRefundRequestStatus } from '@/types/enums';

export class BookingRefundRequestService {
  // Business Admin fetches all refund requests with optional status filter
  static async getAll(
    status?: BookingRefundRequestStatus
  ): Promise<ApiResponse<BookingRefundRequestDto[]>> {
    const params = status !== undefined ? { status } : undefined;
    return apiClient.get<BookingRefundRequestDto[]>(
      API_ENDPOINTS.BOOKING_REFUND_REQUEST.GET_ALL,
      params
    );
  }

  // Learner fetches their refund requests by email
  static async getByLearnerEmail(
    learnerEmail: string,
    status?: BookingRefundRequestStatus
  ): Promise<ApiResponse<BookingRefundRequestDto[]>> {
    const params: Record<string, string | number> = { learnerEmail };
    if (status !== undefined) {
      params.status = status;
    }
    return apiClient.get<BookingRefundRequestDto[]>(
      API_ENDPOINTS.BOOKING_REFUND_REQUEST.GET_BY_EMAIL,
      params
    );
  }

  // Any authenticated role retrieves details by id
  static async getById(
    bookingRefundRequestId: number
  ): Promise<ApiResponse<BookingRefundRequestDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.BOOKING_REFUND_REQUEST.GET_BY_ID, {
      id: bookingRefundRequestId.toString(),
    });
    return apiClient.get<BookingRefundRequestDto>(url);
  }

  // Learner submits a new refund request
  static async create(
    request: BookingRefundRequestCreateRequest
  ): Promise<ApiResponse<BookingRefundRequestDto>> {
    return apiClient.post<BookingRefundRequestDto>(
      API_ENDPOINTS.BOOKING_REFUND_REQUEST.CREATE,
      request
    );
  }

  // Business Admin updates request status through query parameter
  static async updateStatus(
    bookingRefundRequestId: number,
    status: BookingRefundRequestStatus
  ): Promise<ApiResponse<BookingRefundRequestDto>> {
    const baseUrl = replaceUrlParams(
      API_ENDPOINTS.BOOKING_REFUND_REQUEST.UPDATE_STATUS,
      { id: bookingRefundRequestId.toString() }
    );
    const url = `${baseUrl}?status=${status}`;
    return apiClient.put<BookingRefundRequestDto>(url);
  }
}



