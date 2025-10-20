"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Wallet, Plus, Minus, CreditCard, TrendingUp, TrendingDown, Eye, EyeOff, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Input } from '@/components/ui/form/input';

// Mock data - in real app, this would come from API
const mockTransactions = [
  {
    id: 1,
    type: 'payment',
    amount: -200000,
    description: 'Thanh toán session với Nguyễn Văn A',
    date: '2024-01-15',
    status: 'completed',
    reference: 'TXN001'
  },
  {
    id: 2,
    type: 'topup',
    amount: 1000000,
    description: 'Nạp tiền vào ví',
    date: '2024-01-14',
    status: 'completed',
    reference: 'TXN002'
  },
  {
    id: 3,
    type: 'payment',
    amount: -250000,
    description: 'Thanh toán session với Trần Thị B',
    date: '2024-01-10',
    status: 'completed',
    reference: 'TXN003'
  },
  {
    id: 4,
    type: 'refund',
    amount: 180000,
    description: 'Hoàn tiền session bị hủy',
    date: '2024-01-08',
    status: 'completed',
    reference: 'TXN004'
  }
];

export default function WalletPage() {
  const [transactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBalance, setShowBalance] = useState(true);

  // Calculate balance
  const balance = transactions.reduce((sum, tx) => sum + tx.amount, 1000000); // Starting balance
  const totalIncome = transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = Math.abs(transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0));

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'topup': return 'bg-green-100 text-green-800 border-green-200';
      case 'payment': return 'bg-red-100 text-red-800 border-red-200';
      case 'refund': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'withdrawal': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'topup': return 'Nạp tiền';
      case 'payment': return 'Thanh toán';
      case 'refund': return 'Hoàn tiền';
      case 'withdrawal': return 'Rút tiền';
      default: return 'Khác';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup': return TrendingUp;
      case 'payment': return TrendingDown;
      case 'refund': return TrendingUp;
      case 'withdrawal': return TrendingDown;
      default: return Wallet;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Wallet className="h-8 w-8 mr-3 text-[#257180]" />
              Ví & Thanh toán
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý số dư và lịch sử giao dịch
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-[#FD8B51] text-[#257180] hover:bg-[#F2E5BF]">
              <Minus className="h-4 w-4 mr-2" />
              Rút tiền
            </Button>
            <Button className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nạp tiền
            </Button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Số dư hiện tại</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">
                  {showBalance ? `${balance.toLocaleString('vi-VN')} VND` : '•••••••• VND'}
                </p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Hiển thị số dư</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {totalIncome.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {totalExpense.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6 text-green-600" />
              <span className="text-sm">Nạp tiền</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Minus className="h-6 w-6 text-red-600" />
              <span className="text-sm">Rút tiền</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Thêm thẻ</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Wallet className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Lịch sử</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Bộ lọc giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo mô tả, mã giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="topup">Nạp tiền</SelectItem>
                <SelectItem value="payment">Thanh toán</SelectItem>
                <SelectItem value="refund">Hoàn tiền</SelectItem>
                <SelectItem value="withdrawal">Rút tiền</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Wallet className="h-5 w-5 mr-2 text-gray-600" />
            Lịch sử giao dịch ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => {
              const TransactionIcon = getTransactionIcon(transaction.type);
              return (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        transaction.type === 'topup' || transaction.type === 'refund' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        <TransactionIcon className={`h-6 w-6 ${
                          transaction.type === 'topup' || transaction.type === 'refund' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {transaction.description}
                          </h3>
                          <Badge className={`${getTransactionTypeColor(transaction.type)} border`}>
                            {getTransactionTypeLabel(transaction.type)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Mã: {transaction.reference}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString('vi-VN')}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không tìm thấy giao dịch nào</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


