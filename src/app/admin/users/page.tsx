'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Badge } from '@/components/ui/basic/badge';
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Mail } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Mock data - replace with real API calls
  const users = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      role: 'learner',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-10-18',
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      role: 'tutor',
      status: 'active',
      joinDate: '2024-02-20',
      lastLogin: '2024-10-17',
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      role: 'learner',
      status: 'inactive',
      joinDate: '2024-03-10',
      lastLogin: '2024-09-15',
    },
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      learner: { label: 'Học viên', className: 'bg-[#F2E5BF] text-[#257180]' },
      tutor: { label: 'Gia sư', className: 'bg-[#F2E5BF] text-[#257180]' },
      business_admin: { label: 'Quản trị kinh doanh', className: 'bg-[#F2E5BF] text-[#257180]' },
      system_admin: { label: 'Quản trị hệ thống', className: 'bg-[#F2E5BF] text-[#257180]' },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Hoạt động', className: 'bg-[#F2E5BF] text-[#257180]' },
      inactive: { label: 'Không hoạt động', className: 'bg-gray-100 text-gray-800' },
      suspended: { label: 'Tạm khóa', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-2">
          Quản lý tất cả người dùng trong hệ thống
        </p>
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="learner">Học viên</SelectItem>
                <SelectItem value="tutor">Gia sư</SelectItem>
                <SelectItem value="business_admin">Quản trị kinh doanh</SelectItem>
                <SelectItem value="system_admin">Quản trị hệ thống</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="suspended">Tạm khóa</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Áp dụng bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách người dùng</CardTitle>
            <div className="text-sm text-gray-600">
              Tổng: {users.length} người dùng
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Người dùng</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Vai trò</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ngày tham gia</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Lần đăng nhập cuối</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(user.lastLogin).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <UserX className="w-4 h-4" />
                        </Button>
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


