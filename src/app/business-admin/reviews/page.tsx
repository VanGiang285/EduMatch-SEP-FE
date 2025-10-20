import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Star, Users, MessageSquare, TrendingUp } from 'lucide-react';

export default function BusinessAdminReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Star className="h-8 w-8 mr-3 text-[#257180]" />
          Quản lý đánh giá
        </h1>
        <p className="text-gray-600 mt-1">
          Quản lý và theo dõi các đánh giá của học viên về gia sư
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">1,234</p>
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
                <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">4.8</p>
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
                <p className="text-sm font-medium text-gray-600">Đánh giá mới</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">45</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Placeholder */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Danh sách đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tính năng đang được phát triển</p>
            <p className="text-gray-400 text-sm mt-1">Sẽ có sớm trong phiên bản tiếp theo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}