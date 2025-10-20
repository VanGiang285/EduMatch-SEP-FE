'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Badge } from '@/components/ui/basic/badge';
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Eye, Star } from 'lucide-react';

export default function AdminTutorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Mock data - replace with real API calls
  const tutors = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      subjects: ['Toán học', 'Vật lý'],
      rating: 4.8,
      totalStudents: 25,
      status: 'approved',
      hourlyRate: 150000,
      joinDate: '2024-01-15',
      lastActive: '2024-10-18',
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      subjects: ['Tiếng Anh', 'Văn học'],
      rating: 4.9,
      totalStudents: 18,
      status: 'pending',
      hourlyRate: 200000,
      joinDate: '2024-02-20',
      lastActive: '2024-10-17',
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      subjects: ['Hóa học', 'Sinh học'],
      rating: 4.7,
      totalStudents: 12,
      status: 'rejected',
      hourlyRate: 180000,
      joinDate: '2024-03-10',
      lastActive: '2024-09-15',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Bị từ chối', className: 'bg-red-100 text-red-800' },
      suspended: { label: 'Tạm khóa', className: 'bg-orange-100 text-orange-800' },
      deactivated: { label: 'Ngừng hoạt động', className: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý gia sư</h1>
        <p className="text-gray-600 mt-2">
          Quản lý tất cả gia sư và đơn đăng ký
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#F2E5BF] rounded-lg">
                <CheckCircle className="w-6 h-6 text-[#257180]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[#F2E5BF] rounded-lg">
                <CheckCircle className="w-6 h-6 text-[#257180]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bị từ chối</p>
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
                <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
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
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
                <SelectItem value="suspended">Tạm khóa</SelectItem>
                <SelectItem value="deactivated">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn học</SelectItem>
                <SelectItem value="toan">Toán học</SelectItem>
                <SelectItem value="ly">Vật lý</SelectItem>
                <SelectItem value="hoa">Hóa học</SelectItem>
                <SelectItem value="anh">Tiếng Anh</SelectItem>
                <SelectItem value="van">Văn học</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Áp dụng bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tutors Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách gia sư</CardTitle>
            <div className="text-sm text-gray-600">
              Tổng: {tutors.length} gia sư
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Gia sư</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Môn dạy</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Đánh giá</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Học sinh</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Giá/giờ</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tutors.map((tutor) => (
                  <tr key={tutor.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{tutor.name}</div>
                        <div className="text-sm text-gray-500">{tutor.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{tutor.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {tutor.totalStudents} học sinh
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {tutor.hourlyRate.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(tutor.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {tutor.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


