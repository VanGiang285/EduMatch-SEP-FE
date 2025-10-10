"use client";

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/feedback/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'student' | 'tutor' | 'admin';
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, isAuthenticated, requiredRole, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cần đăng nhập
          </h2>
          <p className="text-gray-600">
            Vui lòng đăng nhập để truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
