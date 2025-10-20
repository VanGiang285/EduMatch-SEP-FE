import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { BarChart3, Users, UserCheck, Star, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';

export default function BusinessAdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-8 w-8 mr-3 text-[#257180]" />
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Tổng quan hệ thống và thống kê hoạt động
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">1,234</p>
                <p className="text-sm text-green-600 mt-1">+12% so với tháng trước</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gia sư</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">456</p>
                <p className="text-sm text-green-600 mt-1">+8% so với tháng trước</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đánh giá</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">4.8</p>
                <p className="text-sm text-green-600 mt-1">+0.2 so với tháng trước</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">₫2.4M</p>
                <p className="text-sm text-green-600 mt-1">+15% so với tháng trước</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-[#257180]" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a href="/business-admin/users" className="p-4 border border-gray-200 rounded-lg hover:bg-[#F2E5BF] transition-colors">
                <Users className="h-8 w-8 text-[#257180] mb-2" />
                <h3 className="font-medium">Quản lý Users</h3>
                <p className="text-sm text-gray-600">Quản lý học viên và gia sư</p>
              </a>
              
              <a href="/business-admin/tutors" className="p-4 border border-gray-200 rounded-lg hover:bg-[#F2E5BF] transition-colors">
                <UserCheck className="h-8 w-8 text-[#257180] mb-2" />
                <h3 className="font-medium">Duyệt gia sư</h3>
                <p className="text-sm text-gray-600">Duyệt đơn đăng ký gia sư</p>
              </a>
              
              <a href="/business-admin/reviews" className="p-4 border border-gray-200 rounded-lg hover:bg-[#F2E5BF] transition-colors">
                <Star className="h-8 w-8 text-[#257180] mb-2" />
                <h3 className="font-medium">Đánh giá</h3>
                <p className="text-sm text-gray-600">Quản lý đánh giá</p>
              </a>
              
              <a href="/business-admin/reports" className="p-4 border border-gray-200 rounded-lg hover:bg-[#F2E5BF] transition-colors">
                <TrendingUp className="h-8 w-8 text-[#257180] mb-2" />
                <h3 className="font-medium">Báo cáo</h3>
                <p className="text-sm text-gray-600">Xem báo cáo chi tiết</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-[#257180]" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Gia sư mới được duyệt</p>
                  <p className="text-xs text-gray-500">2 phút trước</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Học viên mới đăng ký</p>
                  <p className="text-xs text-gray-500">15 phút trước</p>
                </div>
          </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
          </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Đánh giá mới</p>
                  <p className="text-xs text-gray-500">1 giờ trước</p>
          </div>
          </div>
        </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}