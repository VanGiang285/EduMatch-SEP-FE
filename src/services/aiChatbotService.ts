import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { ChatRequestDto, ChatResponseDto, ChatSessionDto, ChatMessageDto } from '@/types/backend';
import { ChatRequest } from '@/types/requests';

export class AIChatbotService {
  // Create a new chat session for authenticated user
  static async createSession(): Promise<ApiResponse<{ sessionId: number }>> {
    return apiClient.post<{ sessionId: number }>(API_ENDPOINTS.AI_CHATBOT.CREATE_SESSION);
  }

  // Get list of chat sessions for Learner
  static async listSessions(): Promise<ApiResponse<ChatSessionDto[]>> {
    return apiClient.get<ChatSessionDto[]>(API_ENDPOINTS.AI_CHATBOT.LIST_SESSIONS);
  }

  // Delete a chat session
  static async deleteSession(sessionId: number): Promise<ApiResponse<{ message: string }>> {
    const url = replaceUrlParams(API_ENDPOINTS.AI_CHATBOT.DELETE_SESSION, {
      sessionId: sessionId.toString(),
    });
    return apiClient.delete<{ message: string }>(url);
  }

  // Send message to AI chatbot and get response
  static async chat(request: ChatRequest): Promise<ApiResponse<ChatResponseDto>> {
    const chatRequest: ChatRequestDto = {
      sessionId: request.sessionId,
      message: request.message,
    };
    return apiClient.post<ChatResponseDto>(API_ENDPOINTS.AI_CHATBOT.CHAT, chatRequest);
  }

  // Get chat history for a session
  static async getChatHistory(sessionId: number): Promise<ApiResponse<ChatMessageDto[]>> {
    return apiClient.get<ChatMessageDto[]>(API_ENDPOINTS.AI_CHATBOT.CHAT_HISTORY, {
      sessionId,
    });
  }

  // Sync all tutors to Qdrant (internal/admin use)
  static async syncTutors(): Promise<ApiResponse<{
    message: string;
    tutorsSynced: number;
    timestamp: string;
  }>> {
    return apiClient.post<{
      message: string;
      tutorsSynced: number;
      timestamp: string;
    }>(API_ENDPOINTS.AI_CHATBOT.SYNC_TUTORS);
  }
}

