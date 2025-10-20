"use client";

import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/constants';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Menu, X, Users } from 'lucide-react';
import Link from 'next/link';
import { PageWrapper } from '@/components/common/PageWrapper';

interface SystemAdminLayoutProps {
  children: React.ReactNode;
}

export default function SystemAdminLayout({ children }: SystemAdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== USER_ROLES.SYSTEM_ADMIN)) {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);

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

  if (!user || user.role !== USER_ROLES.SYSTEM_ADMIN) {
    return null; // Will redirect via useEffect
  }

  const isUsersActive = pathname === '/system-admin/users';

  return (
    <>
      <style jsx global>{`
        html {
          overflow-y: scroll !important;
          scrollbar-gutter: stable;
        }
        body {
          overflow-y: scroll !important;
          scrollbar-gutter: stable;
        }
        [data-radix-select-content] {
          z-index: 9999 !important;
          position: fixed !important;
          overflow-y: visible !important;
          transform: translateZ(0) !important;
        }
        [data-radix-select-viewport] {
          overflow-y: visible !important;
        }
        [data-radix-select-trigger] {
          position: relative !important;
        }
      `}</style>
      <div className="min-h-screen bg-[#F9FAFB]">
        <PageWrapper currentPage="system-admin">
          {/* Mobile menu button */}
          <div className="lg:hidden fixed top-20 left-4 z-40">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-white shadow-lg text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex pt-16">
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              {/* Close button for mobile */}
              <div className="lg:hidden absolute top-4 right-4 z-50">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="h-full px-3 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <ul className="space-y-2 w-full">
                    <li>
                      <Link
                        href="/system-admin/users"
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isUsersActive
                            ? 'bg-[#FD8B51] text-white'
                            : 'text-gray-700 hover:bg-[#F2E5BF] hover:text-[#257180]'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Users className="h-5 w-5 mr-3" />
                        Quản lý người dùng
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-64 overflow-hidden">
              <main className="flex-1 p-6 overflow-y-auto">
                {children}
              </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
        </PageWrapper>
      </div>
    </>
  );
}