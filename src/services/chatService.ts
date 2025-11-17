import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { ChatRoomDto, ChatMessageDto } from '@/types/backend';
export class ChatService {
  static async getChatRooms(email: string): Promise<ApiResponse<ChatRoomDto[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CHAT.GET_ROOMS, { email });
    return apiClient.get<ChatRoomDto[]>(endpoint);
  }
  static async getMessages(roomId: number): Promise<ApiResponse<ChatMessageDto[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CHAT.GET_MESSAGES, { roomId: roomId.toString() });
    return apiClient.get<ChatMessageDto[]>(endpoint);
  }
  static async getOrCreateChatRoom(tutorId: number, userEmail: string): Promise<ApiResponse<ChatRoomDto>> {
    return apiClient.post<ChatRoomDto>(API_ENDPOINTS.CHAT.GET_OR_CREATE_ROOM, { 
      tutorId,
      userEmail 
    });
  }
}
