import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { TutorPayoutDto } from '@/types/backend';

export class TutorPayoutService {
  static async getByBookingId(bookingId: number): Promise<ApiResponse<TutorPayoutDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.TUTOR_PAYOUTS.GET_BY_BOOKING, { bookingId: bookingId.toString() });
    return apiClient.get<TutorPayoutDto[]>(url);
  }
}

