"use client";
import { Button } from "../ui/basic/button";
import { Menu, X, Search, BookOpen, GraduationCap, MessageCircle, Bell, Heart, LogOut, User, Wallet, UserCircle, Calendar, Settings, FileText, ChevronDown, Sparkles, Receipt, AlertTriangle, ClipboardList } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { useWalletContext } from "@/contexts/WalletContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/constants";
import { MessageDropdown } from "./MessageDropdown";
import { NotificationDropdown } from "./NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/navigation/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/basic/avatar";
interface NavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
  onNavigateToBecomeTutor?: () => void;
  onNavigateToFindTutor?: () => void;
  onNavigateToAIChat?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToClassRequests?: () => void;
  currentPage: string;
  walletBalance?: number;
}
export function Navbar({ onNavigateToLogin, onNavigateToRegister, onNavigateToHome, onNavigateToBecomeTutor, onNavigateToFindTutor, onNavigateToAIChat, onNavigateToMessages, onNavigateToNotifications, onNavigateToFavorites, onNavigateToWallet, onNavigateToClassRequests, currentPage, walletBalance: propWalletBalance }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
  const walletContext = useWalletContext();
  const walletBalance = walletContext?.balance ?? propWalletBalance ?? 0;

  const isAdmin = user && (user.role === USER_ROLES.SYSTEM_ADMIN || user.role === USER_ROLES.BUSINESS_ADMIN);
  const isTutor = user && user.role === USER_ROLES.TUTOR;
  const isLearner = user && user.role === USER_ROLES.LEARNER;

  const handleLogout = async () => {
    try {
      await logout();
      onNavigateToHome();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleBecomeTutorClick = () => {
    console.log('🔍 Navbar - isAuthenticated:', isAuthenticated);
    console.log('🔍 Navbar - user:', user);

    if (!isAuthenticated || !user) {
      console.log('🔍 Navbar - Not authenticated, redirecting to login');
      toast.warning('Cần đăng nhập', 'Bạn cần đăng nhập để trở thành gia sư', 3000);
      setTimeout(() => {
        onNavigateToLogin();
      }, 1000);
    } else {
      console.log('🔍 Navbar - Authenticated, navigating to become-tutor');
      onNavigateToBecomeTutor?.();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#257180] border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onNavigateToHome}
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-[#257180] rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">EduMatch</span>
          </button>
          {/* Hide menu items for admin users */}
          {!isAdmin && (
            <div className="hidden lg:flex items-center space-x-1">
              {(!isAuthenticated || isLearner) && (
                <>
                  <button
                    onClick={onNavigateToFindTutor}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Tìm gia sư
                  </button>
                  <button
                    onClick={onNavigateToAIChat}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Chat
                  </button>
                </>
              )}
              <button
                onClick={onNavigateToClassRequests}
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Yêu cầu mở lớp
              </button>
            </div>
          )}
          <div className="hidden lg:flex items-center space-x-2">
            {isAuthenticated && !isAdmin && (
              <div className="flex items-center space-x-1">
                <MessageDropdown
                  onViewAll={() => {
                    onNavigateToMessages?.();
                  }}
                  onMessageClick={(id) => {
                    onNavigateToMessages?.();
                  }}
                />
                <NotificationDropdown
                  onViewAll={() => {
                    onNavigateToNotifications?.();
                  }}
                  onNotificationClick={(id) => {
                    onNavigateToNotifications?.();
                  }}
                  onMarkAllRead={() => {
                  }}
                />
                <button
                  onClick={onNavigateToFavorites}
                  className="p-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                  title="Gia sư đã thích"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/profile?tab=wallet')}
                  className="flex items-center space-x-2 px-3 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                  title="Ví tiền"
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {walletBalance.toLocaleString('vi-VN')}đ
                  </span>
                </button>
              </div>
            )}
            <div className="flex items-center space-x-3 ml-4">
              {isAuthenticated && user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all">
                      {user.avatar ? (
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={user.avatar} alt={user.name} className="rounded-lg" />
                          <AvatarFallback className="bg-[#F2E5BF] text-[#257180] rounded-lg font-semibold">
                            {(user.name || 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="bg-[#F2E5BF] text-[#257180] rounded-lg font-semibold">
                            {(user.name || 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-white font-medium text-sm max-w-32 truncate">
                        {user.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-white/70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-300 shadow-lg">
                    <div className="px-2 py-1.5">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />

                    {!isAdmin && (
                      <>
                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=profile')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Thông tin người dùng
                        </DropdownMenuItem>
                        {isTutor && (
                          <DropdownMenuItem
                            onClick={() => router.push('/profile?tab=tutorProfile')}
                            className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                          >
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Hồ sơ gia sư
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=schedule')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          {isTutor ? 'Lịch dạy' : 'Lịch học'}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=scheduleChange')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Yêu cầu chuyển lịch
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=classes')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          {isTutor ? 'Lịch đặt' : 'Lớp học'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(isTutor ? '/profile?tab=tutorApplications' : '/profile?tab=classRequests')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {isTutor ? 'Ứng tuyển lớp dạy' : 'Yêu cầu mở lớp'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=wallet')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Ví
                        </DropdownMenuItem>
                        {!isTutor && (
                          <DropdownMenuItem
                            onClick={() => router.push('/profile?tab=refundRequests')}
                            className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Yêu cầu hoàn tiền
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=reports')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Báo cáo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=notifications')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Thông báo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=messages')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Tin nhắn
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push('/profile?tab=settings')}
                          className="cursor-pointer hover:bg-[#FD8B51] hover:text-white"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Cài đặt
                        </DropdownMenuItem>
                      </>
                    )}

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
              ) : (
                <>
                  {currentPage !== 'login' && (
                    <Button
                      variant="ghost"
                      onClick={onNavigateToLogin}
                      className="text-white hover:text-[#FD8B51] hover:bg-white/10 font-medium px-4"
                    >
                      Đăng nhập
                    </Button>
                  )}
                  {currentPage !== 'register' && (
                    <Button
                      onClick={onNavigateToRegister}
                      className="bg-[#FD8B51] hover:bg-[#CB6040] text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      Đăng ký ngay
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#257180] border-t border-white/20">
          <div className="px-4 py-4 space-y-2">
            {/* Hide mobile menu items for admin users */}
            {!isAdmin && (
              <>
                {(!isAuthenticated || isLearner) && (
                  <>
                    <button
                      onClick={onNavigateToFindTutor}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium w-full text-left"
                    >
                      <Search className="w-4 h-4" />
                      Tìm gia sư
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigateToAIChat?.();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium w-full text-left"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Chat
                    </button>
                  </>
                )}
                <button
                  onClick={onNavigateToClassRequests}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium w-full text-left"
                >
                  <BookOpen className="w-4 h-4" />
                  Yêu cầu mở lớp
                </button>
              </>
            )}
            {isAuthenticated && !isAdmin && (
              <div className="pt-4 space-y-2 border-t border-white/20">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={onNavigateToMessages}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Tin nhắn</span>
                  </button>
                  <button
                    onClick={onNavigateToNotifications}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="text-sm">Thông báo</span>
                  </button>
                  <button
                    onClick={onNavigateToFavorites}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Yêu thích</span>
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/profile?tab=wallet');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm">Ví: {walletBalance.toLocaleString('vi-VN')}đ</span>
                  </button>
                </div>
              </div>
            )}
            <div className="pt-4 space-y-2 border-t border-white/20">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                        <span className="text-[#257180] font-bold text-sm">
                          {(user.name || 'U').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/70 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Thông tin người dùng</span>
                    </button>
                    {isTutor && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push('/profile?tab=tutorProfile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-sm">Hồ sơ gia sư</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=schedule');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{isTutor ? 'Lịch dạy' : 'Lịch học'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=scheduleChange');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span className="text-sm">Yêu cầu chuyển lịch</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=classes');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">{isTutor ? 'Lịch đặt' : 'Lớp học'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push(isTutor ? '/profile?tab=tutorApplications' : '/profile?tab=classRequests');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{isTutor ? 'Ứng tuyển lớp dạy' : 'Yêu cầu mở lớp'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=wallet');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm">Ví</span>
                    </button>
                    {!isTutor && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push('/profile?tab=refundRequests');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Receipt className="w-4 h-4" />
                        <span className="text-sm">Yêu cầu hoàn tiền</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=reports');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Báo cáo</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=notifications');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="text-sm">Thông báo</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=messages');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Tin nhắn</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/profile?tab=settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Cài đặt</span>
                    </button>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border border-white/30 text-white hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/50 font-medium transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <>
                  {currentPage !== 'login' && (
                    <Button
                      variant="outline"
                      onClick={onNavigateToLogin}
                      className="w-full border border-white/30 text-white hover:bg-white/10 font-medium"
                    >
                      Đăng nhập
                    </Button>
                  )}
                  {currentPage !== 'register' && (
                    <Button
                      onClick={onNavigateToRegister}
                      className="w-full bg-[#FD8B51] hover:bg-[#CB6040] text-white font-semibold"
                    >
                      Đăng ký ngay
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}