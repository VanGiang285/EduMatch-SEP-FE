'use client';
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
} from '@/components/ui/feedback/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/feedback/alert-dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Label } from '@/components/ui/form/label';
import { Search, Eye, CheckCircle, XCircle, MapPin, Calendar, ArrowUpDown, Loader2 } from 'lucide-react';
import { 
  formatCurrency,
  getClassRequestStatusText,
  getClassRequestStatusColor,
  getTeachingModeText,
  getDayOfWeekText,
} from '@/data/mockBusinessAdminData';
import { ClassRequestService, ClassRequestItemDto, ClassRequestDetailDto } from '@/services/classRequestService';
import { TutorApplicationService, TutorApplicationItemDto } from '@/services/tutorApplicationService';
import { useCustomToast } from '@/hooks/useCustomToast';
import { ClassRequestStatus, TeachingMode } from '@/types/enums';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'learnerName' | 'subjectName' | 'createdAt';
type SortOrder = 'asc' | 'desc';

// Map status filter value to ClassRequestStatus enum
const getStatusFromFilter = (filter: string): ClassRequestStatus | null => {
  switch (filter) {
    case 'pending': return ClassRequestStatus.Reviewing; // 1 - Chờ duyệt
    case 'open': return ClassRequestStatus.Open; // 0 - Đã duyệt/Đang mở
    case 'selected': return ClassRequestStatus.Selected; // 2 - Đã chọn
    case 'closed': return ClassRequestStatus.Closed; // 3 - Đã đóng
    case 'cancelled': return ClassRequestStatus.Cancelled; // 4 - Đã hủy
    case 'expired': return ClassRequestStatus.Expired; // 5 - Hết hạn
    default: return null;
  }
};

export function ManageClassRequests() {
  const { showSuccess, showError } = useCustomToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending'); // Mặc định: Chờ duyệt
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ClassRequestDetailDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [requests, setRequests] = useState<ClassRequestItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicants, setApplicants] = useState<TutorApplicationItemDto[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Load danh sách yêu cầu theo status
  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      try {
        const targetStatus = getStatusFromFilter(statusFilter);
        let allRequests: ClassRequestItemDto[] = [];
        
        if (statusFilter === 'pending' || targetStatus === ClassRequestStatus.Reviewing) {
          // Chờ duyệt - Reviewing (1) - chỉ gọi LIST_PENDING
          const response = await ClassRequestService.getPendingClassRequests();
          console.log('[Business Admin] Loading PENDING requests:', response);
          if (response.success && response.data) {
            allRequests = response.data;
            // Log status của từng request để debug
            response.data.forEach((req, idx) => {
              const statusNum = getStatusNumber(req.status);
              console.log(`[Business Admin] PENDING Request ${idx}: id=${req.id}, status="${req.status}" (parsed=${statusNum})`);
            });
          } else {
            console.error('[Business Admin] Failed to load PENDING:', response.message);
            if (response.message) {
              showError('Lỗi', response.message);
            }
          }
        } else if (statusFilter === 'open' || targetStatus === ClassRequestStatus.Open) {
          // Đã duyệt/Đang mở - Open (0) - chỉ gọi LIST_OPEN
          const response = await ClassRequestService.getOpenClassRequests();
          console.log('[Business Admin] Loading OPEN requests:', response);
          if (response.success && response.data) {
            allRequests = response.data;
            // Log status của từng request để debug
            response.data.forEach((req, idx) => {
              const statusNum = getStatusNumber(req.status);
              console.log(`[Business Admin] OPEN Request ${idx}: id=${req.id}, status="${req.status}" (parsed=${statusNum})`);
            });
          } else {
            console.error('[Business Admin] Failed to load OPEN:', response.message);
            if (response.message) {
              showError('Lỗi', response.message);
            }
          }
        } else {
          // Các status khác (Selected, Closed, Cancelled, Expired)
          // Gọi cả LIST_PENDING và LIST_OPEN, merge lại rồi filter theo status
          console.log('[Business Admin] Loading ALL requests for status:', targetStatus);
          const [pendingResponse, openResponse] = await Promise.all([
            ClassRequestService.getPendingClassRequests(),
            ClassRequestService.getOpenClassRequests(),
          ]);
          
          const pendingData = pendingResponse.success && pendingResponse.data ? pendingResponse.data : [];
          const openData = openResponse.success && openResponse.data ? openResponse.data : [];
          
          // Merge và loại bỏ duplicate (theo ID)
          const merged = [...pendingData, ...openData];
          const uniqueRequests = merged.filter((req, index, self) => 
            index === self.findIndex(r => r.id === req.id)
          );
          
          allRequests = uniqueRequests;
        }

        // Filter theo status nếu cần (cho các status khác pending/open)
        if (targetStatus !== null && targetStatus !== ClassRequestStatus.Reviewing && targetStatus !== ClassRequestStatus.Open) {
          allRequests = allRequests.filter(req => {
            const reqStatus = getStatusNumber(req.status);
            return reqStatus === targetStatus;
          });
        }
        
        console.log('[Business Admin] Final filtered requests:', allRequests.length, allRequests);
        setRequests(allRequests);
      } catch (err: any) {
        console.error('[Business Admin] Error loading class requests:', err);
        showError('Lỗi', 'Không thể tải danh sách yêu cầu. Vui lòng thử lại.');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Load chi tiết yêu cầu và danh sách gia sư ứng tuyển khi mở dialog
  useEffect(() => {
    if (selectedRequest?.id && showDetailDialog) {
      const loadDetail = async () => {
        setLoadingDetail(true);
        setLoadingApplicants(false);
        try {
          // Load chi tiết yêu cầu
          const detailResponse = await ClassRequestService.getClassRequestById(selectedRequest.id);
          if (detailResponse.success && detailResponse.data) {
            setSelectedRequest(detailResponse.data);
            
            // Nếu đã duyệt (Open), load danh sách gia sư ứng tuyển
            const statusNum = getStatusNumber(detailResponse.data.status);
            console.log(`[Business Admin] Detail dialog: status="${detailResponse.data.status}" (parsed=${statusNum})`);
            
            if (statusNum === ClassRequestStatus.Open) {
              setLoadingApplicants(true);
              const applicantsResponse = await TutorApplicationService.getApplicationsByClassRequest(selectedRequest.id);
              if (applicantsResponse.success && applicantsResponse.data) {
                setApplicants(applicantsResponse.data);
              }
              setLoadingApplicants(false);
            }
          }
        } catch (err: any) {
          console.error('Error loading detail:', err);
          showError('Lỗi', 'Không thể tải thông tin chi tiết');
        } finally {
          setLoadingDetail(false);
        }
      };

      loadDetail();
    } else {
      setSelectedRequest(null);
      setApplicants([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest?.id, showDetailDialog]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    const filtered = requests.filter((request) => {
      const matchesSearch = request.learnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          // Sort by index (will be displayed as index)
          aValue = filtered.indexOf(a);
          bValue = filtered.indexOf(b);
          break;
        case 'learnerName':
          aValue = (a.learnerName || '').toLowerCase();
          bValue = (b.learnerName || '').toLowerCase();
          break;
        case 'subjectName':
          aValue = (a.subjectName || '').toLowerCase();
          bValue = (b.subjectName || '').toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
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

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleViewDetail = async (request: ClassRequestItemDto) => {
    // Load chi tiết từ API
    try {
      const response = await ClassRequestService.getClassRequestById(request.id);
      if (response.success && response.data) {
        setSelectedRequest(response.data);
        setShowDetailDialog(true);
      } else {
        showError('Lỗi', 'Không thể tải thông tin chi tiết');
      }
    } catch (err: any) {
      console.error('Error loading detail:', err);
      showError('Lỗi', 'Không thể tải thông tin chi tiết');
    }
  };

  const handleApprove = async (requestId: number) => {
    setIsApproving(true);
    try {
      const response = await ClassRequestService.approveOrRejectClassRequest(requestId, {
        isApproved: true,
      });

      if (response.success) {
        showSuccess('Thành công', 'Đã duyệt yêu cầu mở lớp thành công');
        setShowDetailDialog(false);
        // Reload danh sách - yêu cầu đã duyệt sẽ chuyển từ PENDING sang OPEN
        // Nếu đang filter "pending", reload PENDING. Nếu filter "open", reload OPEN
        const targetStatus = getStatusFromFilter(statusFilter);
        if (statusFilter === 'pending' || targetStatus === ClassRequestStatus.Reviewing) {
          const reloadResponse = await ClassRequestService.getPendingClassRequests();
          if (reloadResponse.success && reloadResponse.data) {
            setRequests(reloadResponse.data);
          }
        } else if (statusFilter === 'open' || targetStatus === ClassRequestStatus.Open) {
          const reloadResponse = await ClassRequestService.getOpenClassRequests();
          if (reloadResponse.success && reloadResponse.data) {
            setRequests(reloadResponse.data);
          }
        } else {
          // Reload cả 2 và merge
          const [pendingResponse, openResponse] = await Promise.all([
            ClassRequestService.getPendingClassRequests(),
            ClassRequestService.getOpenClassRequests(),
          ]);
          const pendingData = pendingResponse.success && pendingResponse.data ? pendingResponse.data : [];
          const openData = openResponse.success && openResponse.data ? openResponse.data : [];
          const merged = [...pendingData, ...openData];
          const uniqueRequests = merged.filter((req, index, self) => 
            index === self.findIndex(r => r.id === req.id)
          );
          if (targetStatus !== null) {
            const filtered = uniqueRequests.filter(req => {
              const reqStatus = getStatusNumber(req.status);
              return reqStatus === targetStatus;
            });
            setRequests(filtered);
          } else {
            setRequests(uniqueRequests);
          }
        }
      } else {
        throw new Error(response.message || 'Duyệt yêu cầu thất bại');
      }
    } catch (err: any) {
      console.error('Error approving request:', err);
      showError('Lỗi', err.message || 'Không thể duyệt yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showError('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    if (!selectedRequest) {
      showError('Lỗi', 'Không tìm thấy yêu cầu');
      return;
    }

    setIsRejecting(true);
    try {
      const response = await ClassRequestService.approveOrRejectClassRequest(selectedRequest.id, {
        isApproved: false,
        rejectionReason: rejectReason.trim(),
      });

      if (response.success) {
        showSuccess('Thành công', 'Đã từ chối yêu cầu mở lớp');
        setShowRejectDialog(false);
        setShowDetailDialog(false);
        setRejectReason('');
        // Reload danh sách - yêu cầu bị từ chối sẽ không còn trong PENDING
        // Nếu đang filter "pending", reload PENDING
        const targetStatus = getStatusFromFilter(statusFilter);
        if (statusFilter === 'pending' || targetStatus === ClassRequestStatus.Reviewing) {
          const reloadResponse = await ClassRequestService.getPendingClassRequests();
          if (reloadResponse.success && reloadResponse.data) {
            setRequests(reloadResponse.data);
          }
        } else if (statusFilter === 'open' || targetStatus === ClassRequestStatus.Open) {
          const reloadResponse = await ClassRequestService.getOpenClassRequests();
          if (reloadResponse.success && reloadResponse.data) {
            setRequests(reloadResponse.data);
          }
        } else {
          // Reload cả 2 và merge
          const [pendingResponse, openResponse] = await Promise.all([
            ClassRequestService.getPendingClassRequests(),
            ClassRequestService.getOpenClassRequests(),
          ]);
          const pendingData = pendingResponse.success && pendingResponse.data ? pendingResponse.data : [];
          const openData = openResponse.success && openResponse.data ? openResponse.data : [];
          const merged = [...pendingData, ...openData];
          const uniqueRequests = merged.filter((req, index, self) => 
            index === self.findIndex(r => r.id === req.id)
          );
          if (targetStatus !== null) {
            const filtered = uniqueRequests.filter(req => {
              const reqStatus = getStatusNumber(req.status);
              return reqStatus === targetStatus;
            });
            setRequests(filtered);
          } else {
            setRequests(uniqueRequests);
          }
        }
      } else {
        throw new Error(response.message || 'Từ chối yêu cầu thất bại');
      }
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      showError('Lỗi', err.message || 'Không thể từ chối yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Helper để lấy teaching mode text
  const getModeText = (mode: string | number) => {
    if (typeof mode === 'number') {
      if (mode === TeachingMode.Offline) return 'Tại nhà';
      if (mode === TeachingMode.Online) return 'Trực tuyến';
      if (mode === TeachingMode.Hybrid) return 'Kết hợp';
    }
    if (typeof mode === 'string') {
      if (mode === 'Offline' || mode === TeachingMode.Offline.toString()) return 'Tại nhà';
      if (mode === 'Online' || mode === TeachingMode.Online.toString()) return 'Trực tuyến';
      if (mode === 'Hybrid' || mode === TeachingMode.Hybrid.toString()) return 'Kết hợp';
    }
    return getTeachingModeText(mode as number);
  };

  // Helper để lấy status number từ string enum name hoặc number
  const getStatusNumber = (status: string | number | null | undefined): number => {
    if (status === null || status === undefined) {
      console.log('[Business Admin] getStatusNumber: status is null/undefined');
      return -1; // Invalid status
    }
    
    // Nếu là number, trả về trực tiếp
    if (typeof status === 'number') {
      console.log(`[Business Admin] getStatusNumber: status is number: ${status}`);
      return status;
    }
    
    // Nếu là string, thử parse số trước
    const statusStr = String(status).trim();
    const parsed = parseInt(statusStr, 10);
    if (!isNaN(parsed)) {
      console.log(`[Business Admin] getStatusNumber: parsed string "${statusStr}" to number: ${parsed}`);
      return parsed;
    }
    
    // Nếu không phải số, map từ enum name (case-insensitive)
    const statusMap: Record<string, number> = {
      'Open': ClassRequestStatus.Open,           // 0
      'Reviewing': ClassRequestStatus.Reviewing, // 1
      'Selected': ClassRequestStatus.Selected,   // 2
      'Closed': ClassRequestStatus.Closed,       // 3
      'Cancelled': ClassRequestStatus.Cancelled, // 4
      'Expired': ClassRequestStatus.Expired,     // 5
      // Case-insensitive variants
      'open': ClassRequestStatus.Open,
      'reviewing': ClassRequestStatus.Reviewing,
      'selected': ClassRequestStatus.Selected,
      'closed': ClassRequestStatus.Closed,
      'cancelled': ClassRequestStatus.Cancelled,
      'expired': ClassRequestStatus.Expired,
      // Alternative names (Pending = Reviewing)
      'Pending': ClassRequestStatus.Reviewing,  // 1
      'pending': ClassRequestStatus.Reviewing,   // 1
    };
    
    const mapped = statusMap[statusStr] ?? -1;
    if (mapped === -1) {
      console.warn(`[Business Admin] getStatusNumber: Unknown status string "${statusStr}", returning -1`);
    } else {
      console.log(`[Business Admin] getStatusNumber: status string "${statusStr}" mapped to ${mapped}`);
    }
    return mapped;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Yêu cầu mở lớp</h1>
        <p className="text-gray-600 mt-1">Duyệt yêu cầu mở lớp từ học viên</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên học viên hoặc môn học..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="open">Đã duyệt/Đang mở</SelectItem>
                <SelectItem value="selected">Đã chọn gia sư</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="expired">Hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách yêu cầu</CardTitle>
            <Badge variant="outline">{filteredRequests.length} yêu cầu</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
              <span className="ml-2 text-gray-600">Đang tải danh sách...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[80px]">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="h-8 px-2">
                          ID <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('learnerName')} className="h-8 px-2">
                          Học viên <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('subjectName')} className="h-8 px-2">
                          Môn học <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Hình thức</TableHead>
                      <TableHead>Địa điểm</TableHead>
                      <TableHead>Số buổi</TableHead>
                      <TableHead>Mức giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          Không tìm thấy yêu cầu nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((request, index) => {
                        const displayIndex = startIndex + index + 1; // ID hiển thị theo index (1, 2, 3...)
                        const statusNum = getStatusNumber(request.status);
                        console.log(`[Business Admin] Request ${request.id}: status="${request.status}" (type=${typeof request.status}), parsed=${statusNum}`);
                        const displayName = request.title || `${request.subjectName || ''} ${request.level || ''}`.trim();
                        
                        return (
                          <TableRow key={request.id} className="hover:bg-gray-50">
                            <TableCell>
                              <span className="font-mono text-sm text-gray-600">{displayIndex}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={request.avatarUrl} alt={request.learnerName} />
                                  <AvatarFallback className="bg-[#257180] text-white">
                                    {request.learnerName?.substring(0, 2).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{request.learnerName || 'N/A'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{request.subjectName || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{request.level || ''}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getModeText(request.mode)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              <div>
                                <p className="text-xs">-</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{request.expectedSessions} buổi</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div>
                                {request.targetUnitPriceMin && request.targetUnitPriceMax ? (
                                  <>
                                    <p className="text-gray-900">
                                      {formatCurrency(request.targetUnitPriceMin)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      - {formatCurrency(request.targetUnitPriceMax)}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-gray-500">-</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {statusNum === -1 ? (
                                <Badge className="bg-gray-100 text-gray-800">
                                  Không xác định ({String(request.status)})
                                </Badge>
                              ) : (
                                <Badge className={getClassRequestStatusColor(statusNum)}>
                                  {getClassRequestStatusText(statusNum)}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(request)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu mở lớp</DialogTitle>
          </DialogHeader>
          
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
              <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
            </div>
          ) : selectedRequest ? (
            <div className="space-y-6">
              {/* Learner Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-[#257180] text-white text-2xl">
                    {selectedRequest.learnerEmail?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedRequest.learnerEmail || 'N/A'}</h3>
                  <p className="text-gray-600">{selectedRequest.learnerEmail}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getClassRequestStatusColor(getStatusNumber(selectedRequest.status))}>
                      {getClassRequestStatusText(getStatusNumber(selectedRequest.status))}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Tạo ngày {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Class Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Môn học</p>
                      <p className="font-medium text-gray-900">{selectedRequest.subjectName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cấp độ</p>
                      <p className="font-medium text-gray-900">{selectedRequest.level || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hình thức</p>
                      <Badge variant="outline">
                        {getModeText(selectedRequest.mode)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số buổi dự kiến</p>
                      <p className="font-medium text-gray-900">{selectedRequest.expectedSessions} buổi</p>
                    </div>
                    {selectedRequest.targetUnitPriceMin && selectedRequest.targetUnitPriceMax && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Mức giá mong muốn</p>
                        <p className="font-medium text-[#257180]">
                          {formatCurrency(selectedRequest.targetUnitPriceMin)} - {formatCurrency(selectedRequest.targetUnitPriceMax)}/buổi
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  {(selectedRequest.addressLine || selectedRequest.subDistrictName || selectedRequest.provinceName) && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Địa điểm học</p>
                          {selectedRequest.addressLine && (
                            <p className="font-medium text-gray-900">{selectedRequest.addressLine}</p>
                          )}
                          <p className="font-medium text-gray-900">
                            {selectedRequest.subDistrictName || ''}, {selectedRequest.provinceName || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {(selectedRequest.learningGoal || selectedRequest.tutorRequirement) && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Mô tả chi tiết</p>
                      {selectedRequest.learningGoal && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Mục tiêu học tập:</p>
                          <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.learningGoal}</p>
                        </div>
                      )}
                      {selectedRequest.tutorRequirement && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Yêu cầu gia sư:</p>
                          <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.tutorRequirement}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejection Reason (nếu bị từ chối) */}
                  {selectedRequest.rejectionReason && (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</p>
                      <p className="text-red-900">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}

                  {/* Application Stats */}
                  {getStatusNumber(selectedRequest.status) === ClassRequestStatus.Open && (
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      {loadingApplicants ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                          <p className="text-sm text-green-800">Đang tải danh sách gia sư ứng tuyển...</p>
                        </div>
                      ) : (
                        <p className="text-sm text-green-800">
                          Đã có <span className="font-semibold">{applicants.length} gia sư</span> ứng tuyển vào lớp này
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Schedule & Applicants */}
                <div className="space-y-6">
                  {/* Schedule */}
                  {selectedRequest.slots && selectedRequest.slots.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Calendar className="h-5 w-5" />
                          Lịch học dự kiến
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedRequest.slots.map((slot: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Badge variant="outline">{getDayOfWeekText(slot.dayOfWeek)}</Badge>
                              <span className="text-gray-900">
                                {slot.slot?.startTime || slot.startTime || ''} - {slot.slot?.endTime || slot.endTime || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Applicants (nếu đã duyệt) */}
                  {getStatusNumber(selectedRequest.status) === ClassRequestStatus.Open && applicants.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Gia sư ứng tuyển ({applicants.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                          {applicants.map((applicant) => (
                            <div key={applicant.applicationId} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={applicant.avatarUrl} />
                                  <AvatarFallback className="bg-[#257180] text-white text-xs">
                                    {applicant.tutorName?.substring(0, 2).toUpperCase() || 'GS'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{applicant.tutorName}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(applicant.appliedAt).toLocaleDateString('vi-VN')}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 line-clamp-2">{applicant.message}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Actions - Chỉ hiển thị nút Duyệt/Từ chối khi status = Reviewing (1) hoặc Pending */}
              {(() => {
                const statusNum = getStatusNumber(selectedRequest.status);
                console.log(`[Business Admin] Detail dialog actions: status="${selectedRequest.status}" (parsed=${statusNum}), Reviewing=${ClassRequestStatus.Reviewing}`);
                return statusNum === ClassRequestStatus.Reviewing;
              })() && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetailDialog(false)}
                    disabled={isApproving || isRejecting}
                    className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                  >
                    Đóng
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowRejectDialog(true);
                    }}
                    disabled={isApproving || isRejecting}
                    className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button
                    className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={isApproving || isRejecting}
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang duyệt...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Duyệt yêu cầu
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy thông tin chi tiết</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối yêu cầu mở lớp</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối yêu cầu này
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Lý do từ chối *</Label>
            <Textarea
              id="reject-reason"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={4}
              disabled={isRejecting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setRejectReason('')}
              disabled={isRejecting}
              className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject} 
              className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang từ chối...
                </>
              ) : (
                'Xác nhận từ chối'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
