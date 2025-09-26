import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CheckCircle, Star, Users, BookOpen, Clock, Award, Play, TrendingUp, Heart, Zap, Globe, Shield } from "lucide-react";

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LandingPage({ onNavigateToLogin, onNavigateToRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-pink-200 rounded-full opacity-30 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full opacity-20 blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-6 h-6 bg-blue-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-20 w-5 h-5 bg-indigo-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-40 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left content */}
            <div className="mb-12 lg:mb-0 relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Miễn phí 7 ngày đầu tiên</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Học tập thông minh với{" "}
                <span className="relative">
                  <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text animate-pulse">
                    EduMatch
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full opacity-30"></div>
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                Kết nối với <span className="font-semibold text-blue-600">10,000+ gia sư chuyên nghiệp</span>. 
                Học 1-kèm-1 trực tuyến với phương pháp cá nhân hóa, giúp bạn đạt mục tiêu nhanh chóng.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={onNavigateToRegister}
                  size="lg"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                  Bắt đầu học ngay - Miễn phí
                </Button>
                <Button
                  variant="outline"
                  onClick={onNavigateToLogin}
                  size="lg"
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-8 py-6 text-lg rounded-2xl font-semibold transition-all duration-300"
                >
                  Đăng nhập
                </Button>
              </div>

              {/* Stats with animation */}
              <div className="grid grid-cols-3 gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">10K+</div>
                  <div className="text-sm text-gray-600">Gia sư</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">50+</div>
                  <div className="text-sm text-gray-600">Môn học</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">Hỗ trợ</div>
                </div>
              </div>
            </div>

            {/* Right content - Interactive hero image */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1586388750948-16833a41ee95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjB0dXRvcmluZyUyMHRlYWNoZXIlMjBzdHVkZW50fGVufDF8fHx8MTc1ODg5NTM0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Online tutoring session"
                    className="w-full h-96 object-cover"
                  />
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 animate-bounce delay-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">+25% điểm số</div>
                    <div className="text-xs text-gray-500">sau 1 tháng</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 animate-bounce delay-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9/5</span>
                </div>
                <p className="text-sm text-gray-600 max-w-xs">
                  "Gia sư giúp tôi cải thiện từ 6.5 lên 8.5 chỉ sau 3 tháng!"
                </p>
                <p className="text-xs text-gray-400 mt-1">- Minh Anh, lớp 11</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Slider */}
      <section className="py-16 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Học viên nói gì về EduMatch?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1758525866412-252944c7812e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjBsZWFybmluZyUyMG9ubGluZSUyMGhhcHB5fGVufDF8fHx8MTc1ODg5NTYwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">Nguyễn Minh An</div>
                  <div className="text-sm text-gray-600">Học sinh lớp 12</div>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Thầy gia sư rất tận tâm và phương pháp dạy phù hợp với em. Điểm Toán của em đã tăng từ 6 lên 9 trong 2 tháng!"
              </p>
            </Card>

            <Card className="p-6 rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHRlYWNoZXIlMjB0dXRvciUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg4OTU2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Teacher"
                    className="w-full h-full object-cover"
                  />
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">Trần Thu Hà</div>
                  <div className="text-sm text-gray-600">Gia sư Tiếng Anh</div>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "EduMatch giúp tôi kết nối với nhiều học sinh. Nền tảng rất dễ sử dụng và hỗ trợ tuyệt vời!"
              </p>
            </Card>

            <Card className="p-6 rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-teal-50">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1716337563114-365568c4db60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNlbGVicmF0aW5nJTIwc3VjY2VzcyUyMGFjaGlldmVtZW50fGVufDF8fHx8MTc1ODg5NTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Parent"
                    className="w-full h-full object-cover"
                  />
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">Lê Văn Nam</div>
                  <div className="text-sm text-gray-600">Phụ huynh</div>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Con tôi rất thích học với gia sư qua EduMatch. Tiến bộ rõ rệt và tự tin hơn rất nhiều!"
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section với thiết kế mới */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-6">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="font-semibold text-gray-700">Tại sao chọn EduMatch?</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              Nền tảng học tập{" "}
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                thông minh nhất
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Công nghệ AI kết hợp với phương pháp giảng dạy hiện đại, mang đến trải nghiệm học tập tuyệt vời.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group p-8 rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gia sư chất lượng cao</h3>
              <p className="text-gray-700 leading-relaxed">
                100% gia sư được kiểm định kỹ lưỡng với bằng cấp chuyên môn và kinh nghiệm giảng dạy xuất sắc.
              </p>
            </Card>

            <Card className="group p-8 rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI cá nhân hóa</h3>
              <p className="text-gray-700 leading-relaxed">
                Thuật toán AI phân tích và tạo lộ trình học tập riêng biệt cho từng học viên dựa trên năng lực.
              </p>
            </Card>

            <Card className="group p-8 rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Linh hoạt 24/7</h3>
              <p className="text-gray-700 leading-relaxed">
                Học mọi lúc, mọi nơi với lịch học linh hoạt. Hỗ trợ khách hàng 24/7 không giới hạn.
              </p>
            </Card>

            <Card className="group p-8 rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cam kết kết quả</h3>
              <p className="text-gray-700 leading-relaxed">
                Đảm bảo cải thiện điểm số hoặc hoàn tiền 100%. Cam kết chất lượng với hàng nghìn review 5 sao.
              </p>
            </Card>

            <Card className="group p-8 rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Công nghệ hiện đại</h3>
              <p className="text-gray-700 leading-relaxed">
                Lớp học ảo với bảng tương tác, chia sẻ màn hình, ghi âm và AI phân tích tiến độ.
              </p>
            </Card>

            <Card className="group p-8 rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">An toàn & bảo mật</h3>
              <p className="text-gray-700 leading-relaxed">
                Dữ liệu được mã hóa 256-bit SSL. Thanh toán an toàn và thông tin cá nhân được bảo vệ tuyệt đối.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section với thiết kế gradient */}
      <section className="py-16 lg:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Sẵn sàng thay đổi tương lai?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Hàng nghìn học viên đã thành công với EduMatch. Đến lượt bạn tỏa sáng!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={onNavigateToRegister}
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-6 text-lg rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Dùng thử miễn phí 7 ngày
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 hover:border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-2xl font-semibold transition-all duration-300"
              >
                Xem demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Không cần thẻ tín dụng</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Hủy bất cứ lúc nào</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                EduMatch
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Nền tảng kết nối gia sư và học viên hàng đầu Việt Nam. Học tập thông minh, tương lai rộng mở.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">ig</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Dành cho học viên</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tìm gia sư</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Đánh giá gia sư</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hỗ trợ học tập</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Dành cho gia sư</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Trở thành gia sư</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Quản lý lớp học</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Thu nhập</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 EduMatch. Tất cả quyền được bảo lưu. Made with ❤️ in Vietnam.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}