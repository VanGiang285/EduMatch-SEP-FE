import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import {
  ScheduleDto,
  BookingDto,
  ReportListItemDto,
  TutorMonthlyEarningDto,
} from '@/types/backend';

export class TutorDashboardService {
  static async getUpcomingLessons(): Promise<ApiResponse<ScheduleDto[]>> {
    return apiClient.get<ScheduleDto[]>(
      API_ENDPOINTS.TUTOR_DASHBOARD.GET_UPCOMING_LESSONS
    );
  }

  static async getTodaySchedules(): Promise<ApiResponse<ScheduleDto[]>> {
    return apiClient.get<ScheduleDto[]>(
      API_ENDPOINTS.TUTOR_DASHBOARD.GET_TODAY_SCHEDULES
    );
  }

  static async getPendingBookings(): Promise<ApiResponse<BookingDto[]>> {
    return apiClient.get<BookingDto[]>(
      API_ENDPOINTS.TUTOR_DASHBOARD.GET_PENDING_BOOKINGS
    );
  }

  static async getMonthlyEarnings(
    year: number
  ): Promise<ApiResponse<TutorMonthlyEarningDto[]>> {
    return apiClient.get<TutorMonthlyEarningDto[]>(
      API_ENDPOINTS.TUTOR_DASHBOARD.GET_MONTHLY_EARNINGS,
      { year }
    );
  }

  static async getCurrentMonthEarning(): Promise<
    ApiResponse<TutorMonthlyEarningDto>
  > {
    return apiClient.get<TutorMonthlyEarningDto>(
      API_ENDPOINTS.TUTOR_DASHBOARD.GET_CURRENT_MONTH_EARNING
    );
  }

  static async getReportsPendingDefense(): Promise<
    ApiResponse<ReportListItemDto[]>
  > {
    return apiClient.get<ReportListItemDto[]>(
      API_ENDPOINTS.TUTOR_DASHBOARD.GET_REPORTS_PENDING_DEFENSE
    );
  }
}

