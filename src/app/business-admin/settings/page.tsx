import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Settings, Shield, Bell, Palette, Database } from 'lucide-react';

export default function BusinessAdminSettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="h-8 w-8 mr-3 text-[#257180]" />
          Cài đặt hệ thống
        </h1>
        <p className="text-gray-600 mt-1">
          Cấu hình và quản lý các thiết lập của hệ thống
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="h-5 w-5 mr-2 text-[#257180]" />
              Bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Cài đặt bảo mật và quyền truy cập
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Xác thực 2FA</span>
                <span className="text-green-600">Bật</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Mật khẩu mạnh</span>
                <span className="text-green-600">Bật</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Session timeout</span>
                <span className="text-gray-600">30 phút</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Bell className="h-5 w-5 mr-2 text-[#257180]" />
              Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Cài đặt thông báo và cảnh báo
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Email thông báo</span>
                <span className="text-green-600">Bật</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Push notification</span>
                <span className="text-green-600">Bật</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>SMS cảnh báo</span>
                <span className="text-gray-600">Tắt</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Palette className="h-5 w-5 mr-2 text-[#257180]" />
              Giao diện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Tùy chỉnh giao diện và hiển thị
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Chế độ tối</span>
                <span className="text-gray-600">Tắt</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Ngôn ngữ</span>
                <span className="text-gray-600">Tiếng Việt</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Múi giờ</span>
                <span className="text-gray-600">GMT+7</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Database className="h-5 w-5 mr-2 text-[#257180]" />
              Dữ liệu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Quản lý dữ liệu và sao lưu
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Sao lưu tự động</span>
                <span className="text-green-600">Bật</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Tần suất sao lưu</span>
                <span className="text-gray-600">Hàng ngày</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Dung lượng sử dụng</span>
                <span className="text-gray-600">2.4 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Placeholder */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Cài đặt nâng cao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tính năng đang được phát triển</p>
            <p className="text-gray-400 text-sm mt-1">Sẽ có sớm trong phiên bản tiếp theo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}