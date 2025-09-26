import { Button } from "./ui/button";

interface NavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
  currentPage: 'landing' | 'login' | 'register';
}

export function Navbar({ onNavigateToLogin, onNavigateToRegister, onNavigateToHome, currentPage }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={onNavigateToHome}
              className="text-2xl font-bold text-black hover:text-gray-800 transition-colors"
            >
              EduMatch
            </button>
          </div>

          {/* Navigation Links - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Tìm gia sư
            </a>
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Trở thành gia sư
            </a>
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Về chúng tôi
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {currentPage !== 'login' && (
              <Button
                variant="ghost"
                onClick={onNavigateToLogin}
                className="text-gray-600 hover:text-black hover:bg-gray-100"
              >
                Đăng nhập
              </Button>
            )}
            {currentPage !== 'register' && (
              <Button
                onClick={onNavigateToRegister}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                Đăng ký
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}