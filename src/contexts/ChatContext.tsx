"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ChatService } from "@/services/chatService";
import { useAuth } from "./AuthContext";
import { useCustomToast } from "@/hooks/useCustomToast";

interface ChatContextType {
  openChatWithTutor: (tutorId: number, tutorEmail: string, tutorName?: string, tutorAvatar?: string) => Promise<void>;
  isFloatingChatOpen: boolean;
  setIsFloatingChatOpen: (open: boolean) => void;
  selectedRoomId: number | null;
  setSelectedRoomId: (roomId: number | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const { user } = useAuth();
  const { showError } = useCustomToast();

  const openChatWithTutor = useCallback(async (
    tutorId: number,
    tutorEmail: string,
    tutorName?: string,
    tutorAvatar?: string
  ) => {
    console.log('ChatContext.openChatWithTutor called with:', {
      tutorId,
      tutorEmail,
      tutorName,
      tutorAvatar,
      userEmail: user?.email
    });

    if (!user?.email) {
      console.error('User email is missing');
      showError("Lỗi", "Vui lòng đăng nhập để nhắn tin.");
      return;
    }

    try {
      console.log('Calling ChatService.getOrCreateChatRoom...');
      // Get or create chat room
      const roomResponse = await ChatService.getOrCreateChatRoom(tutorId, user.email);
      console.log('ChatService.getOrCreateChatRoom response:', roomResponse);
      
      if (roomResponse.success && roomResponse.data) {
        console.log('Setting selectedRoomId and opening floating chat:', roomResponse.data.id);
        // Set selected room and open floating chat
        setSelectedRoomId(roomResponse.data.id);
        setIsFloatingChatOpen(true);
        console.log('Floating chat should be open now');
      } else {
        console.error('Failed to create/get chat room:', roomResponse);
        showError("Lỗi", "Không thể tạo phòng chat. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Failed to open chat with tutor:", error);
      showError("Lỗi", "Không thể mở phòng chat. Vui lòng thử lại.");
    }
  }, [user?.email, showError]);

  return (
    <ChatContext.Provider
      value={{
        openChatWithTutor,
        isFloatingChatOpen,
        setIsFloatingChatOpen,
        selectedRoomId,
        setSelectedRoomId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

