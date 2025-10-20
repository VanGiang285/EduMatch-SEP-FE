"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { DollarSign, TrendingUp, TrendingDown, Download, Filter, Search, Calendar, CreditCard, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Input } from '@/components/ui/form/input';

// Mock data - in real app, this would come from API
const mockEarnings = [
  {
    id: 1,
    studentName: 'Nguyễn Văn A',
    subject: 'Toán học - Lớp 12',
    sessionDate: '2024-01-15',
    duration: 1.5,
    hourlyRate: 200000,
    amount: 300000,
    status: 'completed',
    paymentDate: '2024-01-16'
  },
  {
    id: 2,
    studentName: 'Trần Thị B',
    subject: 'Vật lý - Lớp 11',
    sessionDate: '2024-01-14',
    duration: 2,
    hourlyRate: 250000,
    amount: 500000,
    status: 'completed',
    paymentDate: '2024-01-15'
  },
  {
    id: 3,
    studentName: 'Lê Văn C',
    subject: 'Hóa học - Lớp 10',
    sessionDate: '2024-01-13',
    duration: 1.5,
    hourlyRate: 180000,
    amount: 270000,
    status: 'pending',
    paymentDate: null
  }
];

const mockWithdrawals = [
  {
    id: 1,
    amount: 1000000,
    status: 'completed',
    requestDate: '2024-01-10',
    processDate: '2024-01-12',
    method: 'Bank Transfer',
    accountNumber: '****1234'
  },
  {
    id: 2,
    amount: 500000,
    status: 'pending',
    requestDate: '2024-01-14',
    processDate: null,
    method: 'Bank Transfer',
    accountNumber: '****1234'
  }
];

export default function EarningsPage() {
  const [earnings] = useState(mockEarnings);
  const [withdrawals] = useState(mockWithdrawals);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const completedEarnings = earnings.filter(e => e.status === 'completed').reduce((sum, earning) => sum + earning.amount, 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, earning) => sum + earning.amount, 0);
  const totalWithdrawn = withdrawals.filter(w => w.status === 'completed').reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const availableBalance = completedEarnings - totalWithdrawn - pendingWithdrawals;

  const filteredEarnings = earnings.filter(earning => {
    const matchesSearch = 
      earning.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || earning.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const handleWithdraw = () => {
    // TODO: Implement withdraw functionality
    console.log('Withdraw requested');
  };

  const handleExportEarnings = () => {
    // TODO: Implement export earnings functionality
    console.log('Export earnings');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <DollarSign className="h-8 w-8 mr-3 text-[#257180]" />
              Thu nhập
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thu nhập và rút tiền
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleExportEarnings}
              variant="outline"
              className="border-[#FD8B51] text-[#257180] hover:bg-[#F2E5BF]"
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button
              onClick={handleWithdraw}
              className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Rút tiền
            </Button>
          </div>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">
                  {totalEarnings.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Số dư khả dụng</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {availableBalance.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {pendingEarnings.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã rút</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {totalWithdrawn.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{earnings.length}</p>
              <p className="text-sm text-gray-600">Tổng buổi dạy</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {earnings.reduce((sum, earning) => sum + earning.duration, 0).toFixed(1)}h
              </p>
              <p className="text-sm text-gray-600">Tổng giờ dạy</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(totalEarnings / earnings.reduce((sum, earning) => sum + earning.duration, 0))} VND/h
              </p>
              <p className="text-sm text-gray-600">Thu nhập trung bình/giờ</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo học viên, môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="completed">Đã thanh toán</SelectItem>
                <SelectItem value="pending">Chờ thanh toán</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Earnings List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <DollarSign className="h-5 w-5 mr-2 text-gray-600" />
            Lịch sử thu nhập ({filteredEarnings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F2E5BF]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày dạy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mức phí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEarnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {earning.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{earning.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(earning.sessionDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{earning.duration}h</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {earning.hourlyRate.toLocaleString('vi-VN')} VND/h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {earning.amount.toLocaleString('vi-VN')} VND
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${getStatusColor(earning.status)} border`}>
                        {getStatusLabel(earning.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEarnings.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không tìm thấy thu nhập nào</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
            Lịch sử rút tiền
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {withdrawal.amount.toLocaleString('vi-VN')} VND
                    </h3>
                    <p className="text-sm text-gray-600">
                      {withdrawal.method} - {withdrawal.accountNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      Yêu cầu: {new Date(withdrawal.requestDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getStatusColor(withdrawal.status)} border`}>
                    {getStatusLabel(withdrawal.status)}
                  </Badge>
                  {withdrawal.processDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Xử lý: {new Date(withdrawal.processDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


