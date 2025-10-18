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
    async (fullName: string, email: string, password: string) => {
      return await auth.register(fullName, email, password);
    }
  );
  const logoutAsync = useAsync(
    async () => {
      return await auth.logout();
    }
  );
  const googleLoginAsync = useAsync(
    async (idToken: string) => {
      return await auth.googleLogin(idToken);
    }
  );
  const verifyEmailAsync = useAsync(
    async (token: string) => {
      return await auth.verifyEmail(token);
    }
  );
  const resendVerificationAsync = useAsync(
    async (email: string) => {
      return await auth.resendVerification(email);
    }
  );
  return {
    ...auth,
    loginAsync,
    registerAsync,
    logoutAsync,
    googleLoginAsync,
    verifyEmailAsync,
    resendVerificationAsync,
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
  const handleRegister = async (fullName: string, email: string, password: string) => {
    try {
      await auth.register(fullName, email, password);
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
  const handleGoogleLogin = async (idToken: string) => {
    try {
      await auth.googleLogin(idToken);
      return { success: true };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      return { 
        success: false, 
        error: ErrorHandler.getUserFriendlyMessage(appError) 
      };
    }
  };
  const handleVerifyEmail = async (token: string) => {
    try {
      await auth.verifyEmail(token);
      return { success: true };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      return { 
        success: false, 
        error: ErrorHandler.getUserFriendlyMessage(appError) 
      };
    }
  };
  const handleResendVerification = async (email: string) => {
    try {
      await auth.resendVerification(email);
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
    handleGoogleLogin,
    handleVerifyEmail,
    handleResendVerification,
  };
};