import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-2 sm:p-4 lg:p-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden lg:grid lg:grid-cols-2">
        {/* Phần bên trái - Hình ảnh và caption */}
        <div className="relative hidden lg:flex lg:flex-col lg:justify-end overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1727790632675-204d26c2326c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBib29rcyUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NTg3NzgyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Student studying with books"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="relative z-10 p-12 pb-16">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              BƯỚC ĐẦU TIÊN<br />
              HƯỚNG TỚI THÀNH CÔNG
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Tạo tài khoản và bắt đầu hành trình học tập cùng các gia sư hàng đầu. Tri thức là chìa khóa mở ra tương lai.
            </p>
          </div>
        </div>

        {/* Phần bên phải - Form đăng ký */}
        <div className="flex flex-col justify-start lg:justify-center py-4 sm:py-6 lg:py-12 px-4 sm:px-6 lg:px-16 min-h-screen lg:min-h-0 overflow-y-auto">
          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-black mb-2 sm:mb-3 lg:mb-4 leading-tight tracking-tight">
                TẠO TÀI KHOẢN<br />
                HỌC TẬP NGAY HÔM NAY
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed">
                Gia nhập cộng đồng học viên và trải nghiệm phương pháp học tập hiệu quả.
              </p>
            </div>

            <form className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Họ và tên */}
              <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                <Label htmlFor="fullName" className="text-black text-sm sm:text-base">Họ và tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  className="h-9 sm:h-10 lg:h-12 border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                <Label htmlFor="email" className="text-black text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="h-9 sm:h-10 lg:h-12 border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                <Label htmlFor="password" className="text-black text-sm sm:text-base">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tạo mật khẩu mạnh"
                    className="h-9 sm:h-10 lg:h-12 border-gray-300 rounded-lg bg-gray-50 pr-10 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 sm:top-2.5 lg:top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                <Label htmlFor="confirmPassword" className="text-black text-sm sm:text-base">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    className="h-9 sm:h-10 lg:h-12 border-gray-300 rounded-lg bg-gray-50 pr-10 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2 sm:top-2.5 lg:top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />}
                  </button>
                </div>
              </div>

              {/* Already have account link */}
              <div className="text-left">
                <p className="text-xs sm:text-sm text-gray-600">
                  Đã có tài khoản?{" "}
                  <button 
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-black underline hover:text-gray-800"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="border-gray-400 mt-0.5 sm:mt-1"
                />
                <Label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Tôi đồng ý với{" "}
                  <a href="#" className="text-black underline hover:text-gray-800">
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a href="#" className="text-black underline hover:text-gray-800">
                    Chính sách bảo mật
                  </a>
                </Label>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                disabled={!agreeTerms}
                className="w-full h-9 sm:h-10 lg:h-12 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm sm:text-base"
              >
                Tạo tài khoản - Bắt đầu học ngay
              </Button>

              {/* Divider */}
              <div className="relative my-3 sm:my-4 lg:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>

              {/* Google Register */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-9 sm:h-10 lg:h-12 border-gray-300 hover:bg-gray-50 rounded-lg text-sm sm:text-base"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng ký với Google
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}