'use client';
import React, { useEffect, useMemo, useState } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, GraduationCap, FileText } from 'lucide-react';
import { mockDashboardStats, formatCurrency } from '@/data/mockBusinessAdminData';
import { AdminService } from '@/services/adminService';
import { AdminSummaryStatsDto, MonthlyAdminStatsDto } from '@/types/backend';
import { useCustomToast } from '@/hooks/useCustomToast';
import { WalletService } from '@/services/walletService';
import { WalletTransactionDto, WalletTransactionType } from '@/types/backend';

export function Dashboard() {
  const { showError } = useCustomToast();
  const [summary, setSummary] = useState<AdminSummaryStatsDto | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyAdminStatsDto[]>([]);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [loadingMonthly, setLoadingMonthly] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [recentTransactions, setRecentTransactions] = useState<WalletTransactionDto[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);

  const loading = loadingSummary || loadingMonthly || loadingTransactions;

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        const summaryRes = await AdminService.getAdminSummaryStats();

        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data);
        } else if (!summaryRes.success) {
          showError('Lỗi', summaryRes.message || 'Không thể tải thống kê tổng quan');
        }
      } catch (error) {
        showError('Lỗi', 'Không thể tải thống kê tổng quan. Vui lòng thử lại.');
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [showError]);

  useEffect(() => {
    const loadMonthly = async () => {
      try {
        setLoadingMonthly(true);
        const monthlyRes = await AdminService.getMonthlyAdminStats(selectedYear);

        if (monthlyRes.success && monthlyRes.data) {
          setMonthlyStats(monthlyRes.data);
        } else if (!monthlyRes.success) {
          showError('Lỗi', monthlyRes.message || 'Không thể tải thống kê theo tháng');
        }
      } catch (error) {
        showError('Lỗi', 'Không thể tải thống kê theo tháng. Vui lòng thử lại.');
      } finally {
        setLoadingMonthly(false);
      }
    };

    loadMonthly();
  }, [selectedYear, showError]);

  useEffect(() => {
    const loadRecentTransactions = async () => {
      try {
        setLoadingTransactions(true);
        const res = await WalletService.getSystemWalletTransactions();
        if (res.success && res.data) {
          const normalized = res.data.map((t) => ({
            ...t,
            transactionType: WalletService.normalizeTransactionType(
              t.transactionType as number | string
            ),
            reason: WalletService.normalizeTransactionReason(t.reason as number | string),
          }));
          const sorted = normalized.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentTransactions(sorted.slice(0, 10));
        } else if (!res.success) {
          showError('Lỗi', res.message || 'Không thể tải giao dịch gần đây');
        }
      } catch (error) {
        showError('Lỗi', 'Không thể tải giao dịch gần đây. Vui lòng thử lại.');
      } finally {
        setLoadingTransactions(false);
      }
    };

    loadRecentTransactions();
  }, [showError]);

  const overview = useMemo(() => {
    if (!summary || monthlyStats.length === 0) {
      return mockDashboardStats.overview;
    }

    const totalRevenue = monthlyStats.reduce(
      (sum, item) => sum + (item.revenue?.netPlatformRevenueAmount || 0),
      0
    );

    const approvedTutors = summary.tutors.approved;

    return {
      totalRevenue,
      totalTransactions: summary.bookings.total,
      totalLearners: summary.users.learners,
      totalTutors: approvedTutors,
      pendingApprovals:
        summary.tutors.pending +
        summary.refunds.pending +
        summary.reports.pending,
    };
  }, [summary, monthlyStats]);

  const revenueByMonth = useMemo(() => {
    const year = selectedYear;

    // Nếu chưa có dữ liệu thật, fallback mock nhưng vẫn đảm bảo 12 tháng
    if (monthlyStats.length === 0) {
      return Array.from({ length: 12 }, (_, idx) => {
        const mock = mockDashboardStats.revenueByMonth[idx];
        return {
          month: `Tháng ${idx + 1}`,
          revenue: mock ? mock.revenue : 0,
        };
      });
    }

    // Luôn build đủ 12 tháng
    return Array.from({ length: 12 }, (_, idx) => {
      const month = idx + 1;
      const found = monthlyStats.find((m) => m.month === month && m.year === year);
      return {
        month: `Tháng ${month}`,
        revenue: found?.revenue?.netPlatformRevenueAmount || 0,
      };
    });
  }, [monthlyStats, selectedYear]);

  const usersByMonth = useMemo(() => {
    const year = selectedYear;

    // Nếu chưa có dữ liệu thật, fallback mock nhưng vẫn đảm bảo 12 tháng
    if (monthlyStats.length === 0) {
      return Array.from({ length: 12 }, (_, idx) => {
        return {
          month: `Tháng ${idx + 1}`,
          activeUsers: 0,
        };
      });
    }

    // Luôn build đủ 12 tháng
    return Array.from({ length: 12 }, (_, idx) => {
      const month = idx + 1;
      const found = monthlyStats.find((m) => m.month === month && m.year === year);
      return {
        month: `Tháng ${month}`,
        activeUsers: found?.users?.active || 0,
      };
    });
  }, [monthlyStats, selectedYear]);

  const stats = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(overview.totalRevenue),
      icon: DollarSign,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Tổng giao dịch',
      value: overview.totalTransactions.toLocaleString('vi-VN'),
      icon: TrendingUp,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Tổng học viên',
      value: overview.totalLearners.toLocaleString('vi-VN'),
      icon: Users,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Tổng gia sư',
      value: overview.totalTutors.toLocaleString('vi-VN'),
      icon: GraduationCap,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {loading ? 'Đang tải dữ liệu thực từ hệ thống...' : 'Tổng quan hệ thống EduMatch'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow bg-white border-gray-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
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
      <div className="space-y-6">
        {/* Revenue Chart - Full Width */}
        <Card className="bg-white border-gray-300">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-gray-900">Doanh thu theo tháng</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Năm:</span>
                <input
                  type="number"
                  className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                  value={selectedYear}
                  min={2000}
                  max={9999}
                  onChange={(e) => {
                    const value = parseInt(e.target.value || '0', 10);
                    if (!isNaN(value)) {
                      setSelectedYear(value);
                    }
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip
                  formatter={(value: number) => [WalletService.formatCurrency(value), 'Doanh thu']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="revenue" name="Doanh thu" fill="#257180" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users Chart - Full Width */}
        <Card className="bg-white border-gray-300">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-gray-900">Người dùng theo tháng</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Năm:</span>
                <input
                  type="number"
                  className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                  value={selectedYear}
                  min={2000}
                  max={9999}
                  onChange={(e) => {
                    const value = parseInt(e.target.value || '0', 10);
                    if (!isNaN(value)) {
                      setSelectedYear(value);
                    }
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={usersByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}`} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString('vi-VN')} người dùng`, 'Người dùng hoạt động']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="activeUsers" name="Người dùng hoạt động" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white border-gray-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Giao dịch gần đây</CardTitle>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">{recentTransactions.length} giao dịch</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-600">
              Đang tải giao dịch gần đây...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction, index) => (
                    <TableRow
                      key={transaction.id}
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900 text-xs">
                            {WalletService.getTransactionReasonLabel(transaction.reason)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {transaction.booking?.learnerEmail || 'Hệ thống'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            transaction.transactionType === WalletTransactionType.CREDIT
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.transactionType === WalletTransactionType.CREDIT
                            ? '+'
                            : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
