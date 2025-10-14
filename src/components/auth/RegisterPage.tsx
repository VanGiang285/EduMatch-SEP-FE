import { Button } from "../ui/basic/button";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { Checkbox } from "../ui/form/checkbox";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { TermsAndPrivacyModal } from "../common/TermsAndPrivacyModal";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
// import { useRouter } from "next/navigation"; // Removed unused import
import { toast } from "sonner";
interface RegisterPageProps {
  onSwitchToLogin: () => void;
}
export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const { register } = useAuth();
  // const router = useRouter(); // Removed unused variable
  
  // Check password match real-time
  const checkPasswordMatch = (pwd: string, confirmPwd: string) => {
    if (confirmPwd.length > 0 && pwd !== confirmPwd) {
      setPasswordMatchError("Mật khẩu xác nhận không khớp");
    } else {
      setPasswordMatchError("");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordMatchError("");
    
    // Check null, undefined và empty string
    if (!email || !password || !confirmPassword || email === '' || password === '' || confirmPassword === '') {
      setError("Vui lòng nhập đầy đủ tất cả thông tin");
      return;
    }
    
    // Check khoảng trắng bên trong (trước khi trim)
    if (email.includes(' ') || password.includes(' ') || confirmPassword.includes(' ')) {
      setError("Email và mật khẩu không được chứa khoảng trắng");
      return;
    }
    
    // Trim và check empty sau khi trim
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    
    if (trimmedEmail.length === 0 || trimmedPassword.length === 0 || trimmedConfirmPassword.length === 0) {
      setError("Tất cả các trường không được để trống");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }
    
    // Check password length
    if (trimmedPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    // Check password match
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp với mật khẩu");
      return;
    }
    
    if (!agreeTerms) {
      setError("Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật");
      return;
    }
    
    try {
      setIsLoading(true);
      await register(trimmedEmail, trimmedPassword);
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      // Redirect to email verification page
      window.location.href = `/login?email=${encodeURIComponent(trimmedEmail)}`;
    } catch (error: any) {
      // Xử lý các loại lỗi từ backend
      let errorMessage = "Đăng ký thất bại";
      
      if (error.message) {
        if (error.message.includes("Email already exists") || error.message.includes("already registered")) {
          errorMessage = "Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Địa chỉ email không hợp lệ";
        } else if (error.message.includes("Password too weak")) {
          errorMessage = "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F2E5BF] flex items-center justify-center p-2 sm:p-4 lg:p-8 pt-20">
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
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 leading-tight tracking-tight">
                TẠO TÀI KHOẢN<br />
                HỌC TẬP NGAY HÔM NAY
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Gia nhập cộng đồng học viên và trải nghiệm phương pháp học tập hiệu quả.
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
                  className="h-10 sm:h-11 lg:h-12 border border-[#257180]/30 rounded-lg bg-white text-sm sm:text-base focus:border-[#FD8B51] focus:ring-1 focus:ring-[#FD8B51]"
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      checkPasswordMatch(e.target.value, confirmPassword);
                    }}
                    placeholder="Tạo mật khẩu mạnh (ít nhất 6 ký tự)"
                    className="h-10 sm:h-11 lg:h-12 border border-[#257180]/30 rounded-lg bg-white pr-10 text-sm sm:text-base focus:border-[#FD8B51] focus:ring-1 focus:ring-[#FD8B51]"
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
              </div>
              {/* Confirm Password Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="confirmPassword" className="text-black text-sm sm:text-base">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      checkPasswordMatch(password, e.target.value);
                    }}
                    placeholder="Nhập lại mật khẩu"
                    className="h-10 sm:h-11 lg:h-12 border border-[#257180]/30 rounded-lg bg-white pr-10 text-sm sm:text-base focus:border-[#FD8B51] focus:ring-1 focus:ring-[#FD8B51]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 sm:top-3 lg:top-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {(error || passwordMatchError) && (
                  <p className="text-sm text-red-600">{error || passwordMatchError}</p>
                )}
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
                  <TermsAndPrivacyModal type="terms">
                    <button type="button" className="text-black underline hover:text-gray-800">
                      Điều khoản sử dụng
                    </button>
                  </TermsAndPrivacyModal>{" "}
                  và{" "}
                  <TermsAndPrivacyModal type="privacy">
                    <button type="button" className="text-black underline hover:text-gray-800">
                      Chính sách bảo mật
                    </button>
                  </TermsAndPrivacyModal>
                </Label>
              </div>
              {/* Register Button */}
              <Button
                type="submit"
                disabled={!agreeTerms || isLoading}
                className="w-full h-10 sm:h-11 lg:h-12 bg-[#257180] hover:bg-[#1e5a66] disabled:bg-gray-400 text-white rounded-lg font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản - Bắt đầu học ngay"}
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
              {/* Google Register */}
              <GoogleSignInButton 
                mode="signup" 
                disabled={isLoading}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}