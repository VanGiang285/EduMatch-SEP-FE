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
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const addMessage = useCallback((message: ChatMessageDto) => {
    setMessages((prevMessages) => {
      // Check if message already exists (by real ID)
      const exists = prevMessages.some((msg) => msg.id === message.id);
      if (exists) {
        return prevMessages;
      }
      // If this is a real message from server, try to replace temporary optimistic message
      // Temporary messages have negative IDs, real messages have positive IDs
      const isRealMessage = typeof message.id === 'number' && message.id > 0;
      if (isRealMessage) {
        // Find and remove temporary message with matching content
        // We match by content and sender, not by time (since timezone might differ)
        let foundTempMessage = false;
        const filtered = prevMessages.filter(msg => {
          // If it's a temporary message (negative ID) with matching content
          if (typeof msg.id === 'number' && msg.id < 0) {
            const isMatchingTemp = msg.chatRoomId === message.chatRoomId && 
                                   msg.senderEmail === message.senderEmail &&
                                   (msg.messageText?.trim() || '') === (message.messageText?.trim() || '');
            if (isMatchingTemp) {
              foundTempMessage = true;
              // Remove temporary message - return false to filter it out
              return false;
            }
          }
          return true;
        });
        
        if (foundTempMessage) {
          console.log("🔄 Replacing temporary message with real message from server");
        }
        
        return [...filtered, message];
      }
      // Temporary message or new message - add it
      return [...prevMessages, message];
    });
  }, []);
  useEffect(() => {
    const handleConnectionStateChange = () => {
      const isConnectedNow = connection.state === signalR.HubConnectionState.Connected;
      setIsConnected(isConnectedNow);
    };
    const handleClose = () => {
      setIsConnected(false);
    };
    const handleReconnecting = () => {
      setIsConnected(false);
    };
    const handleReconnected = () => {
      setIsConnected(true);
    };
    connection.onclose(handleClose);
    connection.onreconnecting(handleReconnecting);
    connection.onreconnected(handleReconnected);
    const initializeConnection = async () => {
      try {
        await startSignalR();
        handleConnectionStateChange();
        setTimeout(() => {
          handleConnectionStateChange();
        }, 200);
      } catch (err) {
        console.error("Failed to start SignalR:", err);
        setIsConnected(false);
      }
    };
    initializeConnection();
    handleConnectionStateChange();
    const stateCheckInterval = setInterval(() => {
      handleConnectionStateChange();
    }, 500); 
    const handleReceiveMessage = (messageObject: ChatMessageDto) => {
      console.log("📨 Received new message:", messageObject);
      // Add message - the addMessage function will handle replacing temporary messages
      addMessage(messageObject);
    };
    connection.on("ReceiveMessage", handleReceiveMessage);
    return () => {
      clearInterval(stateCheckInterval);
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
