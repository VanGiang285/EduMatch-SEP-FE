import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/feedback/dialog";
import { Button } from "./ui/basic/button";
import { ScrollArea } from "./ui/layout/scroll-area";
import { Shield, FileText, CheckCircle } from "lucide-react";

interface TermsAndPrivacyModalProps {
  type: "terms" | "privacy";
  children: React.ReactNode;
}

export function TermsAndPrivacyModal({ type, children }: TermsAndPrivacyModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isTerms = type === "terms";
  const title = isTerms ? "Điều khoản sử dụng" : "Chính sách bảo mật";
  const icon = isTerms ? <FileText className="h-5 w-5" /> : <Shield className="h-5 w-5" />;

  const termsContent = (
    <div className="space-y-8">
      <div className="text-center bg-gradient-to-r from-[#257180]/5 to-[#FD8B51]/5 p-6 rounded-xl border border-[#257180]/10">
        <div className="w-20 h-20 bg-[#257180]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="h-10 w-10 text-[#257180]" />
        </div>
        <h2 className="text-3xl font-bold text-black mb-3">Điều khoản sử dụng</h2>
        <p className="text-gray-600 text-base">Nền tảng kết nối học viên và gia sư</p>
        {/* <p className="text-gray-500 text-sm mt-2">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p> */}
      </div>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Chấp nhận điều khoản
          </h3>
          <p className="text-base leading-relaxed">
            Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản sử dụng này. 
            Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
          </p>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Mô tả dịch vụ
          </h3>
          <p className="text-base leading-relaxed mb-3">
            Chúng tôi cung cấp nền tảng kết nối học viên với gia sư, tạo điều kiện cho việc học tập và giảng dạy trực tuyến.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium mb-2">Dịch vụ bao gồm:</p>
            <ul className="text-blue-700 space-y-1">
              <li>• Tìm kiếm và kết nối với gia sư phù hợp</li>
              <li>• Đặt lịch học và quản lý thời gian biểu</li>
              <li>• Công cụ hỗ trợ học tập trực tuyến</li>
              <li>• Hệ thống đánh giá và phản hồi</li>
              <li>• Thanh toán an toàn và minh bạch</li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Trách nhiệm của người dùng
          </h3>
          <div className="space-y-3">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-amber-800 font-medium mb-2">Bạn cam kết:</p>
              <ul className="text-amber-700 space-y-1">
                <li>• Cung cấp thông tin chính xác và cập nhật</li>
                <li>• Bảo mật tài khoản và mật khẩu của mình</li>
                <li>• Sử dụng dịch vụ một cách hợp pháp và có đạo đức</li>
                <li>• Không chia sẻ nội dung vi phạm bản quyền</li>
                <li>• Tôn trọng quyền riêng tư của người khác</li>
                <li>• Thanh toán đúng hạn và đầy đủ</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            Quyền sở hữu trí tuệ
          </h3>
          <p className="text-base leading-relaxed">
            Tất cả nội dung, tính năng và dịch vụ trên nền tảng này đều thuộc quyền sở hữu của chúng tôi hoặc được cấp phép sử dụng. 
            Bạn không được sao chép, phân phối hoặc sử dụng bất kỳ nội dung nào mà không có sự đồng ý bằng văn bản.
          </p>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
            Giới hạn trách nhiệm
          </h3>
          <p className="text-base leading-relaxed">
            Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc hậu quả nào phát sinh từ việc sử dụng dịch vụ của chúng tôi.
          </p>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
            Thay đổi điều khoản
          </h3>
          <p className="text-base leading-relaxed">
            Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là bạn đã chấp nhận các điều khoản mới.
          </p>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
            Liên hệ hỗ trợ
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-base leading-relaxed mb-3">
              Nếu bạn có bất kỳ câu hỏi nào về các điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> support@edumatch.com</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const privacyContent = (
    <div className="space-y-8">
      <div className="text-center bg-gradient-to-r from-[#257180]/5 to-[#FD8B51]/5 p-6 rounded-xl border border-[#257180]/10">
        <div className="w-20 h-20 bg-[#257180]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="h-10 w-10 text-[#257180]" />
        </div>
        <h2 className="text-3xl font-bold text-black mb-3">Chính sách bảo mật</h2>
        <p className="text-gray-600 text-base">Bảo vệ thông tin cá nhân của bạn</p>
        {/* <p className="text-gray-500 text-sm mt-2">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p> */}
      </div>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Thông tin chúng tôi thu thập
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium mb-2">Thông tin cá nhân:</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Họ tên, email, số điện thoại</li>
                <li>• Thông tin hồ sơ học tập và mục tiêu</li>
                <li>• Lịch sử giao dịch và thanh toán</li>
                <li>• Thông tin liên hệ khẩn cấp</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium mb-2">Thông tin sử dụng:</p>
              <ul className="text-green-700 space-y-1">
                <li>• Dữ liệu truy cập và tương tác</li>
                <li>• Thông tin thiết bị và trình duyệt</li>
                <li>• Cookies và công nghệ tương tự</li>
                <li>• Vị trí địa lý (nếu được phép)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Mục đích sử dụng thông tin
          </h3>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-amber-800 font-medium mb-2">Chúng tôi sử dụng thông tin để:</p>
            <ul className="text-amber-700 space-y-1">
              <li>• Cung cấp và cải thiện dịch vụ kết nối gia sư</li>
              <li>• Xử lý giao dịch và thanh toán an toàn</li>
              <li>• Gửi thông báo và cập nhật quan trọng</li>
              <li>• Hỗ trợ khách hàng và giải quyết vấn đề</li>
              <li>• Tuân thủ nghĩa vụ pháp lý</li>
              <li>• Phân tích và cải thiện trải nghiệm người dùng</li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Chia sẻ thông tin
          </h3>
          <p className="text-base leading-relaxed mb-3">
            Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, trừ các trường hợp:
          </p>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-800 font-medium mb-2">Các trường hợp ngoại lệ:</p>
            <ul className="text-red-700 space-y-1">
              <li>• Có sự đồng ý rõ ràng từ bạn</li>
              <li>• Để cung cấp dịch vụ (gia sư, thanh toán)</li>
              <li>• Tuân thủ yêu cầu pháp lý</li>
              <li>• Bảo vệ quyền lợi và an toàn của chúng tôi</li>
              <li>• Trong trường hợp sáp nhập hoặc mua lại</li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            Bảo mật thông tin
          </h3>
          <p className="text-base leading-relaxed mb-3">
            Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
          </p>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium mb-2">Các biện pháp bảo mật:</p>
            <ul className="text-green-700 space-y-1">
              <li>• Mã hóa SSL/TLS cho dữ liệu truyền tải</li>
              <li>• Lưu trữ an toàn trên máy chủ được bảo mật</li>
              <li>• Kiểm soát truy cập nghiêm ngặt</li>
              <li>• Giám sát và phát hiện xâm nhập 24/7</li>
              <li>• Sao lưu dữ liệu định kỳ</li>
              <li>• Đào tạo nhân viên về bảo mật</li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
            Quyền của bạn
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium mb-2">Bạn có quyền:</p>
            <ul className="text-blue-700 space-y-1">
              <li>• Truy cập và xem thông tin cá nhân</li>
              <li>• Chỉnh sửa hoặc cập nhật thông tin</li>
              <li>• Xóa tài khoản và dữ liệu</li>
              <li>• Rút lại sự đồng ý</li>
              <li>• Khiếu nại về việc xử lý dữ liệu</li>
              <li>• Yêu cầu xuất dữ liệu cá nhân</li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
            Cookies và công nghệ theo dõi
          </h3>
          <p className="text-base leading-relaxed mb-3">
            Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng, phân tích lưu lượng truy cập và cá nhân hóa nội dung.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 font-medium mb-2">Bạn có thể:</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• Điều chỉnh cài đặt cookies trong trình duyệt</li>
              <li>• Từ chối cookies không cần thiết</li>
              <li>• Xóa cookies đã lưu trữ</li>
            </ul>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-3 text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-[#257180] text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
            Liên hệ về bảo mật
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-base leading-relaxed mb-3">
              Nếu bạn có câu hỏi về chính sách bảo mật này hoặc muốn thực hiện quyền của mình, vui lòng liên hệ:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email bảo mật:</strong> privacy@edumatch.com</p>
              <p><strong>Hotline:</strong> 1900-xxxx</p>
              <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM</p>
              <p><strong>Thời gian:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 bg-white">
        <DialogHeader className="p-6 pb-4 border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-black">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] px-6 py-4">
          <div className="prose prose-sm max-w-none">
            {isTerms ? termsContent : privacyContent}
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center p-6 pt-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Vui lòng đọc kỹ nội dung trước khi đồng ý
          </div>
          <Button 
            onClick={() => setIsOpen(false)}
            className="bg-[#257180] hover:bg-[#1e5a66] text-white px-6 py-2"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Đã đọc và hiểu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
