import { Button } from "../ui/basic/button";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { Checkbox } from "../ui/form/checkbox";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomToast } from "@/hooks/useCustomToast";
import { AuthService } from "@/services/authService";
import { ROLE_NAME_TO_ROLE_MAP, USER_ROLES } from "@/constants";
interface LoginPageProps {
  onSwitchToRegister: () => void;
  onForgotPassword?: () => void;
}
export function LoginPage({ onSwitchToRegister, onForgotPassword }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { showSuccess, showInfo } = useCustomToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Check null, undefined và empty string
    if (!email || !password || email === '' || password === '') {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    
    // Check khoảng trắng bên trong (trước khi trim)
    if (email.includes(' ') || password.includes(' ')) {
      setError("Email và mật khẩu không được chứa khoảng trắng");
      return;
    }
    
    // Trim và check empty sau khi trim
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (trimmedEmail.length === 0 || trimmedPassword.length === 0) {
      setError("Email và mật khẩu không được để trống");
      return;
    }
    
    try {
      setIsLoading(true);
      await login(trimmedEmail, trimmedPassword, rememberMe);
      showSuccess("Đăng nhập thành công!");
      
      // Get current user to check role and redirect immediately
      try {
        const userResponse = await AuthService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          // Determine role from roleId or roleName
          let role = USER_ROLES.LEARNER;
          if (userResponse.data.roleId) {
            // If roleId exists, use it
            const roleId = Number(userResponse.data.roleId);
            if (roleId === 4) role = USER_ROLES.SYSTEM_ADMIN;
            else if (roleId === 3) role = USER_ROLES.BUSINESS_ADMIN;
            else if (roleId === 2) role = USER_ROLES.TUTOR;
            else if (roleId === 1) role = USER_ROLES.LEARNER;
          } else if (userResponse.data.roleName) {
            // If roleName exists, map it to role string
            role = (ROLE_NAME_TO_ROLE_MAP[userResponse.data.roleName] || USER_ROLES.LEARNER) as typeof USER_ROLES[keyof typeof USER_ROLES];
          }
          
          const redirectTo = searchParams.get('redirect');
          
          // Redirect based on role or redirect param
          if (redirectTo) {
            router.push(redirectTo);
            return;
          }
          
          // Redirect based on role
          if (role === USER_ROLES.SYSTEM_ADMIN) {
            router.push('/system-admin/users');
          } else if (role === USER_ROLES.BUSINESS_ADMIN) {
            router.push('/business-admin/dashboard');
          } else {
            router.push('/');
          }
        }
      } catch (userError) {
        console.warn('Failed to get user details for redirect:', userError);
        // Fallback to home page if getCurrentUser fails
        router.push('/');
      }
    } catch (error: any) {
      let errorMessage = "Đăng nhập thất bại";
      
      // Xử lý error message từ nhiều nguồn khác nhau
      const message = error?.message || error?.error || '';
      
      if (message) {
        // Check các trường hợp lỗi cụ thể
        if (message.includes("Invalid email") || 
            message.includes("Invalid credentials") || 
            message.includes("invalid") ||
            message.includes("wrong password") ||
            message.toLowerCase().includes("incorrect")) {
          errorMessage = "Email hoặc mật khẩu không chính xác";
        } else if (message.includes("Email not verified") || message.includes("not verified")) {
          try {
            await AuthService.resendVerification(trimmedEmail);
            errorMessage = "Vui lòng xác thực email trước khi đăng nhập. Email xác thực đã được gửi lại";
            showInfo("Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn");
          } catch (resendError) {
            errorMessage = "Vui lòng xác thực email trước khi đăng nhập";
          }
        } else if (message.includes("Account is deactivated") || message.includes("deactivated")) {
          errorMessage = "Tài khoản đã bị vô hiệu hóa";
        } else if (message.includes("Email is logged in with google") || message.includes("google")) {
          errorMessage = "Email này đã được đăng ký bằng Google. Vui lòng đăng nhập bằng Google";
        } else if (message === "An error occurred") {
          // Nếu là generic error, cho thông báo mặc định
          errorMessage = "Email hoặc mật khẩu không chính xác";
        } else {
          errorMessage = message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-2 sm:p-4 lg:p-8 pt-20">
      <div className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden lg:grid lg:grid-cols-2 border border-[#FD8B51]">
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
        <div className="flex flex-col justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-16 min-h-screen lg:min-h-0">
          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 leading-tight tracking-tight">
                CÙNG GIA SƯ MỞ RA<br />
                CƠ HỘI HỌC TẬP MỚI
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Sẵn sàng bước vào hành trình học tập tiếp theo? Đăng nhập ngay và để gia sư đưa bạn đến đích.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6" noValidate>
              {/* Email Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-black text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="h-10 sm:h-11 lg:h-12 border-gray-300 rounded-lg bg-white text-sm sm:text-base focus:border-[#257180] focus:ring-1 focus:ring-[#257180]"
                />
              </div>
              {/* Password Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="password" className="text-black text-sm sm:text-base">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="h-10 sm:h-11 lg:h-12 border-gray-300 rounded-lg bg-white pr-10 text-sm sm:text-base focus:border-[#257180] focus:ring-1 focus:ring-[#257180]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 sm:top-3 lg:top-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
              {/* New user link */}
              <div className="text-left">
                <p className="text-xs sm:text-sm text-gray-600">
                  Người dùng mới?{" "}
                  <button 
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-black underline hover:text-gray-800"
                  >
                    Tạo tài khoản
                  </button>
                </p>
              </div>
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-400"
                  />
                  <Label htmlFor="remember" className="text-xs sm:text-sm text-gray-600">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-800"
                >
                  Quên mật khẩu?
                </button>
              </div>
              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 lg:h-12 bg-[#257180] hover:bg-[#1e5a66] text-white rounded-lg font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập - Bắt đầu học ngay"}
              </Button>
              {/* Divider */}
              <div className="relative my-4 sm:my-5 lg:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>
              {/* Google Login */}
              <GoogleSignInButton 
                mode="signin" 
                disabled={isLoading}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}