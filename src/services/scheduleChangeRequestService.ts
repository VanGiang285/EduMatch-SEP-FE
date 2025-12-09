import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { ScheduleChangeRequestDto } from '@/types/backend';
import { ScheduleChangeRequestStatus } from '@/types/enums';

export interface ScheduleChangeRequestCreateRequest {
  scheduleId: number;
  requesterEmail: string;
  requestedToEmail: string;
  oldAvailabilitiId: number;
  newAvailabilitiId: number;
  reason?: string;
}

export class ScheduleChangeRequestService {
  static async getById(
    id: number
  ): Promise<ApiResponse<ScheduleChangeRequestDto>> {
    const endpoint = replaceUrlParams(
      API_ENDPOINTS.SCHEDULE_CHANGE_REQUESTS.GET_BY_ID,
      {
        id: id.toString(),
      }
    );
    return apiClient.get<ScheduleChangeRequestDto>(endpoint);
  }

  static async create(
    payload: ScheduleChangeRequestCreateRequest
  ): Promise<ApiResponse<ScheduleChangeRequestDto>> {
    return apiClient.post<ScheduleChangeRequestDto>(
      API_ENDPOINTS.SCHEDULE_CHANGE_REQUESTS.CREATE,
      payload
    );
  }

  static async updateStatus(
    id: number,
    status: ScheduleChangeRequestStatus
  ): Promise<ApiResponse<ScheduleChangeRequestDto>> {
    const endpoint = replaceUrlParams(
      API_ENDPOINTS.SCHEDULE_CHANGE_REQUESTS.UPDATE_STATUS,
      {
        id: id.toString(),
      }
    );
    const urlWithStatus = `${endpoint}?status=${status}`;
    return apiClient.put<ScheduleChangeRequestDto>(urlWithStatus);
  }

  static async getAllByRequesterEmail(
    requesterEmail: string,
    status?: ScheduleChangeRequestStatus
  ): Promise<ApiResponse<ScheduleChangeRequestDto[]>> {
    return apiClient.get<ScheduleChangeRequestDto[]>(
      API_ENDPOINTS.SCHEDULE_CHANGE_REQUESTS.GET_ALL_BY_REQUESTER_EMAIL,
      {
        requesterEmail,
        status,
      }
    );
  }

  static async getAllByRequestedToEmail(
    requestedToEmail: string,
    status?: ScheduleChangeRequestStatus
  ): Promise<ApiResponse<ScheduleChangeRequestDto[]>> {
    return apiClient.get<ScheduleChangeRequestDto[]>(
      API_ENDPOINTS.SCHEDULE_CHANGE_REQUESTS.GET_ALL_BY_REQUESTED_TO_EMAIL,
      {
        requestedToEmail,
        status,
      }
    );
  }

  static async getAllByScheduleId(
    scheduleId: number,
    status?: ScheduleChangeRequestStatus
  ): Promise<ApiResponse<ScheduleChangeRequestDto[]>> {
    const endpoint = replaceUrlParams(
      API_ENDPOINTS.SCHEDULE_CHANGE_REQUESTS.GET_ALL_BY_SCHEDULE_ID,
      { scheduleId: scheduleId.toString() },
      {
        status,
      }
    );
    return apiClient.get<ScheduleChangeRequestDto[]>(endpoint);
  }
}
