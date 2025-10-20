'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Users, GraduationCap, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  // Mock data - replace with real API calls
  const stats = [
    {
      title: 'Tổng người dùng',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Gia sư đã duyệt',
      value: '456',
      change: '+8%',
      changeType: 'positive' as const,
      icon: GraduationCap,
    },
    {
      title: 'Đánh giá trung bình',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive' as const,
      icon: Star,
    },
    {
      title: 'Doanh thu tháng',
      value: '12.5M VNĐ',
      change: '+15%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Đang chờ duyệt',
      value: '23',
      change: '-5',
      changeType: 'negative' as const,
      icon: Clock,
    },
    {
      title: 'Tỷ lệ thành công',
      value: '94%',
      change: '+2%',
      changeType: 'positive' as const,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Tổng quan về hệ thống EduMatch
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-[#257180]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' 
                    ? 'text-[#257180]' 
                    : 'text-red-600'
                }`}>
                  {stat.change} so với tháng trước
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Gia sư mới đăng ký</p>
                  <p className="text-xs text-gray-500">Nguyễn Văn A - 2 phút trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Đánh giá mới</p>
                  <p className="text-xs text-gray-500">5 sao từ học viên - 5 phút trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Cần duyệt</p>
                  <p className="text-xs text-gray-500">3 hồ sơ gia sư - 10 phút trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gia sư online</span>
                <span className="text-sm font-medium">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Buổi học hôm nay</span>
                <span className="text-sm font-medium">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Phản hồi tích cực</span>
                <span className="text-sm font-medium">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


