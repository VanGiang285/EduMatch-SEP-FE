'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { Separator } from '@/components/ui/layout/separator';
import { Label } from '@/components/ui/form/label';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  Calendar,
  ArrowUpDown,
  Loader2,
  Star,
  Shield,
  MapPin,
  Globe,
  Users,
  Maximize2,
} from 'lucide-react';
import { TutorVerificationRequestService, TutorService } from '@/services';
import { TutorVerificationRequestDto, TutorProfileDto } from '@/types/backend';
import { TutorVerificationRequestStatus, TeachingMode, VerifyStatus, EnumHelpers, TutorStatus } from '@/types/enums';
import { RejectTutorRequest } from '@/types/requests';
import { useCustomToast } from '@/hooks/useCustomToast';
import { formatCurrency } from '@/data/mockBusinessAdminData';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'userName' | 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export interface DetailTutorProfile {
  id: number;
  userName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  addressLine?: string;
  provinceName?: string;
  subDistrictName?: string;
  status: number;
  teachingModes: number;
  bio?: string;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  subjects: NonNullable<TutorProfileDto['tutorSubjects']>;
  educations: NonNullable<TutorProfileDto['tutorEducations']>;
  certificates: NonNullable<TutorProfileDto['tutorCertificates']>;
  availabilities: NonNullable<TutorProfileDto['tutorAvailabilities']>;
}

const getApplicantName = (request: TutorVerificationRequestDto): string => {
  return (
    request.tutor?.userName ||
    request.user?.userName ||
    request.user?.userProfile?.userEmailNavigation?.userName ||
    request.userEmail?.split('@')[0] ||
    'Chưa có tên'
  );
};

const getApplicantAvatar = (request: TutorVerificationRequestDto): string | undefined => {
  return (
    request.tutor?.avatarUrl ||
    request.user?.userProfile?.avatarUrl ||
    request.user?.tutorProfile?.avatarUrl
  );
};

export const mapTutorProfileToDetail = (
  tutor: TutorProfileDto,
  request?: TutorVerificationRequestDto
): DetailTutorProfile => {
  const statusValue =
    typeof tutor.status === 'string'
      ? parseInt(tutor.status, 10) || TutorStatus.Pending
      : (tutor.status as number) ?? TutorStatus.Pending;

  const teachingModeValue =
    typeof tutor.teachingModes === 'string'
      ? parseInt(tutor.teachingModes as string, 10) || TeachingMode.Offline
      : (tutor.teachingModes as number) ?? TeachingMode.Offline;

  return {
    id: tutor.id,
    userName: tutor.userName || (request ? getApplicantName(request) : tutor.userEmail),
    email: request?.userEmail || tutor.userEmail,
    avatarUrl: tutor.avatarUrl || (request ? getApplicantAvatar(request) : undefined),
    phone: tutor.phone,
    createdAt: tutor.createdAt,
    addressLine: tutor.addressLine,
    provinceName: tutor.province?.name,
    subDistrictName: tutor.subDistrict?.name,
    status: statusValue,
    teachingModes: teachingModeValue,
    bio: tutor.bio,
    rating: (tutor as any)?.rating ?? 0,
    totalReviews: (tutor as any)?.totalReviews ?? 0,
    totalStudents: (tutor as any)?.totalStudents ?? 0,
    subjects: tutor.tutorSubjects || [],
    educations: tutor.tutorEducations || [],
    certificates: tutor.tutorCertificates || [],
    availabilities: tutor.tutorAvailabilities || [],
  };
};

const getStatusLabel = (status: TutorVerificationRequestStatus | number | string | null | undefined): string => {
  const parsedStatus = EnumHelpers.parseTutorVerificationRequestStatus(status);
  switch (parsedStatus) {
    case TutorVerificationRequestStatus.Pending:
      return 'Chờ duyệt';
    case TutorVerificationRequestStatus.Approved:
      return 'Đã duyệt';
    case TutorVerificationRequestStatus.Rejected:
      return 'Đã từ chối';
    default:
      return 'Không xác định';
  }
};

const getStatusColor = (status: TutorVerificationRequestStatus | number | string | null | undefined): string => {
  const parsedStatus = EnumHelpers.parseTutorVerificationRequestStatus(status);
  switch (parsedStatus) {
    case TutorVerificationRequestStatus.Pending:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case TutorVerificationRequestStatus.Approved:
      return 'bg-green-100 text-green-800 border-green-200';
    case TutorVerificationRequestStatus.Rejected:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTeachingModeText = (modes: TeachingMode | string): string => {
  const parsedModes = EnumHelpers.parseTeachingMode(modes);
  const modeLabels: string[] = [];
  if (parsedModes & TeachingMode.Offline) modeLabels.push('Dạy trực tiếp');
  if (parsedModes & TeachingMode.Online) modeLabels.push('Dạy online');
  if (parsedModes & TeachingMode.Hybrid) modeLabels.push('Kết hợp');
  return modeLabels.length > 0 ? modeLabels.join(', ') : 'Chưa cập nhật';
};

const getVerifyStatusText = (status: VerifyStatus | number): string => {
  const parsedStatus = EnumHelpers.parseVerifyStatus(status);
  switch (parsedStatus) {
    case VerifyStatus.Pending:
      return 'Chờ duyệt';
    case VerifyStatus.Verified:
      return 'Đã xác minh';
    case VerifyStatus.Rejected:
      return 'Bị từ chối';
    case VerifyStatus.Expired:
      return 'Hết hạn';
    case VerifyStatus.Removed:
      return 'Đã xóa';
    default:
      return 'Không xác định';
  }
};

const getVerifyStatusColor = (status: VerifyStatus | number): string => {
  const parsedStatus = EnumHelpers.parseVerifyStatus(status);
  switch (parsedStatus) {
    case VerifyStatus.Pending:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case VerifyStatus.Verified:
      return 'bg-green-100 text-green-800 border-green-200';
    case VerifyStatus.Rejected:
      return 'bg-red-100 text-red-800 border-red-200';
    case VerifyStatus.Expired:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case VerifyStatus.Removed:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function ManageTutorApplications() {
  const { showSuccess, showError } = useCustomToast();
  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TutorVerificationRequestStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<TutorVerificationRequestDto | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfileDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [requests, setRequests] = useState<TutorVerificationRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTutor, setLoadingTutor] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const detailTutor = useMemo(() => {
    if (!selectedRequest || !selectedTutor) return null;
    return mapTutorProfileToDetail(selectedTutor, selectedRequest);
  }, [selectedRequest, selectedTutor]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (statusFilter === 'all') {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          TutorVerificationRequestService.getAll(TutorVerificationRequestStatus.Pending),
          TutorVerificationRequestService.getAll(TutorVerificationRequestStatus.Approved),
          TutorVerificationRequestService.getAll(TutorVerificationRequestStatus.Rejected),
        ]);
        
        const allRequests: TutorVerificationRequestDto[] = [];
        if (pendingRes.success && pendingRes.data) allRequests.push(...pendingRes.data);
        if (approvedRes.success && approvedRes.data) allRequests.push(...approvedRes.data);
        if (rejectedRes.success && rejectedRes.data) allRequests.push(...rejectedRes.data);
        
        setRequests(allRequests);
      } else {
        response = await TutorVerificationRequestService.getAll(statusFilter);
        if (response.success && response.data) {
          setRequests(response.data);
        } else {
          setRequests([]);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showErrorRef.current?.('Lỗi', 'Không thể tải danh sách đơn đăng ký');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredRequests = useMemo(() => {
    const filtered = requests.filter((req) => {
      const userName = getApplicantName(req);
      const email = req.userEmail || '';
      const matchesSearch =
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        case 'userName':
          aValue = getApplicantName(a).toLowerCase();
          bValue = getApplicantName(b).toLowerCase();
          break;
        case 'email':
          aValue = a.userEmail.toLowerCase();
          bValue = b.userEmail.toLowerCase();
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

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetail = async (request: TutorVerificationRequestDto) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
    
    if (request.tutorId) {
      try {
        setLoadingTutor(true);
        const response = await TutorService.getTutorById(request.tutorId);
        if (response.success && response.data) {
          setSelectedTutor(response.data);
        } else {
          showError('Lỗi', 'Không thể tải thông tin gia sư');
        }
      } catch (error) {
        console.error('Error fetching tutor:', error);
        showError('Lỗi', 'Không thể tải thông tin gia sư');
      } finally {
        setLoadingTutor(false);
      }
    }
  };

  const handleApproveApplication = async () => {
    if (!selectedRequest?.tutorId) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await TutorService.approveAndVerifyAll(selectedRequest.tutorId);
      if (response.success) {
        showSuccess('Thành công', 'Đã duyệt đơn đăng ký và xác minh tất cả chứng chỉ, bằng cấp');
        setShowDetailDialog(false);
        fetchRequests();
      } else {
        showError('Lỗi', response.message || 'Không thể duyệt đơn đăng ký');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      showError('Lỗi', 'Không thể duyệt đơn đăng ký');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!rejectReason.trim()) {
      showError('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    if (!selectedRequest?.tutorId) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư');
      return;
    }

    try {
      setIsProcessing(true);
      const request: RejectTutorRequest = { reason: rejectReason.trim() };
      const response = await TutorService.rejectAll(selectedRequest.tutorId, request);
      if (response.success) {
        showSuccess('Thành công', 'Đã từ chối đơn đăng ký');
        setShowRejectDialog(false);
        setShowDetailDialog(false);
        setRejectReason('');
        fetchRequests();
      } else {
        showError('Lỗi', response.message || 'Không thể từ chối đơn đăng ký');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      showError('Lỗi', 'Không thể từ chối đơn đăng ký');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Đơn đăng ký Gia sư</h1>
        <p className="text-gray-600 mt-1">Duyệt đơn đăng ký trở thành gia sư</p>
      </div>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
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
                  setStatusFilter(parseInt(value) as TutorVerificationRequestStatus);
                }
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={TutorVerificationRequestStatus.Pending.toString()}>
                  Chờ duyệt
                </SelectItem>
                <SelectItem value={TutorVerificationRequestStatus.Approved.toString()}>
                  Đã duyệt
                </SelectItem>
                <SelectItem value={TutorVerificationRequestStatus.Rejected.toString()}>
                  Đã từ chối
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách đơn đăng ký</CardTitle>
            <Badge variant="outline">{filteredRequests.length} đơn</Badge>
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
                        <Button variant="ghost" size="sm" onClick={() => handleSort('userName')} className="h-8 px-2">
                          Người đăng ký <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('email')} className="h-8 px-2">
                          Email <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">Trạng thái</TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('createdAt')} className="h-8 px-2">
                          Ngày đăng ký <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Không có đơn đăng ký nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((req, index) => {
                        const userName = getApplicantName(req) || 'Chưa có tên';
                        const avatarUrl = getApplicantAvatar(req);
                        return (
                          <TableRow key={req.id} className="hover:bg-gray-50">
                            <TableCell className="text-left">
                              <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                            </TableCell>
                            <TableCell className="text-left">
                              <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F2E5BF]">
                                    {avatarUrl ? (
                                      <img 
                                        src={avatarUrl} 
                                        alt={userName}
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
                                      className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold text-[#257180] bg-[#F2E5BF] ${avatarUrl ? 'hidden' : 'flex'}`}
                                      style={{ display: avatarUrl ? 'none' : 'flex' }}
                                    >
                                      {userName.substring(0, 2).toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                                  {req.tutor?.phone && (
                                    <p className="text-xs text-gray-500">{req.tutor.phone}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 text-left">{req.userEmail}</TableCell>
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
        <DialogContent className="!max-w-7xl sm:!max-w-7xl max-h-[95vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Hồ sơ gia sư</DialogTitle>
          </DialogHeader>

          {loadingTutor ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : detailTutor && selectedRequest ? (
            <div className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6 flex-col sm:flex-row">
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-28 h-28 sm:w-32 sm:h-32">
                            <AvatarImage src={detailTutor.avatarUrl} alt={detailTutor.userName} className="object-cover" />
                            <AvatarFallback className="text-2xl bg-[#F2E5BF] text-[#257180]">
                              {detailTutor.userName
                                .split(' ')
                                .slice(-2)
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white bg-blue-600">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-3">
                            <div className="min-w-0">
                              <h1 className="text-gray-900 text-2xl font-semibold mb-2 truncate" title={detailTutor.userName}>
                                {detailTutor.userName}
                              </h1>
                              <div className="flex items-center gap-3 flex-wrap text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-gray-900">{detailTutor.rating.toFixed(1)}</span>
                                  <span className="text-gray-500">({detailTutor.totalReviews} đánh giá)</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span>{detailTutor.totalStudents} học viên</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className={getStatusColor(selectedRequest.status)}>
                                Trạng thái đơn: {getStatusLabel(selectedRequest.status)}
                              </Badge>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                {getTeachingModeText(detailTutor.teachingModes)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {detailTutor.subDistrictName || 'Chưa cập nhật'}
                                  {detailTutor.provinceName ? `, ${detailTutor.provinceName}` : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <Globe className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{getTeachingModeText(detailTutor.teachingModes)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <Users className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{detailTutor.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  Đăng ký ngày {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="about" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-[#F2E5BF]">
                      <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">
                        Giới thiệu
                      </TabsTrigger>
                      <TabsTrigger
                        value="education"
                        className="data-[state=active]:bg-white data-[state=active]:text-[#257180]"
                      >
                        Học vấn & Chứng chỉ
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="space-y-6">
                      <Card className="border border-gray-200">
                        <CardHeader>
                          <CardTitle className="font-bold">Về tôi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                              {detailTutor.bio || 'Chưa có thông tin giới thiệu.'}
                            </p>
                          </div>
                          <Separator className="bg-gray-200" />
                          <div>
                            <h3 className="text-gray-900 mb-3 font-bold">Môn học đăng ký</h3>
                            {detailTutor.subjects.length > 0 ? (
                              <div className="space-y-3">
                                {detailTutor.subjects.map((subject) => (
                                  <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                              <p className="font-medium text-gray-900">{subject.subject?.subjectName || 'Chưa có tên'}</p>
                                      {subject.level && <p className="text-sm text-gray-600">{subject.level.name}</p>}
                                    </div>
                                    <p className="font-semibold text-[#257180]">
                                      {subject.hourlyRate ? formatCurrency(subject.hourlyRate) : 'Chưa cập nhật'}/giờ
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">Chưa có môn học nào.</p>
                            )}
                          </div>
                          <Separator className="bg-gray-200" />
                          {detailTutor.availabilities.length > 0 ? (
                            <div>
                              <h3 className="text-gray-900 mb-3 font-bold">Lịch khả dụng</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {detailTutor.availabilities.map((avail) => (
                                  <div key={avail.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm">
                                      {avail.slot?.dayOfWeek !== undefined &&
                                        ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][avail.slot.dayOfWeek]}
                                    </span>
                                    {avail.slot?.startTime && avail.slot?.endTime && (
                                      <span className="text-sm text-gray-600">
                                        {avail.slot.startTime} - {avail.slot.endTime}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-gray-900 mb-3 font-bold">Lịch khả dụng</h3>
                              <p className="text-gray-500">Chưa cập nhật lịch khả dụng.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-6">
                      <Card className="border border-gray-200">
                        <CardHeader>
                          <CardTitle className="font-bold">Học vấn</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {detailTutor.educations.length > 0 ? (
                            detailTutor.educations.map((edu) => (
                              <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-gray-900">{edu.institution?.name || 'Chưa có tên'}</p>
                                    {edu.issueDate && (
                                      <p className="text-sm text-gray-600">
                                        Tốt nghiệp: {new Date(edu.issueDate).toLocaleDateString('vi-VN')}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className={getVerifyStatusColor(edu.verified)}>
                                    {getVerifyStatusText(edu.verified)}
                                  </Badge>
                                </div>
                                {edu.certificateUrl && (
                                  <div className="relative group cursor-zoom-in" onClick={() => setPreviewImage(edu.certificateUrl ?? null)}>
                                    <img
                                      src={edu.certificateUrl}
                                      alt="Bằng cấp"
                                      className="w-full max-h-64 object-cover rounded-lg border"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                                      <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>
                                )}
                                {edu.certificateUrl && (
                                  <a
                                    href={edu.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#257180] hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Xem bằng cấp
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                                {edu.verified === VerifyStatus.Rejected && edu.rejectReason && (
                                  <div className="p-2 bg-red-50 rounded text-sm text-red-800">
                                    <p className="font-medium">Lý do từ chối:</p>
                                    <p>{edu.rejectReason}</p>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">Chưa có thông tin học vấn.</p>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader>
                          <CardTitle className="font-bold">Chứng chỉ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {detailTutor.certificates.length > 0 ? (
                            detailTutor.certificates.map((cert) => (
                              <div key={cert.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {cert.certificateType?.name || 'Chưa có tên'}
                                    </p>
                                    {cert.issueDate && (
                                      <p className="text-sm text-gray-600">
                                        Cấp ngày: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className={getVerifyStatusColor(cert.verified)}>
                                    {getVerifyStatusText(cert.verified)}
                                  </Badge>
                                </div>
                                {cert.certificateUrl && (
                                  <div className="relative group cursor-zoom-in" onClick={() => setPreviewImage(cert.certificateUrl ?? null)}>
                                    <img
                                      src={cert.certificateUrl}
                                      alt="Chứng chỉ"
                                      className="w-full max-h-64 object-cover rounded-lg border"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                                      <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>
                                )}
                                {cert.certificateUrl && (
                                  <a
                                    href={cert.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#257180] hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Xem chứng chỉ
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                                {cert.verified === VerifyStatus.Rejected && cert.rejectReason && (
                                  <div className="p-2 bg-red-50 rounded text-sm text-red-800">
                                    <p className="font-medium">Lý do từ chối:</p>
                                    <p>{cert.rejectReason}</p>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">Chưa có thông tin chứng chỉ.</p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Thông tin nhanh</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium truncate">{detailTutor.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="font-medium">{detailTutor.phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Môn học:</span>
                          <span className="font-medium">{detailTutor.subjects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chứng chỉ:</span>
                          <span className="font-medium">{detailTutor.certificates.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hình thức:</span>
                          <span className="font-medium truncate">{getTeachingModeText(detailTutor.teachingModes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Đơn đăng ký:</span>
                          <span className="font-medium">{getStatusLabel(selectedRequest.status)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#257180]/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full" onClick={() => setShowDetailDialog(false)}>
                          Đóng
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setShowRejectDialog(true)}
                          disabled={
                            isProcessing ||
                            EnumHelpers.parseTutorVerificationRequestStatus(selectedRequest.status) !==
                              TutorVerificationRequestStatus.Pending
                          }
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Từ chối yêu cầu
                        </Button>
                        <Button
                          className="w-full bg-[#257180] hover:bg-[#257180]/90 text-white"
                          onClick={handleApproveApplication}
                          disabled={
                            isProcessing ||
                            EnumHelpers.parseTutorVerificationRequestStatus(selectedRequest.status) !==
                              TutorVerificationRequestStatus.Pending
                          }
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Kích hoạt tài khoản
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : selectedRequest ? (
            <div className="text-center py-8 text-gray-500">Không tìm thấy thông tin gia sư</div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl bg-transparent border-none shadow-none p-0" aria-describedby={undefined}>
          {previewImage && (
            <div className="relative">
              <img src={previewImage} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-lg bg-white" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối đơn đăng ký</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối đơn đăng ký này
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
            <AlertDialogAction 
              onClick={handleRejectApplication} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
