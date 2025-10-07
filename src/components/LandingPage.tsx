"use client";

import { Button } from "./ui/basic/button";
import { Card } from "./ui/layout/card";
import { Avatar } from "./ui/basic/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  CheckCircle, 
  Star, 
  Users, 
  Clock, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Play,
  Brain,
  Rocket,
  Heart,
  Lightbulb,
  MessageCircle,
  Video,
  BookOpen,
  Award,
  Globe,
  ChevronRight
} from "lucide-react";

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LandingPage({ onNavigateToLogin, onNavigateToRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section - #257180 Background */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#257180] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <Sparkles className="h-4 w-4 text-[#FD8B51]" />
              <span className="text-sm font-medium text-white">Miễn phí 7 ngày đầu tiên</span>
              </div>
              
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
              Học tập thông minh<br />
              <span className="text-[#FD8B51]">Tương lai rộng mở</span>
              </h1>
              
            <p className="text-lg lg:text-xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Kết nối với 10,000+ gia sư chuyên nghiệp. Học 1-kèm-1 với AI cá nhân hóa, đạt mục tiêu nhanh hơn 3 lần.
              </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button
                  onClick={onNavigateToRegister}
                  size="lg"
                className="group bg-[#FD8B51] hover:bg-[#CB6040] text-white px-8 py-6 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                Bắt đầu ngay - Miễn phí
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                className="group border-2 border-white/30 hover:border-white bg-white/10 hover:bg-white/20 text-white px-8 py-6 text-lg rounded-xl font-semibold transition-all backdrop-blur-sm"
                >
                <Play className="mr-2 h-5 w-5" />
                Xem demo
                </Button>
              </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">
                <div className="text-3xl font-bold text-white mb-2">10K+</div>
                <div className="text-sm text-white/80 font-medium">Gia sư chất lượng</div>
              </Card>
              <Card className="p-6 bg-[#FD8B51] border-0 rounded-xl hover:bg-[#CB6040] transition-all">
                <div className="text-3xl font-bold text-white mb-2">95%</div>
                <div className="text-sm text-white/90 font-medium">Hài lòng</div>
              </Card>
              <Card className="p-6 bg-[#CB6040] border-0 rounded-xl hover:bg-[#FD8B51] transition-all">
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <div className="text-sm text-white/90 font-medium">Môn học</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-white/80 font-medium">Hỗ trợ</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - #F2E5BF Background */}
      <section className="py-16 lg:py-24 bg-[#F2E5BF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white border border-[#257180]/20 rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-[#FD8B51]" />
              <span className="text-sm font-medium text-[#257180]">Tại sao chọn chúng tôi</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#257180] mb-6">
              Tìm gia sư phù hợp nhất cho bạn
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hàng nghìn gia sư chuyên nghiệp sẵn sàng dạy kèm 1-1 các môn học từ cấp 1 đến đại học
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <Card className="p-6 bg-white border border-[#257180]/20 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 bg-[#FD8B51] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#257180] mb-2">Gia sư chuyên nghiệp</h3>
              <p className="text-gray-600 text-sm">100% gia sư được kiểm định kỹ lưỡng và có kinh nghiệm</p>
            </Card>

            {/* Card 2 */}
            <Card className="p-6 bg-white border border-[#FD8B51]/30 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 bg-[#CB6040] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#257180] mb-2">Học 1-kèm-1</h3>
              <p className="text-gray-600 text-sm">Tập trung hoàn toàn vào nhu cầu và tiến độ của bạn</p>
            </Card>

            {/* Card 3 */}
            <Card className="p-6 bg-white border border-[#CB6040]/30 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 bg-[#257180] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#257180] mb-2">Linh hoạt thời gian</h3>
              <p className="text-gray-600 text-sm">Đặt lịch học theo thời gian rảnh của bạn</p>
            </Card>

            {/* Card 4 */}
            <Card className="p-6 bg-white border border-[#257180]/20 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 bg-[#FD8B51] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#257180] mb-2">Đa dạng môn học</h3>
              <p className="text-gray-600 text-sm">Từ Toán, Lý, Hóa đến Tiếng Anh, Văn học</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section - White Background */}
      <section id="services" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#F2E5BF] border border-[#257180]/20 rounded-full px-4 py-2 mb-6">
              <BookOpen className="h-4 w-4 text-[#FD8B51]" />
              <span className="text-sm font-medium text-[#257180]">Dịch vụ của chúng tôi</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#257180] mb-6">
              Gia sư chuyên nghiệp cho mọi nhu cầu
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Đội ngũ gia sư được tuyển chọn kỹ lưỡng, có kinh nghiệm và chuyên môn cao trong từng lĩnh vực
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <Card className="p-8 bg-[#F2E5BF] border border-[#257180]/20 rounded-2xl shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-20 h-20 bg-[#FD8B51] rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#257180] mb-4">Gia sư Khoa học Tự nhiên</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Toán, Lý, Hóa, Sinh với phương pháp giảng dạy hiện đại, dễ hiểu và hiệu quả
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Toán học từ cơ bản đến nâng cao</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Vật lý, Hóa học, Sinh học</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Luyện thi chuyên, Olympic</span>
                </div>
              </div>
            </Card>

            {/* Service 2 */}
            <Card className="p-8 bg-white border-2 border-[#FD8B51] rounded-2xl shadow-sm hover:shadow-lg transition-all text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#FD8B51] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Phổ biến nhất
                </div>
              </div>
              <div className="w-20 h-20 bg-[#CB6040] rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Video className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#257180] mb-4">Gia sư Khoa học Xã hội</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Văn học, Lịch sử, Địa lý, GDCD với cách tiếp cận thú vị và dễ nhớ
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Văn học và Tiếng Việt</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Lịch sử, Địa lý, GDCD</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Kỹ năng viết và thuyết trình</span>
                </div>
              </div>
            </Card>

            {/* Service 3 */}
            <Card className="p-8 bg-[#F2E5BF] border border-[#CB6040]/30 rounded-2xl shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-20 h-20 bg-[#257180] rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#257180] mb-4">Gia sư Ngoại ngữ</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Tiếng Anh, Tiếng Trung, Tiếng Nhật với giáo viên bản ngữ và chuyên nghiệp
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Tiếng Anh: IELTS, TOEIC, TOEFL</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Tiếng Trung, Tiếng Nhật</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#FD8B51]" />
                  <span>Giao tiếp thực tế</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories - #F2E5BF Background */}
      <section id="success-stories" className="py-16 lg:py-24 bg-[#F2E5BF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white border border-[#257180]/20 rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-[#FD8B51]" />
              <span className="text-sm font-medium text-[#257180]">Câu chuyện thành công</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#257180] mb-6">
              Học viên nói gì về EduMatch?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hàng nghìn học viên đã đạt được mục tiêu và thay đổi cuộc đời nhờ EduMatch
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Video/Image */}
            <div className="relative">
              <Card className="relative p-6 bg-white border border-[#257180]/20 shadow-lg rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                  alt="Happy students"
                  className="w-full h-80 object-cover rounded-xl"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#FD8B51] rounded-full flex items-center justify-center shadow-lg hover:bg-[#CB6040] transition-colors cursor-pointer">
                    <Play className="h-6 w-6 text-white ml-1" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right - Testimonials */}
            <div className="space-y-6">
              {/* Testimonial 1 */}
              <Card className="p-6 bg-white border border-[#257180]/20 rounded-xl shadow-sm">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-[#F2E5BF]">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1758525866412-252944c7812e?w=100&h=100&fit=crop"
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-[#257180]">Minh An</div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      &ldquo;Điểm Toán tăng từ 6 lên 9 chỉ sau 2 tháng! Thầy dạy rất tận tâm và phương pháp rất hiệu quả.&rdquo;
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#FD8B51] font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>+50% điểm số</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Testimonial 2 */}
              <Card className="p-6 bg-white border border-[#FD8B51]/30 rounded-xl shadow-sm">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-[#F2E5BF]">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?w=100&h=100&fit=crop"
                      alt="Teacher"
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-[#257180]">Thu Hà</div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      &ldquo;Nền tảng dễ sử dụng, học sinh đông, thu nhập ổn định. Đội ngũ support rất tốt!&rdquo;
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#CB6040] font-medium">
                      <Users className="h-3 w-3" />
                      <span>100+ học viên</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Testimonial 3 */}
              <Card className="p-6 bg-white border border-[#CB6040]/30 rounded-xl shadow-sm">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-[#F2E5BF]">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1716337563114-365568c4db60?w=100&h=100&fit=crop"
                      alt="Parent"
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-[#257180]">Văn Nam</div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      &ldquo;Con tôi tiến bộ rõ rệt và tự tin hơn nhiều. Nền tảng đáng tin cậy cho phụ huynh!&rdquo;
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#FD8B51] font-medium">
                      <Heart className="h-3 w-3" />
                      <span>Rất hài lòng</span>
              </div>
              </div>
              </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - White Background */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#F2E5BF] border border-[#257180]/20 rounded-full px-4 py-2 mb-6">
              <Lightbulb className="h-4 w-4 text-[#FD8B51]" />
              <span className="text-sm font-medium text-[#257180]">Quy trình đơn giản</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#257180] mb-6">
              Tìm gia sư chỉ trong 3 bước
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quy trình đơn giản giúp bạn tìm gia sư phù hợp và đặt lịch học ngay
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-[#FD8B51] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#FD8B51]">1</span>
                </div>
                </div>
                {/* Arrow */}
                <div className="hidden lg:block absolute top-12 -right-4">
                  <ChevronRight className="h-8 w-8 text-[#257180]/30" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#257180] mb-4">Tìm gia sư</h3>
              <p className="text-gray-600 leading-relaxed">
                Tìm kiếm gia sư theo môn học, cấp độ và thời gian phù hợp với bạn.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-[#CB6040] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#CB6040]">2</span>
                  </div>
                </div>
                {/* Arrow */}
                <div className="hidden lg:block absolute top-12 -right-4">
                  <ChevronRight className="h-8 w-8 text-[#257180]/30" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#257180] mb-4">Đặt lịch học</h3>
              <p className="text-gray-600 leading-relaxed">
                Chọn thời gian phù hợp và đặt lịch học trực tuyến với gia sư đã chọn.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-[#257180] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#257180]">3</span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#257180] mb-4">Học 1-kèm-1</h3>
              <p className="text-gray-600 leading-relaxed">
                Bắt đầu buổi học trực tuyến với gia sư, tập trung hoàn toàn vào nhu cầu của bạn.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              onClick={onNavigateToRegister}
              size="lg"
              className="bg-[#FD8B51] hover:bg-[#CB6040] text-white px-8 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Bắt đầu ngay - Miễn phí
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - #257180 Background */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-[#257180]">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="h-16 w-16 mx-auto mb-8 text-[#FD8B51]" />
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Sẵn sàng tìm gia sư<br />phù hợp nhất?
          </h2>
          
          <p className="text-lg lg:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Tham gia cùng 10,000+ học viên đã tìm được gia sư lý tưởng. Bắt đầu học tập hiệu quả ngay hôm nay!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              onClick={onNavigateToRegister}
              size="lg"
              className="group bg-[#FD8B51] hover:bg-[#CB6040] text-white px-10 py-6 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Tìm gia sư ngay - Miễn phí
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
                </div>

          <div className="flex flex-wrap justify-center gap-8 text-white/90">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#FD8B51]" />
              <span className="text-base">Không cần thẻ tín dụng</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#FD8B51]" />
              <span className="text-base">Hủy bất cứ lúc nào</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#FD8B51]" />
              <span className="text-base">Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}