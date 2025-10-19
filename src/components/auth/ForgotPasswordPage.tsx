import { Button } from "../ui/basic/button";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Mail, ArrowLeft, CheckCircle, Clock, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";
interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}
export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-2 sm:p-4 lg:p-8 pt-20">
        <div className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden lg:grid lg:grid-cols-2 border border-[#FD8B51]">
          <div className="relative hidden lg:flex lg:flex-col lg:justify-end overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwdGVhY2hlciUyMHR1dG9yaW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc1ODc3ODIxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Student and teacher studying together"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="relative z-10 p-12 pb-16">
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                EMAIL ĐÃ ĐƯỢC GỬI!<br />
                KIỂM TRA HỘP THƯ
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-16 min-h-screen lg:min-h-0">
            <div className="mx-auto w-full max-w-md">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4 leading-tight">
                  KIỂM TRA EMAIL CỦA BẠN
                </h1>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <span className="font-semibold text-[#257180]">{email}</span>
                </p>
              </div>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">Bước tiếp theo:</h3>
                      <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                        <li>• Kiểm tra hộp thư đến của bạn</li>
                        <li>• Tìm email từ EduMatch</li>
                        <li>• Click vào liên kết trong email</li>
                        <li>• Tạo mật khẩu mới</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">Không thấy email?</h3>
                      <p className="text-xs sm:text-sm text-blue-700">
                        Kiểm tra thư mục spam hoặc thư rác của bạn. Email có thể mất vài phút để đến.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full h-10 sm:h-11 lg:h-12 bg-[#257180] hover:bg-[#1e5a66] text-white rounded-lg font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all"
                >
                  Gửi lại email
                </Button>
                <Button
                  onClick={onBackToLogin}
                  variant="outline"
                  className="w-full h-10 sm:h-11 lg:h-12 hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51] rounded-lg text-sm sm:text-base"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại đăng nhập
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-2 sm:p-4 lg:p-8 pt-20">
      <div className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden lg:grid lg:grid-cols-2 border border-[#FD8B51]">
        <div className="relative hidden lg:flex lg:flex-col lg:justify-end overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwdGVhY2hlciUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc1ODc3ODIxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Student and teacher learning together"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="relative z-10 p-12 pb-16">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              QUÊN MẬT KHẨU?<br />
              ĐỪNG LO LẮNG!
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản của mình một cách nhanh chóng và an toàn.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-16 min-h-screen lg:min-h-0">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 leading-tight tracking-tight">
                ĐẶT LẠI MẬT KHẨU<br />
                NHANH CHÓNG VÀ AN TOÀN
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Nhập email của bạn để nhận liên kết đặt lại mật khẩu. Chúng tôi sẽ gửi hướng dẫn chi tiết đến hộp thư của bạn.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-black text-sm sm:text-base">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 sm:top-3 lg:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 sm:h-11 lg:h-12 pl-10 sm:pl-12 border border-gray-300 rounded-lg bg-white text-sm sm:text-base focus:border-[#257180] focus:ring-1 focus:ring-[#257180]"
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">Thời gian xử lý</h3>
                    <p className="text-xs sm:text-sm text-blue-700">
                      Email đặt lại mật khẩu sẽ được gửi trong vòng 2-3 phút. Vui lòng kiểm tra cả hộp thư spam.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 lg:h-12 bg-[#257180] hover:bg-[#1e5a66] disabled:bg-gray-400 text-white rounded-lg font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang gửi...
                  </>
                ) : (
                  "Gửi liên kết đặt lại"
                )}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm font-medium flex items-center justify-center mx-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
            <div className="mt-6 sm:mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-black mb-1 text-sm sm:text-base">Bảo mật thông tin</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Email đặt lại mật khẩu chỉ có hiệu lực trong 24 giờ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}