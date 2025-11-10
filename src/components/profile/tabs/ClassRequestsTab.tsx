"use client";

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
import { Search, Eye, Plus, MapPin, Calendar, ArrowUpDown, Users, Edit, Trash2, Loader2, Clock, BookOpen, GraduationCap, Target, UserCheck, FileText } from 'lucide-react';
import { 
  getClassRequestStatusText,
  getClassRequestStatusColor,
} from '@/data/mockClassRequests';
import { CreateClassRequestDialog } from '@/components/class-requests/CreateClassRequestDialog';
import { ClassRequestService, ClassRequestItemDto, ClassRequestDetailDto } from '@/services/classRequestService';
import { TutorApplicationService, TutorApplicationItemDto } from '@/services/tutorApplicationService';
import { useCustomToast } from '@/hooks/useCustomToast';
import { ClassRequestStatus, TeachingMode } from '@/types/enums';
import { FormatService } from '@/lib/format';

const ITEMS_PER_PAGE = 8;

type SortField = 'id' | 'subjectName' | 'createdAt';
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
    default: return null; // 'all' - Tất cả trạng thái
  }
};

export function ClassRequestsTab() {
  const { showSuccess, showError } = useCustomToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Default: Tất cả trạng thái
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ClassRequestDetailDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<ClassRequestItemDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [requests, setRequests] = useState<ClassRequestItemDto[]>([]);
  const [applicants, setApplicants] = useState<TutorApplicationItemDto[]>([]);

  // Helper để parse status number
  const getStatusNumber = (status: string | number | null | undefined): number => {
    if (status === null || status === undefined) {
      return -1;
    }
    if (typeof status === 'number') {
      return status;
    }
    const statusStr = String(status).trim();
    const parsed = parseInt(statusStr, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
    const statusMap: Record<string, number> = {
      'Open': ClassRequestStatus.Open,
      'Reviewing': ClassRequestStatus.Reviewing,
      'Pending': ClassRequestStatus.Reviewing,
      'Selected': ClassRequestStatus.Selected,
      'Closed': ClassRequestStatus.Closed,
      'Cancelled': ClassRequestStatus.Cancelled,
      'Expired': ClassRequestStatus.Expired,
      'open': ClassRequestStatus.Open,
      'reviewing': ClassRequestStatus.Reviewing,
      'pending': ClassRequestStatus.Reviewing,
      'selected': ClassRequestStatus.Selected,
      'closed': ClassRequestStatus.Closed,
      'cancelled': ClassRequestStatus.Cancelled,
      'expired': ClassRequestStatus.Expired,
    };
    return statusMap[statusStr] ?? -1;
  };

  // Helper để lấy teaching mode text
  const getModeText = (mode: string | number | null | undefined): string => {
    if (mode === null || mode === undefined) {
      return 'Không xác định';
    }
    let modeNum: number = -1;
    if (typeof mode === 'number') {
      modeNum = mode;
    } else if (typeof mode === 'string') {
      const parsed = parseInt(mode, 10);
      if (!isNaN(parsed)) {
        modeNum = parsed;
      } else {
        const modeMap: Record<string, number> = {
          'Offline': TeachingMode.Offline,
          'Online': TeachingMode.Online,
          'Hybrid': TeachingMode.Hybrid,
        };
        modeNum = modeMap[mode] ?? -1;
      }
    } else {
      return 'Không xác định';
    }
    if (modeNum === TeachingMode.Offline) return 'Tại nhà';
    if (modeNum === TeachingMode.Online) return 'Trực tuyến';
    if (modeNum === TeachingMode.Hybrid) return 'Kết hợp';
    return 'Không xác định';
  };

  // Load danh sách yêu cầu theo status filter
  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      try {
        const targetStatus = getStatusFromFilter(statusFilter);
        let allRequests: ClassRequestItemDto[] = [];

        if (statusFilter === 'all') {
          // Load tất cả các status
          const [pendingRes, openRes, expiredRes, rejectedRes, cancelledRes] = await Promise.all([
            ClassRequestService.getPendingClassRequestsByLearner(),
            ClassRequestService.getOpenClassRequestsByLearner(),
            ClassRequestService.getExpiredClassRequestsByLearner(),
            ClassRequestService.getRejectedClassRequestsByLearner(),
            ClassRequestService.getCanceledClassRequestsByLearner(),
          ]);
          
          const pendingData = pendingRes.success && pendingRes.data ? pendingRes.data : [];
          const openData = openRes.success && openRes.data ? openRes.data : [];
          const expiredData = expiredRes.success && expiredRes.data ? expiredRes.data : [];
          const rejectedData = rejectedRes.success && rejectedRes.data ? rejectedRes.data : [];
          const cancelledData = cancelledRes.success && cancelledRes.data ? cancelledRes.data : [];
          
          // Merge tất cả và loại bỏ duplicate
          const merged = [...pendingData, ...openData, ...expiredData, ...rejectedData, ...cancelledData];
          allRequests = merged.filter((req, index, self) => 
            index === self.findIndex(r => r.id === req.id)
          );
        } else if (statusFilter === 'pending') {
          const response = await ClassRequestService.getPendingClassRequestsByLearner();
          if (response.success && response.data) {
            allRequests = response.data;
          }
        } else if (statusFilter === 'open') {
          const response = await ClassRequestService.getOpenClassRequestsByLearner();
          if (response.success && response.data) {
            allRequests = response.data;
          }
        } else if (statusFilter === 'expired') {
          const response = await ClassRequestService.getExpiredClassRequestsByLearner();
          if (response.success && response.data) {
            allRequests = response.data;
          }
        } else if (statusFilter === 'cancelled') {
          const response = await ClassRequestService.getCanceledClassRequestsByLearner();
          if (response.success && response.data) {
            allRequests = response.data;
          }
        } else {
          // Selected, Closed - cần load từ open và filter
          const [pendingRes, openRes] = await Promise.all([
            ClassRequestService.getPendingClassRequestsByLearner(),
            ClassRequestService.getOpenClassRequestsByLearner(),
          ]);
          const pendingData = pendingRes.success && pendingRes.data ? pendingRes.data : [];
          const openData = openRes.success && openRes.data ? openRes.data : [];
          const merged = [...pendingData, ...openData];
          const uniqueRequests = merged.filter((req, index, self) => 
            index === self.findIndex(r => r.id === req.id)
          );
          
          if (targetStatus !== null) {
            allRequests = uniqueRequests.filter(req => {
              const reqStatus = getStatusNumber(req.status);
              return reqStatus === targetStatus;
            });
          } else {
            allRequests = uniqueRequests;
          }
        }

        setRequests(allRequests);
      } catch (err: any) {
        showError('Lỗi', 'Không thể tải danh sách yêu cầu. Vui lòng thử lại.');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Load chi tiết yêu cầu khi mở dialog
  useEffect(() => {
    if (selectedRequest?.id && showDetailDialog) {
      const loadDetail = async () => {
        setLoadingDetail(true);
        setLoadingApplicants(false);
        try {
          const detailResponse = await ClassRequestService.getClassRequestById(selectedRequest.id);
          if (detailResponse.success && detailResponse.data) {
            setSelectedRequest(detailResponse.data);
            
            // Nếu đã duyệt (Open), load danh sách gia sư ứng tuyển
            const statusNum = getStatusNumber(detailResponse.data.status);
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
      const matchesSearch = request.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.title?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
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
      showError('Lỗi', 'Không thể tải thông tin chi tiết');
    }
  };

  const handleEdit = (request: any) => {
    setEditingRequest(request);
    setShowCreateDialog(true);
    setShowDetailDialog(false);
  };

  const handleDeleteClick = (request: any) => {
    setRequestToDelete(request);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!requestToDelete) return;

    setIsDeleting(true);
    try {
      const response = await ClassRequestService.deleteClassRequest(requestToDelete.id);
      if (response.success) {
        showSuccess('Thành công', 'Đã xóa yêu cầu mở lớp thành công.');
        setShowDeleteDialog(false);
        setShowDetailDialog(false);
        setRequestToDelete(null);
        // Reload danh sách
        if (statusFilter === 'all') {
          const [pendingRes, openRes, expiredRes, rejectedRes, cancelledRes] = await Promise.all([
            ClassRequestService.getPendingClassRequestsByLearner(),
            ClassRequestService.getOpenClassRequestsByLearner(),
            ClassRequestService.getExpiredClassRequestsByLearner(),
            ClassRequestService.getRejectedClassRequestsByLearner(),
            ClassRequestService.getCanceledClassRequestsByLearner(),
          ]);
          const pendingData = pendingRes.success && pendingRes.data ? pendingRes.data : [];
          const openData = openRes.success && openRes.data ? openRes.data : [];
          const expiredData = expiredRes.success && expiredRes.data ? expiredRes.data : [];
          const rejectedData = rejectedRes.success && rejectedRes.data ? rejectedRes.data : [];
          const cancelledData = cancelledRes.success && cancelledRes.data ? cancelledRes.data : [];
          const merged = [...pendingData, ...openData, ...expiredData, ...rejectedData, ...cancelledData];
          setRequests(merged.filter((req, index, self) => 
            index === self.findIndex(r => r.id === req.id)
          ));
        } else if (statusFilter === 'pending') {
          const reloadResponse = await ClassRequestService.getPendingClassRequestsByLearner();
          if (reloadResponse.success && reloadResponse.data) {
            setRequests(reloadResponse.data);
          }
        } else if (statusFilter === 'open') {
          const reloadResponse = await ClassRequestService.getOpenClassRequestsByLearner();
          if (reloadResponse.success && reloadResponse.data) {
            setRequests(reloadResponse.data);
          }
        } else if (statusFilter === 'expired') {
          const reloadResponse = await ClassRequestService.getExpiredClassRequestsByLearner();
          if (reloadResponse.success && reloadResponse.data) {
            setRequests(reloadResponse.data);
          }
        } else if (statusFilter === 'cancelled') {
          const reloadResponse = await ClassRequestService.getCanceledClassRequestsByLearner();
          if (reloadResponse.success && reloadResponse.data) {
            setRequests(reloadResponse.data);
          }
        }
      } else {
        throw new Error(response.message || 'Không thể xóa yêu cầu');
      }
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể xóa yêu cầu mở lớp. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Yêu cầu mở lớp</h2>
          <p className="text-gray-600 mt-1">Quản lý các yêu cầu mở lớp của bạn</p>
        </div>
        <Button 
          size="lg"
          className="bg-[#257180] hover:bg-[#257180]/90 text-white"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo yêu cầu mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo môn học..."
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
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
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
      <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Danh sách yêu cầu</CardTitle>
            <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
              {filteredRequests.length} yêu cầu
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[80px]">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('id')} 
                      className="h-8 px-2 text-[#257180] hover:bg-[#FD8B51] hover:text-white"
                    >
                      ID <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('subjectName')} 
                      className="h-8 px-2 text-[#257180] hover:bg-[#FD8B51] hover:text-white"
                    >
                      Môn học <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Hình thức</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Số buổi</TableHead>
                  <TableHead>Mức giá</TableHead>
                  <TableHead>Ứng tuyển</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-b border-gray-200">
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#257180]" />
                      <p className="text-gray-500 mt-2">Đang tải...</p>
                    </TableCell>
                  </TableRow>
                ) : paginatedRequests.length === 0 ? (
                  <TableRow className="border-b border-gray-200">
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Không tìm thấy yêu cầu nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRequests.map((request) => {
                    const statusNum = getStatusNumber(request.status);
                    return (
                    <TableRow key={request.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{request.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                            <p className="font-medium text-gray-900">{request.subjectName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{request.level || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                            {getModeText(request.mode)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div>
                            <p>N/A</p>
                            <p className="text-xs text-gray-500"></p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                            {request.expectedSessions || 0} buổi
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                            {request.targetUnitPriceMin && request.targetUnitPriceMax ? (
                              <>
                          <p className="text-gray-900">
                                  {FormatService.formatVND(request.targetUnitPriceMin)}
                          </p>
                          <p className="text-xs text-gray-500">
                                  - {FormatService.formatVND(request.targetUnitPriceMax)}
                          </p>
                              </>
                            ) : (
                              <p className="text-gray-500">Chưa có</p>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-[#257180]">-</span>
                        </div>
                      </TableCell>
                      <TableCell>
                          <Badge className={getClassRequestStatusColor(statusNum)}>
                            {getClassRequestStatusText(statusNum)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleViewDetail(request)}
                          className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem
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
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="!max-w-6xl sm:!max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu mở lớp</DialogTitle>
          </DialogHeader>
          
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
              <p className="ml-3 text-gray-600">Đang tải thông tin chi tiết...</p>
            </div>
          ) : selectedRequest ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedRequest.title || 'Yêu cầu mở lớp'}</h3>
                  <p className="text-gray-600 mt-1">Yêu cầu #{selectedRequest.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  {(() => {
                    const statusNum = getStatusNumber(selectedRequest.status);
                    return (
                      <>
                        <Badge className={getClassRequestStatusColor(statusNum)}>
                          {getClassRequestStatusText(statusNum)}
                  </Badge>
                        {statusNum === ClassRequestStatus.Reviewing && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleEdit(selectedRequest)}
                        className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                              onClick={() => handleDeleteClick(selectedRequest as any)}
                        className="text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </Button>
                    </div>
                  )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description - Mô tả chi tiết */}
                  {selectedRequest.description && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 mb-2">Mô tả chi tiết yêu cầu</p>
                          <p className="text-gray-900 whitespace-pre-wrap break-words">{selectedRequest.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Class Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        Môn học
                      </p>
                      <p className="font-medium text-gray-900 mt-1 break-words">{selectedRequest.subjectName || 'N/A'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        Cấp độ
                      </p>
                      <p className="font-medium text-gray-900 mt-1 break-words">{selectedRequest.level || 'N/A'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">Hình thức</p>
                      <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20 mt-1">
                        {getModeText(selectedRequest.mode)}
                      </Badge>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">Số buổi học</p>
                      <p className="font-medium text-gray-900 mt-1 break-words">{selectedRequest.expectedSessions || 0} buổi</p>
                    </div>
                    <div className="sm:col-span-2 min-w-0">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Target className="h-4 w-4 flex-shrink-0" />
                        Mục tiêu học tập
                      </p>
                      <p className="font-medium text-gray-900 mt-1 break-words whitespace-pre-wrap">{selectedRequest.learningGoal || 'Chưa có'}</p>
                    </div>
                    <div className="sm:col-span-2 min-w-0">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <UserCheck className="h-4 w-4 flex-shrink-0" />
                        Yêu cầu gia sư
                      </p>
                      <p className="font-medium text-gray-900 mt-1 break-words whitespace-pre-wrap">{selectedRequest.tutorRequirement || 'Chưa có'}</p>
                      </div>
                    <div className="sm:col-span-2 min-w-0">
                      <p className="text-sm text-gray-600">Mức giá mong muốn</p>
                      <p className="font-medium text-[#257180] mt-1 break-words">
                        {selectedRequest.targetUnitPriceMin && selectedRequest.targetUnitPriceMax ? (
                          <>
                            {FormatService.formatVND(selectedRequest.targetUnitPriceMin)} - {FormatService.formatVND(selectedRequest.targetUnitPriceMax)}/buổi
                          </>
                        ) : (
                          'Chưa có'
                        )}
                      </p>
                    </div>
                    {selectedRequest.expectedStartDate && (
                      <div className="min-w-0">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          Ngày bắt đầu dự kiến
                        </p>
                        <p className="font-medium text-gray-900 mt-1 break-words">
                          {FormatService.formatDate(selectedRequest.expectedStartDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="p-4 border border-[#257180]/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600">Địa điểm học</p>
                        <p className="font-medium text-gray-900 mt-1 break-words">
                          {selectedRequest.subDistrictName && selectedRequest.provinceName ? (
                            `${selectedRequest.subDistrictName}, ${selectedRequest.provinceName}`
                          ) : selectedRequest.provinceName || selectedRequest.subDistrictName || 'Chưa có'}
                        </p>
                        {selectedRequest.addressLine && selectedRequest.addressLine !== 'string' && (
                          <p className="text-sm text-gray-600 mt-1 break-words">{selectedRequest.addressLine}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 p-4 border border-[#257180]/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Ngày tạo</p>
                      <p className="font-medium text-gray-900 mt-1">
                        {FormatService.formatDate(selectedRequest.createdAt)}
                      </p>
                    </div>
                    {selectedRequest.updatedAt && (
                    <div>
                        <p className="text-sm text-gray-600">Ngày cập nhật</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {FormatService.formatDate(selectedRequest.updatedAt)}
                      </p>
                    </div>
                    )}
                    {selectedRequest.approvedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Ngày duyệt</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {FormatService.formatDate(selectedRequest.approvedAt)}
                        </p>
                      </div>
                    )}
                    {selectedRequest.approvedBy && (
                      <div>
                        <p className="text-sm text-gray-600">Người duyệt</p>
                        <p className="font-medium text-gray-900 mt-1">{selectedRequest.approvedBy}</p>
                      </div>
                    )}
                    {selectedRequest.rejectionReason && (
                      <div className="col-span-2 min-w-0">
                        <p className="text-sm text-red-600">Lý do từ chối</p>
                        <p className="font-medium text-red-800 mt-1 break-words whitespace-pre-wrap">{selectedRequest.rejectionReason}</p>
                      </div>
                    )}
                    {selectedRequest.cancelReason && (
                      <div className="col-span-2 min-w-0">
                        <p className="text-sm text-red-600">Lý do hủy</p>
                        <p className="font-medium text-red-800 mt-1 break-words whitespace-pre-wrap">{selectedRequest.cancelReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-4">
                  <Card className="border-[#257180]/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-5 w-5" />
                        Thống kê
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700 mb-1">Gia sư ứng tuyển</p>
                        <p className="text-2xl font-semibold text-green-800">{applicants.length}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 mb-1">Tổng số buổi</p>
                        <p className="text-2xl font-semibold text-blue-800">{selectedRequest.expectedSessions || 0}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tutor Applications List */}
              {(() => {
                const statusNum = getStatusNumber(selectedRequest.status);
                if (statusNum === ClassRequestStatus.Open && applicants.length > 0) {
                  return (
                    <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#257180]" />
                          Gia sư ứng tuyển ({applicants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                        {loadingApplicants ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-[#257180]" />
                            <p className="ml-3 text-gray-600">Đang tải danh sách gia sư...</p>
                          </div>
                        ) : (
                    <div className="space-y-4">
                            {applicants.map((applicant) => (
                              <div key={applicant.applicationId} className="border border-[#257180]/20 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#F2E5BF]">
                                      {applicant.avatarUrl ? (
                                  <img 
                                          src={applicant.avatarUrl} 
                                    alt={applicant.tutorName}
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
                                        className={`w-full h-full rounded-lg flex items-center justify-center text-lg font-bold text-[#257180] bg-[#F2E5BF] ${applicant.avatarUrl ? 'hidden' : 'flex'}`}
                                        style={{ display: applicant.avatarUrl ? 'none' : 'flex' }}
                                >
                                  {applicant.tutorName ? applicant.tutorName.substring(0, 2).toUpperCase() : 'GS'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                        <h4 className="text-xl font-semibold text-gray-900">{applicant.tutorName}</h4>
                                        <p className="text-sm text-gray-500">ID: {applicant.tutorId}</p>
                                </div>
                              </div>
                              
                                    {applicant.message && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                        <p className="text-sm text-gray-700">{applicant.message}</p>
                              </div>
                                    )}
                              
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                        Ứng tuyển: {FormatService.formatDate(applicant.appliedAt)}
                                </p>
                                <div className="flex gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="lg" 
                                          className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                                          onClick={() => {
                                            handleViewTutorProfile(applicant.tutorId);
                                          }}
                                        >
                                    Xem hồ sơ
                                  </Button>
                                        <Button 
                                          size="lg" 
                                          className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                                          onClick={() => {
                                            // TODO: Implement select tutor
                                          }}
                                        >
                                    Chọn gia sư
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                        )}
                  </CardContent>
                </Card>
                  );
                }
                return null;
              })()}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowDetailDialog(false)}
                  className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Class Request Dialog */}
      <CreateClassRequestDialog 
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setEditingRequest(null);
        }}
        editingRequest={editingRequest}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa yêu cầu</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa yêu cầu mở lớp <span className="font-semibold">&quot;{requestToDelete?.title || `#${requestToDelete?.id}`}&quot;</span> không?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setShowDeleteDialog(false);
                setRequestToDelete(null);
              }}
              disabled={isDeleting}
              className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

