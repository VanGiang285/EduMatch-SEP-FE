"use client";

import { Button } from "./ui/basic/button";
import { Input } from "./ui/form/input";
import { Send, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#257180] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-semibold mb-2">Đăng ký nhận tin tức</h3>
              <p className="text-white/80">Nhận thông tin về khóa học mới và ưu đãi đặc biệt</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg"
              />
              <Button className="bg-[#FD8B51] hover:bg-[#CB6040] text-white px-6 h-12 rounded-lg font-semibold whitespace-nowrap shadow-sm hover:shadow-md transition-all">
                Đăng ký
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FD8B51] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold">EduMatch</span>
            </div>
            <p className="text-white/80 leading-relaxed max-w-md">
              Nền tảng kết nối gia sư và học viên hàng đầu Việt Nam. Học tập thông minh, tương lai rộng mở với công nghệ AI và phương pháp giảng dạy hiện đại.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#FD8B51] flex items-center justify-center transition-all transform hover:scale-110">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#FD8B51] flex items-center justify-center transition-all transform hover:scale-110">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#FD8B51] flex items-center justify-center transition-all transform hover:scale-110">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#FD8B51] flex items-center justify-center transition-all transform hover:scale-110">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#FD8B51] flex items-center justify-center transition-all transform hover:scale-110">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* For Students */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Dành cho học viên</h4>
            <ul className="space-y-3 text-white/80">
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Tìm gia sư</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Đánh giá gia sư</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Hỗ trợ học tập</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Lịch sử học tập</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Chứng chỉ</a></li>
            </ul>
          </div>

          {/* For Tutors */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Dành cho gia sư</h4>
            <ul className="space-y-3 text-white/80">
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Trở thành gia sư</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Quản lý lớp học</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Thu nhập</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Tài liệu giảng dạy</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Đào tạo</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Hỗ trợ</h4>
            <ul className="space-y-3 text-white/80">
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Báo cáo sự cố</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-[#F2E5BF] transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#FD8B51] rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Email</div>
                <a href="mailto:contact@edumatch.vn" className="text-white hover:text-[#F2E5BF] transition-colors">
                  contact@edumatch.vn
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#CB6040] rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Hotline</div>
                <a href="tel:+84123456789" className="text-white hover:text-[#F2E5BF] transition-colors">
                  +84 123 456 789
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#F2E5BF] rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#257180]" />
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Địa chỉ</div>
                <span className="text-white">Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-white/60">
            © 2025 EduMatch. Tất cả quyền được bảo lưu. Made with ❤️ in Vietnam.
          </p>
        </div>
      </div>
    </footer>
  );
}
