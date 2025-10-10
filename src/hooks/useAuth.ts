import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useAsync } from './useAsync';
import { ErrorHandler } from '@/lib/error-handler';

export const useAuth = useAuthContext;

export const useAuthAsync = () => {
  const auth = useAuthContext();
  
  const loginAsync = useAsync(
    async (email: string, password: string, rememberMe = false) => {
      return await auth.login(email, password, rememberMe);
    }
  );

  const registerAsync = useAsync(
    async (userData: any) => {
      return await auth.register(userData);
    }
  );

  const logoutAsync = useAsync(
    async () => {
      return await auth.logout();
    }
  );

  return {
    ...auth,
    loginAsync,
    registerAsync,
    logoutAsync,
  };
};

export const useAuthStatus = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  return {
    isAuthenticated,
    isLoading: loading,
    user,
    isStudent: user?.role === 'student',
    isTutor: user?.role === 'tutor',
    isAdmin: user?.role === 'admin',
  };
};

export const useProtectedRoute = (requiredRole?: string) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  const hasAccess = () => {
    if (!isAuthenticated || !user) return false;
    if (!requiredRole) return true;
    return user.role === requiredRole;
  };

  return {
    hasAccess: hasAccess(),
    isLoading: loading,
    user,
    isAuthenticated,
  };
};

export const useAuthActions = () => {
  const auth = useAuthContext();
  
  const handleLogin = async (email: string, password: string, rememberMe = false) => {
    try {
      await auth.login(email, password, rememberMe);
      return { success: true };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      return { 
        success: false, 
        error: ErrorHandler.getUserFriendlyMessage(appError) 
      };
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      await auth.register(userData);
      return { success: true };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      return { 
        success: false, 
        error: ErrorHandler.getUserFriendlyMessage(appError) 
      };
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      return { success: true };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      return { 
        success: false, 
        error: ErrorHandler.getUserFriendlyMessage(appError) 
      };
    }
  };

  return {
    handleLogin,
    handleRegister,
    handleLogout,
  };
};