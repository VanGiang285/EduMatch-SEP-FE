"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types';
import { AuthService } from '@/services';
import { ErrorHandler } from '@/lib/error-handler';
import { STORAGE_KEYS } from '@/constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = AuthService.getStoredUser();
        const isAuthenticated = AuthService.isAuthenticated();

        if (isAuthenticated && storedUser) {
          setUser(storedUser);
          
          try {
            const response = await AuthService.getCurrentUser();
            if (response.success && response.data) {
              setUser(response.data);
              AuthService.storeUserData(response.data, localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '');
            }
          } catch (error) {
            AuthService.clearStoredData();
            setUser(null);
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
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      const response = await AuthService.login({ email, password, rememberMe });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        const fullUser: User = {
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(fullUser);
        AuthService.storeUserData(fullUser, token);
        
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        }
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.login');
      throw ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await AuthService.logout();
    } catch (error) {
      ErrorHandler.logError(error, 'AuthProvider.logout');
    } finally {
      AuthService.clearStoredData();
      setUser(null);
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      setLoading(true);
      const response = await AuthService.register(userData);
      
      if (response.success && response.data) {
        const { user } = response.data;
        const fullUser: User = {
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(fullUser);
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

  const refreshToken = useCallback(async () => {
    try {
      const response = await AuthService.refreshToken();
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        const fullUser: User = {
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(fullUser);
        AuthService.storeUserData(fullUser, token);
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