"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/basic/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/layout/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/feedback/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/feedback/alert-dialog';
import { Textarea } from '@/components/ui/form/textarea';
import { useCustomToast } from '@/hooks/useCustomToast';
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Award, 
  BookOpen, 
  DollarSign, 
  Play, 
  FileText,
  Users,
  UserCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TutorManagementService, TutorProfile } from '@/services/tutorManagementService';
import { TutorStatus, VerifyStatus } from '@/types/enums';

interface BusinessAdminTutorApplicationManagementProps {
  className?: string;
}

// Rejection reasons
const REJECTION_REASONS = [
  'Thông tin cá nhân không đầy đủ',
  'Bằng cấp/chứng chỉ không hợp lệ',
  'Kinh nghiệm giảng dạy không đủ',
  'Video giới thiệu không phù hợp',
  'Lịch dạy không phù hợp',
  'Mức học phí không hợp lý',
  'Khác'
];

export default function BusinessAdminTutorApplicationManagement({ className }: BusinessAdminTutorApplicationManagementProps) {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [showTutorDetail, setShowTutorDetail] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { showSuccess, showError } = useCustomToast();

  // Load tutors on component mount
  React.useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    setLoading(true);
    try {
      // Load tutors with pending status by default
      const response = await TutorManagementService.getTutorsByStatus(TutorStatus.Pending);
      if (response.success && response.data) {
        setTutors(response.data);
      } else {
        showError('Không thể tải danh sách đơn đăng ký gia sư');
      }
    } catch (error) {
      showError('Lỗi khi tải danh sách đơn đăng ký gia sư');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTutor = async (tutorId: number) => {
    try {
      // TODO: Call API to approve tutor
      // For now, update local state optimistically
      setTutors(prev => prev.map(tutor => 
        tutor.id === tutorId 
          ? { ...tutor, status: TutorStatus.Approved }
          : tutor
      ));
      showSuccess('Đã duyệt đơn đăng ký gia sư thành công');
      setShowTutorDetail(false);
    } catch (error) {
      showError('Lỗi khi duyệt đơn đăng ký gia sư');
    }
  };

  const handleRejectTutor = async (tutorId: number) => {
    try {
      const reason = rejectionReason === 'Khác' ? customRejectionReason : rejectionReason;
      if (!reason.trim()) {
        showError('Vui lòng nhập lý do từ chối');
        return;
      }

      // TODO: Call API to reject tutor with reason
      // For now, update local state optimistically
      setTutors(prev => prev.map(tutor => 
        tutor.id === tutorId 
          ? { ...tutor, status: TutorStatus.Rejected }
          : tutor
      ));
      showSuccess('Đã từ chối đơn đăng ký gia sư');
      setShowTutorDetail(false);
      setShowRejectDialog(false);
      setRejectionReason('');
      setCustomRejectionReason('');
    } catch (error) {
      showError('Lỗi khi từ chối đơn đăng ký gia sư');
    }
  };

  const openTutorDetail = (tutor: TutorProfile) => {
    setSelectedTutor(tutor);
    setShowTutorDetail(true);
  };

  const openRejectDialog = () => {
    setShowRejectDialog(true);
  };

  // Filter tutors based on search and filters
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = 
      tutor.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && tutor.status === TutorStatus.Pending) ||
      (statusFilter === 'approved' && tutor.status === TutorStatus.Approved) ||
      (statusFilter === 'rejected' && tutor.status === TutorStatus.Rejected);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTutors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTutors = filteredTutors.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusLabel = (status: TutorStatus) => {
    switch (status) {
      case TutorStatus.Pending: return 'Chờ duyệt';
      case TutorStatus.Approved: return 'Đã duyệt';
      case TutorStatus.Rejected: return 'Bị từ chối';
      case TutorStatus.Suspended: return 'Tạm khóa';
      case TutorStatus.Deactivated: return 'Ngừng hoạt động';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: TutorStatus) => {
    switch (status) {
      case TutorStatus.Pending: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TutorStatus.Approved: return 'bg-green-100 text-green-800 border-green-200';
      case TutorStatus.Rejected: return 'bg-red-100 text-red-800 border-red-200';
      case TutorStatus.Suspended: return 'bg-orange-100 text-orange-800 border-orange-200';
      case TutorStatus.Deactivated: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerifyStatusLabel = (status: VerifyStatus) => {
    switch (status) {
      case VerifyStatus.Pending: return 'Chờ duyệt';
      case VerifyStatus.Verified: return 'Đã xác minh';
      case VerifyStatus.Rejected: return 'Bị từ chối';
      case VerifyStatus.Expired: return 'Hết hạn';
      case VerifyStatus.Removed: return 'Đã xóa';
      default: return 'Không xác định';
    }
  };

  const getVerifyStatusColor = (status: VerifyStatus) => {
    switch (status) {
      case VerifyStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      case VerifyStatus.Verified: return 'bg-green-100 text-green-800';
      case VerifyStatus.Rejected: return 'bg-red-100 text-red-800';
      case VerifyStatus.Expired: return 'bg-orange-100 text-orange-800';
      case VerifyStatus.Removed: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | undefined | null, formatStr: string = 'dd/MM/yyyy') => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatStr, { locale: vi });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  // Statistics
  const pendingTutors = tutors.filter(t => t.status === TutorStatus.Pending);
  const approvedTutors = tutors.filter(t => t.status === TutorStatus.Approved);
  const rejectedTutors = tutors.filter(t => t.status === TutorStatus.Rejected);

  return (
    <div className={`space-y-6 ${className}`} style={{ 
      overflowX: 'hidden'
    }}>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserCheck className="h-8 w-8 mr-3 text-[#257180]" />
              Quản lý đăng ký gia sư
            </h1>
            <p className="text-gray-600 mt-1">
              Duyệt và quản lý các đơn đăng ký trở thành gia sư
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={loadTutors} 
              disabled={loading}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-[#F2E5BF] hover:border-[#FD8B51]"
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{pendingTutors.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{approvedTutors.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bị từ chối</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{rejectedTutors.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <X className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo email, tên..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="z-[9999]" style={{ overflowY: 'visible' }}>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            Danh sách đơn đăng ký ({filteredTutors.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F2E5BF]">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">Thông tin</TableHead>
                  <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-gray-900">Ngày đăng ký</TableHead>
                  <TableHead className="font-semibold text-gray-900">Môn dạy</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTutors.map((tutor, index) => (
                  <TableRow key={`${tutor.id}-${index}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-[#F2E5BF] flex items-center justify-center">
                          {tutor.avatarUrl ? (
                            <img 
                              src={tutor.avatarUrl} 
                              alt={tutor.userName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-[#257180]">
                              {tutor.userName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tutor.userName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {tutor.userEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getStatusColor(tutor.status)} border`}>
                        {getStatusLabel(tutor.status)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(tutor.createdAt)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {tutor.tutorSubjects && tutor.tutorSubjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {tutor.tutorSubjects.slice(0, 2).map((subject, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                                {subject.subject?.subjectName}
                              </Badge>
                            ))}
                            {tutor.tutorSubjects.length > 2 && (
                              <Badge className="bg-gray-100 text-gray-800 border border-gray-200 text-xs">
                                +{tutor.tutorSubjects.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTutorDetail(tutor)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredTutors.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không tìm thấy đơn đăng ký nào</p>
                <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredTutors.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Hiển thị</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]" style={{ overflowY: 'visible' }}>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-700">
                  trong {filteredTutors.length} kết quả
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === pageNum 
                            ? "bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white" 
                            : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutor Detail Modal */}
      <Dialog open={showTutorDetail} onOpenChange={setShowTutorDetail}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Chi tiết đơn đăng ký gia sư</DialogTitle>
            <DialogDescription>
              Xem và duyệt đơn đăng ký của {selectedTutor?.userName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTutor && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="border border-[#FD8B51]">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="h-5 w-5 mr-2 text-[#257180]" />
                    Thông tin cá nhân
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-[#F2E5BF] flex items-center justify-center">
                        {selectedTutor.avatarUrl ? (
                          <img 
                            src={selectedTutor.avatarUrl} 
                            alt={selectedTutor.userName}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-[#257180]">
                            {selectedTutor.userName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedTutor.userName}</h3>
                        <p className="text-gray-600">{selectedTutor.userEmail}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Ngày đăng ký: {formatDate(selectedTutor.createdAt, 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedTutor.province?.name}, {selectedTutor.subDistrict?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTutor.bio && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Giới thiệu bản thân</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedTutor.bio}</p>
                    </div>
                  )}
                  
                  {selectedTutor.teachingExp && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Kinh nghiệm giảng dạy</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedTutor.teachingExp}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              {selectedTutor.tutorEducations && selectedTutor.tutorEducations.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <GraduationCap className="h-5 w-5 mr-2 text-[#257180]" />
                      Học vấn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTutor.tutorEducations.map((education, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{education.institution?.name}</h4>
                              <p className="text-sm text-gray-600">
                                Ngày cấp: {formatDate(education.issueDate)}
                              </p>
                            </div>
                            <Badge className={`${getVerifyStatusColor(education.verified)} border`}>
                              {getVerifyStatusLabel(education.verified)}
                            </Badge>
                          </div>
                          {education.certificateUrl && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(education.certificateUrl, '_blank')}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Xem bằng cấp
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Certificates */}
              {selectedTutor.tutorCertificates && selectedTutor.tutorCertificates.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Award className="h-5 w-5 mr-2 text-[#257180]" />
                      Chứng chỉ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTutor.tutorCertificates.map((certificate, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{certificate.certificateType?.name}</h4>
                              <p className="text-sm text-gray-600">
                                Ngày cấp: {formatDate(certificate.issueDate)} - 
                                Hết hạn: {formatDate(certificate.expiryDate)}
                              </p>
                            </div>
                            <Badge className={`${getVerifyStatusColor(certificate.verified)} border`}>
                              {getVerifyStatusLabel(certificate.verified)}
                            </Badge>
                          </div>
                          {certificate.certificateUrl && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(certificate.certificateUrl, '_blank')}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Xem chứng chỉ
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subjects & Rates */}
              {selectedTutor.tutorSubjects && selectedTutor.tutorSubjects.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="h-5 w-5 mr-2 text-[#257180]" />
                      Môn dạy & Học phí
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTutor.tutorSubjects.map((subject, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{subject.subject?.subjectName}</h4>
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                              {subject.level?.levelName}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{subject.hourlyRate?.toLocaleString('vi-VN')} VND/giờ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Video Introduction */}
              {selectedTutor.videoIntroUrl && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Play className="h-5 w-5 mr-2 text-[#257180]" />
                      Video giới thiệu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedTutor.videoIntroUrl, '_blank')}
                        className="flex items-center"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Xem video giới thiệu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Availability */}
              {selectedTutor.tutorAvailabilities && selectedTutor.tutorAvailabilities.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="h-5 w-5 mr-2 text-[#257180]" />
                      Lịch khả dụng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <p>Khoảng thời gian: {formatDate(selectedTutor.tutorAvailabilities[0]?.startDate)} - {formatDate(selectedTutor.tutorAvailabilities[0]?.endDate)}</p>
                      <p className="mt-1">Số slot đã đăng ký: {selectedTutor.tutorAvailabilities.length}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowTutorDetail(false)}>
                Đóng
              </Button>
            </div>
            
            {selectedTutor?.status === TutorStatus.Pending && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={openRejectDialog}
                  className="text-red-600 hover:text-red-700 border-red-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  onClick={() => handleApproveTutor(selectedTutor.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Duyệt
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đơn đăng ký</DialogTitle>
            <DialogDescription>
              Vui lòng chọn lý do từ chối đơn đăng ký của {selectedTutor?.userName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Lý do từ chối</label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do từ chối" />
                </SelectTrigger>
                <SelectContent className="z-[9999]" style={{ overflowY: 'visible' }}>
                  {REJECTION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {rejectionReason === 'Khác' && (
              <div>
                <label className="text-sm font-medium text-gray-500">Lý do chi tiết</label>
                <Textarea
                  placeholder="Nhập lý do từ chối chi tiết..."
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={() => selectedTutor && handleRejectTutor(selectedTutor.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}