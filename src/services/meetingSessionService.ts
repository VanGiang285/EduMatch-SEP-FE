import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { MeetingSessionDto } from '@/types/backend';

export class MeetingSessionService {
  static async getById(id: number): Promise<ApiResponse<MeetingSessionDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.MEETING_SESSIONS.GET_BY_ID, { id: id.toString() });
    return apiClient.get<MeetingSessionDto>(url);
  }

  static async getByScheduleId(scheduleId: number): Promise<ApiResponse<MeetingSessionDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.MEETING_SESSIONS.GET_BY_SCHEDULE_ID, { scheduleId: scheduleId.toString() });
    return apiClient.get<MeetingSessionDto>(url);
  }
}

