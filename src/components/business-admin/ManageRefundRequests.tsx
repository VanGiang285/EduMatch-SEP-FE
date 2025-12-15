'use client';
import React, { useState, useMemo, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/feedback/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { Label } from '@/components/ui/form/label';
import { Search, Eye, Loader2, ArrowUpDown, CheckCircle, XCircle, FileText } from 'lucide-react';
import { BookingRefundRequestService } from '@/services';
import { BookingRefundRequestDto } from '@/types/backend';
import { BookingRefundRequestStatus, EnumHelpers } from '@/types/enums';
import { useCustomToast } from '@/hooks/useCustomToast';
import { formatCurrency } from '@/data/mockBusinessAdminData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'learnerEmail' | 'createdAt' | 'status';
type SortOrder = 'asc' | 'desc';

const getStatusLabel = (status: BookingRefundRequestStatus | string | number | null | undefined): string => {
  const parsedStatus = EnumHelpers.parseBookingRefundRequestStatus(status);
  switch (parsedStatus) {
    case BookingRefundRequestStatus.Pending:
      return 'Chờ duyệt';
    case BookingRefundRequestStatus.Approved:
      return 'Đã duyệt';
    case BookingRefundRequestStatus.Rejected:
      return 'Đã từ chối';
    default:
      return 'Không xác định';
  }
};

const getStatusColor = (status: BookingRefundRequestStatus | string | number | null | undefined): string => {
  const parsedStatus = EnumHelpers.parseBookingRefundRequestStatus(status);
  switch (parsedStatus) {
    case BookingRefundRequestStatus.Pending:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case BookingRefundRequestStatus.Approved:
      return 'bg-green-100 text-green-800 border-green-200';
    case BookingRefundRequestStatus.Rejected:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function ManageRefundRequests() {
  const { showSuccess, showError } = useCustomToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingRefundRequestStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<BookingRefundRequestDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [requests, setRequests] = useState<BookingRefundRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let response;
      
      if (statusFilter === 'all') {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          BookingRefundRequestService.getAll(BookingRefundRequestStatus.Pending),
          BookingRefundRequestService.getAll(BookingRefundRequestStatus.Approved),
          BookingRefundRequestService.getAll(BookingRefundRequestStatus.Rejected),
        ]);
        
        const allRequests: BookingRefundRequestDto[] = [];
        if (pendingRes.success && pendingRes.data) allRequests.push(...pendingRes.data);
        if (approvedRes.success && approvedRes.data) allRequests.push(...approvedRes.data);
        if (rejectedRes.success && rejectedRes.data) allRequests.push(...rejectedRes.data);
        
        setRequests(allRequests);
      } else {
        response = await BookingRefundRequestService.getAll(statusFilter);
        if (response.success && response.data) {
          setRequests(response.data);
        } else {
          setRequests([]);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showError('Lỗi', 'Không thể tải danh sách yêu cầu hoàn tiền');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredRequests = useMemo(() => {
    let filtered = requests.filter((req) => {
      const learnerName = req.learner?.name || '';
      const email = req.learnerEmail || '';
      const matchesSearch = learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'learnerEmail':
          aValue = a.learnerEmail.toLowerCase();
          bValue = b.learnerEmail.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [requests, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetail = async (request: BookingRefundRequestDto) => {
    try {
      const response = await BookingRefundRequestService.getById(request.id);
      if (response.success && response.data) {
        setSelectedRequest(response.data);
        setShowDetailDialog(true);
      } else {
        showError('Lỗi', 'Không thể tải chi tiết yêu cầu hoàn tiền');
      }
    } catch (error) {
      console.error('Error fetching request detail:', error);
      showError('Lỗi', 'Không thể tải chi tiết yêu cầu hoàn tiền');
    }
  };

  const handleUpdateStatus = async (requestId: number, status: BookingRefundRequestStatus) => {
    try {
      setIsProcessing(true);
      const response = await BookingRefundRequestService.updateStatus(requestId, status);
      if (response.success) {
        showSuccess('Thành công', `Đã ${status === BookingRefundRequestStatus.Approved ? 'duyệt' : 'từ chối'} yêu cầu hoàn tiền`);
        setShowDetailDialog(false);
        fetchRequests();
      } else {
        showError('Lỗi', response.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Lỗi', 'Không thể cập nhật trạng thái');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Yêu cầu Hoàn tiền</h1>
        <p className="text-gray-600 mt-1">Duyệt và quản lý các yêu cầu hoàn tiền từ học viên</p>
      </div>

      <Card className="bg-white border border-gray-300">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email học viên..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter === 'all' ? 'all' : statusFilter.toString()}
              onValueChange={(value) => {
                if (value === 'all') {
                  setStatusFilter('all');
                } else {
                  setStatusFilter(parseInt(value) as BookingRefundRequestStatus);
                }
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={BookingRefundRequestStatus.Pending.toString()}>
                  Chờ duyệt
                </SelectItem>
                <SelectItem value={BookingRefundRequestStatus.Approved.toString()}>
                  Đã duyệt
                </SelectItem>
                <SelectItem value={BookingRefundRequestStatus.Rejected.toString()}>
                  Đã từ chối
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách yêu cầu hoàn tiền</CardTitle>
            <div className="flex items-center gap-2 text-gray-700">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{filteredRequests.length} yêu cầu</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[80px] text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="h-8 px-2">
                          ID <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('learnerEmail')} className="h-8 px-2">
                          Học viên <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">Chính sách hoàn tiền</TableHead>
                      <TableHead className="text-left">Số tiền</TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('status')} className="h-8 px-2">
                          Trạng thái <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('createdAt')} className="h-8 px-2">
                          Ngày tạo <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Không có yêu cầu hoàn tiền nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((req, index) => {
                        const learnerName = req.learner?.name || req.learnerEmail;
                        const learnerAvatar = req.learner?.avatarUrl;
                        return (
                          <TableRow key={req.id} className="hover:bg-gray-50">
                            <TableCell className="text-left">
                              <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                            </TableCell>
                            <TableCell className="text-left">
                              <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F2E5BF]">
                                    {learnerAvatar ? (
                                      <img 
                                        src={learnerAvatar} 
                                        alt={learnerName}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                          if (fallback) {
                                            fallback.style.display = 'flex';
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <div 
                                      className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold text-[#257180] bg-[#F2E5BF] ${learnerAvatar ? 'hidden' : 'flex'}`}
                                      style={{ display: learnerAvatar ? 'none' : 'flex' }}
                                    >
                                      {learnerName.substring(0, 2).toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{learnerName}</p>
                                  <p className="text-xs text-gray-500">{req.learnerEmail}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-left">
                              <p className="text-sm text-gray-900">{req.refundPolicy?.name || 'N/A'}</p>
                              {req.refundPolicy && (
                                <p className="text-xs text-gray-500">{req.refundPolicy.refundPercentage}%</p>
                              )}
                            </TableCell>
                            <TableCell className="text-left">
                              {req.approvedAmount ? (
                                <span className="font-semibold text-[#257180]">{formatCurrency(req.approvedAmount)}</span>
                              ) : req.booking?.totalAmount && req.refundPolicy ? (
                                <span className="text-gray-600">
                                  {formatCurrency((req.booking.totalAmount * req.refundPolicy.refundPercentage) / 100)}
                                </span>
                              ) : (
                                <span className="text-gray-500">Chưa tính</span>
                              )}
                            </TableCell>
                            <TableCell className="text-left">
                              <Badge className={`${getStatusColor(req.status)} border`}>
                                {getStatusLabel(req.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 text-left">
                              {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell className="text-left">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(req)}
                                className="p-2 hover:bg-[#FD8B51] hover:text-white"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

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
                      
                      {[...Array(totalPages)].map((_, idx) => (
                        <PaginationItem key={idx}>
                          <PaginationLink
                            onClick={() => setCurrentPage(idx + 1)}
                            isActive={currentPage === idx + 1}
                            className="cursor-pointer"
                          >
                            {idx + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu hoàn tiền</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">ID Yêu cầu</Label>
                  <p className="font-medium text-gray-900">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Trạng thái</Label>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {getStatusLabel(selectedRequest.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Học viên</Label>
                  <p className="font-medium text-gray-900">{selectedRequest.learner?.name || selectedRequest.learnerEmail}</p>
                  <p className="text-xs text-gray-500">{selectedRequest.learnerEmail}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Ngày tạo</Label>
                  <p className="font-medium text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                {selectedRequest.booking && (
                  <>
                    <div>
                      <Label className="text-sm text-gray-600">ID Booking</Label>
                      <p className="font-medium text-gray-900">{selectedRequest.bookingId}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Tổng tiền booking</Label>
                      <p className="font-medium text-gray-900">{formatCurrency(selectedRequest.booking.totalAmount)}</p>
                    </div>
                  </>
                )}
                {selectedRequest.refundPolicy && (
                  <>
                    <div>
                      <Label className="text-sm text-gray-600">Chính sách hoàn tiền</Label>
                      <p className="font-medium text-gray-900">{selectedRequest.refundPolicy.name}</p>
                      <p className="text-xs text-gray-500">{selectedRequest.refundPolicy.refundPercentage}%</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Số tiền hoàn lại</Label>
                      <p className="font-semibold text-[#257180] text-lg">
                        {selectedRequest.approvedAmount 
                          ? formatCurrency(selectedRequest.approvedAmount)
                          : selectedRequest.booking?.totalAmount
                            ? formatCurrency((selectedRequest.booking.totalAmount * selectedRequest.refundPolicy.refundPercentage) / 100)
                            : 'Chưa tính'}
                      </p>
                    </div>
                  </>
                )}
                {selectedRequest.processedAt && (
                  <div>
                    <Label className="text-sm text-gray-600">Ngày xử lý</Label>
                    <p className="font-medium text-gray-900">{new Date(selectedRequest.processedAt).toLocaleString('vi-VN')}</p>
                  </div>
                )}
                {selectedRequest.processedBy && (
                  <div>
                    <Label className="text-sm text-gray-600">Người xử lý</Label>
                    <p className="font-medium text-gray-900">{selectedRequest.processedBy}</p>
                  </div>
                )}
              </div>

              {selectedRequest.reason && (
                <div>
                  <Label className="text-sm text-gray-600">Lý do yêu cầu hoàn tiền</Label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedRequest.reason}</p>
                </div>
              )}

              {selectedRequest.adminNote && (
                <div>
                  <Label className="text-sm text-gray-600">Ghi chú của admin</Label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedRequest.adminNote}</p>
                </div>
              )}

              {selectedRequest.refundRequestEvidences && selectedRequest.refundRequestEvidences.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600 mb-2">Bằng chứng</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.refundRequestEvidences.map((evidence) => (
                      <div key={evidence.id} className="p-3 border rounded-lg">
                        <a href={evidence.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#257180] hover:underline">
                          Xem bằng chứng #{evidence.id}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.status === BookingRefundRequestStatus.Pending && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
                    Đóng
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus(selectedRequest.id, BookingRefundRequestStatus.Rejected)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Từ chối
                  </Button>
                  <Button
                    className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                    onClick={() => handleUpdateStatus(selectedRequest.id, BookingRefundRequestStatus.Approved)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Duyệt
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

