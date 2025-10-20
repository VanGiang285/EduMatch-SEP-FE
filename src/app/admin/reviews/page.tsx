'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Badge } from '@/components/ui/basic/badge';
import { Search, Filter, MoreHorizontal, Star, Eye, Trash2, Flag } from 'lucide-react';

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with real API calls
  const reviews = [
    {
      id: 1,
      studentName: 'Nguyễn Văn A',
      tutorName: 'Trần Thị B',
      subject: 'Toán học',
      rating: 5,
      comment: 'Gia sư rất nhiệt tình và có phương pháp dạy hay. Con tôi tiến bộ rõ rệt sau 2 tháng học.',
      status: 'approved',
      createdAt: '2024-10-15',
      reported: false,
    },
    {
      id: 2,
      studentName: 'Lê Văn C',
      tutorName: 'Phạm Thị D',
      subject: 'Tiếng Anh',
      rating: 4,
      comment: 'Gia sư dạy tốt nhưng đôi khi hơi nhanh. Cần điều chỉnh tốc độ giảng dạy.',
      status: 'approved',
      createdAt: '2024-10-14',
      reported: false,
    },
    {
      id: 3,
      studentName: 'Hoàng Văn E',
      tutorName: 'Vũ Thị F',
      subject: 'Vật lý',
      rating: 2,
      comment: 'Gia sư không đúng giờ và thường xuyên hủy buổi học. Không hài lòng với dịch vụ.',
      status: 'pending',
      createdAt: '2024-10-13',
      reported: true,
    },
  ];

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Bị từ chối', className: 'bg-red-100 text-red-800' },
      hidden: { label: 'Đã ẩn', className: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <p className="text-gray-600 mt-2">
          Quản lý tất cả đánh giá và báo cáo
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#F2E5BF] rounded-lg">
                <Star className="w-6 h-6 text-[#257180]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#F2E5BF] rounded-lg">
                <Star className="w-6 h-6 text-[#257180]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bị báo cáo</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#F2E5BF] rounded-lg">
                <Star className="w-6 h-6 text-[#257180]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                <p className="text-2xl font-bold text-gray-900">4.6</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên học viên hoặc gia sư..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Đánh giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đánh giá</SelectItem>
                <SelectItem value="5">5 sao</SelectItem>
                <SelectItem value="4">4 sao</SelectItem>
                <SelectItem value="3">3 sao</SelectItem>
                <SelectItem value="2">2 sao</SelectItem>
                <SelectItem value="1">1 sao</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
                <SelectItem value="hidden">Đã ẩn</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Áp dụng bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách đánh giá</CardTitle>
            <div className="text-sm text-gray-600">
              Tổng: {reviews.length} đánh giá
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        {getRatingStars(review.rating)}
                      </div>
                      <Badge variant="secondary">{review.subject}</Badge>
                      {review.reported && (
                        <Badge className="bg-red-100 text-red-800">
                          <Flag className="w-3 h-3 mr-1" />
                          Bị báo cáo
                        </Badge>
                      )}
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Học viên:</span> {review.studentName} → 
                      <span className="font-medium"> Gia sư:</span> {review.tutorName}
                    </div>
                    <p className="text-gray-800 mb-2">{review.comment}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {review.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                          Duyệt
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Từ chối
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


