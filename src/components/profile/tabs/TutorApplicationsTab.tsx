"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/layout/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { Badge } from '@/components/ui/basic/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/feedback/dialog';
import { Textarea } from '@/components/ui/form/textarea';
import {
  Search,
  Loader2,
  Eye,
  Edit,
  XCircle,
  Filter,
  Calendar,
  BookOpen,
  GraduationCap,
  Target,
  MapPin,
  User as UserIcon,
  DollarSign,
  Clock,
  ArrowUpDown,
  FileText,
} from 'lucide-react';
import { TutorApplicationService } from '@/services/tutorApplicationService';
import { ClassRequestService, ClassRequestDetailDto } from '@/services/classRequestService';
import { TutorAppliedItemDto } from '@/types/backend';
import { useCustomToast } from '@/hooks/useCustomToast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TutorApplicationStatus, DayOfWeekEnum, EnumHelpers } from '@/types/enums';
import { getClassRequestStatusText, getClassRequestStatusColor } from '@/data/mockClassRequests';
import { FormatService } from '@/lib/format';

const PAGE_SIZE = 8;

type ApplicationRow = TutorAppliedItemDto & { listStatus: 'applied' | 'canceled' };

const formatSlotTime = (time?: string | null): string => {
  if (!time) return 'N/A';
  const timeStr = time.toString();
  if (timeStr.length >= 5) {
    return timeStr.slice(0, 5);
  }
  return timeStr;
};

const parseApplicationStatus = (status: number | string): TutorApplicationStatus => {
  if (typeof status === 'number') {
    return status === 0 ? TutorApplicationStatus.Applied : TutorApplicationStatus.Canceled;
  }
  if (status === 'Applied' || status === '0') {
    return TutorApplicationStatus.Applied;
  }
  return TutorApplicationStatus.Canceled;
};

const getApplicationStatusBadge = (status: TutorApplicationStatus) => {
  if (status === TutorApplicationStatus.Applied) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

const getApplicationStatusText = (status: TutorApplicationStatus) => {
  if (status === TutorApplicationStatus.Applied) {
    return 'Đang ứng tuyển';
  }
  return 'Đã hủy';
};

const parseClassRequestStatus = (status: string | number): number => {
  if (typeof status === 'number') {
    return status;
  }
  switch (status) {
    case 'Open':
    case '0':
      return 0;
    case 'Reviewing':
    case '1':
      return 1;
    case 'Selected':
    case '2':
      return 2;
    case 'Closed':
    case '3':
      return 3;
    case 'Cancelled':
    case '4':
      return 4;
    case 'Expired':
    case '5':
      return 5;
    default:
      return -1;
  }
};

const getModeLabel = (mode: string | number | null | undefined) => {
  if (mode === null || mode === undefined) {
    return 'Không xác định';
  }
  if (typeof mode === 'number') {
    if (mode === 0) return 'Tại nhà';
    if (mode === 1) return 'Trực tuyến';
    if (mode === 2) return 'Kết hợp';
    return 'Không xác định';
  }
  const normalized = mode.toString().toLowerCase();
  if (normalized === 'offline' || normalized === '0') return 'Tại nhà';
  if (normalized === 'online' || normalized === '1') return 'Trực tuyến';
  if (normalized === 'hybrid' || normalized === '2') return 'Kết hợp';
  return 'Không xác định';
};

const renderSlots = (slots?: ClassRequestDetailDto['slots']) => {
  if (!slots || slots.length === 0) return null;
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-base text-gray-900">Lịch học dự kiến</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slots.map((slot) => (
          <div key={slot.id} className="p-3 border border-[#257180]/20 rounded-lg flex items-center justify-between">
            <span className="font-medium text-gray-900">
              {EnumHelpers.getDayOfWeekLabel(slot.dayOfWeek as DayOfWeekEnum)}
            </span>
            <span className="text-sm text-gray-600">
              {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export function TutorApplicationsTab() {
  const { showError, showSuccess } = useCustomToast();
  const [appliedApplications, setAppliedApplications] = useState<TutorAppliedItemDto[]>([]);
  const [canceledApplications, setCanceledApplications] = useState<TutorAppliedItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'canceled'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'offline' | 'online' | 'hybrid'>('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRequest, setDetailRequest] = useState<ClassRequestDetailDto | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const [appliedRes, canceledRes] = await Promise.all([
        TutorApplicationService.getTutorAppliedApplications(),
        TutorApplicationService.getTutorCanceledApplications(),
      ]);
      const appliedData = appliedRes.success && appliedRes.data ? appliedRes.data : [];
      const canceledData = canceledRes.success && canceledRes.data ? canceledRes.data : [];
      setAppliedApplications(appliedData);
      setCanceledApplications(canceledData);
    } catch (error) {
      showError('Lỗi', 'Không thể tải danh sách ứng tuyển');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, modeFilter]);

  const combinedApplications = useMemo(() => {
    const appliedRows: ApplicationRow[] = appliedApplications.map((item) => ({
      ...item,
      listStatus: 'applied',
    }));
    const canceledRows: ApplicationRow[] = canceledApplications.map((item) => ({
      ...item,
      listStatus: 'canceled',
    }));
    return [...appliedRows, ...canceledRows];
  }, [appliedApplications, canceledApplications]);

  const filteredApplications = useMemo(() => {
    let data = combinedApplications;
    if (statusFilter !== 'all') {
      data = data.filter((item) => item.listStatus === statusFilter);
    }
    if (modeFilter !== 'all') {
      data = data.filter((item) => {
        if (!item.mode) return false;
        const normalized = item.mode.toString().toLowerCase();
        if (modeFilter === 'offline') return normalized.includes('offline') || normalized === '0';
        if (modeFilter === 'online') return normalized.includes('online') || normalized === '1';
        return normalized.includes('hybrid') || normalized === '2';
      });
    }
    if (searchTerm.trim().length > 0) {
      const term = searchTerm.trim().toLowerCase();
      data = data.filter((item) =>
        item.title.toLowerCase().includes(term) ||
        item.subjectName.toLowerCase().includes(term) ||
        item.learnerName.toLowerCase().includes(term)
      );
    }
    const sorted = [...data].sort((a, b) => {
      if (priceSort) {
        const aPrice = a.targetUnitPriceMin ?? a.targetUnitPriceMax ?? 0;
        const bPrice = b.targetUnitPriceMin ?? b.targetUnitPriceMax ?? 0;
        if (aPrice === bPrice) {
          return priceSort === 'asc'
            ? new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
            : new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        }
        return priceSort === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      }
      const diff = new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      return dateSort === 'asc' ? -diff : diff;
    });
    return sorted;
  }, [combinedApplications, searchTerm, statusFilter, modeFilter, priceSort, dateSort]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + PAGE_SIZE);

  const handleViewDetail = async (application: ApplicationRow) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
    setDetailLoading(true);
    try {
      const response = await ClassRequestService.getClassRequestById(application.classRequestId);
      if (response.success && response.data) {
        setDetailRequest(response.data);
      } else {
        throw new Error(response.message || 'Không thể tải chi tiết yêu cầu');
      }
    } catch (error) {
      showError('Lỗi', 'Không thể tải thông tin chi tiết');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenEdit = (application: ApplicationRow) => {
    setSelectedApplication(application);
    setEditMessage(application.message);
    setEditDialogOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!selectedApplication) return;
    if (!editMessage.trim()) {
      showError('Thiếu thông tin', 'Vui lòng nhập nội dung cập nhật');
      return;
    }
    setEditLoading(true);
    try {
      const response = await TutorApplicationService.editApplication({
        tutorApplicationId: selectedApplication.id,
        message: editMessage.trim(),
      });
      if (!response.success) {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
      showSuccess('Thành công', 'Đã cập nhật tin nhắn ứng tuyển');
      setEditDialogOpen(false);
      setSelectedApplication(null);
      await loadApplications();
    } catch (error) {
      showError('Lỗi', 'Không thể cập nhật tin nhắn');
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedApplication) return;
    setCancelLoading(true);
    try {
      const response = await TutorApplicationService.cancelApplication(selectedApplication.id);
      if (!response.success) {
        throw new Error(response.message || 'Hủy ứng tuyển thất bại');
      }
      showSuccess('Thành công', 'Đã hủy ứng tuyển');
      setCancelDialogOpen(false);
      setSelectedApplication(null);
      await loadApplications();
    } catch (error) {
      showError('Lỗi', 'Không thể hủy ứng tuyển');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatPrice = (min?: number, max?: number) => {
    if (min && max) {
      return `${FormatService.formatVND(min)} - ${FormatService.formatVND(max)}/buổi`;
    }
    if (min) {
      return FormatService.formatVND(min);
    }
    if (max) {
      return FormatService.formatVND(max);
    }
    return 'Chưa có';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Ứng tuyển lớp dạy</h2>
          <p className="text-gray-600 mt-1">Theo dõi các yêu cầu mở lớp mà bạn đã gửi</p>
        </div>
        <Button
          variant="outline"
          className="border-[#257180] text-[#257180] hover:bg-[#257180] hover:text-white"
          onClick={loadApplications}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tải
            </>
          ) : (
            <>
              <Filter className="h-4 w-4 mr-2" />
              Làm mới dữ liệu
            </>
          )}
        </Button>
      </div>

      <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tiêu đề, môn học hoặc học viên"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'applied' | 'canceled') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="applied">Đang ứng tuyển</SelectItem>
                <SelectItem value="canceled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={modeFilter} onValueChange={(value: 'all' | 'offline' | 'online' | 'hybrid') => setModeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Hình thức dạy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hình thức</SelectItem>
                <SelectItem value="offline">Dạy trực tiếp</SelectItem>
                <SelectItem value="online">Dạy online</SelectItem>
                <SelectItem value="hybrid">Kết hợp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Danh sách ứng tuyển</CardTitle>
            <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
              {filteredApplications.length} yêu cầu
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[50px] text-center px-2">ID</TableHead>
                  <TableHead className="min-w-[180px] max-w-[250px] px-3">Yêu cầu</TableHead>
                  <TableHead className="w-[90px] px-2">Hình thức</TableHead>
                  <TableHead className="w-[120px] px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPriceSort((prev) => {
                          if (prev === 'asc') return 'desc';
                          if (prev === 'desc') return null;
                          return 'asc';
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-[#257180]"
                    >
                      Học phí
                      <ArrowUpDown
                        className={`h-3 w-3 transition-colors ${priceSort ? 'text-[#257180]' : 'text-gray-400'}`}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px] px-2">Trạng thái</TableHead>
                  <TableHead className="w-[110px] px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDateSort((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                        setPriceSort(null);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-[#257180]"
                    >
                      Ngày ứng tuyển
                      <ArrowUpDown
                        className={`h-3 w-3 transition-transform ${dateSort === 'asc' ? 'rotate-180' : ''} text-[#257180]`}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="w-[90px] text-right px-2">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#257180]" />
                      <p className="text-gray-500 mt-2">Đang tải dữ liệu</p>
                    </TableCell>
                  </TableRow>
                ) : paginatedApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      Không có ứng tuyển nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedApplications.map((application, index) => {
                    const applicationStatus = parseApplicationStatus(application.tutorApplicationStatus);
                    return (
                      <TableRow key={application.id} className="hover:bg-gray-50 border-b border-gray-200">
                        <TableCell className="text-center font-mono text-xs text-gray-600 px-2">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="px-3">
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 line-clamp-1 truncate">{application.title}</p>
                            <p className="text-xs text-gray-600 line-clamp-1 truncate">
                              {application.subjectName} • {application.level}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
                              <UserIcon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{application.learnerName}</span>
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-2">
                          <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20 text-xs whitespace-nowrap">
                            {getModeLabel(application.mode)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-2">
                          <div className="text-xs text-gray-900">
                            <span className="line-clamp-2">{formatPrice(application.targetUnitPriceMin, application.targetUnitPriceMax)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-2">
                          <Badge className={`${getApplicationStatusBadge(applicationStatus)} text-xs`}>
                            {getApplicationStatusText(applicationStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 whitespace-nowrap px-2">
                          {FormatService.formatDate(application.appliedAt)}
                        </TableCell>
                        <TableCell className="text-right px-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full border border-gray-200 text-gray-500 hover:bg-[#FD8B51] hover:text-white flex-shrink-0"
                              onClick={() => handleViewDetail(application)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {applicationStatus === TutorApplicationStatus.Applied && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full border border-gray-200 text-gray-500 hover:bg-[#257180] hover:text-white flex-shrink-0"
                                  onClick={() => handleOpenEdit(application)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full border border-gray-200 text-gray-500 hover:bg-red-500 hover:text-white flex-shrink-0"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setCancelDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredApplications.length > PAGE_SIZE && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPageSafe - 1))}
                      className={currentPageSafe === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPageSafe === index + 1}
                        className="cursor-pointer"
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPageSafe + 1))}
                      className={currentPageSafe === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            setDetailRequest(null);
            setSelectedApplication(null);
          }
        }}
      >
        <DialogContent className="w-full !max-w-[95vw] sm:!max-w-[70vw] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              {detailRequest ? (detailRequest.title || `${detailRequest.subjectName || ''} ${detailRequest.level || ''}`.trim()) : 'Chi tiết yêu cầu mở lớp'}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Thông tin chi tiết về yêu cầu và danh sách gia sư ứng tuyển
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
              <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
            </div>
          ) : detailRequest ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
              {/* Left Column: Request Details */}
              <div className="space-y-6 lg:col-span-2">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const statusNum = parseClassRequestStatus(detailRequest.status);
                      return (
                        <>
                          <Badge className={getClassRequestStatusColor(statusNum)}>
                            {getClassRequestStatusText(statusNum)}
                          </Badge>
                          {selectedApplication && (
                            <Badge className={getApplicationStatusBadge(parseApplicationStatus(selectedApplication.tutorApplicationStatus))}>
                              {getApplicationStatusText(parseApplicationStatus(selectedApplication.tutorApplicationStatus))}
                            </Badge>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      Môn học
                    </p>
                    <p className="font-medium text-gray-900 mt-1 break-words">{detailRequest.subjectName || 'N/A'}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      Cấp độ
                    </p>
                    <p className="font-medium text-gray-900 mt-1 break-words">{detailRequest.level || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2 min-w-0">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      Mục tiêu học tập
                    </p>
                    <p className="font-medium text-gray-900 mt-1 break-words whitespace-pre-wrap">{detailRequest.learningGoal || 'Chưa có'}</p>
                  </div>
                  <div className="sm:col-span-2 min-w-0">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      Yêu cầu gia sư
                    </p>
                    <p className="font-medium text-gray-900 mt-1 break-words whitespace-pre-wrap">{detailRequest.tutorRequirement || 'Chưa có'}</p>
                  </div>
                  {detailRequest.expectedStartDate && (
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        Ngày bắt đầu dự kiến
                      </p>
                      <p className="font-medium text-gray-900 mt-1 break-words">
                        {FormatService.formatDate(detailRequest.expectedStartDate)}
                      </p>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Hình thức</p>
                    <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20 mt-1">
                      {getModeLabel(detailRequest.mode)}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Số buổi học</p>
                    <p className="font-medium text-gray-900 mt-1 break-words">{detailRequest.expectedSessions} buổi</p>
                  </div>
                  {detailRequest.targetUnitPriceMin && detailRequest.targetUnitPriceMax && (
                    <div className="sm:col-span-2 min-w-0">
                      <p className="text-sm text-gray-600">Mức giá mong muốn</p>
                      <p className="font-medium text-[#257180] mt-1 break-words">
                        {FormatService.formatVND(detailRequest.targetUnitPriceMin)} - {FormatService.formatVND(detailRequest.targetUnitPriceMax)}/buổi
                      </p>
                    </div>
                  )}
                </div>

                {/* Slots */}
                {detailRequest.slots && detailRequest.slots.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                      <Clock className="h-4 w-4 text-[#257180]" />
                      Thời gian học dự kiến
                    </p>
                    <div className="space-y-2">
                      {detailRequest.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 border border-gray-100 rounded-md"
                        >
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-medium text-gray-900">{EnumHelpers.getDayOfWeekLabel(slot.dayOfWeek as DayOfWeekEnum)}</span>
                          </div>
                          <div className="text-sm font-semibold text-[#257180]">
                            {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {((detailRequest.addressLine && detailRequest.addressLine !== 'string') || detailRequest.subDistrictName || detailRequest.provinceName) && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600">Địa điểm học</p>
                        <p className="font-medium text-gray-900 mt-1 break-words">
                          {detailRequest.subDistrictName && detailRequest.provinceName ? (
                            `${detailRequest.subDistrictName}, ${detailRequest.provinceName}`
                          ) : detailRequest.provinceName || detailRequest.subDistrictName || 'Chưa có'}
                        </p>
                        {detailRequest.addressLine && detailRequest.addressLine !== 'string' && (
                          <p className="text-sm text-gray-600 mt-1 break-words">{detailRequest.addressLine}</p>
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
                      {FormatService.formatDate(detailRequest.createdAt)}
                    </p>
                  </div>
                  {detailRequest.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-600">Ngày cập nhật</p>
                      <p className="font-medium text-gray-900 mt-1">
                        {FormatService.formatDate(detailRequest.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Application Message */}
              <div className="border-l-2 border-gray-200 pl-6 lg:col-span-1">
                <h4 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-900">
                  <FileText className="h-6 w-6 text-[#257180]" />
                  Thư ứng tuyển
                </h4>

                {selectedApplication?.message ? (
                  <Card className="border border-gray-200 hover:border-[#FD8B51]/30 transition-all">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Ứng tuyển: {FormatService.formatDate(selectedApplication.appliedAt)}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-gray-700 leading-relaxed text-sm break-words whitespace-pre-wrap">{selectedApplication.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Chưa có thư ứng tuyển</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy thông tin chi tiết</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedApplication(null);
            setEditMessage('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cập nhật tin nhắn ứng tuyển</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              rows={6}
              value={editMessage}
              onChange={(event) => setEditMessage(event.target.value)}
              placeholder="Chia sẻ thêm lý do bạn phù hợp với lớp học này..."
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={editLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={editLoading}
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  'Cập nhật'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            setSelectedApplication(null);
          }
        }}
        title="Hủy ứng tuyển"
        description="Bạn có chắc chắn muốn hủy ứng tuyển cho lớp này?"
        type="error"
        confirmText="Hủy ngay"
        cancelText="Đóng"
        loading={cancelLoading}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

