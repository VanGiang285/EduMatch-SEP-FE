import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { ChatRoomDto, ChatMessageDto } from '@/types/backend';

export class ChatService {
  // Lấy danh sách phòng chat của user
  static async getChatRooms(email: string): Promise<ApiResponse<ChatRoomDto[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CHAT.GET_ROOMS, { email });
    return apiClient.get<ChatRoomDto[]>(endpoint);
  }

  // Lấy tin nhắn trong phòng chat
  static async getMessages(roomId: number): Promise<ApiResponse<ChatMessageDto[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CHAT.GET_MESSAGES, { roomId: roomId.toString() });
    return apiClient.get<ChatMessageDto[]>(endpoint);
  }
}
