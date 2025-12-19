import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { ScheduleDto, ScheduleAttendanceSummaryDto } from '@/types/backend';
import { ScheduleStatus } from '@/types/enums';
import { PagedResult } from './bookingService';

export interface ScheduleCreateRequest {
  availabilitiId: number;
  bookingId: number;
  attendanceNote?: string;
  isOnline?: boolean;
}

export interface ScheduleUpdateRequest {
  id: number;
  availabilitiId?: number;
  bookingId?: number;
  status?: ScheduleStatus;
  attendanceNote?: string;
  isOnline?: boolean;
}

export class ScheduleService {
  /**
   * Lấy Schedule theo Id
   */
  static async getById(id: number): Promise<ApiResponse<ScheduleDto>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.GET_BY_ID, {
      id: id.toString(),
    });
    return apiClient.get<ScheduleDto>(endpoint);
  }

  /**
   * Lấy Schedule theo AvailabilityId
   */
  static async getByAvailabilityId(
    availabilityId: number
  ): Promise<ApiResponse<ScheduleDto>> {
    const endpoint = replaceUrlParams(
      API_ENDPOINTS.SCHEDULES.GET_BY_AVAILABILITY_ID,
      {
        availabilitiId: availabilityId.toString(),
      }
    );
    return apiClient.get<ScheduleDto>(endpoint);
  }

  /**
   * Lấy danh sách Schedule theo BookingId có phân trang
   */
  static async getAllPaging(
    bookingId: number,
    params?: {
      status?: ScheduleStatus;
      page?: number;
      pageSize?: number;
    }
  ): Promise<ApiResponse<PagedResult<ScheduleDto>>> {
    return apiClient.get<PagedResult<ScheduleDto>>(
      API_ENDPOINTS.SCHEDULES.GET_ALL_PAGING,
      {
        bookingId,
        status: params?.status,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      }
    );
  }

  /**
   * Lấy danh sách Schedule theo BookingId (không phân trang)
   */
  static async getAllNoPaging(
    bookingId: number,
    status?: ScheduleStatus
  ): Promise<ApiResponse<ScheduleDto[]>> {
    return apiClient.get<ScheduleDto[]>(
      API_ENDPOINTS.SCHEDULES.GET_ALL_NO_PAGING,
      {
        bookingId,
        status,
      }
    );
  }

  /**
   * Tạo Schedule mới
   */
  static async createSchedule(
    request: ScheduleCreateRequest
  ): Promise<ApiResponse<ScheduleDto>> {
    return apiClient.post<ScheduleDto>(API_ENDPOINTS.SCHEDULES.CREATE, request);
  }

  /**
   * Tạo danh sách Schedule
   */
  static async createScheduleList(
    requests: ScheduleCreateRequest[]
  ): Promise<ApiResponse<ScheduleDto[]>> {
    return apiClient.post<ScheduleDto[]>(
      API_ENDPOINTS.SCHEDULES.CREATE_LIST,
      requests
    );
  }

  /**
   * Cập nhật Schedule
   */
  static async updateSchedule(
    request: ScheduleUpdateRequest
  ): Promise<ApiResponse<ScheduleDto>> {
    return apiClient.put<ScheduleDto>(API_ENDPOINTS.SCHEDULES.UPDATE, request);
  }

  /**
   * Cập nhật Status của Schedule
   */
  static async updateStatus(
    id: number,
    status: ScheduleStatus
  ): Promise<ApiResponse<ScheduleDto>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.UPDATE_STATUS, {
      id: id.toString(),
    });
    return apiClient.put<ScheduleDto>(endpoint, { status });
  }

  /**
   * Hủy toàn bộ Schedule theo BookingId
   */
  static async cancelAllByBooking(
    bookingId: number
  ): Promise<ApiResponse<ScheduleDto[]>> {
    const endpoint = replaceUrlParams(
      API_ENDPOINTS.SCHEDULES.CANCEL_ALL_BY_BOOKING,
      {
        bookingId: bookingId.toString(),
      }
    );
    return apiClient.post<ScheduleDto[]>(endpoint);
  }

  /**
   * Lấy tất cả lịch học theo LearnerEmail
   */
  static async getAllByLearnerEmail(
    learnerEmail: string,
    params?: {
      startDate?: Date | string;
      endDate?: Date | string;
      status?: ScheduleStatus;
    }
  ): Promise<ApiResponse<ScheduleDto[]>> {
    return apiClient.get<ScheduleDto[]>(
      API_ENDPOINTS.SCHEDULES.GET_ALL_BY_LEARNER_EMAIL,
      {
        learnerEmail,
        startDate:
          params?.startDate instanceof Date
            ? params.startDate.toISOString()
            : params?.startDate,
        endDate:
          params?.endDate instanceof Date
            ? params.endDate.toISOString()
            : params?.endDate,
        status: params?.status,
      }
    );
  }

  /**
   * Lấy tất cả lịch dạy theo TutorEmail
   */
  static async getAllByTutorEmail(
    tutorEmail: string,
    params?: {
      startDate?: Date | string;
      endDate?: Date | string;
      status?: ScheduleStatus;
    }
  ): Promise<ApiResponse<ScheduleDto[]>> {
    return apiClient.get<ScheduleDto[]>(
      API_ENDPOINTS.SCHEDULES.GET_ALL_BY_TUTOR_EMAIL,
      {
        tutorEmail,
        startDate:
          params?.startDate instanceof Date
            ? params.startDate.toISOString()
            : params?.startDate,
        endDate:
          params?.endDate instanceof Date
            ? params.endDate.toISOString()
            : params?.endDate,
        status: params?.status,
      }
    );
  }

  /**
   * Học viên xác nhận lịch học đã hoàn thành và kích hoạt thanh toán ngay lập tức.
   */
  static async finishSchedule(id: number): Promise<ApiResponse<object>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.FINISH, {
      id: id.toString(),
    });
    return apiClient.post<object>(endpoint);
  }

  /**
   * Học viên hoặc gia sư hủy việc hoàn thành lịch học (không thanh toán).
   */
  static async cancelScheduleCompletion(
    id: number
  ): Promise<ApiResponse<object>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.CANCEL, {
      id: id.toString(),
    });
    return apiClient.post<object>(endpoint);
  }

  /**
   * Đánh dấu lịch học là đã báo cáo/tạm giữ (liên kết với một báo cáo hiện có).
   */
  static async reportSchedule(
    id: number,
    reportId: number
  ): Promise<ApiResponse<object>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.REPORT, {
      id: id.toString(),
      reportId: reportId.toString(),
    });
    return apiClient.post<object>(endpoint);
  }

  /**
   * Admin giải quyết: giải phóng thanh toán hoặc hủy sau khi xem xét.
   */
  static async resolveReport(
    id: number,
    releaseToTutor: boolean = true
  ): Promise<ApiResponse<object>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.RESOLVE_REPORT, {
      id: id.toString(),
    });
    const url = `${endpoint}?releaseToTutor=${releaseToTutor}`;
    return apiClient.post<object>(url);
  }

  static async getAttendanceSummary(bookingId: number): Promise<ApiResponse<ScheduleAttendanceSummaryDto>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.ATTENDANCE_SUMMARY, {
      bookingId: bookingId.toString(),
    });
    return apiClient.get<ScheduleAttendanceSummaryDto>(endpoint);
  }

  static async adminFinishSchedule(id: number): Promise<ApiResponse<object>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.ADMIN_FINISH, {
      id: id.toString(),
    });
    return apiClient.post<object>(endpoint);
  }

  static async adminCancelSchedule(id: number): Promise<ApiResponse<object>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.SCHEDULES.ADMIN_CANCEL, {
      id: id.toString(),
    });
    return apiClient.post<object>(endpoint);
  }

  static async getByTutorEmailAndStatus(
    tutorEmail: string,
    bookingId: number,
    params?: {
      status?: ScheduleStatus;
      take?: number;
    }
  ): Promise<ApiResponse<ScheduleDto[]>> {
    return apiClient.get<ScheduleDto[]>(
      API_ENDPOINTS.SCHEDULES.GET_BY_TUTOR_EMAIL_AND_STATUS,
      {
        tutorEmail,
        bookingId,
        status: params?.status,
        take: params?.take || 1,
      }
    );
  }
}
