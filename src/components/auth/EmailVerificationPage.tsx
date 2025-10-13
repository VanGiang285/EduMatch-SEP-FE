import { Button } from "../ui/basic/button";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
interface EmailVerificationPageProps {
  onBackToLogin: () => void;
}
export function EmailVerificationPage({ onBackToLogin }: EmailVerificationPageProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState("");
  const { verifyEmail, resendVerification } = useAuth();
  // const router = useRouter(); // Removed unused variable
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');
  const handleVerifyEmail = useCallback(async (verificationToken: string) => {
    try {
      setIsVerifying(true);
      setVerificationStatus('pending');
      await verifyEmail(verificationToken);
      setVerificationStatus('success');
      toast.success("Email đã được xác thực thành công!");
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error.message || "Xác thực email thất bại");
      toast.error(error.message || "Xác thực email thất bại");
    } finally {
      setIsVerifying(false);
    }
  }, [verifyEmail, onBackToLogin]);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);
  
  useEffect(() => {
    if (token) {
      handleVerifyEmail(token);
    }
  }, [token, handleVerifyEmail]);
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }
    try {
      setIsLoading(true);
      await resendVerification(email);
      toast.success("Email xác thực đã được gửi lại!");
    } catch (error: any) {
      toast.error(error.message || "Gửi lại email thất bại");
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Mail className="h-16 w-16 text-blue-500" />;
    }
  };
  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'success':
        return {
          title: "Xác thực thành công!",
          description: "Email của bạn đã được xác thực. Bạn sẽ được chuyển về trang đăng nhập."
        };
      case 'error':
        return {
          title: "Xác thực thất bại",
          description: errorMessage || "Token xác thực không hợp lệ hoặc đã hết hạn."
        };
      default:
        return {
          title: "Xác thực email",
          description: "Vui lòng kiểm tra email và nhấp vào liên kết xác thực để kích hoạt tài khoản."
        };
    }
  };
  const statusMessage = getStatusMessage();
  return (
    <div className="min-h-screen bg-[#F2E5BF] flex items-center justify-center p-2 sm:p-4 lg:p-8 pt-20">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden lg:grid lg:grid-cols-2">
        {/* Phần bên trái - Hình ảnh và caption */}
        <div className="relative hidden lg:flex lg:flex-col lg:justify-end overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbWFpbCUyMHZlcmlmaWNhdGlvbiUyMGNvbW11bmljYXRpb258ZW58MXx8fHwxNzU4Nzc4MjE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Email verification"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="relative z-10 p-12 pb-16">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              XÁC THỰC EMAIL<br />
              ĐỂ BẮT ĐẦU HỌC TẬP
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Bước cuối cùng để hoàn tất đăng ký. Hãy kiểm tra hộp thư và xác thực email để kích hoạt tài khoản.
            </p>
          </div>
        </div>
        {/* Phần bên phải - Form xác thực */}
        <div className="flex flex-col justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-16 min-h-screen lg:min-h-0">
          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-6 sm:mb-8 text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 leading-tight tracking-tight">
                {statusMessage.title}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {statusMessage.description}
              </p>
            </div>
            {verificationStatus === 'pending' && !token && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Email Input for resend */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-black text-sm sm:text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email để gửi lại liên kết xác thực"
                    className="h-10 sm:h-11 lg:h-12 border border-[#257180]/30 rounded-lg bg-white text-sm sm:text-base focus:border-[#FD8B51] focus:ring-1 focus:ring-[#FD8B51]"
                    required
                  />
                </div>
                {/* Resend Button */}
                <Button
                  onClick={handleResendVerification}
                  disabled={isLoading || !email}
                  className="w-full h-10 sm:h-11 lg:h-12 bg-[#257180] hover:bg-[#1e5a66] text-white rounded-lg font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Đang gửi..." : "Gửi lại email xác thực"}
                </Button>
              </div>
            )}
            {isVerifying && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#257180] mx-auto mb-4"></div>
                <p className="text-gray-600">Đang xác thực email...</p>
              </div>
            )}
            {/* Back to Login */}
            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={onBackToLogin}
                className="inline-flex items-center text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại trang đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}