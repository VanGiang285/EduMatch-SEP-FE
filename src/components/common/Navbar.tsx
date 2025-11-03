"use client";
import { Button } from "../ui/basic/button";
import { Menu, X, Search, BookOpen, GraduationCap, MessageCircle, Bell, Heart, LogOut, User, Wallet, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomToast } from "@/hooks/useCustomToast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/constants";
interface NavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
  onNavigateToBecomeTutor?: () => void;
  onNavigateToFindTutor?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToWallet?: () => void;
  onNavigateToClassRequests?: () => void;
  currentPage: string;
  walletBalance?: number;
}
export function Navbar({ onNavigateToLogin, onNavigateToRegister, onNavigateToHome, onNavigateToBecomeTutor, onNavigateToFindTutor, onNavigateToMessages, onNavigateToNotifications, onNavigateToFavorites, onNavigateToWallet, onNavigateToClassRequests, currentPage, walletBalance = 0 }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { showWarning } = useCustomToast();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check if user is admin (system or business)
  const isAdmin = user && (user.role === USER_ROLES.SYSTEM_ADMIN || user.role === USER_ROLES.BUSINESS_ADMIN);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
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
      showWarning('Cần đăng nhập', 'Bạn cần đăng nhập để trở thành gia sư', 3000);
      setTimeout(() => {
        onNavigateToLogin();
      }, 1000);
    } else {
      console.log('🔍 Navbar - Authenticated, navigating to become-tutor');
      onNavigateToBecomeTutor?.();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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
              <button 
                onClick={onNavigateToFindTutor}
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
              >
                <Search className="w-4 h-4" />
                Tìm gia sư
              </button>
              <button 
                onClick={onNavigateToClassRequests}
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Yêu cầu mở lớp
              </button>
              <button 
                onClick={handleBecomeTutorClick}
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
              >
                <GraduationCap className="w-4 h-4" />
                Trở thành gia sư
              </button>
            </div>
          )}
           <div className="hidden lg:flex items-center space-x-2">
             {isAuthenticated && !isAdmin && (
               <div className="flex items-center space-x-1">
                 <button
                   onClick={onNavigateToMessages}
                   className="p-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                   title="Tin nhắn"
                 >
                   <MessageCircle className="w-5 h-5" />
                 </button>
                 <button
                   onClick={onNavigateToNotifications}
                   className="p-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                   title="Thông báo"
                 >
                   <Bell className="w-5 h-5" />
                 </button>
                 <button
                   onClick={onNavigateToFavorites}
                   className="p-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                   title="Gia sư đã thích"
                 >
                   <Heart className="w-5 h-5" />
                 </button>
                 <button
                   onClick={onNavigateToWallet}
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
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#FD8B51] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-white font-medium text-sm max-w-32 truncate">
                      {user.name}
                    </span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {/* Show profile menu items for non-admin users */}
                        {!isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                router.push('/profile');
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <UserCircle className="w-4 h-4" />
                              <span>Tài khoản của tôi</span>
                            </button>
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                router.push('/profile/wallet');
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <Wallet className="w-4 h-4" />
                              <span>Ví & Thanh toán</span>
                            </button>
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                router.push('/profile/messages');
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Tin nhắn</span>
                            </button>
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                router.push('/profile?tab=notifications');
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <Bell className="w-4 h-4" />
                              <span>Thông báo</span>
                            </button>
                          </>
                        )}
                      </div>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                <button 
                  onClick={onNavigateToFindTutor}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium w-full text-left"
                >
                  <Search className="w-4 h-4" />
                  Tìm gia sư
                </button>
                <button 
                  onClick={onNavigateToClassRequests}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium w-full text-left"
                >
                  <BookOpen className="w-4 h-4" />
                  Yêu cầu mở lớp
                </button>
                <button 
                  onClick={handleBecomeTutorClick}
                  className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium w-full text-left"
                >
                  <GraduationCap className="w-4 h-4" />
                  Trở thành gia sư
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
                     onClick={onNavigateToWallet}
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
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#FD8B51] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
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
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm">Thông tin cá nhân</span>
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
                        router.push('/profile?tab=notifications');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="text-sm">Thông báo</span>
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