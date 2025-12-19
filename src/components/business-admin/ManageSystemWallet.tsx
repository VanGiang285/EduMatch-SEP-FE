'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/feedback/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs';
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
  Loader2,
  Plus,
  Edit,
  Settings,
} from 'lucide-react';
import { 
  formatCurrency,
} from '@/data/mockBusinessAdminData';
import { WalletService } from '@/services/walletService';
import { SystemFeeService } from '@/services/systemFeeService';
import { WalletDto, WalletTransactionDto, SystemWalletDashboardDto, SystemFeeDto } from '@/types/backend';
import { WalletTransactionType, WalletTransactionReason } from '@/types/backend';
import { SystemFeeCreateRequest, SystemFeeUpdateRequest } from '@/types/requests';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;
const SYSTEM_FEE_ITEMS_PER_PAGE = 10;

export function ManageSystemWallet() {
    // Wallet states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  
  const [systemWallet, setSystemWallet] = useState<WalletDto | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);
  const [dashboard, setDashboard] = useState<SystemWalletDashboardDto | null>(null);

  // System Fee states
  const [systemFees, setSystemFees] = useState<SystemFeeDto[]>([]);
  const [isLoadingSystemFees, setIsLoadingSystemFees] = useState(true);
  const [systemFeePage, setSystemFeePage] = useState(1);
  const [systemFeeTotalPages, setSystemFeeTotalPages] = useState(1);
  const [showSystemFeeDialog, setShowSystemFeeDialog] = useState(false);
  const [editingSystemFee, setEditingSystemFee] = useState<SystemFeeDto | null>(null);
  const [isSavingSystemFee, setIsSavingSystemFee] = useState(false);
  
  // System Fee form
  const [systemFeeForm, setSystemFeeForm] = useState<SystemFeeCreateRequest>({
    name: '',
    percentage: undefined,
    fixedAmount: undefined,
    isActive: true,
  });

  // Load wallet data
  useEffect(() => {
    const loadWalletData = async () => {
      setIsLoadingWallet(true);
      try {
        const response = await WalletService.getSystemWallet();
        if (response.success && response.data) {
          setSystemWallet(response.data);
        } else {
          toast.error('Lỗi', response.message || 'Không thể tải thông tin ví hệ thống');
        }
      } catch (error: any) {
        console.error('Error loading system wallet:', error);
        toast.error('Không thể tải thông tin ví hệ thống. Vui lòng thử lại.');
      } finally {
        setIsLoadingWallet(false);
      }
    };

    loadWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load transactions (sử dụng giao dịch ví hệ thống)
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const response = await WalletService.getSystemWalletTransactions();
        if (response.success && response.data) {
          const normalized = response.data.map((t) => ({
            ...t,
            transactionType: WalletService.normalizeTransactionType(
              t.transactionType as number | string
            ),
            reason: WalletService.normalizeTransactionReason(
              t.reason as number | string
            ),
          }));
          setTransactions(normalized);
        } else {
          toast.error('Lỗi', response.message || 'Không thể tải lịch sử giao dịch');
        }
      } catch (error: any) {
        console.error('Error loading transactions:', error);
        toast.error('Không thể tải lịch sử giao dịch. Vui lòng thử lại.');
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoadingDashboard(true);
      try {
        const response = await WalletService.getSystemWalletDashboard();
        if (response.success && response.data) {
          setDashboard(response.data);
        } else {
          toast.error('Lỗi', response.message || 'Không thể tải dữ liệu dashboard');
        }
      } catch (error: any) {
        console.error('Error loading dashboard:', error);
        toast.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load system fees
  useEffect(() => {
    const loadSystemFees = async () => {
      setIsLoadingSystemFees(true);
      try {
        const response = await SystemFeeService.getAllPaging({
          page: systemFeePage,
          pageSize: SYSTEM_FEE_ITEMS_PER_PAGE,
        });
        if (response.success && response.data) {
          setSystemFees(response.data.items || []);
          setSystemFeeTotalPages(Math.ceil((response.data.totalCount || 0) / SYSTEM_FEE_ITEMS_PER_PAGE));
        } else {
          toast.error('Lỗi', response.message || 'Không thể tải danh sách phí hệ thống');
        }
      } catch (error: any) {
        console.error('Error loading system fees:', error);
        toast.error('Không thể tải danh sách phí hệ thống. Vui lòng thử lại.');
      } finally {
        setIsLoadingSystemFees(false);
      }
    };

    loadSystemFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemFeePage]);

  // Calculate wallet stats
  const currentBalance = systemWallet?.balance || 0;
  const totalCredit = useMemo(() => 
    transactions
      .filter(t => t.transactionType === WalletTransactionType.CREDIT)
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const totalDebit = useMemo(() => 
    transactions
      .filter(t => t.transactionType === WalletTransactionType.DEBIT)
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = 
        (transaction.booking?.learnerEmail && transaction.booking.learnerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.booking?.tutorEmail && transaction.booking.tutorEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.referenceCode && transaction.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || 
                         (typeFilter === 'credit' && transaction.transactionType === WalletTransactionType.CREDIT) ||
                         (typeFilter === 'debit' && transaction.transactionType === WalletTransactionType.DEBIT);
      
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get transaction type text
  const getTransactionTypeText = (type: WalletTransactionType, reason: WalletTransactionReason) => {
    if (type === WalletTransactionType.CREDIT) {
      const creditReasons: Record<number, string> = {
        [WalletTransactionReason.PAYMENT_BOOKING]: 'Thanh toán Booking',
        [WalletTransactionReason.PLATFORM_FEE]: 'Phí nền tảng',
        [WalletTransactionReason.DEPOSIT]: 'Nạp tiền',
      };
      return creditReasons[reason] || 'Nạp tiền';
    } else {
      const debitReasons: Record<number, string> = {
        [WalletTransactionReason.RECEIVE_FROM_BOOKING]: 'Chi trả gia sư',
        [WalletTransactionReason.REFUND_BOOKING]: 'Hoàn tiền',
        [WalletTransactionReason.WITHDRAWAL]: 'Rút tiền',
      };
      return debitReasons[reason] || 'Trừ tiền';
    }
  };

  // Handle System Fee CRUD
  const handleCreateSystemFee = () => {
    setEditingSystemFee(null);
    setSystemFeeForm({
      name: '',
      percentage: undefined,
      fixedAmount: undefined,
      isActive: true,
    });
    setShowSystemFeeDialog(true);
  };

  const handleEditSystemFee = (fee: SystemFeeDto) => {
    setEditingSystemFee(fee);
    setSystemFeeForm({
      name: fee.name,
      percentage: fee.percentage,
      fixedAmount: fee.fixedAmount,
      isActive: fee.isActive ?? true,
    });
    setShowSystemFeeDialog(true);
  };

  const handleSaveSystemFee = async () => {
    if (!systemFeeForm.name.trim()) {
      toast.error('Vui lòng nhập tên phí hệ thống');
      return;
    }

    if (!systemFeeForm.percentage && !systemFeeForm.fixedAmount) {
      toast.error('Vui lòng nhập phần trăm hoặc số tiền cố định');
      return;
    }

    setIsSavingSystemFee(true);
    try {
      if (editingSystemFee) {
        // Update
        const request: SystemFeeUpdateRequest = {
          id: editingSystemFee.id,
          ...systemFeeForm,
        };
        const response = await SystemFeeService.updateSystemFee(request);
        if (response.success) {
          toast.success('Cập nhật phí hệ thống thành công');
          setShowSystemFeeDialog(false);
          // Reload system fees
          const reloadResponse = await SystemFeeService.getAllPaging({
            page: systemFeePage,
            pageSize: SYSTEM_FEE_ITEMS_PER_PAGE,
          });
          if (reloadResponse.success && reloadResponse.data) {
            setSystemFees(reloadResponse.data.items || []);
          }
        } else {
          toast.error('Lỗi', response.message || 'Không thể cập nhật phí hệ thống');
        }
      } else {
        // Create
        const response = await SystemFeeService.createSystemFee(systemFeeForm);
        if (response.success) {
          toast.success('Tạo phí hệ thống thành công');
          setShowSystemFeeDialog(false);
          // Reload system fees
          const reloadResponse = await SystemFeeService.getAllPaging({
            page: systemFeePage,
            pageSize: SYSTEM_FEE_ITEMS_PER_PAGE,
          });
          if (reloadResponse.success && reloadResponse.data) {
            setSystemFees(reloadResponse.data.items || []);
            setSystemFeeTotalPages(Math.ceil((reloadResponse.data.totalCount || 0) / SYSTEM_FEE_ITEMS_PER_PAGE));
          }
        } else {
          toast.error('Lỗi', response.message || 'Không thể tạo phí hệ thống');
        }
      }
    } catch (error: any) {
      console.error('Error saving system fee:', error);
      toast.error('Không thể lưu phí hệ thống. Vui lòng thử lại.');
    } finally {
      setIsSavingSystemFee(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Ví hệ thống</h1>
        <p className="text-gray-600 mt-1">Theo dõi và quản lý ví của hệ thống EduMatch</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-[#F2E5BF]">
          <TabsTrigger value="wallet" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]">
            <Wallet className="h-4 w-4 mr-2" />
            Ví hệ thống
          </TabsTrigger>
          <TabsTrigger value="system-fee" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]">
            <Settings className="h-4 w-4 mr-2" />
            Phí hệ thống
          </TabsTrigger>
        </TabsList>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-gray-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  {isLoadingWallet ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số dư ví hệ thống</p>
                  {isLoadingWallet ? (
                    <div className="h-9 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <>
                      <p className="text-3xl font-semibold text-gray-900">{formatCurrency(currentBalance)}</p>
                      {dashboard && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tổng số dư người dùng: {formatCurrency(dashboard.totalUserAvailableBalance)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  {isLoadingTransactions ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <span className="text-sm text-gray-500">Tổng thu</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng tiền vào ví</p>
                  {isLoadingTransactions ? (
                    <div className="h-9 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <>
                      <p className="text-3xl font-semibold text-green-600">{formatCurrency(totalCredit)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {transactions.filter(t => t.transactionType === WalletTransactionType.CREDIT).length} giao dịch
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-red-50">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  {isLoadingTransactions ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <span className="text-sm text-gray-500">Tổng chi</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng tiền ra ví</p>
                  {isLoadingTransactions ? (
                    <div className="h-9 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <>
                      <p className="text-3xl font-semibold text-red-600">{formatCurrency(totalDebit)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {transactions.filter(t => t.transactionType === WalletTransactionType.DEBIT).length} giao dịch
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Info */}
          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-300">
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin ví hệ thống</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số dư ví hệ thống:</span>
                      <span className="font-semibold">{formatCurrency(dashboard.platformRevenueBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số dư sẽ trả cho gia sư:</span>
                      <span className="font-semibold">{formatCurrency(dashboard.pendingTutorPayoutBalance)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

      {/* Filters */}
      <Card className="bg-white border border-gray-300">
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
      <Card className="bg-white border border-gray-300">
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
                  paginatedTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">
                          {startIndex + index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.transactionType === WalletTransactionType.CREDIT ? (
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
                        {transaction.booking?.learnerEmail || transaction.booking?.tutorEmail || 'Hệ thống'}
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
                          transaction.transactionType === WalletTransactionType.CREDIT ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === WalletTransactionType.CREDIT ? '+' : '-'}
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
        </TabsContent>

        {/* System Fee Tab */}
        <TabsContent value="system-fee" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Quản lý Phí hệ thống</h2>
              <p className="text-gray-600 mt-1">Cấu hình các loại phí hệ thống</p>
            </div>
            <Button onClick={handleCreateSystemFee} className="bg-[#257180] hover:bg-[#257180]/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Thêm phí hệ thống
            </Button>
          </div>

          {/* System Fees Table */}
          <Card className="bg-white border border-gray-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách phí hệ thống</CardTitle>
                <Badge variant="outline">{systemFees.length} phí</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSystemFees ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
                  <span className="ml-2 text-gray-600">Đang tải danh sách phí hệ thống...</span>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-[60px]">ID</TableHead>
                          <TableHead>Tên phí</TableHead>
                          <TableHead>Phần trăm (%)</TableHead>
                          <TableHead>Số tiền cố định</TableHead>
                          <TableHead>Hiệu lực từ</TableHead>
                          <TableHead>Hiệu lực đến</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemFees.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              Chưa có phí hệ thống nào
                            </TableCell>
                          </TableRow>
                        ) : (
                          systemFees.map((fee) => (
                            <TableRow key={fee.id} className="hover:bg-gray-50">
                              <TableCell>
                                <span className="font-mono text-sm text-gray-600">{fee.id}</span>
                              </TableCell>
                              <TableCell className="font-medium">{fee.name}</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {fee.percentage !== undefined && fee.percentage !== null ? `${fee.percentage}%` : '-'}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {fee.fixedAmount !== undefined && fee.fixedAmount !== null ? formatCurrency(fee.fixedAmount) : '-'}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(fee.effectiveFrom).toLocaleDateString('vi-VN')}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {fee.effectiveTo ? new Date(fee.effectiveTo).toLocaleDateString('vi-VN') : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge className={fee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {fee.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSystemFee(fee)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {systemFeeTotalPages > 1 && (
                    <div className="mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setSystemFeePage(prev => Math.max(1, prev - 1))}
                              className={systemFeePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {[...Array(Math.min(systemFeeTotalPages, 5))].map((_, idx) => {
                            let pageNum;
                            if (systemFeeTotalPages <= 5) {
                              pageNum = idx + 1;
                            } else if (systemFeePage <= 3) {
                              pageNum = idx + 1;
                            } else if (systemFeePage >= systemFeeTotalPages - 2) {
                              pageNum = systemFeeTotalPages - 4 + idx;
                            } else {
                              pageNum = systemFeePage - 2 + idx;
                            }
                            
                            return (
                              <PaginationItem key={idx}>
                                <PaginationLink
                                  onClick={() => setSystemFeePage(pageNum)}
                                  isActive={systemFeePage === pageNum}
                                  className="cursor-pointer"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setSystemFeePage(prev => Math.min(systemFeeTotalPages, prev + 1))}
                              className={systemFeePage === systemFeeTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Fee Dialog */}
      <Dialog open={showSystemFeeDialog} onOpenChange={setShowSystemFeeDialog}>
        <DialogContent className="max-w-2xl border-gray-300 shadow-lg">
          <DialogHeader>
            <DialogTitle>{editingSystemFee ? 'Chỉnh sửa Phí hệ thống' : 'Thêm Phí hệ thống'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tên phí hệ thống <span className="text-red-500">*</span>
              </label>
              <Input
                value={systemFeeForm.name}
                onChange={(e) => setSystemFeeForm({ ...systemFeeForm, name: e.target.value })}
                placeholder="Nhập tên phí hệ thống"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Phần trăm (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={systemFeeForm.percentage || ''}
                  onChange={(e) => setSystemFeeForm({ 
                    ...systemFeeForm, 
                    percentage: e.target.value ? parseFloat(e.target.value) : undefined,
                    fixedAmount: e.target.value ? undefined : systemFeeForm.fixedAmount
                  })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Số tiền cố định (VND)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={systemFeeForm.fixedAmount || ''}
                  onChange={(e) => setSystemFeeForm({ 
                    ...systemFeeForm, 
                    fixedAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    percentage: e.target.value ? undefined : systemFeeForm.percentage
                  })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={systemFeeForm.isActive ?? true}
                onChange={(e) => setSystemFeeForm({ ...systemFeeForm, isActive: e.target.checked })}
                className="w-4 h-4 text-[#257180] border-gray-300 rounded focus:ring-[#257180]"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Kích hoạt
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowSystemFeeDialog(false)}
              disabled={isSavingSystemFee}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveSystemFee}
              disabled={isSavingSystemFee}
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {isSavingSystemFee ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
