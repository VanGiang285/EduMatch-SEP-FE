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
  register: (email: string, password: string) => Promise<void>;
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
              // Convert backend user data to frontend User type
              const userData: User = {
                id: response.data.email, // Use email as ID since backend uses email as primary key
                email: response.data.email,
                name: response.data.name || response.data.email,
                role: response.data.roleId === '1' ? 'student' : response.data.roleId === '2' ? 'tutor' : 'admin',
                avatar: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setUser(userData);
              AuthService.storeUserData(userData, localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '');
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
        const { accessToken } = response.data;
        // Store access token first - we'll update with user data later
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        // Create a temporary user object for now
        const tempUser: User = {
          id: email, // Use email as ID temporarily
          email: email,
          name: email,
          role: 'student', // Default role
          avatar: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(tempUser);
        AuthService.storeUserData(tempUser, accessToken);
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        }
        // Try to get user data in background (don't block login)
        setTimeout(async () => {
          try {
            const userResponse = await AuthService.getCurrentUser();
            if (userResponse.success && userResponse.data) {
              const userData: User = {
                id: userResponse.data.email,
                email: userResponse.data.email,
                name: userResponse.data.name || userResponse.data.email,
                role: userResponse.data.roleId === '1' ? 'student' : userResponse.data.roleId === '2' ? 'tutor' : 'admin',
                avatar: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setUser(userData);
              AuthService.storeUserData(userData, accessToken);
            }
          } catch (error) {
            console.warn('Failed to get user details:', error);
            // Keep the temporary user data
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
  const register = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await AuthService.register({ email, password });
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
        // Store access token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        // Get user data
        const userResponse = await AuthService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const userData: User = {
            id: userResponse.data.email,
            email: userResponse.data.email,
            name: userResponse.data.name || userResponse.data.email,
            role: userResponse.data.roleId === '1' ? 'student' : userResponse.data.roleId === '2' ? 'tutor' : 'admin',
            avatar: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUser(userData);
          AuthService.storeUserData(userData, accessToken);
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
  }, []);
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
        // Store new access token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        // Get updated user data
        const userResponse = await AuthService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const userData: User = {
            id: userResponse.data.email,
            email: userResponse.data.email,
            name: userResponse.data.name || userResponse.data.email,
            role: userResponse.data.roleId === '1' ? 'student' : userResponse.data.roleId === '2' ? 'tutor' : 'admin',
            avatar: undefined,
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