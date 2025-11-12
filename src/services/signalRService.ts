import * as signalR from "@microsoft/signalr";
import { APP_CONFIG } from "@/constants/config";
import { STORAGE_KEYS } from "@/constants";

const HUB_URL = `${APP_CONFIG.API_BASE_URL}/chatHub`;

/**
 * Get access token from localStorage
 */
function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || "";
}

// Create SignalR connection
const connection = new signalR.HubConnectionBuilder()
  .withUrl(HUB_URL, {
    accessTokenFactory: () => getAccessToken(),
  })
  .withAutomaticReconnect()
  .build();

/**
 * Start SignalR connection
 */
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

/**
 * Stop SignalR connection
 */
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

/**
 * Send message via SignalR
 * @param chatRoomId - Chat room ID
 * @param receiverEmail - Receiver email address
 * @param message - Message text
 */
async function sendMessage(
  chatRoomId: number,
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
    await connection.invoke("SendMessage", chatRoomId, receiverEmail, message);
  } catch (err) {
    console.error("❌ Failed to send message:", err);
    throw err;
  }
}

/**
 * Mark messages as read via SignalR
 * @param chatRoomId - Chat room ID
 * @param receiverEmail - Receiver email address
 */
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









