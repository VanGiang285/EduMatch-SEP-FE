import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { FileText, BarChart3, TrendingUp, Download } from 'lucide-react';

export default function BusinessAdminReportsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="h-8 w-8 mr-3 text-[#257180]" />
          Báo cáo & Thống kê
        </h1>
        <p className="text-gray-600 mt-1">
          Xem báo cáo chi tiết và thống kê hoạt động của hệ thống
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Báo cáo tháng này</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">12</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tăng trưởng</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">+15%</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Biểu đồ</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">8</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Placeholder */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Báo cáo chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tính năng đang được phát triển</p>
            <p className="text-gray-400 text-sm mt-1">Sẽ có sớm trong phiên bản tiếp theo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}