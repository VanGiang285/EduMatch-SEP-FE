import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit } from 'lucide-react';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="h-8 w-8 mr-3 text-[#257180]" />
              Thông tin cá nhân
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin cá nhân và cài đặt tài khoản
            </p>
          </div>
          <Button className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
                    <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-[#F2E5BF] flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-medium text-[#257180]">
                  JD
                </span>
                    </div>
              <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
              <p className="text-gray-600">Học viên</p>
              <div className="mt-4">
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  Đang hoạt động
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Thông tin cá nhân</CardTitle>
                  </CardHeader>
          <CardContent>
            <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">john.doe@example.com</p>
                      </div>
                    </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Số điện thoại</p>
                    <p className="text-sm text-gray-600">+84 123 456 789</p>
                        </div>
                      </div>
                      
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Địa chỉ</p>
                    <p className="text-sm text-gray-600">Hà Nội, Việt Nam</p>
                      </div>
                    </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ngày sinh</p>
                    <p className="text-sm text-gray-600">01/01/1990</p>
                        </div>
                      </div>
                    </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Giới thiệu bản thân</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tôi là một học viên đam mê học tập và phát triển bản thân. 
                  Tôi luôn tìm kiếm những cơ hội học tập mới và cải thiện kỹ năng của mình.
                </p>
              </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Trạng thái tài khoản</span>
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  Hoạt động
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Xác thực email</span>
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  Đã xác thực
                                  </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Ngày tham gia</span>
                <span className="text-sm text-gray-600">15/01/2024</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Bảo mật</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Mật khẩu</span>
                <Button variant="outline" size="sm">
                  Đổi mật khẩu
                                    </Button>
                                  </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Xác thực 2FA</span>
                <Button variant="outline" size="sm">
                  Bật 2FA
                </Button>
              </div>
                      <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Đăng nhập gần đây</span>
                <span className="text-sm text-gray-600">Hôm nay</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}