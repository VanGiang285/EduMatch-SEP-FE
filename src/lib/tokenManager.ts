import { STORAGE_KEYS } from '@/constants';

export interface TokenPayload {
  sub: string;
  email: string;
  unique_name: string;
  role: string;
  provider: string;
  createdAt: string;
  avatarUrl: string;
  jti: string;
  nbf: number;
  exp: number;
  iat: number;
  iss: string;
}

export class TokenManager {
  private static refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Decode JWT token và trả về payload
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Kiểm tra token có hết hạn không
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Lấy thời gian hết hạn của token (timestamp)
   */
  static getTokenExpiryTime(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload) return 0;
    
    return payload.exp * 1000; // Convert to milliseconds
  }

  /**
   * Kiểm tra có nên refresh token sớm không (5 phút trước khi hết hạn)
   */
  static shouldRefreshSoon(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const refreshThreshold = 5 * 60; // 5 phút
    return (payload.exp - currentTime) < refreshThreshold;
  }

  /**
   * Lấy thời gian còn lại của token (seconds)
   */
  static getTokenTimeRemaining(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  }

  /**
   * Bắt đầu timer để refresh token trước khi hết hạn
   */
  static startTokenRefreshTimer(
    token: string, 
    onRefresh: () => Promise<void>,
    onRefreshFailed: () => void
  ): void {
    // Dừng timer cũ nếu có
    this.stopTokenRefreshTimer();

    const payload = this.decodeToken(token);
    if (!payload) {
      console.error('Invalid token, cannot start refresh timer');
      return;
    }

    const currentTime = Date.now();
    const expiryTime = payload.exp * 1000;
    const refreshTime = expiryTime - (5 * 60 * 1000); // 5 phút trước khi hết hạn
    
    // Nếu token sắp hết hạn (ít hơn 5 phút), refresh ngay
    if (refreshTime <= currentTime) {
      console.log('Token expires soon, refreshing immediately');
      onRefresh().catch(onRefreshFailed);
      return;
    }

    const timeUntilRefresh = refreshTime - currentTime;
    console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);

    this.refreshTimer = setTimeout(async () => {
      try {
        console.log('Auto-refreshing token...');
        await onRefresh();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        onRefreshFailed();
      }
    }, timeUntilRefresh);
  }

  /**
   * Dừng timer refresh token
   */
  static stopTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
      console.log('Token refresh timer stopped');
    }
  }

  /**
   * Lấy token hiện tại từ localStorage
   */
  static getCurrentToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Lưu token mới và cập nhật timer
   */
  static saveTokenAndUpdateTimer(
    token: string,
    onRefresh: () => Promise<void>,
    onRefreshFailed: () => void
  ): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    this.startTokenRefreshTimer(token, onRefresh, onRefreshFailed);
  }
}
