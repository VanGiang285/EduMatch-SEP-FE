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
  FileText,
  ClipboardList,
  AlertCircle,
  Wallet,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CreditCard,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BusinessAdminSidebarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function BusinessAdminSidebar({ 
  currentView, 
  onNavigate, 
  isCollapsed: externalIsCollapsed,
  onToggleCollapse 
}: BusinessAdminSidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = onToggleCollapse || setInternalIsCollapsed;
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/business-admin/dashboard' },
    { id: 'users', label: 'Quản lý Người dùng', icon: UserIcon, path: '/business-admin/users' },
    { id: 'tutor-applications', label: 'Đơn đăng ký Gia sư', icon: FileText, path: '/business-admin/applications' },
    { id: 'class-requests', label: 'Yêu cầu mở lớp', icon: ClipboardList, path: '/business-admin/class-requests' },
    { id: 'reports', label: 'Báo cáo', icon: AlertCircle, path: '/business-admin/reports' },
    { id: 'refund-requests', label: 'Yêu cầu hoàn tiền', icon: Receipt, path: '/business-admin/refund-requests' },
    { id: 'refund-policies', label: 'Chính sách hoàn tiền', icon: CreditCard, path: '/business-admin/refund-policies' },
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
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
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

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-[#257180] text-white">
                      {user?.name?.[0] || 'BA'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 z-[9999]">
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

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-50 lg:hidden overflow-y-auto">
              <div className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'default' : 'ghost'}
                      onClick={() => handleNavigation(item.id)}
                      className={cn(
                        "w-full justify-start",
                        isActive 
                          ? 'bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white' 
                          : 'hover:bg-[#FD8B51] hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#257180] to-[#FD8B51] rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#257180]">EduMatch</h1>
                <p className="text-xs text-orange-600 font-medium">Business Admin</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn("ml-auto", isCollapsed && "mx-auto")}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                onClick={() => handleNavigation(item.id)}
                className={cn(
                  "w-full justify-start",
                  isActive 
                    ? 'bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white' 
                    : 'hover:bg-[#FD8B51] hover:text-white',
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && item.label}
              </Button>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="border-t border-gray-200 p-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-all w-full",
                isCollapsed && "justify-center"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-[#257180] text-white">
                    {user?.name?.[0] || 'BA'}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <span className="text-sm text-gray-900 truncate flex-1 text-left">
                    {user?.name || 'Business Admin'}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 z-[9999]">
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
        </div>
      </aside>
    </>
  );
}

