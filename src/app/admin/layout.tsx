'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/constants';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FD8B51]" />
          <span className="text-gray-600">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  // Additional client-side check (middleware already handles this)
  useEffect(() => {
    if (!loading && (!user || user.role !== USER_ROLES.SYSTEM_ADMIN)) {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);

  if (!user || user.role !== USER_ROLES.SYSTEM_ADMIN) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#FD8B51]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Xin chào, {user.fullName || user.email}
              </span>
              <span className="px-2 py-1 bg-[#F2E5BF] text-[#257180] text-xs rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b border-[#FD8B51]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/admin/dashboard"
              className="border-b-2 border-transparent text-gray-500 hover:text-[#257180] hover:border-[#FD8B51] px-1 py-4 text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/admin/users"
              className="border-b-2 border-transparent text-gray-500 hover:text-[#257180] hover:border-[#FD8B51] px-1 py-4 text-sm font-medium"
            >
              Quản lý người dùng
            </a>
            <a
              href="/admin/tutors"
              className="border-b-2 border-transparent text-gray-500 hover:text-[#257180] hover:border-[#FD8B51] px-1 py-4 text-sm font-medium"
            >
              Quản lý gia sư
            </a>
            <a
              href="/admin/reviews"
              className="border-b-2 border-transparent text-gray-500 hover:text-[#257180] hover:border-[#FD8B51] px-1 py-4 text-sm font-medium"
            >
              Quản lý đánh giá
            </a>
            <a
              href="/admin/settings"
              className="border-b-2 border-transparent text-gray-500 hover:text-[#257180] hover:border-[#FD8B51] px-1 py-4 text-sm font-medium"
            >
              Cài đặt
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
