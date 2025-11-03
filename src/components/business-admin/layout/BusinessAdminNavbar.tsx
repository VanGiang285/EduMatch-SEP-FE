"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/basic/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/navigation/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  ClipboardList,
  AlertCircle,
  Wallet,
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface BusinessAdminNavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export function BusinessAdminNavbar({ currentView, onNavigate }: BusinessAdminNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/business-admin/dashboard' },
    { id: 'learners', label: 'Quản lý Học viên', icon: Users, path: '/business-admin/learners' },
    { id: 'tutors', label: 'Quản lý Gia sư', icon: GraduationCap, path: '/business-admin/tutors' },
    { id: 'tutor-applications', label: 'Đơn đăng ký Gia sư', icon: FileText, path: '/business-admin/applications' },
    { id: 'class-requests', label: 'Yêu cầu mở lớp', icon: ClipboardList, path: '/business-admin/class-requests' },
    { id: 'reports', label: 'Báo cáo', icon: AlertCircle, path: '/business-admin/reports' },
    { id: 'wallet', label: 'Ví hệ thống', icon: Wallet, path: '/business-admin/wallet' },
  ];

  const handleNavigation = (view: string) => {
    const item = menuItems.find(m => m.id === view);
    if (item) {
      router.push(item.path);
    }
    onNavigate?.(view);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      router.push('/');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#257180] to-[#FD8B51] rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">E</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#257180]">EduMatch</h1>
              <p className="text-xs text-orange-600 font-medium">Business Admin</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigation(item.id)}
                  className={isActive ? 'bg-[#257180] hover:bg-[#257180]/90 text-white' : ''}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-[#257180] text-white">
                      {user?.name?.[0] || 'BA'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm text-gray-900">{user?.name || 'Business Admin'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-[#FD8B51] z-[9999]">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => handleNavigation(item.id)}
                    className={`justify-start ${isActive ? 'bg-[#257180] hover:bg-[#257180]/90 text-white' : ''}`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

