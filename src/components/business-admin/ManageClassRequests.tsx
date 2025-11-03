'use client';
import React, { useState, useMemo } from 'react';
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
import { Search, Eye, CheckCircle, XCircle, MapPin, Calendar, ArrowUpDown } from 'lucide-react';
import { 
  mockClassRequestsForAdmin,
  formatCurrency,
  getClassRequestStatusText,
  getClassRequestStatusColor,
  getTeachingModeText,
  getDayOfWeekText,
} from '@/data/mockBusinessAdminData';
// Toast: import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'learnerName' | 'subjectName' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function ManageClassRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [requests, setRequests] = useState(mockClassRequestsForAdmin);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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
    let filtered = requests.filter((request) => {
      const matchesSearch = request.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'pending' && request.status === 0) ||
                           (statusFilter === 'approved' && request.status === 1);
      
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
        case 'learnerName':
          aValue = a.learnerName.toLowerCase();
          bValue = b.learnerName.toLowerCase();
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
  }, [requests, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetail = (request: any) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const handleApprove = (requestId: number) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 1 } : req
    ));
    console.log('Success: Đã duyệt yêu cầu mở lớp');
    setShowDetailDialog(false);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      console.log('Error: Vui lòng nhập lý do từ chối');
      return;
    }
    setRequests(prev => prev.map(req => 
      req.id === selectedRequest.id ? { ...req, status: 4 } : req
    ));
    console.log('Success: Đã từ chối yêu cầu mở lớp');
    setShowRejectDialog(false);
    setShowDetailDialog(false);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý Yêu cầu mở lớp</h1>
        <p className="text-gray-600 mt-1">Duyệt yêu cầu mở lớp từ học viên</p>
      </div>

      {/* Filters */}
      <Card className="bg-white">
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
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card className="bg-white">

      {/* Requests Table */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Danh sách yêu cầu</CardTitle>
            <Badge variant="outline">{filteredRequests.length} yêu cầu</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
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
                  paginatedRequests.map((request) => (
                    <TableRow key=$1 className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{request.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.learnerAvatar} alt={request.learnerName} />
                            <AvatarFallback className="bg-[#257180] text-white">
                              {request.learnerName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{request.learnerName}</p>
                            <p className="text-xs text-gray-500">{request.learnerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{request.subjectName}</p>
                          <p className="text-xs text-gray-500">{request.levelName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
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
                        <Badge variant="outline">{request.expectedTotalSessions} buổi</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p className="text-gray-900">
                            {formatCurrency(request.targetUnitPriceMin)}
                          </p>
                          <p className="text-xs text-gray-500">
                            - {formatCurrency(request.targetUnitPriceMax)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getClassRequestStatusColor(request.status)}>
                          {getClassRequestStatusText(request.status)}
                        </Badge>
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
      </Card className="bg-white">

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="!!max-w- sm:!max-w-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu mở lớp</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Learner Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedRequest.learnerAvatar} alt={selectedRequest.learnerName} />
                  <AvatarFallback className="bg-[#257180] text-white text-2xl">
                    {selectedRequest.learnerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedRequest.learnerName}</h3>
                  <p className="text-gray-600">{selectedRequest.learnerEmail}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getClassRequestStatusColor(selectedRequest.status)}>
                      {getClassRequestStatusText(selectedRequest.status)}
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
                      <p className="font-medium text-gray-900">{selectedRequest.subjectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cấp độ</p>
                      <p className="font-medium text-gray-900">{selectedRequest.levelName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hình thức</p>
                      <Badge variant="outline">
                        {getTeachingModeText(selectedRequest.teachingMode)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số buổi dự kiến</p>
                      <p className="font-medium text-gray-900">{selectedRequest.expectedTotalSessions} buổi</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Mức giá mong muốn</p>
                      <p className="font-medium text-[#257180]">
                        {formatCurrency(selectedRequest.targetUnitPriceMin)} - {formatCurrency(selectedRequest.targetUnitPriceMax)}/buổi
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Địa điểm học</p>
                        <p className="font-medium text-gray-900">
                          {selectedRequest.subDistrictName}, {selectedRequest.cityName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Mô tả chi tiết</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>

                  {/* Application Stats */}
                  {selectedRequest.status === 1 && (
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        Đã có <span className="font-semibold">{selectedRequest.totalApplicants} gia sư</span> ứng tuyển vào lớp này
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Schedule */}
                <div className="space-y-6">
                  {/* Schedule */}
                  <Card className="bg-white">
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
                            <span className="text-gray-900">{slot.timeSlot}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card className="bg-white">
                </div>
              </div>

              {/* Actions */}
              {selectedRequest.status === 0 && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                    Đóng
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button
                    className="bg-[#257180] hover:bg-[#1f5a66]"
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Duyệt yêu cầu
                  </Button>
                </div>
              )}
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
            <Label htmlFor="reject-reason">Lý do từ chối</Label>
            <Textarea
              id="reject-reason"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
