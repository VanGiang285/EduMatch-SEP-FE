"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/basic/button";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BecomeTutorSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-16">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="bg-white border-[#FD8B51] shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-black">
              Đăng ký thành công!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600 text-lg">
                Cảm ơn bạn đã đăng ký trở thành gia sư tại EduMatch!
              </p>
              <p className="text-gray-600">
                Chúng tôi đã nhận được hồ sơ của bạn và sẽ xem xét trong vòng 24-48 giờ.
              </p>
              <p className="text-gray-600">
                Bạn sẽ nhận được email thông báo kết quả xét duyệt.
              </p>
            </div>

            <div className="bg-[#F2E5BF] p-6 rounded-lg border border-gray-300">
              <h3 className="font-semibold text-black mb-3">Những bước tiếp theo:</h3>
              <div className="text-left space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Đội ngũ EduMatch sẽ xem xét hồ sơ của bạn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Bạn sẽ nhận email thông báo kết quả</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Nếu được duyệt, bạn có thể bắt đầu nhận học viên</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/')}
                className="bg-[#FD8B51] hover:bg-[#CB6040]"
              >
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/find-tutor')}
                className="border-[#257180] text-[#257180] hover:bg-[#F2E5BF]"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Tìm gia sư
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

