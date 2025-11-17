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
      const exists = prevMessages.some((msg) => msg.id === message.id);
      if (exists) {
        return prevMessages;
      }
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
