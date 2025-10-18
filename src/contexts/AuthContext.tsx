"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types';
import { AuthService } from '@/services';
import { ErrorHandler } from '@/lib/error-handler';
import { STORAGE_KEYS } from '@/constants';
import { TokenManager } from '@/lib/tokenManager';
import { apiClient } from '@/lib/api';
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Token refresh callbacks
  const handleTokenRefresh = useCallback(async () => {
    try {
      console.log('🔄 Refreshing token...');
      const response = await AuthService.refreshToken();
      if (response.success && response.data) {
        const { accessToken } = response.data;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        
        // Cập nhật timer cho token mới
        TokenManager.saveTokenAndUpdateTimer(
          accessToken,
          handleTokenRefresh,
          handleTokenRefreshFailed
        );
        
        console.log('✅ Token refreshed successfully');
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  }, []);

  const handleTokenRefreshFailed = useCallback(() => {
    console.log('🚪 Token refresh failed, logging out user');
    // Dừng token refresh timer
    TokenManager.stopTokenRefreshTimer();
    
    // Clear auth data
    AuthService.clearStoredData();
    setUser(null);
  }, []);

  // Setup ApiClient callbacks
  useEffect(() => {
    apiClient.setTokenRefreshCallbacks(handleTokenRefresh, handleTokenRefreshFailed);
  }, [handleTokenRefresh, handleTokenRefreshFailed]);
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = AuthService.getStoredUser();
        const isAuthenticated = AuthService.isAuthenticated();
        if (isAuthenticated && storedUser) {
          setUser(storedUser);
          
          // Bắt đầu token refresh timer cho user đã login
          const currentToken = TokenManager.getCurrentToken();
          if (currentToken) {
            TokenManager.saveTokenAndUpdateTimer(
              currentToken,
              handleTokenRefresh,
              handleTokenRefreshFailed
            );
          }
          
          try {
            const response = await AuthService.getCurrentUser();
            if (response.success && response.data) {
              const userData: User = {
                id: response.data.email,
                email: response.data.email,
                name: response.data.name || response.data.email,
                role: response.data.roleId === '1' ? 'student' : response.data.roleId === '2' ? 'tutor' : 'admin',
                avatar: response.data.avatarUrl || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setUser(userData);
              AuthService.storeUserData(userData, localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '');
            }
          } catch (error) {
            AuthService.clearStoredData();
            setUser(null);
            TokenManager.stopTokenRefreshTimer();
          }
        }
      } catch (error) {
        ErrorHandler.logError(error, 'AuthProvider.initializeAuth');
        AuthService.clearStoredData();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, [handleTokenRefresh, handleTokenRefreshFailed]);
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      const response = await AuthService.login({ email, password, rememberMe });
      if (response.success && response.data) {
        const { accessToken } = response.data;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        const tempUser: User = {
          id: email,
          email: email,
          name: email,
          role: 'student',
          avatar: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(tempUser);
        AuthService.storeUserData(tempUser, accessToken);
        
        // Bắt đầu token refresh timer
        TokenManager.saveTokenAndUpdateTimer(
          accessToken,
          handleTokenRefresh,
          handleTokenRefreshFailed
        );
        
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        }
        setTimeout(async () => {
          try {
            const userResponse = await AuthService.getCurrentUser();
            if (userResponse.success && userResponse.data) {
              const userData: User = {
                id: userResponse.data.email,
                email: userResponse.data.email,
                name: userResponse.data.name || userResponse.data.email,
                role: userResponse.data.roleId === '1' ? 'student' : userResponse.data.roleId === '2' ? 'tutor' : 'admin',
                avatar: userResponse.data.avatarUrl || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setUser(userData);
              AuthService.storeUserData(userData, accessToken);
            }
          } catch (error) {
            console.warn('Failed to get user details:', error);
          }
        }, 1000);
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.login');
      throw ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [handleTokenRefresh, handleTokenRefreshFailed]);
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Dừng token refresh timer
      TokenManager.stopTokenRefreshTimer();
      
      await AuthService.logout();
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.logout');
    } finally {
      AuthService.clearStoredData();
      setUser(null);
      setLoading(false);
    }
  }, []);
  const register = useCallback(async (fullName: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await AuthService.register({ fullName, email, password });
      if (response.success) {
        // Registration successful, user needs to verify email
        // Don't set user state yet, wait for email verification
      } else {
        throw new Error(response.error?.message || 'Registration failed');
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.register');
      throw ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);
  const googleLogin = useCallback(async (idToken: string) => {
    try {
      setLoading(true);
      const response = await AuthService.googleLogin({ idToken });
      if (response.success && response.data) {
        const { accessToken } = response.data;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        const userResponse = await AuthService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const userData: User = {
            id: userResponse.data.email,
            email: userResponse.data.email,
            name: userResponse.data.name || userResponse.data.email,
            role: userResponse.data.roleId === '1' ? 'student' : userResponse.data.roleId === '2' ? 'tutor' : 'admin',
            avatar: userResponse.data.avatarUrl || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUser(userData);
          AuthService.storeUserData(userData, accessToken);
          
          // Bắt đầu token refresh timer cho Google login
          TokenManager.saveTokenAndUpdateTimer(
            accessToken,
            handleTokenRefresh,
            handleTokenRefreshFailed
          );
        }
      } else {
        throw new Error(response.error?.message || 'Google login failed');
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.googleLogin');
      throw ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [handleTokenRefresh, handleTokenRefreshFailed]);
  const verifyEmail = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const response = await AuthService.verifyEmail(token);
      if (response.success) {
        // Email verified successfully
      } else {
        throw new Error(response.error?.message || 'Email verification failed');
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.verifyEmail');
      throw ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);
  const resendVerification = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const response = await AuthService.resendVerification(email);
      if (response.success) {
        // Verification email sent successfully
      } else {
        throw new Error(response.error?.message || 'Failed to resend verification email');
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.resendVerification');
      throw ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);
  const refreshToken = useCallback(async () => {
    try {
      const response = await AuthService.refreshToken();
      if (response.success && response.data) {
        const { accessToken } = response.data;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        const userResponse = await AuthService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const userData: User = {
            id: userResponse.data.email,
            email: userResponse.data.email,
            name: userResponse.data.name || userResponse.data.email,
            role: userResponse.data.roleId === '1' ? 'student' : userResponse.data.roleId === '2' ? 'tutor' : 'admin',
            avatar: userResponse.data.avatarUrl || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUser(userData);
          AuthService.storeUserData(userData, accessToken);
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.refreshToken');
      AuthService.clearStoredData();
      setUser(null);
      throw error;
    }
  }, []);
  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AuthService.storeUserData(updatedUser, localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '');
    }
  }, [user]);
  const clearAuth = useCallback(() => {
    // Dừng token refresh timer
    TokenManager.stopTokenRefreshTimer();
    
    AuthService.clearStoredData();
    setUser(null);
  }, []);
  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    googleLogin,
    verifyEmail,
    resendVerification,
    refreshToken,
    updateUser,
    clearAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};