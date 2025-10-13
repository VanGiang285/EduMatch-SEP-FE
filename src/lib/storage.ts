import { STORAGE_KEYS } from '@/constants';
export class StorageService {
  static setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }
  static getItem<T = any>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }
  static removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
  static clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
  static setAuthToken(token: string): void {
    this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }
  static getAuthToken(): string | null {
    return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }
  static removeAuthToken(): void {
    this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  static setRefreshToken(token: string): void {
    this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }
  static getRefreshToken(): string | null {
    return this.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }
  static removeRefreshToken(): void {
    this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
  static setUserData(user: any): void {
    this.setItem(STORAGE_KEYS.USER_DATA, user);
  }
  static getUserData<T = any>(): T | null {
    return this.getItem<T>(STORAGE_KEYS.USER_DATA);
  }
  static removeUserData(): void {
    this.removeItem(STORAGE_KEYS.USER_DATA);
  }
  static setTheme(theme: string): void {
    this.setItem(STORAGE_KEYS.THEME, theme);
  }
  static getTheme(): string | null {
    return this.getItem<string>(STORAGE_KEYS.THEME);
  }
  static removeTheme(): void {
    this.removeItem(STORAGE_KEYS.THEME);
  }
  static setLanguage(language: string): void {
    this.setItem(STORAGE_KEYS.LANGUAGE, language);
  }
  static getLanguage(): string | null {
    return this.getItem<string>(STORAGE_KEYS.LANGUAGE);
  }
  static removeLanguage(): void {
    this.removeItem(STORAGE_KEYS.LANGUAGE);
  }
  static setRememberMe(remember: boolean): void {
    this.setItem(STORAGE_KEYS.REMEMBER_ME, remember);
  }
  static getRememberMe(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME) || false;
  }
  static removeRememberMe(): void {
    this.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }
  static clearAuthData(): void {
    this.removeAuthToken();
    this.removeRefreshToken();
    this.removeUserData();
    this.removeRememberMe();
  }
  static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
  static getSize(): number {
    if (typeof window === 'undefined') return 0;
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
  static getQuota(): number {
    if (typeof window === 'undefined') return 0;
    return 5 * 1024 * 1024; // 5MB
  }
  static isFull(): boolean {
    return this.getSize() > this.getQuota() * 0.9; // 90% full
  }
}
export class SessionStorageService {
  static setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
    }
  }
  static getItem<T = any>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from sessionStorage:', error);
      return null;
    }
  }
  static removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  }
  static clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.clear();
  }
}