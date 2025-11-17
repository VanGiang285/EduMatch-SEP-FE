'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Badge } from '../ui/basic/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/feedback/dialog';
import { Slider } from '../ui/form/slider';
import { SelectWithSearch, SelectWithSearchItem } from '../ui/form/select-with-search';
import { Textarea } from '../ui/form/textarea';
import { Label } from '../ui/form/label';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES, DAY_OF_WEEK_OPTIONS } from '@/constants';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/navigation/pagination';
import {
  Plus,
  MapPin,
  Video,
  Clock,
  Users,
  Home,
  BookOpen,
  GraduationCap,
  Loader2,
  Send,
} from 'lucide-react';
import {
  mockSubjects,
  mockGradeLevels,
  getClassRequestStatusText,
  getClassRequestStatusColor,
} from '@/data/mockClassRequests';
import { Separator } from '../ui/layout/separator';
import { FormatService } from '@/lib/format';
import { CreateClassRequestDialog } from './CreateClassRequestDialog';
import { ClassRequestService, ClassRequestItemDto, ClassRequestDetailDto } from '@/services/classRequestService';
import { TutorApplicationService, TutorApplicationItemDto } from '@/services/tutorApplicationService';
import { useCustomToast } from '@/hooks/useCustomToast';
import { TeachingMode, ClassRequestStatus } from '@/types/enums';

const DAY_OF_WEEK_MAP: Record<number, string> = DAY_OF_WEEK_OPTIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<number, string>
);

const getDayOfWeekLabel = (day: number | string | undefined): string => {
  if (day === undefined || day === null) {
    return 'Không xác định';
  }
  const dayNumber = typeof day === 'string' ? parseInt(day, 10) : day;
  if (Number.isNaN(dayNumber)) {
    return 'Không xác định';
  }
  return DAY_OF_WEEK_MAP[dayNumber] || 'Không xác định';
};

const formatSlotTime = (time?: string | null): string => {
  if (!time) return '--:--';
  if (time.length >= 5) {
    return time.slice(0, 5);
  }
  return time;
};

export function ClassRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();
  
  // States
  const [classRequests, setClassRequests] = useState<ClassRequestItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<ClassRequestDetailDto | null>(null);
  const [applicants, setApplicants] = useState<TutorApplicationItemDto[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applyingRequestId, setApplyingRequestId] = useState<number | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  
  // Filters
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [teachingModeFilter, setTeachingModeFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 500000]);
  const [sortBy, setSortBy] = useState<string>('newest'); // newest, price-low, price-high
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Load danh sách yêu cầu mở lớp (Public - không cần auth)
  useEffect(() => {
    const loadClassRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ClassRequestService.getOpenClassRequests();
        if (response.success && response.data) {
          setClassRequests(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách yêu cầu');
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi tải danh sách yêu cầu');
      } finally {
        setLoading(false);
      }
    };

    loadClassRequests();
  }, []);

  // Load chi tiết yêu cầu và danh sách gia sư ứng tuyển khi mở dialog
  useEffect(() => {
    if (selectedRequest && showDetailDialog) {
      const loadDetail = async () => {
        setLoadingDetail(true);
        setLoadingApplicants(true);
        try {
          // Load chi tiết yêu cầu
          const detailResponse = await ClassRequestService.getClassRequestById(selectedRequest);
          if (detailResponse.success && detailResponse.data) {
            setSelectedRequestDetail(detailResponse.data);
            
            // Load danh sách gia sư ứng tuyển (có thể bị 403 nếu không có quyền)
            try {
              const applicantsResponse = await TutorApplicationService.getApplicationsByClassRequest(selectedRequest);
              if (applicantsResponse.success && applicantsResponse.data) {
                setApplicants(applicantsResponse.data);
              }
            } catch (err: any) {
              // Nếu bị 403 hoặc lỗi khác, không hiển thị danh sách applicants (có thể là public không có quyền)
              setApplicants([]);
            }
          }
        } catch (err: any) {
          showError('Lỗi', 'Không thể tải thông tin chi tiết');
        } finally {
          setLoadingDetail(false);
          setLoadingApplicants(false);
        }
      };

      loadDetail();
    } else {
      setSelectedRequestDetail(null);
      setApplicants([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest, showDetailDialog]);

  // Filter và sort requests
  const filteredRequests = useMemo(() => {
    const filtered = classRequests.filter((request) => {
      // Status filter - chỉ hiển thị Open (status = 0 hoặc "0" hoặc "Open")
      // Xử lý cả trường hợp status là string enum name, string number, number, hoặc null/undefined
      let statusNum: number;
      if (request.status === null || request.status === undefined) {
        return false;
      }
      if (typeof request.status === 'string') {
        // Thử parse số trước
        const parsed = parseInt(request.status, 10);
        if (!isNaN(parsed)) {
          statusNum = parsed;
        } else {
          // Nếu không phải số, map từ enum name
          const statusMap: Record<string, number> = {
            'Open': ClassRequestStatus.Open,
            'Reviewing': ClassRequestStatus.Reviewing,
            'Selected': ClassRequestStatus.Selected,
            'Closed': ClassRequestStatus.Closed,
            'Cancelled': ClassRequestStatus.Cancelled,
            'Expired': ClassRequestStatus.Expired,
          };
          statusNum = statusMap[request.status];
          if (statusNum === undefined) {
            return false;
          }
        }
      } else {
        statusNum = request.status;
      }
      if (statusNum !== ClassRequestStatus.Open) {
        return false;
      }

      // Subject filter
      if (subjectFilter !== 'all' && request.subjectName?.toLowerCase() !== mockSubjects.find(s => s.id.toString() === subjectFilter)?.name.toLowerCase()) {
        return false;
      }

      // Grade filter
      if (gradeFilter !== 'all' && request.level?.toLowerCase() !== mockGradeLevels.find(g => g.id.toString() === gradeFilter)?.name.toLowerCase()) {
        return false;
      }

      // Teaching mode filter
      if (teachingModeFilter !== 'all') {
        // Convert request.mode to number for comparison
        let requestModeNum: number;
        if (typeof request.mode === 'number') {
          requestModeNum = request.mode;
        } else if (typeof request.mode === 'string') {
          const parsed = parseInt(request.mode, 10);
          if (!isNaN(parsed)) {
            requestModeNum = parsed;
          } else {
            // Map từ enum name
            const modeMap: Record<string, number> = {
              'Offline': TeachingMode.Offline,
              'Online': TeachingMode.Online,
              'Hybrid': TeachingMode.Hybrid,
            };
            requestModeNum = modeMap[request.mode] ?? -1;
          }
        } else {
          return false;
        }
        
        const filterModeMap: Record<string, number> = {
          '0': TeachingMode.Offline,
          '1': TeachingMode.Online,
        };
        const filterMode = filterModeMap[teachingModeFilter];
        if (filterMode === undefined || requestModeNum !== filterMode) {
          return false;
        }
      }

      // Price filter
      const requestMaxPrice = request.targetUnitPriceMax || 0;
      const requestMinPrice = request.targetUnitPriceMin || 0;
      if (requestMinPrice > priceRange[1] || requestMaxPrice < priceRange[0]) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'price-low') {
        return (a.targetUnitPriceMin || 0) - (b.targetUnitPriceMin || 0);
      } else if (sortBy === 'price-high') {
        return (b.targetUnitPriceMax || 0) - (a.targetUnitPriceMax || 0);
      } else {
        // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [classRequests, subjectFilter, gradeFilter, teachingModeFilter, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [subjectFilter, gradeFilter, teachingModeFilter, sortBy, priceRange]);

  const handleViewDetail = (requestId: number) => {
    setSelectedRequest(requestId);
    setShowDetailDialog(true);
  };

  const handleApplyClick = (requestId: number) => {
    if (!user) {
      showError('Lỗi', 'Vui lòng đăng nhập để ứng tuyển');
      return;
    }
    if (user.role !== USER_ROLES.TUTOR) {
      showError('Lỗi', 'Chỉ gia sư mới có thể ứng tuyển');
      return;
    }
    setApplyingRequestId(requestId);
    setApplyMessage('');
    setShowApplyDialog(true);
  };

  const handleSubmitApply = async () => {
    if (!applyingRequestId || !applyMessage.trim()) {
      showError('Lỗi', 'Vui lòng nhập thư ứng tuyển');
      return;
    }

    setIsApplying(true);
    try {
      const response = await TutorApplicationService.applyToClassRequest({
        classRequestId: applyingRequestId,
        message: applyMessage.trim(),
      });

      if (response.success) {
        showSuccess('Thành công', 'Ứng tuyển thành công!');
        setShowApplyDialog(false);
        setApplyMessage('');
        setApplyingRequestId(null);
        // Reload danh sách để cập nhật số lượng ứng viên
        const refreshResponse = await ClassRequestService.getOpenClassRequests();
        if (refreshResponse.success && refreshResponse.data) {
          setClassRequests(refreshResponse.data);
        }
      } else {
        throw new Error(response.message || 'Ứng tuyển thất bại');
      }
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể ứng tuyển. Vui lòng thử lại.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleViewTutorProfile = (tutorId: number) => {
    router.push(`/tutor/${tutorId}`);
  };

  // Helper để lấy display name
  const getDisplayName = (request: ClassRequestItemDto) => {
    return `${request.subjectName} ${request.level || ''}`.trim();
  };


  // Helper để lấy teaching mode text
  const getModeText = (mode: string | number | null | undefined) => {
    if (mode === null || mode === undefined) {
      return 'Không xác định';
    }
    
    // Xử lý cả string enum name và number
    let modeNum: number;
    if (typeof mode === 'number') {
      modeNum = mode;
    } else if (typeof mode === 'string') {
      // Thử parse số trước
      const parsed = parseInt(mode, 10);
      if (!isNaN(parsed)) {
        modeNum = parsed;
      } else {
        // Map từ enum name
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

  // Check if user is tutor
  const isTutor = user?.role === USER_ROLES.TUTOR;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Filters Section - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Subject Filter */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch 
                value={subjectFilter} 
                onValueChange={setSubjectFilter}
                placeholder="Môn học"
              >
                <SelectWithSearchItem value="all">Tất cả môn học</SelectWithSearchItem>
                {mockSubjects.map((subject) => (
                  <SelectWithSearchItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            {/* Grade Filter */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch 
                value={gradeFilter} 
                onValueChange={setGradeFilter}
                placeholder="Lớp"
              >
                <SelectWithSearchItem value="all">Tất cả lớp</SelectWithSearchItem>
                {mockGradeLevels.map((grade) => (
                  <SelectWithSearchItem key={grade.id} value={grade.id.toString()}>
                    {grade.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            {/* Teaching Mode Filter */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch 
                value={teachingModeFilter} 
                onValueChange={setTeachingModeFilter}
                placeholder="Hình thức"
              >
                <SelectWithSearchItem value="all">Tất cả hình thức</SelectWithSearchItem>
                <SelectWithSearchItem value="0">Tại nhà</SelectWithSearchItem>
                <SelectWithSearchItem value="1">Trực tuyến</SelectWithSearchItem>
              </SelectWithSearch>
            </div>

            {/* Sort */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch 
                value={sortBy} 
                onValueChange={setSortBy}
                placeholder="Sắp xếp"
              >
                <SelectWithSearchItem value="newest">Mới nhất</SelectWithSearchItem>
                <SelectWithSearchItem value="price-low">Giá thấp - cao</SelectWithSearchItem>
                <SelectWithSearchItem value="price-high">Giá cao - thấp</SelectWithSearchItem>
              </SelectWithSearch>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
               <label className="text-sm font-semibold text-gray-800">
                 Khoảng giá (₫/giờ)
               </label>
              <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-md border border-gray-300 shadow-sm">
                <span className="font-medium text-[#257180]">
                  {FormatService.formatVND(priceRange[0])}
                </span>
                <span className="text-gray-400">-</span>
                <span className="font-medium text-[#257180]">
                  {FormatService.formatVND(priceRange[1])}
                </span>
              </div>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={500000}
              step={10000}
              className="w-full [&_.bg-primary]:bg-[#257180]"
            />
          </div>
        </div>
      </div>

      {/* Create Request Button - Not Sticky */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateDialog(true)} className="bg-[#257180] hover:bg-[#1e5a66] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tạo yêu cầu
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
            <span className="ml-2 text-gray-600">Đang tải danh sách yêu cầu...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Request List */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-6">
              {paginatedRequests.map((request) => {
                const displayName = request.title || getDisplayName(request);
                // Kiểm tra xem yêu cầu này có phải của user đang login không
                // So sánh với learnerEmail nếu có, nếu không thì so sánh với learnerName (có thể là email)
                const isMyRequest = user?.email && (
                  (request.learnerEmail && user.email.toLowerCase() === request.learnerEmail.toLowerCase()) ||
                  (!request.learnerEmail && user.email.toLowerCase() === request.learnerName.toLowerCase())
                );
                
                return (
                  <Card key={request.id} className="hover:border-[#257180]/40 hover:shadow-md transition-all duration-200 bg-white">
                    <CardContent className="p-6">
                      <div className="flex gap-4 sm:gap-5">
                        {/* Left: Avatar & Basic Info */}
                        <div className="relative flex-shrink-0 self-center sm:self-start">
                          <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-lg overflow-hidden bg-[#F2E5BF]">
                            {request.avatarUrl ? (
                              <img 
                                src={request.avatarUrl} 
                                alt={request.learnerName}
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
                              className={`w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold text-[#257180] bg-[#F2E5BF] ${request.avatarUrl ? 'hidden' : 'flex'}`}
                              style={{ display: request.avatarUrl ? 'none' : 'flex' }}
                            >
                              {request.learnerName?.slice(0, 2).toUpperCase() || 'U'}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Details */}
                        <div className="flex-1">
                          {/* Title & Status */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{displayName}</h3>
                              {isMyRequest && (
                                <Badge className="bg-[#FD8B51] text-white text-xs px-2 py-0.5">
                                  Của tôi
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#257180] text-white text-xs px-3 py-1">
                                {request.subjectName || 'N/A'} - {request.level || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Học viên: {request.learnerName}</p>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              {request.mode === TeachingMode.Online.toString() || request.mode === 'Online' ? (
                                <Video className="h-4 w-4 text-[#257180] flex-shrink-0" />
                              ) : (
                                <Home className="h-4 w-4 text-[#257180] flex-shrink-0" />
                              )}
                              <span className="truncate">{getModeText(request.mode)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock className="h-4 w-4 text-[#257180] flex-shrink-0" />
                              <span>{request.expectedSessions} buổi</span>
                            </div>

                            {request.targetUnitPriceMin && request.targetUnitPriceMax && (
                              <div className="col-span-2 sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
                                <span className="font-semibold text-[#257180]">
                                  {FormatService.formatVND(request.targetUnitPriceMin)} - {FormatService.formatVND(request.targetUnitPriceMax)}/buổi
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom: Price & Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-[#257180]/20 gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                              {request.targetUnitPriceMin && request.targetUnitPriceMax && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Khoảng giá mong muốn</p>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl text-black font-bold">
                                      {request.targetUnitPriceMin === request.targetUnitPriceMax 
                                        ? FormatService.formatVND(request.targetUnitPriceMin)
                                        : `${FormatService.formatVND(request.targetUnitPriceMin)} - ${FormatService.formatVND(request.targetUnitPriceMax)}`
                                      }
                                    </span>
                                    <span className="text-base text-gray-600">/buổi</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button 
                                variant="outline"
                                onClick={() => handleViewDetail(request.id)}
                                className="flex-1 sm:flex-none hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                              >
                                Xem chi tiết
                              </Button>
                              {(request.status === ClassRequestStatus.Open.toString() || request.status === '0') && user && isTutor && (
                                <Button 
                                  onClick={() => handleApplyClick(request.id)}
                                  className="bg-[#FD8B51] hover:bg-[#CB6040] text-white flex-1 sm:flex-none"
                                >
                                  Ứng tuyển
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredRequests.length === 0 && !loading && (
                <Card className="bg-white">
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500 text-sm">Không tìm thấy yêu cầu nào phù hợp</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-sm text-gray-600">
                  Hiển thị <span className="font-bold text-gray-900">{startIndex + 1}</span> - <span className="font-bold text-gray-900">{Math.min(endIndex, filteredRequests.length)}</span> trong tổng số <span className="font-bold text-gray-900">{filteredRequests.length}</span> yêu cầu
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
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
          </>
        )}

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="w-full !max-w-[95vw] sm:!max-w-[70vw] max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Chi tiết yêu cầu mở lớp</DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-gray-600">
                Thông tin chi tiết về yêu cầu và danh sách gia sư ứng tuyển
              </DialogDescription>
            </DialogHeader>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
                <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
              </div>
            ) : selectedRequestDetail ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Left Column: Request Details */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start gap-5 bg-gradient-to-r from-[#F2E5BF]/20 to-transparent p-6 rounded-lg">
                    <div className="relative flex-shrink-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#F2E5BF] border-4 border-white shadow-md">
                        {selectedRequestDetail.learnerEmail && (
                          <div className="w-full h-full rounded-lg flex items-center justify-center text-lg sm:text-xl font-bold text-[#257180] bg-[#F2E5BF]">
                            {selectedRequestDetail.learnerEmail.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {selectedRequestDetail.title || `${selectedRequestDetail.subjectName || ''} ${selectedRequestDetail.level || ''}`.trim()}
                      </h3>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        Môn học
                      </p>
                      <p className="font-medium text-gray-900 mt-1 break-words">{selectedRequestDetail.subjectName || 'N/A'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        Cấp độ
                      </p>
                      <p className="font-medium text-gray-900 mt-1 break-words">{selectedRequestDetail.level || 'N/A'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">Hình thức</p>
                      <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20 mt-1">
                        {getModeText(selectedRequestDetail.mode)}
                      </Badge>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">Số buổi học</p>
                      <p className="font-medium text-gray-900 mt-1 break-words">{selectedRequestDetail.expectedSessions} buổi</p>
                    </div>
                    {selectedRequestDetail.targetUnitPriceMin && selectedRequestDetail.targetUnitPriceMax && (
                      <div className="sm:col-span-2 min-w-0">
                        <p className="text-sm text-gray-600">Mức giá mong muốn</p>
                        <p className="font-medium text-[#257180] mt-1 break-words">
                          {FormatService.formatVND(selectedRequestDetail.targetUnitPriceMin)} - {FormatService.formatVND(selectedRequestDetail.targetUnitPriceMax)}/buổi
                        </p>
                      </div>
                    )}
                  </div>

                {/* Slots */}
                {selectedRequestDetail.slots && selectedRequestDetail.slots.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                      <Clock className="h-4 w-4 text-[#257180]" />
                      Thời gian học dự kiến
                    </p>
                    <div className="space-y-2">
                      {selectedRequestDetail.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 border border-gray-100 rounded-md"
                        >
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-medium text-gray-900">{getDayOfWeekLabel(slot.dayOfWeek)}</span>
                          </div>
                          <div className="text-sm font-semibold text-[#257180]">
                            {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                  {/* Description */}
                  {(selectedRequestDetail.learningGoal || selectedRequestDetail.tutorRequirement) && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {selectedRequestDetail.learningGoal && (
                        <div className="mb-4 min-w-0">
                          <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                            <BookOpen className="h-4 w-4 flex-shrink-0" />
                            Mục tiêu học tập
                          </p>
                          <p className="font-medium text-gray-900 mt-1 break-words whitespace-pre-wrap">{selectedRequestDetail.learningGoal}</p>
                        </div>
                      )}
                      {selectedRequestDetail.tutorRequirement && (
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                            <GraduationCap className="h-4 w-4 flex-shrink-0" />
                            Yêu cầu gia sư
                          </p>
                          <p className="font-medium text-gray-900 mt-1 break-words whitespace-pre-wrap">{selectedRequestDetail.tutorRequirement}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {((selectedRequestDetail.addressLine && selectedRequestDetail.addressLine !== 'string') || selectedRequestDetail.subDistrictName || selectedRequestDetail.provinceName) && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600">Địa điểm học</p>
                          <p className="font-medium text-gray-900 mt-1 break-words">
                            {selectedRequestDetail.subDistrictName && selectedRequestDetail.provinceName ? (
                              `${selectedRequestDetail.subDistrictName}, ${selectedRequestDetail.provinceName}`
                            ) : selectedRequestDetail.provinceName || selectedRequestDetail.subDistrictName || 'Chưa có'}
                          </p>
                          {selectedRequestDetail.addressLine && selectedRequestDetail.addressLine !== 'string' && (
                            <p className="text-sm text-gray-600 mt-1 break-words">{selectedRequestDetail.addressLine}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Ngày tạo</p>
                      <p className="font-medium text-gray-900 mt-1">
                        {FormatService.formatDate(selectedRequestDetail.createdAt)}
                      </p>
                    </div>
                    {selectedRequestDetail.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Ngày cập nhật</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {FormatService.formatDate(selectedRequestDetail.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Applicants */}
                <div className="border-l-2 border-gray-200 pl-6 lg:col-span-1">
                  <h4 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-900">
                    <GraduationCap className="h-6 w-6 text-[#257180]" />
                    Gia sư ứng tuyển ({applicants.length})
                  </h4>

                  {loadingApplicants ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-[#257180]" />
                    </div>
                  ) : applicants.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Chưa có gia sư nào ứng tuyển</p>
                      <p className="text-gray-500 mt-1 text-sm">Hãy quay lại sau nhé!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                      {applicants.map((applicant) => (
                        <Card key={applicant.applicationId} className="border border-gray-200 hover:border-[#FD8B51]/30 transition-all">
                          <CardContent className="p-4">
                            <div className="flex gap-3 mb-3">
                              <div className="relative flex-shrink-0">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2E5BF] border-2 border-gray-200">
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
                                    className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold text-[#257180] bg-[#F2E5BF] ${applicant.avatarUrl ? 'hidden' : 'flex'}`}
                                    style={{ display: applicant.avatarUrl ? 'none' : 'flex' }}
                                  >
                                    {applicant.tutorName?.slice(0, 2).toUpperCase() || 'GS'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-lg font-semibold mb-1 truncate">{applicant.tutorName}</h5>
                                <p className="text-xs text-gray-500">
                                  Ứng tuyển: {FormatService.formatDate(applicant.appliedAt)}
                                </p>
                              </div>
                            </div>

                            <div className="mb-3 min-w-0">
                              <p className="text-gray-500 text-xs mb-1">Thư ứng tuyển:</p>
                              <p className="text-gray-700 leading-relaxed text-sm break-words whitespace-pre-wrap">{applicant.message}</p>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51] text-xs"
                                onClick={() => handleViewTutorProfile(applicant.tutorId)}
                              >
                                Xem hồ sơ
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy thông tin chi tiết</p>
              </div>
            )}
            
            {/* Footer với button Ứng tuyển ở góc phải */}
            {selectedRequestDetail && (() => {
              // Parse status number
              let statusNum: number;
              if (typeof selectedRequestDetail.status === 'number') {
                statusNum = selectedRequestDetail.status;
              } else {
                const parsed = parseInt(selectedRequestDetail.status, 10);
                if (!isNaN(parsed)) {
                  statusNum = parsed;
                } else {
                  // Map từ enum name
                  const statusMap: Record<string, number> = {
                    'Open': ClassRequestStatus.Open,
                    'Reviewing': ClassRequestStatus.Reviewing,
                    'Selected': ClassRequestStatus.Selected,
                    'Closed': ClassRequestStatus.Closed,
                    'Cancelled': ClassRequestStatus.Cancelled,
                    'Expired': ClassRequestStatus.Expired,
                  };
                  statusNum = statusMap[selectedRequestDetail.status] ?? -1;
                }
              }
              const isOpen = statusNum === ClassRequestStatus.Open;
              if (isOpen && user && isTutor) {
                return (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                    <Button
                      onClick={() => handleApplyClick(selectedRequestDetail.id)}
                      className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
                      size="lg"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Ứng tuyển
                    </Button>
                  </div>
                );
              }
              return null;
            })()}
          </DialogContent>
        </Dialog>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ứng tuyển vào yêu cầu mở lớp</DialogTitle>
              <DialogDescription>
                Vui lòng viết thư ứng tuyển để giới thiệu về bản thân và phương pháp dạy học của bạn
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="applyMessage">Thư ứng tuyển *</Label>
                <Textarea
                  id="applyMessage"
                  placeholder="Xin chào, tôi là gia sư có kinh nghiệm... (Tối thiểu 50 ký tự)"
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  className="mt-2 min-h-[150px]"
                  disabled={isApplying}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {applyMessage.length}/50 ký tự tối thiểu
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplyDialog(false);
                    setApplyMessage('');
                    setApplyingRequestId(null);
                  }}
                  disabled={isApplying}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitApply}
                  disabled={isApplying || !applyMessage.trim() || applyMessage.trim().length < 50}
                  className="bg-[#257180] hover:bg-[#1e5a66] text-white"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi ứng tuyển
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Request Dialog */}
        <CreateClassRequestDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            // Reload danh sách sau khi tạo thành công
            const reload = async () => {
              try {
                const response = await ClassRequestService.getOpenClassRequests();
                if (response.success && response.data) {
                  setClassRequests(response.data);
                }
              } catch (err) {
                // Silent error - không cần log
              }
            };
            reload();
          }}
        />
      </div>
    </div>
  );
}
