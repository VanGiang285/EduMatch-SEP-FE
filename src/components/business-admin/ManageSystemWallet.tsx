'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { 
  mockSystemWalletTransactions,
  formatCurrency,
  mockDashboardStats,
} from '@/data/mockBusinessAdminData';

const ITEMS_PER_PAGE = 20;

export function ManageSystemWallet() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate wallet stats
  const currentBalance = mockDashboardStats.overview.totalRevenue;
  const totalCredit = mockSystemWalletTransactions
    .filter(t => t.transactionType === 1)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = mockSystemWalletTransactions
    .filter(t => t.transactionType === 0)
    .reduce((sum, t) => sum + t.amount, 0);

  // Filter transactions
  const filteredTransactions = mockSystemWalletTransactions.filter((transaction) => {
    const matchesSearch = 
      (transaction.userName && transaction.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.tutorName && transaction.tutorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.referenceCode && transaction.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'credit' && transaction.transactionType === 1) ||
                       (typeFilter === 'debit' && transaction.transactionType === 0);
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get transaction type text
  const getTransactionTypeText = (type: number, reason: number) => {
    if (type === 1) { // CREDIT
      const creditReasons: Record<number, string> = {
        2: 'Thanh toán Booking',
        5: 'Phí nền tảng',
      };
      return creditReasons[reason] || 'Nạp tiền';
    } else { // DEBIT
      const debitReasons: Record<number, string> = {
        4: 'Chi trả gia sư',
        3: 'Hoàn tiền',
        1: 'Rút tiền',
      };
      return debitReasons[reason] || 'Trừ tiền';
    }
  };

  // Monthly balance data (mock)
  const monthlyBalanceData = [
    { month: 'T1', balance: 35000000 },
    { month: 'T2', balance: 38000000 },
    { month: 'T3', balance: 42000000 },
    { month: 'T4', balance: 41000000 },
    { month: 'T5', balance: 45000000 },
    { month: 'T6', balance: 47000000 },
    { month: 'T7', balance: 46000000 },
    { month: 'T8', balance: 48000000 },
    { month: 'T9', balance: 49500000 },
    { month: 'T10', balance: 51000000 },
    { month: 'T11', balance: currentBalance, current: true },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Ví hệ thống</h1>
        <p className="text-gray-600 mt-1">Theo dõi và quản lý ví của hệ thống EduMatch</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Số dư ví hệ thống</p>
              <p className="text-3xl font-semibold text-gray-900">{formatCurrency(currentBalance)}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +5.2% so với tháng trước
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Tổng thu</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng tiền vào ví</p>
              <p className="text-3xl font-semibold text-green-600">{formatCurrency(totalCredit)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {mockSystemWalletTransactions.filter(t => t.transactionType === 1).length} giao dịch
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-50">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">Tổng chi</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng tiền ra ví</p>
              <p className="text-3xl font-semibold text-red-600">{formatCurrency(totalDebit)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {mockSystemWalletTransactions.filter(t => t.transactionType === 0).length} giao dịch
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Chart */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Biến động số dư theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyBalanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Tháng: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#257180" 
                strokeWidth={2}
                dot={{ fill: '#257180', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên người dùng hoặc mã giao dịch..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giao dịch</SelectItem>
                <SelectItem value="credit">Tiền vào</SelectItem>
                <SelectItem value="debit">Tiền ra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <Badge variant="outline">{filteredTransactions.length} giao dịch</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Loại giao dịch</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Mã tham chiếu</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Số dư trước</TableHead>
                  <TableHead>Số dư sau</TableHead>
                  <TableHead>Ngày giao dịch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không tìm thấy giao dịch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">#{transaction.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.transactionType === 1 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {getTransactionTypeText(transaction.transactionType, transaction.reason)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.userName || transaction.tutorName || 'Hệ thống'}
                      </TableCell>
                      <TableCell>
                        {transaction.referenceCode ? (
                          <span className="font-mono text-xs text-gray-600">{transaction.referenceCode}</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          transaction.transactionType === 1 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 1 ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatCurrency(transaction.balanceBefore)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(transaction.balanceAfter)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    return (
                      <PaginationItem key={idx}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
