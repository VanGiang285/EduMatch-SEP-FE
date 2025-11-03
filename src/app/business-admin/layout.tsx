"use client";

import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/constants';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BusinessAdminLayout as BusinessAdminLayoutComponent } from '@/components/business-admin/layout/BusinessAdminLayout';

interface BusinessAdminLayoutProps {
  children: React.ReactNode;
}

export default function BusinessAdminLayout({ children }: BusinessAdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if we're on the home page or unauthorized page (likely after logout)
    const isOnHomePage = pathname === '/';
    const isOnUnauthorizedPage = pathname === '/unauthorized';
    
    if (!loading) {
      // If user is null (after logout), redirect to homepage
      if (!user && !isOnHomePage && !isOnUnauthorizedPage) {
        router.push('/');
        return;
      }
      
      // If user exists but is not BUSINESS_ADMIN, redirect to unauthorized
      if (user && user.role !== USER_ROLES.BUSINESS_ADMIN && !isOnUnauthorizedPage && !isOnHomePage) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FD8B51]" />
          <span className="text-gray-600">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== USER_ROLES.BUSINESS_ADMIN) {
    return null; // Will redirect via useEffect
  }

  return (
    <BusinessAdminLayoutComponent>
      {children}
    </BusinessAdminLayoutComponent>
  );
}

