"use client";

import React, { useState, useEffect } from 'react';
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
  Building2,
  Loader2,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '@/data/mockLearnerData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { SelectWithSearch, SelectWithSearchItem } from '@/components/ui/form/select-with-search';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { useWalletContext } from '@/contexts/WalletContext';
import { WalletService } from '@/services/walletService';
import { WalletTransactionDto, UserBankAccountDto, BankDto } from '@/types/backend';
import { WalletTransactionType } from '@/types/backend';
import { ErrorHandler } from '@/lib/error-handler';
import { CreateUserBankAccountRequest } from '@/types/requests';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function WalletTab() {
  const { balance, wallet, loading: walletLoading, refetch: refetchBalance } = useWalletContext();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false);
  const [transactionsError, setTransactionsError] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState<UserBankAccountDto[]>([]);
  const [banks, setBanks] = useState<BankDto[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState<boolean>(false);
  const [banksLoading, setBanksLoading] = useState<boolean>(false);
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState<CreateUserBankAccountRequest>({
    bankId: 0,
    accountNumber: '',
    accountHolderName: ''
  });
  const [deletingAccountId, setDeletingAccountId] = useState<number | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<UserBankAccountDto | null>(null);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const quickAmounts = [100000, 200000, 500000, 1000000, 2000000, 5000000];

  // Helper function to remove Vietnamese accents and convert to uppercase
  const normalizeVietnameseText = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  };

  // Use real balance or fallback to 0
  const currentBalance = wallet?.balance ?? balance ?? 0;

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      const response = await WalletService.getTransactions();

      if (response.success && response.data) {
        // Sort by createdAt descending (newest first)
        const sortedTransactions = [...response.data].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const normalizedTransactions: WalletTransactionDto[] = sortedTransactions.map((transaction) => ({
          ...transaction,
          transactionType: WalletService.normalizeTransactionType(transaction.transactionType as number | string),
          reason: WalletService.normalizeTransactionReason(transaction.reason as number | string),
          status: WalletService.normalizeTransactionStatus(transaction.status as number | string),
        }));

        setTransactions(normalizedTransactions);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      setTransactionsError(appError);
      ErrorHandler.logError(err, 'WalletTab.fetchTransactions');
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (!walletLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [walletLoading, isInitialLoad]);

  // Fetch bank accounts and banks
  const fetchBankAccounts = async () => {
    try {
      setBankAccountsLoading(true);
      const response = await WalletService.getBankAccounts();
      if (response.success && response.data) {
        setBankAccounts(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      ErrorHandler.logError(err, 'WalletTab.fetchBankAccounts');
      setBankAccounts([]);
    } finally {
      setBankAccountsLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      setBanksLoading(true);
      const response = await WalletService.getAllBanks();
      if (response.success && response.data) {
        setBanks(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch banks');
      }
    } catch (err) {
      ErrorHandler.logError(err, 'WalletTab.fetchBanks');
      setBanks([]);
    } finally {
      setBanksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bank-accounts') {
      fetchBankAccounts();
      fetchBanks();
    }
  }, [activeTab]);

  // Fetch bank accounts when withdraw dialog opens
  useEffect(() => {
    if (showWithdrawDialog && bankAccounts.length === 0 && !bankAccountsLoading) {
      fetchBankAccounts();
    }
  }, [showWithdrawDialog]);

  const handleAddBankAccount = async () => {
    if (!newBankAccount.bankId || !newBankAccount.accountNumber || !newBankAccount.accountHolderName) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Remove spaces from account number before sending
    const accountNumberWithoutSpaces = newBankAccount.accountNumber.replace(/\s/g, '');

    // Validate account number length to allow both bank accounts and phone numbers
    if (accountNumberWithoutSpaces.length < 6 || accountNumberWithoutSpaces.length > 20) {
      toast.error('Số tài khoản phải có từ 6 đến 20 ký tự');
      return;
    }

    // Check if account number already exists for this bank
    const existingAccount = bankAccounts.find(account => {
      const existingAccountNumber = account.accountNumber.replace(/\s/g, '');
      return account.bank.id === newBankAccount.bankId &&
        existingAccountNumber === accountNumberWithoutSpaces;
    });

    if (existingAccount) {
      toast.error(`Số tài khoản ${newBankAccount.accountNumber} đã tồn tại cho ngân hàng ${existingAccount.bank.name}. Vui lòng kiểm tra lại.`);
      return;
    }

    try {
      // Normalize account holder name: remove accents and convert to uppercase
      const normalizedAccountHolderName = normalizeVietnameseText(newBankAccount.accountHolderName);

      const request = {
        ...newBankAccount,
        accountNumber: accountNumberWithoutSpaces,
        accountHolderName: normalizedAccountHolderName
      };
      const response = await WalletService.createBankAccount(request);
      if (response.success) {
        toast.success('Thêm tài khoản ngân hàng thành công');
        setShowAddBankDialog(false);
        setNewBankAccount({ bankId: 0, accountNumber: '', accountHolderName: '' });
        setIsCapsLockOn(false);
        await fetchBankAccounts();
      } else {
        throw new Error(response.error?.message || 'Failed to add bank account');
      }
    } catch (err) {
      ErrorHandler.logError(err, 'WalletTab.handleAddBankAccount');
      toast.error('Không thể thêm tài khoản ngân hàng');
    }
  };

  const handleDeleteClick = (account: UserBankAccountDto) => {
    setAccountToDelete(account);
    setShowDeleteConfirmDialog(true);
  };

  const handleDeleteBankAccount = async () => {
    if (!accountToDelete) return;

    try {
      setDeletingAccountId(accountToDelete.id);
      const response = await WalletService.deleteBankAccount(accountToDelete.id);
      if (response.success) {
        toast.success('Xóa tài khoản ngân hàng thành công');
        setShowDeleteConfirmDialog(false);
        setAccountToDelete(null);
        await fetchBankAccounts();
      } else {
        throw new Error(response.error?.message || 'Failed to delete bank account');
      }
    } catch (err) {
      ErrorHandler.logError(err, 'WalletTab.handleDeleteBankAccount');
      toast.error('Không thể xóa tài khoản ngân hàng');
    } finally {
      setDeletingAccountId(null);
    }
  };

  const getTransactionIcon = (transactionType: WalletTransactionType) => {
    if (transactionType === WalletTransactionType.CREDIT) {
      return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount) {
      toast.error('Vui lòng nhập số tiền nạp');
      return;
    }

    const amount = Number(topUpAmount);
    if (amount <= 0) {
      toast.error('Số tiền nạp phải lớn hơn 0');
      return;
    }

    // Validate amount range: 50,000 - 5,000,000 VND
    if (amount < 50000) {
      toast.error('Số tiền nạp tối thiểu là 50,000 VND');
      return;
    }
    if (amount > 5000000) {
      toast.error('Số tiền nạp tối đa là 5,000,000 VND');
      return;
    }

    try {
      setIsProcessingTopUp(true);
      // Backend trả về paymentUrl (string) để redirect đến VNPay
      const response = await WalletService.createDeposit({
        amount: amount
      });

      if (response.success && response.data) {
        // response.data là paymentUrl từ VNPay
        const paymentUrl = response.data;

        if (paymentUrl) {
          toast.success('Đang chuyển hướng đến trang thanh toán VNPay...');
          setShowTopUpDialog(false);
          setTopUpAmount('');

          // Redirect to VNPay payment page
          window.location.href = paymentUrl;
        } else {
          throw new Error('Payment URL not received from server');
        }
      } else {
        throw new Error(response.error?.message || 'Failed to create deposit');
      }
    } catch (err) {
      ErrorHandler.logError(err, 'WalletTab.handleTopUp');
      toast.error('Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại.');
    } finally {
      setIsProcessingTopUp(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !selectedBankAccountId) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const amount = Number(withdrawAmount);

    // Validate amount range: 50,000 - 5,000,000 VND (theo backend)
    if (amount < 50000) {
      toast.error('Số tiền rút tối thiểu là 50,000 VND');
      return;
    }
    if (amount > 5000000) {
      toast.error('Số tiền rút tối đa là 5,000,000 VND');
      return;
    }
    if (amount > currentBalance) {
      toast.error('Số tiền rút vượt quá số dư khả dụng');
      return;
    }

    try {
      setIsProcessingWithdraw(true);
      const response = await WalletService.createWithdrawal({
        amount: amount,
        userBankAccountId: selectedBankAccountId
      });

      if (response.success) {
        // Backend trả về message (string) trong response.data
        const message = response.data || 'Yêu cầu rút tiền đã được tạo thành công';
        toast.success(`${message}. Yêu cầu của bạn sẽ được xử lý trong vòng 1-2 ngày làm việc.`);

        setShowWithdrawDialog(false);
        setWithdrawAmount('');
        setSelectedBankAccountId(null);

        // Refresh balance and transactions
        await refetchBalance();
        await fetchTransactions();
      } else {
        throw new Error(response.error?.message || 'Failed to create withdrawal');
      }
    } catch (err) {
      ErrorHandler.logError(err, 'WalletTab.handleWithdraw');
      toast.error('Không thể tạo yêu cầu rút tiền. Vui lòng thử lại.');
    } finally {
      setIsProcessingWithdraw(false);
    }
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
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-white/20 text-white border border-white/30">
              <CheckCircle className="h-3 w-3" />
              <span>Khả dụng</span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-2">Số dư khả dụng</p>
          {walletLoading && isInitialLoad ? (
            <div className="flex items-center gap-2 mb-6">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-2xl font-bold">Đang tải...</p>
            </div>
          ) : (
            <p className="text-4xl font-bold mb-6">{WalletService.formatCurrency(currentBalance)}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 bg-white/90 hover:bg-[#257180] hover:text-white text-[#257180]"
              onClick={() => setShowTopUpDialog(true)}
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Nạp tiền
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-300 bg-white text-[#257180] hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
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
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]">Tổng quan</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]">Lịch sử giao dịch</TabsTrigger>
          <TabsTrigger value="bank-accounts" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]">Tài khoản ngân hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <CardTitle className="text-gray-900">Giao dịch gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#257180]" />
                  <span className="ml-2 text-gray-600">Đang tải giao dịch...</span>
                </div>
              ) : transactionsError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.
                  </AlertDescription>
                </Alert>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transactionType)}
                        <div>
                          <p className="font-medium">
                            {WalletService.getTransactionReasonLabel(transaction.reason)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.transactionType === WalletTransactionType.CREDIT ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {transaction.transactionType === WalletTransactionType.CREDIT ? '+' : '-'}
                          {WalletService.formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Số dư: {WalletService.formatCurrency(transaction.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <CardTitle className="text-gray-900">Tất cả giao dịch</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#257180]" />
                  <span className="ml-2 text-gray-600">Đang tải giao dịch...</span>
                </div>
              ) : transactionsError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.
                  </AlertDescription>
                </Alert>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getTransactionIcon(transaction.transactionType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {WalletService.getTransactionReasonLabel(transaction.reason)}
                            </p>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border border-gray-300 text-gray-700">
                              <span>{WalletService.getTransactionTypeLabel(transaction.transactionType)}</span>
                            </div>
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
                        <p className={`font-semibold text-lg ${transaction.transactionType === WalletTransactionType.CREDIT ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {transaction.transactionType === WalletTransactionType.CREDIT ? '+' : '-'}
                          {WalletService.formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Sau GD: {WalletService.formatCurrency(transaction.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank-accounts" className="mt-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Tài khoản ngân hàng</CardTitle>
                <Button
                  onClick={() => setShowAddBankDialog(true)}
                  className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm tài khoản
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bankAccountsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#257180]" />
                  <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
              ) : bankAccounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có tài khoản ngân hàng nào</p>
                  <p className="text-sm mt-2">Thêm tài khoản để có thể rút tiền từ ví</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#257180] transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#257180] to-[#1e5a66] rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{account.bank.name}</p>
                            {account.isDefault && (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[#257180] text-white border border-gray-300">
                                <CheckCircle className="h-3 w-3" />
                                <span>Mặc định</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {account.accountNumber} - {account.accountHolderName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {account.bank.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(account)}
                          disabled={deletingAccountId === account.id}
                          className="border-gray-300 bg-white text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        >
                          {deletingAccountId === account.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Bank Account Dialog */}
      <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
        <DialogContent className="sm:max-w-md border-gray-300 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Thêm tài khoản ngân hàng</DialogTitle>
            <DialogDescription className="text-gray-600">
              Thêm tài khoản ngân hàng để có thể rút tiền từ ví
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankId">Ngân hàng</Label>
              {banksLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">Đang tải danh sách ngân hàng...</span>
                </div>
              ) : (
                <SelectWithSearch
                  value={newBankAccount.bankId > 0 ? newBankAccount.bankId.toString() : ''}
                  onValueChange={(value) => setNewBankAccount({ ...newBankAccount, bankId: parseInt(value) })}
                  placeholder="Chọn ngân hàng"
                >
                  {banks.map((bank) => (
                    <SelectWithSearchItem key={bank.id} value={bank.id.toString()}>
                      {bank.name} ({bank.code})
                    </SelectWithSearchItem>
                  ))}
                </SelectWithSearch>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Số tài khoản</Label>
              <Input
                id="accountNumber"
                placeholder="0000 0000 0000 0000"
                value={newBankAccount.accountNumber}
                onChange={(e) => {
                  // Remove all non-digits
                  const digits = e.target.value.replace(/\D/g, '');
                  // Limit to 16 digits
                  const limited = digits.slice(0, 16);
                  // Format as xxxx xxxx xxxx xxxx
                  const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
                  setNewBankAccount({ ...newBankAccount, accountNumber: formatted });
                }}
                maxLength={19} // 16 digits + 3 spaces
              />
              <p className="text-xs text-gray-500">
                Tối đa 16 chữ số
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Tên chủ tài khoản</Label>
              <div className="relative">
                <Input
                  id="accountHolderName"
                  placeholder="Nhập tên chủ tài khoản"
                  value={newBankAccount.accountHolderName}
                  onChange={(e) => {
                    // Keep user input as-is for display (preserve Vietnamese accents and case)
                    setNewBankAccount({ ...newBankAccount, accountHolderName: e.target.value });
                  }}
                  onKeyDown={(e) => {
                    // Detect Caps Lock
                    if (e.getModifierState && e.getModifierState('CapsLock')) {
                      setIsCapsLockOn(true);
                    } else {
                      setIsCapsLockOn(false);
                    }
                  }}
                  onKeyUp={(e) => {
                    // Check Caps Lock on key up as well
                    if (e.getModifierState && e.getModifierState('CapsLock')) {
                      setIsCapsLockOn(true);
                    } else {
                      setIsCapsLockOn(false);
                    }
                  }}
                  className={isCapsLockOn ? 'pr-10' : ''}
                />
                {isCapsLockOn && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Caps Lock</span>
                  </div>
                )}
              </div>
              {isCapsLockOn && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-sm">
                    Caps Lock đang bật. Tên tài khoản sẽ được chuyển thành chữ hoa và loại bỏ dấu khi lưu.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddBankDialog(false);
                setNewBankAccount({ bankId: 0, accountNumber: '', accountHolderName: '' });
                setIsCapsLockOn(false);
              }}
              className="border-gray-300 bg-white text-[#257180] hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddBankAccount}
              disabled={!newBankAccount.bankId || !newBankAccount.accountNumber || !newBankAccount.accountHolderName}
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Thêm tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Up Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent className="sm:max-w-md border-gray-300 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Nạp tiền vào ví</DialogTitle>
            <DialogDescription className="text-gray-600">
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
                    className="text-sm border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {topUpAmount && Number(topUpAmount) > 0 && (
              <p className="text-sm text-gray-700 whitespace-nowrap">
                Bạn sẽ nạp <strong className="text-[#257180]">{formatCurrency(Number(topUpAmount))}</strong> vào ví
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTopUpDialog(false);
                setTopUpAmount('');
              }}
              disabled={isProcessingTopUp}
              className="border-gray-300 bg-white text-[#257180] hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            >
              Hủy
            </Button>
            <Button
              onClick={handleTopUp}
              disabled={!topUpAmount || isProcessingTopUp || Number(topUpAmount) <= 0}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {isProcessingTopUp ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Tiếp tục'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md border-gray-300 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl font-semibold">Rút tiền từ ví</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm mt-1">
              Chọn tài khoản ngân hàng để rút tiền về
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-700 whitespace-nowrap">
              Số dư khả dụng: <strong className="text-[#257180]">{WalletService.formatCurrency(currentBalance)}</strong>
            </p>

            <div className="space-y-2">
              <Label htmlFor="withdrawAmount" className="text-gray-900 font-medium">
                Số tiền rút
              </Label>
              <Input
                id="withdrawAmount"
                type="number"
                placeholder="Nhập số tiền"
                value={withdrawAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                    setWithdrawAmount(value);
                  }
                }}
                min="0"
                className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
              />
              <p className="text-xs text-gray-500">
                Số tiền tối thiểu: <span className="font-medium text-[#257180]">{WalletService.formatCurrency(50000)}</span> | Tối đa: <span className="font-medium text-[#257180]">{WalletService.formatCurrency(5000000)}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount" className="text-gray-900 font-medium">
                Tài khoản ngân hàng
              </Label>
              {bankAccountsLoading ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />
                  <span className="text-sm text-gray-600">Đang tải danh sách tài khoản...</span>
                </div>
              ) : bankAccounts.length === 0 ? (
                <Alert className="bg-yellow-50 border-yellow-200 border-l-4 border-l-yellow-500">
                  <AlertDescription className="text-yellow-800 text-sm">
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Bạn chưa có tài khoản ngân hàng nào. Vui lòng thêm tài khoản ngân hàng trước khi rút tiền.
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  value={selectedBankAccountId?.toString() || ''}
                  onValueChange={(value) => setSelectedBankAccountId(parseInt(value))}
                >
                  <SelectTrigger
                    id="bankAccount"
                    className="!h-auto min-h-[2.5rem] py-2 border-gray-300 focus:border-[#257180] focus:ring-[#257180] items-start [&>*[data-slot=select-value]]:text-left [&>*[data-slot=select-value]]:truncate [&>*[data-slot=select-value]]:block [&>*[data-slot=select-value]]:w-full [&>*[data-slot=select-value]]:py-0.5"
                  >
                    <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] w-full">
                    {bankAccounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id.toString()}
                        className="py-3 px-3 cursor-pointer my-1 rounded-md hover:bg-gray-50 data-[highlighted]:bg-gray-50"
                        textValue={account.bank.code ? `${account.bank.code} - ${account.bank.name} - ${account.accountNumber}` : `${account.bank.name} - ${account.accountNumber}`}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#257180] to-[#1e5a66] flex items-center justify-center shadow-sm">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              {account.bank.code ? (
                                <span className="font-semibold text-gray-900 text-sm">
                                  {account.bank.code} - {account.bank.name}
                                </span>
                              ) : (
                                <span className="font-semibold text-gray-900 text-sm">
                                  {account.bank.name}
                                </span>
                              )}
                              {account.isDefault && (
                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs font-medium bg-[#257180] text-white border border-gray-300">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Mặc định</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-700 font-mono font-medium">
                                {account.accountNumber}
                              </p>
                              <p className="text-xs text-gray-600">
                                {account.accountHolderName}
                              </p>
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {withdrawAmount && Number(withdrawAmount) > 0 && Number(withdrawAmount) < 50000 && (
              <p className="text-sm text-yellow-700 whitespace-nowrap">
                Số tiền rút tối thiểu là <strong className="text-[#257180]">{WalletService.formatCurrency(50000)}</strong>
              </p>
            )}

            {withdrawAmount && Number(withdrawAmount) > 5000000 && (
              <p className="text-sm text-yellow-700 whitespace-nowrap">
                Số tiền rút tối đa là <strong className="text-[#257180]">{WalletService.formatCurrency(5000000)}</strong>
              </p>
            )}

            {withdrawAmount && Number(withdrawAmount) > currentBalance && (
              <p className="text-sm text-red-700 whitespace-nowrap">
                Số tiền rút vượt quá số dư khả dụng
              </p>
            )}

            {withdrawAmount && selectedBankAccountId && Number(withdrawAmount) >= 50000 && Number(withdrawAmount) <= Math.min(currentBalance, 5000000) && (
              <p className="text-sm text-green-700">
                Bạn sẽ rút <strong className="text-[#257180]">{WalletService.formatCurrency(Number(withdrawAmount))}</strong> về tài khoản đã chọn. Yêu cầu sẽ được xử lý trong vòng 1-2 ngày làm việc.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowWithdrawDialog(false);
                setWithdrawAmount('');
                setSelectedBankAccountId(null);
              }}
              disabled={isProcessingWithdraw}
              className="border-gray-300 bg-white text-[#257180] hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            >
              Hủy
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                !withdrawAmount ||
                !selectedBankAccountId ||
                isProcessingWithdraw ||
                Number(withdrawAmount) < 50000 ||
                Number(withdrawAmount) > 5000000 ||
                Number(withdrawAmount) > currentBalance
              }
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {isProcessingWithdraw ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Rút tiền'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bank Account Confirm Dialog */}
      <ConfirmDialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
        title="Xác nhận xóa tài khoản ngân hàng"
        description={
          accountToDelete
            ? `Bạn có chắc chắn muốn xóa tài khoản ngân hàng ${accountToDelete.bank.name} - ${accountToDelete.accountNumber} không? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa tài khoản ngân hàng này không?'
        }
        type="error"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteBankAccount}
        onCancel={() => {
          setAccountToDelete(null);
        }}
        loading={deletingAccountId !== null}
      />
    </div>
  );
}
