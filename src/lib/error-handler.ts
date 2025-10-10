
import { AppError } from '@/types';
import { ApiError } from '@/types/api';
import { ERROR_CODES, ERROR_MESSAGES } from '@/constants';

export class ErrorHandler {
  static handleApiError(error: any): AppError {
    if (this.isApiError(error)) {
      return {
        code: error.code || ERROR_CODES.INTERNAL_ERROR,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      return {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: error.message,
        details: error,
      };
    }

    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: ERROR_MESSAGES.SERVER_ERROR,
      details: error,
    };
  }

  static isApiError(error: any): error is ApiError {
    return error && typeof error.status === 'number' && typeof error.message === 'string';
  }

  static getUserFriendlyMessage(error: any): string {
    const appError = this.handleApiError(error);
    
    switch (appError.code) {
      case ERROR_CODES.VALIDATION_ERROR:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case ERROR_CODES.AUTHENTICATION_ERROR:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case ERROR_CODES.AUTHORIZATION_ERROR:
        return ERROR_MESSAGES.FORBIDDEN;
      case ERROR_CODES.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case ERROR_CODES.CONFLICT:
        return ERROR_MESSAGES.CONFLICT;
      case ERROR_CODES.NETWORK_ERROR:
        return ERROR_MESSAGES.NETWORK_ERROR;
      case ERROR_CODES.TIMEOUT_ERROR:
        return 'Yêu cầu hết thời gian chờ. Vui lòng thử lại.';
      default:
        return appError.message || ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  static logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorHandler${context ? ` - ${context}` : ''}]:`, error);
    }
    
  }

  static handleValidationErrors(errors: any[]): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    
    errors.forEach(error => {
      if (error.field && error.message) {
        fieldErrors[error.field] = error.message;
      }
    });
    
    return fieldErrors;
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (this.isApiError(error) && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  }

  static isNetworkError(error: any): boolean {
    return (
      error.code === ERROR_CODES.NETWORK_ERROR ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine
    );
  }

  static isTimeoutError(error: any): boolean {
    return (
      error.code === ERROR_CODES.TIMEOUT_ERROR ||
      error.message?.includes('timeout') ||
      error.name === 'TimeoutError'
    );
  }

  static getErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (this.isApiError(error)) {
      if (error.status >= 500) return 'critical';
      if (error.status >= 400) return 'high';
      return 'medium';
    }
    
    if (this.isNetworkError(error)) return 'high';
    if (this.isTimeoutError(error)) return 'medium';
    
    return 'low';
  }
}

export const setupGlobalErrorHandler = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      ErrorHandler.logError(event.reason, 'Unhandled Promise Rejection');
    });

    window.addEventListener('error', (event) => {
      ErrorHandler.logError(event.error, 'Uncaught Error');
    });
  }
};

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: AppError; resetError: () => void }>;
  onError?: (error: AppError) => void;
}
