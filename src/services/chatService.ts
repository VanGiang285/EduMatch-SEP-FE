import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

// Types for Chat API
export interface ChatRoom {
  id: number;
  name: string;
  type: 'direct' | 'group';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'user' | 'tutor' | 'admin';
  joinedAt: string;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderEmail: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: ChatParticipant;
}

export class ChatService {
  /**
   * Get chat rooms for a user
   */
  static async getChatRooms(email: string): Promise<ApiResponse<ChatRoom[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CHAT.GET_ROOMS, { email });
    return apiClient.get<ChatRoom[]>(endpoint);
  }

  /**
   * Get messages for a chat room
   */
  static async getMessages(roomId: number): Promise<ApiResponse<ChatMessage[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CHAT.GET_MESSAGES, { roomId: roomId.toString() });
    return apiClient.get<ChatMessage[]>(endpoint);
  }
}
