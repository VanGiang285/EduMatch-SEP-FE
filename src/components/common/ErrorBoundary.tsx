"use client";
import React, { Component, ReactNode } from 'react';
import { ErrorHandler, ErrorBoundaryProps, ErrorBoundaryState } from '@/lib/error-handler';
import { Button } from '@/components/ui/basic/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
interface Props extends ErrorBoundaryProps {
  children: ReactNode;
}
export class ErrorBoundary extends Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = ErrorHandler.handleApiError(error);
    return {
      hasError: true,
      error: appError,
    };
  }
  componentDidCatch(error: Error) {
    const appError = ErrorHandler.handleApiError(error);
    ErrorHandler.logError(error, 'ErrorBoundary');
    if (this.props.onError) {
      this.props.onError(appError);
    }
  }
  resetError = () => {
    this.setState({ hasError: false });
  };
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            resetError={this.resetError} 
          />
        );
      }
      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }
    return this.props.children;
  }
}
interface ErrorFallbackProps {
  error: any;
  resetError: () => void;
}
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const message = ErrorHandler.getUserFriendlyMessage(error);
  const severity = ErrorHandler.getErrorSeverity(error);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle 
            className={`h-12 w-12 ${
              severity === 'critical' ? 'text-red-500' :
              severity === 'high' ? 'text-orange-500' :
              severity === 'medium' ? 'text-yellow-500' :
              'text-blue-500'
            }`} 
          />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Đã xảy ra lỗi
        </h1>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="space-y-3">
          <Button
            onClick={resetError}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            Tải lại trang
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Chi tiết lỗi (Development)
            </summary>
            <pre className="mt-2 text-xs text-gray-400 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    const appError = ErrorHandler.handleApiError(error);
    ErrorHandler.logError(error, context);
    return appError;
  };
  const getUserFriendlyMessage = (error: any) => {
    return ErrorHandler.getUserFriendlyMessage(error);
  };
  return {
    handleError,
    getUserFriendlyMessage,
  };
};