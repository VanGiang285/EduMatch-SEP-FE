"use client";

import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/constants';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, User, Calendar, Wallet, MessageSquare, Star, Bell, Shield, Settings, Menu, X, Clock, DollarSign, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import { PageWrapper } from '@/components/common/PageWrapper';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

// Learner menu items
const learnerMenuItems = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User, href: '/profile' },
  { id: 'sessions', label: 'Sessions & Bookings', icon: Calendar, href: '/profile/sessions' },
  { id: 'wallet', label: 'Ví & Thanh toán', icon: Wallet, href: '/profile/wallet' },
  { id: 'messages', label: 'Tin nhắn', icon: MessageSquare, href: '/profile/messages' },
  { id: 'reviews', label: 'Đánh giá', icon: Star, href: '/profile/reviews' },
  { id: 'notifications', label: 'Thông báo', icon: Bell, href: '/profile/notifications' },
  { id: 'security', label: 'Bảo mật', icon: Shield, href: '/profile/security' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, href: '/profile/settings' }
];

// Tutor menu items
const tutorMenuItems = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User, href: '/profile' },
  { id: 'teaching-profile', label: 'Profile gia sư', icon: BookOpen, href: '/profile/teaching-profile' },
  { id: 'sessions', label: 'Sessions & Schedule', icon: Calendar, href: '/profile/sessions' },
  { id: 'availability', label: 'Lịch rảnh', icon: Clock, href: '/profile/availability' },
  { id: 'earnings', label: 'Thu nhập', icon: DollarSign, href: '/profile/earnings' },
  { id: 'messages', label: 'Tin nhắn', icon: MessageSquare, href: '/profile/messages' },
  { id: 'reviews', label: 'Đánh giá', icon: Star, href: '/profile/reviews' },
  { id: 'notifications', label: 'Thông báo', icon: Bell, href: '/profile/notifications' },
  { id: 'security', label: 'Bảo mật', icon: Shield, href: '/profile/security' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, href: '/profile/settings' }
];

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FD8B51]" />
          <span className="text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Determine menu items based on user role
  const menuItems = user.role === USER_ROLES.TUTOR ? tutorMenuItems : learnerMenuItems;
  const isTutor = user.role === USER_ROLES.TUTOR;
  const roleLabel = isTutor ? 'Gia sư' : 'Học viên';

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
        <PageWrapper currentPage="profile">
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
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? 'bg-[#FD8B51] text-white'
                                : 'text-gray-700 hover:bg-[#F2E5BF] hover:text-[#257180]'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
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