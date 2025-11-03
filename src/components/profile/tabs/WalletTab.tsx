"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/feedback/dialog';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle,
  CreditCard,
  Building2
} from 'lucide-react';
import { 
  mockCurrentUser, 
  mockWalletTransactions,
  formatCurrency 
} from '@/data/mockLearnerData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';

export function WalletTab() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const quickAmounts = [100000, 200000, 500000, 1000000, 2000000, 5000000];

  const getTransactionIcon = (transactionType: number, reason: number) => {
    if (transactionType === 1) { // CREDIT
      return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
    } else { // DEBIT
      return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getReasonText = (reason: number) => {
    const reasons = [
      'Nạp tiền',
      'Rút tiền',
      'Thanh toán booking',
      'Hoàn tiền',
      'Nhận tiền từ booking',
      'Phí nền tảng'
    ];
    return reasons[reason] || 'Khác';
  };

  const handleTopUp = () => {
    console.log('Top up:', topUpAmount, paymentMethod);
    // Handle top up logic
    setShowTopUpDialog(false);
    setTopUpAmount('');
    setPaymentMethod('');
  };

  const handleWithdraw = () => {
    console.log('Withdraw:', withdrawAmount, bankName, accountNumber, accountName);
    // Handle withdraw logic
    setShowWithdrawDialog(false);
    setWithdrawAmount('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Ví của tôi</h2>
        <p className="text-gray-600 mt-1">Quản lý số dư và giao dịch</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-[#257180] to-[#1e5a66] text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="h-6 w-6 opacity-80" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              Khả dụng
            </Badge>
          </div>
          <p className="text-sm opacity-90 mb-2">Số dư khả dụng</p>
          <p className="text-4xl font-bold mb-6">{formatCurrency(mockCurrentUser.balance)}</p>
          
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1 bg-white/90 hover:bg-white text-[#257180]"
              onClick={() => setShowTopUpDialog(true)}
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Nạp tiền
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-white/30 text-white hover:bg-white/10"
              onClick={() => setShowWithdrawDialog(true)}
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Rút tiền
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="history">Lịch sử giao dịch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-gray-900">Giao dịch gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWalletTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transactionType, transaction.reason)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.transactionType === 1 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transactionType === 1 ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Số dư: {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-gray-900">Tất cả giao dịch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockWalletTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getTransactionIcon(transaction.transactionType, transaction.reason)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {getReasonText(transaction.reason)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                          </p>
                          {transaction.referenceCode && (
                            <p className="text-xs text-gray-400">
                              Mã GD: {transaction.referenceCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`font-semibold text-lg ${
                        transaction.transactionType === 1 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transactionType === 1 ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sau GD: {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Up Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nạp tiền vào ví</DialogTitle>
            <DialogDescription>
              Chọn số tiền và phương thức thanh toán để nạp vào ví
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topUpAmount">Số tiền nạp</Label>
              <Input
                id="topUpAmount"
                type="number"
                placeholder="Nhập số tiền"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Chọn nhanh</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => setTopUpAmount(amount.toString())}
                    className="text-sm"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vnpay">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      VNPay
                    </div>
                  </SelectItem>
                  <SelectItem value="momo">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      MoMo
                    </div>
                  </SelectItem>
                  <SelectItem value="zalopay">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      ZaloPay
                    </div>
                  </SelectItem>
                  <SelectItem value="bank">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Chuyển khoản ngân hàng
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {topUpAmount && (
              <Alert>
                <AlertDescription>
                  Bạn sẽ nạp <strong>{formatCurrency(Number(topUpAmount))}</strong> vào ví
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopUpDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleTopUp}
              disabled={!topUpAmount || !paymentMethod}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rút tiền từ ví</DialogTitle>
            <DialogDescription>
              Nhập thông tin ngân hàng để rút tiền về tài khoản
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription>
                Số dư khả dụng: <strong>{formatCurrency(mockCurrentUser.balance)}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Số tiền rút</Label>
              <Input
                id="withdrawAmount"
                type="number"
                placeholder="Nhập số tiền"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Ngân hàng</Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger id="bankName">
                  <SelectValue placeholder="Chọn ngân hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vietcombank">Vietcombank</SelectItem>
                  <SelectItem value="techcombank">Techcombank</SelectItem>
                  <SelectItem value="vcb">VCB</SelectItem>
                  <SelectItem value="acb">ACB</SelectItem>
                  <SelectItem value="mb">MB Bank</SelectItem>
                  <SelectItem value="tpbank">TPBank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Số tài khoản</Label>
              <Input
                id="accountNumber"
                placeholder="Nhập số tài khoản"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Tên chủ tài khoản</Label>
              <Input
                id="accountName"
                placeholder="Nhập tên chủ tài khoản"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>

            {withdrawAmount && Number(withdrawAmount) > mockCurrentUser.balance && (
              <Alert variant="destructive">
                <AlertDescription>
                  Số tiền rút vượt quá số dư khả dụng
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleWithdraw}
              disabled={
                !withdrawAmount || 
                !bankName || 
                !accountNumber || 
                !accountName ||
                Number(withdrawAmount) > mockCurrentUser.balance
              }
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Rút tiền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
