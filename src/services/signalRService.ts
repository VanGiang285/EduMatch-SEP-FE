import * as signalR from "@microsoft/signalr";
import { APP_CONFIG } from "@/constants/config";
import { STORAGE_KEYS } from "@/constants";
const HUB_URL = `${APP_CONFIG.API_BASE_URL}/chatHub`;
function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || "";
}
const connection = new signalR.HubConnectionBuilder()
  .withUrl(HUB_URL, {
    accessTokenFactory: () => getAccessToken(),
  })
  .withAutomaticReconnect()
  .build();
async function startSignalR(): Promise<void> {
  if (connection.state === signalR.HubConnectionState.Disconnected) {
    try {
      await connection.start();
      console.log("✅ SignalR connected successfully.");
    } catch (err) {
      console.error("❌ SignalR connection failed: ", err);
      throw err;
    }
  }
}
async function stopSignalR(): Promise<void> {
  if (connection.state !== signalR.HubConnectionState.Disconnected) {
    try {
      await connection.stop();
      console.log("✅ SignalR disconnected.");
    } catch (err) {
      console.error("❌ SignalR disconnection failed: ", err);
    }
  }
}
async function sendMessage(
  chatRoomId: number,
  senderEmail: string,
  receiverEmail: string,
  message: string
): Promise<void> {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    await startSignalR();
  }
  if (connection.state !== signalR.HubConnectionState.Connected) {
    return Promise.reject("SignalR is not connected.");
  }
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Sending message via SignalR:', {
        method: 'SendMessage',
        chatRoomId,
        senderEmail,
        receiverEmail,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      });
    }
    await connection.invoke("SendMessage", chatRoomId, senderEmail, receiverEmail, message);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Message sent successfully');
    }
  } catch (err) {
    console.error("❌ Failed to send message:", err);
    throw err;
  }
}
async function markMessagesAsRead(
  chatRoomId: number,
  receiverEmail: string
): Promise<void> {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    await startSignalR();
  }
  if (connection.state !== signalR.HubConnectionState.Connected) {
    return Promise.reject("SignalR is not connected.");
  }
  try {
    await connection.invoke("MarkMessagesAsRead", chatRoomId, receiverEmail);
  } catch (err) {
    console.error("❌ Failed to mark messages as read:", err);
    throw err;
  }
}
export { connection, startSignalR, stopSignalR, sendMessage, markMessagesAsRead };
