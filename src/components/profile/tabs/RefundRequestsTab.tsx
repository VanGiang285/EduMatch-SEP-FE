"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/basic/badge';
import { Textarea } from '@/components/ui/form/textarea';
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
  DialogFooter,
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
import { Search, Plus, Eye, Loader2, ArrowUpDown, Upload, X, Image as ImageIcon, Video, Receipt } from 'lucide-react';
import { BookingRefundRequestService, RefundPolicyService, BookingService, MediaService } from '@/services';
import { BookingRefundRequestDto, RefundPolicyDto, BookingDto } from '@/types/backend';
import { BookingRefundRequestStatus } from '@/types/enums';
import { BookingRefundRequestCreateRequest } from '@/types/requests';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/data/mockLearnerData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'createdAt' | 'status';
type SortOrder = 'asc' | 'desc';

const getStatusLabel = (status: BookingRefundRequestStatus): string => {
  switch (status) {
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

const getStatusColor = (status: BookingRefundRequestStatus): string => {
  switch (status) {
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

export function RefundRequestsTab() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingRefundRequestStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<BookingRefundRequestDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [requests, setRequests] = useState<BookingRefundRequestDto[]>([]);
  const [policies, setPolicies] = useState<RefundPolicyDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    bookingId: 0,
    refundPolicyId: 0,
    reason: '',
    fileUrls: [] as string[],
  });
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchRequests();
      fetchPolicies();
    }
  }, [user?.email, statusFilter]);

  const fetchRequests = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      let response;
      
      if (statusFilter === 'all') {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          BookingRefundRequestService.getByLearnerEmail(user.email, BookingRefundRequestStatus.Pending),
          BookingRefundRequestService.getByLearnerEmail(user.email, BookingRefundRequestStatus.Approved),
          BookingRefundRequestService.getByLearnerEmail(user.email, BookingRefundRequestStatus.Rejected),
        ]);
        
        const allRequests: BookingRefundRequestDto[] = [];
        if (pendingRes.success && pendingRes.data) allRequests.push(...pendingRes.data);
        if (approvedRes.success && approvedRes.data) allRequests.push(...approvedRes.data);
        if (rejectedRes.success && rejectedRes.data) allRequests.push(...rejectedRes.data);
        
        setRequests(allRequests);
      } else {
        response = await BookingRefundRequestService.getByLearnerEmail(user.email, statusFilter);
        if (response.success && response.data) {
          setRequests(response.data);
        } else {
          setRequests([]);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Không thể tải danh sách yêu cầu hoàn tiền');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      setLoadingPolicies(true);
      const response = await RefundPolicyService.getAll(true);
      if (response.success && response.data) {
        setPolicies(response.data);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoadingPolicies(false);
    }
  };

  const fetchBookings = async () => {
    if (!user?.email) return;
    
    try {
      setLoadingBookings(true);
      const response = await BookingService.getAllByLearnerEmailNoPaging(user.email);
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Không thể tải danh sách booking');
    } finally {
      setLoadingBookings(false);
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
    let filtered = requests;

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
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
  }, [requests, sortField, sortOrder]);

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
        toast.error('Không thể tải chi tiết yêu cầu hoàn tiền');
      }
    } catch (error) {
      console.error('Error fetching request detail:', error);
      toast.error('Không thể tải chi tiết yêu cầu hoàn tiền');
    }
  };

  const handleCreate = () => {
    setFormData({ bookingId: 0, refundPolicyId: 0, reason: '', fileUrls: [] });
    setUploadingFiles([]);
    setUploadedUrls([]);
    fetchBookings();
    setShowCreateDialog(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        toast.error('Chỉ chấp nhận file ảnh hoặc video');
        return false;
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} vượt quá 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const mediaType = file.type.startsWith('image/') ? 'Image' : 'Video';
        const response = await MediaService.uploadFile({
          file,
          ownerEmail: user.email!,
          mediaType: mediaType as 'Image' | 'Video',
        });
        
        if (response.success && response.data?.secureUrl) {
          return response.data.secureUrl;
        } else {
          throw new Error(`Không thể upload file ${file.name}`);
        }
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedUrls(prev => [...prev, ...urls]);
      setUploadingFiles(prev => [...prev, ...validFiles]);
      toast.success(`Đã upload ${urls.length} file thành công`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Không thể upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitCreate = async () => {
    if (!user?.email) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    if (!formData.bookingId || !formData.refundPolicyId) {
      toast.error('Vui lòng chọn booking và chính sách hoàn tiền');
      return;
    }

    try {
      setIsProcessing(true);
      const allFileUrls = [...formData.fileUrls, ...uploadedUrls];
      const request: BookingRefundRequestCreateRequest = {
        bookingId: formData.bookingId,
        learnerEmail: user.email,
        refundPolicyId: formData.refundPolicyId,
        reason: formData.reason.trim() || undefined,
        fileUrls: allFileUrls.length > 0 ? allFileUrls : undefined,
      };
      const response = await BookingRefundRequestService.create(request);
      if (response.success) {
        toast.success('Đã tạo yêu cầu hoàn tiền');
        setShowCreateDialog(false);
        setFormData({ bookingId: 0, refundPolicyId: 0, reason: '', fileUrls: [] });
        setUploadingFiles([]);
        setUploadedUrls([]);
        fetchRequests();
      } else {
        toast.error(response.message || 'Không thể tạo yêu cầu hoàn tiền');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Không thể tạo yêu cầu hoàn tiền');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Yêu cầu Hoàn tiền</h2>
          <p className="text-gray-600 mt-1">Quản lý các yêu cầu hoàn tiền của bạn</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#257180] hover:bg-[#257180]/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Tạo yêu cầu mới
        </Button>
      </div>

      <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
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

      <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách yêu cầu hoàn tiền</CardTitle>
            <div className="flex items-center gap-2 text-gray-600">
              <Receipt className="h-4 w-4" />
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
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Không có yêu cầu hoàn tiền nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((req, index) => (
                        <TableRow key={req.id} className="hover:bg-gray-50">
                          <TableCell className="text-left">
                            <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
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
                            <Badge className={getStatusColor(req.status)}>
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
                      ))
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
            <div className="space-y-4">
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
                <div>
                  <Label className="text-sm text-gray-600">Ngày tạo</Label>
                  <p className="font-medium text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                {selectedRequest.processedAt && (
                  <div>
                    <Label className="text-sm text-gray-600">Ngày xử lý</Label>
                    <p className="font-medium text-gray-900">{new Date(selectedRequest.processedAt).toLocaleString('vi-VN')}</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu hoàn tiền mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="booking">Booking *</Label>
              {loadingBookings ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />
                </div>
              ) : (
                <Select
                  value={formData.bookingId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, bookingId: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn booking" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id.toString()}>
                        Booking #{booking.id} - {formatCurrency(booking.totalAmount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="policy">Chính sách hoàn tiền *</Label>
              {loadingPolicies ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />
                </div>
              ) : (
                <Select
                  value={formData.refundPolicyId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, refundPolicyId: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn chính sách hoàn tiền" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id.toString()}>
                        {policy.name} ({policy.refundPercentage}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="reason">Lý do (tùy chọn)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Nhập lý do yêu cầu hoàn tiền..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label>Bằng chứng (ảnh/video) - Tùy chọn</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#257180] hover:bg-[#257180]/5 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="flex items-center gap-2">
                      {uploading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-[#257180]" />
                          <span className="text-sm text-gray-600">Đang upload...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-[#257180]" />
                          <span className="text-sm text-gray-700">Chọn ảnh/video</span>
                        </>
                      )}
                    </div>
                  </label>
                  <span className="text-xs text-gray-500">Tối đa 10MB/file</span>
                </div>
                {uploadedUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Đã upload ({uploadedUrls.length} file):</p>
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedUrls.map((url, index) => {
                        const file = uploadingFiles[index];
                        const isImage = file?.type.startsWith('image/');
                        return (
                          <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                            {isImage ? (
                              <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-24 object-cover" />
                            ) : (
                              <div className="w-full h-24 flex items-center justify-center bg-gray-100">
                                <Video className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="p-2">
                              <p className="text-xs text-gray-600 truncate">{file?.name || `File ${index + 1}`}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setFormData({ bookingId: 0, refundPolicyId: 0, reason: '', fileUrls: [] });
              setUploadingFiles([]);
              setUploadedUrls([]);
            }} className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
              Hủy
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isProcessing || uploading} className="bg-[#257180] hover:bg-[#257180]/90 text-white">
              {isProcessing || uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Tạo yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

