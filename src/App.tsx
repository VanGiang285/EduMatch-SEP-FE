import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Checkbox } from "./components/ui/checkbox";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden lg:grid lg:grid-cols-2">
        {/* Phần bên trái - Hình ảnh và caption */}
        <div className="relative hidden lg:flex lg:flex-col lg:justify-end overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1647539761535-e55f1c25e02a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9uJTIwbW9kZXJufGVufDF8fHx8MTc1ODcyMDE5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Modern education and learning"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="relative z-10 p-12 pb-16">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              HỌC TẬP THÔNG MINH,<br />
              THÀNH CÔNG BỀN VỮNG
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Mỗi bước tiến trong học tập đều là một chiến thắng. Hãy để gia sư dẫn lối cho hành trình tri thức của bạn.
            </p>
          </div>
        </div>

        {/* Phần bên phải - Form đăng nhập */}
        <div className="flex flex-col justify-center py-12 px-8 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-black mb-4 leading-tight tracking-tight">
                CÙNG GIA SƯ MỞ RA<br />
                CƠ HỘI HỌC TẬP MỚI
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Sẵn sàng bước vào hành trình học tập tiếp theo? Đăng nhập ngay và để gia sư đưa bạn đến đích. Mục tiêu học tập trong mơ chỉ cách bạn một cú click!
              </p>
            </div>

            <form className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="h-12 border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    className="h-12 border-gray-300 rounded-lg bg-gray-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New user link */}
              <div className="text-left">
                <p className="text-sm text-gray-600">
                  Người dùng mới?{" "}
                  <a href="#" className="text-black underline hover:text-gray-800">
                    Tạo tài khoản
                  </a>
                </p>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-400"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium"
              >
                Đăng nhập - Bắt đầu học ngay
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50 rounded-lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}