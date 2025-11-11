import { useEffect, useState, useCallback } from "react";
import { connection, startSignalR } from "@/services/signalRService";
import * as signalR from "@microsoft/signalr";
import { ChatMessageDto } from "@/types/backend";

export interface UseChatReturn {
  messages: ChatMessageDto[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageDto[]>>;
  addMessage: (message: ChatMessageDto) => void;
  isConnected: boolean;
}

/**
 * Hook to manage chat messages and SignalR connection
 */
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Add message to the list
  const addMessage = useCallback((message: ChatMessageDto) => {
    setMessages((prevMessages) => {
      // Check if message already exists (avoid duplicates)
      const exists = prevMessages.some((msg) => msg.id === message.id);
      if (exists) {
        return prevMessages;
      }
      return [...prevMessages, message];
    });
  }, []);

  useEffect(() => {
    // Start SignalR connection
    startSignalR().catch((err) => {
      console.error("Failed to start SignalR:", err);
    });

    // Handle connection state changes
    const handleConnectionStateChange = () => {
      setIsConnected(connection.state === signalR.HubConnectionState.Connected);
    };

    // Listen for connection state changes
    connection.onclose(() => {
      setIsConnected(false);
    });

    connection.onreconnecting(() => {
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      setIsConnected(true);
    });

    // Initial connection state
    handleConnectionStateChange();

    // Listen for new messages
    const handleReceiveMessage = (messageObject: ChatMessageDto) => {
      console.log("📨 Received new message:", messageObject);
      addMessage(messageObject);
    };

    connection.on("ReceiveMessage", handleReceiveMessage);

    // Cleanup
    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
    };
  }, [addMessage]);

  return {
    messages,
    setMessages,
    addMessage,
    isConnected,
  };
}





