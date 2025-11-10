'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/layout/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,
  GraduationCap,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  mockDashboardStats,
  formatCurrency,
} from '@/data/mockBusinessAdminData';

export function Dashboard() {
  const { overview, revenueByMonth, transactionsByType, recentTransactions } = mockDashboardStats;

  const stats = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(overview.totalRevenue),
      icon: DollarSign,
      change: '+12.5%',
      isPositive: true,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Tổng giao dịch',
      value: overview.totalTransactions.toLocaleString('vi-VN'),
      icon: TrendingUp,
      change: '+8.2%',
      isPositive: true,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Tổng học viên',
      value: overview.totalLearners.toLocaleString('vi-VN'),
      icon: Users,
      change: '+5.7%',
      isPositive: true,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Tổng gia sư',
      value: overview.totalTutors.toLocaleString('vi-VN'),
      icon: GraduationCap,
      change: '+3.4%',
      isPositive: true,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Chờ duyệt',
      value: overview.pendingApprovals.toString(),
      icon: AlertCircle,
      change: 'Cần xử lý',
      isPositive: false,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống EduMatch</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {stat.isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                    )}
                    <span className={stat.isPositive ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Tháng: ${label}`}
                />
                <Bar dataKey="revenue" fill="#257180" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Types Pie Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Phân loại giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Giao dịch gần đây</CardTitle>
            <Badge variant="outline">{recentTransactions.length} giao dịch</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => {
                  const reasonText = {
                    2: 'Thanh toán Booking',
                    4: 'Chi trả gia sư',
                    5: 'Phí nền tảng',
                    3: 'Hoàn tiền',
                  }[transaction.reason] || 'Khác';

                  return (
                    <TableRow key={transaction.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{transaction.id}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {reasonText}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {transaction.userName || transaction.tutorName || 'Hệ thống'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          transaction.transactionType === 1 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 1 ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Hoàn thành
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
