"use client";

import { Button } from "../ui/basic/button";
import { Menu, X, Search, BookOpen, GraduationCap, MessageCircle, Bell, Heart } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
  onNavigateToBecomeTutor?: () => void;
  onNavigateToFindTutor?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToFavorites?: () => void;
  currentPage: string;
}

export function Navbar({ onNavigateToLogin, onNavigateToRegister, onNavigateToHome, onNavigateToBecomeTutor, onNavigateToFindTutor, onNavigateToMessages, onNavigateToNotifications, onNavigateToFavorites, currentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#257180] border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={onNavigateToHome}
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-[#257180] rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">EduMatch</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <button 
              onClick={onNavigateToFindTutor}
              className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              <Search className="w-4 h-4" />
              Tìm gia sư
            </button>
            <a 
              href="#classes" 
              className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Danh sách lớp học
            </a>
            <button 
              onClick={onNavigateToBecomeTutor}
              className="flex items-center gap-2 px-4 py-2 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              <GraduationCap className="w-4 h-4" />
              Trở thành gia sư
            </button>
          </div>

          {/* Right side icons and auth buttons */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Action Icons */}
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
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 ml-4">
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
            </div>
          </div>

          {/* Mobile menu button */}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#257180] border-t border-white/20">
          <div className="px-4 py-4 space-y-2">
            <button 
              onClick={onNavigateToFindTutor}
              className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium w-full text-left"
            >
              <Search className="w-4 h-4" />
              Tìm gia sư
            </button>
            <a 
              href="#classes" 
              className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Danh sách lớp học
            </a>
            <button 
              onClick={onNavigateToBecomeTutor}
              className="flex items-center gap-3 px-4 py-3 text-white hover:text-[#FD8B51] hover:bg-white/10 rounded-lg transition-all font-medium w-full text-left"
            >
              <GraduationCap className="w-4 h-4" />
              Trở thành gia sư
            </button>
            
            {/* Mobile Action Icons */}
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
            </div>
            
            <div className="pt-4 space-y-2 border-t border-white/20">
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
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}