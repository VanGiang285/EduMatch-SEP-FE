"use client";

import React, { useState, useMemo } from 'react';
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
import { Search, Eye, Plus, MapPin, Calendar, ArrowUpDown, Users, Edit, Star, Trash2, Loader2 } from 'lucide-react';
import { 
  mockCurrentUser,
  formatCurrency,
  getTeachingModeText,
} from '@/data/mockLearnerData';
import {
  mockClassRequests,
  mockClassApplications,
} from '@/data/mockClassRequests';
import { CreateClassRequestDialog } from '@/components/class-requests/CreateClassRequestDialog';
import { ClassRequestService } from '@/services/classRequestService';
import { useCustomToast } from '@/hooks/useCustomToast';

const ITEMS_PER_PAGE = 8;

type SortField = 'id' | 'subjectName' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function ClassRequestsTab() {
  const { showSuccess, showError } = useCustomToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter only current user's class requests
  const myClassRequests = mockClassRequests.filter(
    req => req.learnerName === mockCurrentUser.userName
  );

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
    let filtered = myClassRequests.filter((request) => {
      const matchesSearch = request.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'open' && request.status === 0) ||
                           (statusFilter === 'reviewing' && request.status === 1) ||
                           (statusFilter === 'selected' && request.status === 2) ||
                           (statusFilter === 'closed' && request.status === 3) ||
                           (statusFilter === 'cancelled' && request.status === 4) ||
                           (statusFilter === 'expired' && request.status === 5);
      
      return matchesSearch && matchesStatus;
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
          aValue = a.subjectName.toLowerCase();
          bValue = b.subjectName.toLowerCase();
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
  }, [myClassRequests, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetail = (request: any) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
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
        // Refresh the list - trong thực tế sẽ reload từ API
        // Ở đây chỉ cần đóng dialog vì đang dùng mock data
      } else {
        throw new Error(response.message || 'Không thể xóa yêu cầu');
      }
    } catch (error: any) {
      console.error('Error deleting class request:', error);
      showError('Lỗi', error.message || 'Không thể xóa yêu cầu mở lớp. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getApplicants = (requestId: number) => {
    return (mockClassApplications as any)[requestId] || [];
  };

  const getStatusText = (status: number) => {
    const statusMap: Record<number, string> = {
      0: 'Đang mở',      // Open
      1: 'Đang xem xét',  // Reviewing
      2: 'Đã chọn',       // Selected
      3: 'Đã đóng',       // Closed
      4: 'Đã hủy',        // Cancelled
      5: 'Hết hạn',       // Expired
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusColor = (status: number) => {
    const colorMap: Record<number, string> = {
      0: 'bg-green-100 text-green-800',      // Open - Xanh lá
      1: 'bg-yellow-100 text-yellow-800',   // Reviewing - Vàng
      2: 'bg-blue-100 text-blue-800',        // Selected - Xanh dương
      3: 'bg-gray-100 text-gray-800',       // Closed - Xám
      4: 'bg-red-100 text-red-800',         // Cancelled - Đỏ
      5: 'bg-orange-100 text-orange-800',    // Expired - Cam
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
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
                <SelectItem value="open">Đang mở</SelectItem>
                <SelectItem value="reviewing">Đang xem xét</SelectItem>
                <SelectItem value="selected">Đã chọn</SelectItem>
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
                {paginatedRequests.length === 0 ? (
                  <TableRow className="border-b border-gray-200">
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Không tìm thấy yêu cầu nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{request.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{request.subjectName}</p>
                          <p className="text-xs text-gray-500">{request.gradeName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                          {getTeachingModeText(request.teachingMode)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div>
                          <p>{request.cityName}</p>
                          <p className="text-xs text-gray-500">{request.subDistrictName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                          {request.totalSessions} buổi
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p className="text-gray-900">
                            {formatCurrency(request.minPrice)}
                          </p>
                          <p className="text-xs text-gray-500">
                            - {formatCurrency(request.maxPrice)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-[#257180]">{request.totalApplicants}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
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
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedRequest.displayName}</h3>
                  <p className="text-gray-600 mt-1">Yêu cầu #{selectedRequest.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {getStatusText(selectedRequest.status)}
                  </Badge>
                  {selectedRequest.status === 1 && (
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
                        onClick={() => handleDeleteClick(selectedRequest)}
                        className="text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Class Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Môn học</p>
                      <p className="font-medium text-gray-900">{selectedRequest.subjectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cấp độ</p>
                      <p className="font-medium text-gray-900">{selectedRequest.gradeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hình thức</p>
                      <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                        {getTeachingModeText(selectedRequest.teachingMode)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số buổi học</p>
                      <p className="font-medium text-gray-900">{selectedRequest.totalSessions} buổi</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Buổi/tuần</p>
                      <p className="font-medium text-gray-900">{selectedRequest.sessionPerWeek} buổi</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số gia sư ứng tuyển</p>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-[#257180]" />
                        <span className="font-medium text-[#257180]">{selectedRequest.totalApplicants} gia sư</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Mức giá mong muốn</p>
                      <p className="font-medium text-[#257180]">
                        {formatCurrency(selectedRequest.minPrice)} - {formatCurrency(selectedRequest.maxPrice)}/buổi
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="p-4 border border-[#257180]/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Địa điểm học</p>
                        <p className="font-medium text-gray-900">
                          {selectedRequest.subDistrictName}, {selectedRequest.cityName}
                        </p>
                        {selectedRequest.location && (
                          <p className="text-sm text-gray-600 mt-1">{selectedRequest.location}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Mô tả chi tiết</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 p-4 border border-[#257180]/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Ngày tạo</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hết hạn</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedRequest.expiresAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
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
                        <p className="text-2xl font-semibold text-green-800">{selectedRequest.totalApplicants}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 mb-1">Tổng số buổi</p>
                        <p className="text-2xl font-semibold text-blue-800">{selectedRequest.totalSessions}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700 mb-1">Buổi/tuần</p>
                        <p className="text-2xl font-semibold text-purple-800">{selectedRequest.sessionPerWeek}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tutor Applications List */}
              {selectedRequest.totalApplicants > 0 && (
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#257180]" />
                      Gia sư ứng tuyển ({getApplicants(selectedRequest.id).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getApplicants(selectedRequest.id).map((applicant: any) => (
                        <div key={applicant.id} className="border border-[#257180]/20 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#F2E5BF]">
                                {applicant.tutorAvatar ? (
                                  <img 
                                    src={applicant.tutorAvatar} 
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
                                  className={`w-full h-full rounded-lg flex items-center justify-center text-lg font-bold text-[#257180] bg-[#F2E5BF] ${applicant.tutorAvatar ? 'hidden' : 'flex'}`}
                                  style={{ display: applicant.tutorAvatar ? 'none' : 'flex' }}
                                >
                                  {applicant.tutorName ? applicant.tutorName.substring(0, 2).toUpperCase() : 'GS'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-2xl font-semibold text-gray-900">{applicant.tutorName}</h4>
                                  <p className="text-sm text-gray-600">{applicant.education}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-[#257180]">
                                    {formatCurrency(applicant.proposedPrice)}/buổi
                                  </p>
                                  <p className="text-xs text-gray-500">Giá đề xuất</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{applicant.rating}</span>
                                  <span className="text-sm text-gray-500">({applicant.totalReviews} đánh giá)</span>
                                </div>
                                <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                                  {applicant.experience} năm kinh nghiệm
                                </Badge>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-sm text-gray-700">{applicant.coverLetter}</p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  Ứng tuyển: {new Date(applicant.appliedAt).toLocaleString('vi-VN')}
                                </p>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="lg" className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
                                    Xem hồ sơ
                                  </Button>
                                  <Button size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
                                    Chọn gia sư
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
          )}
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
              Bạn có chắc chắn muốn xóa yêu cầu mở lớp <span className="font-semibold">"{requestToDelete?.displayName}"</span> không?
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
