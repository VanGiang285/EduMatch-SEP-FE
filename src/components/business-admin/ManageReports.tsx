'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  DialogFooter,
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { useCustomToast } from '@/hooks/useCustomToast';
import { ReportService, TutorService, BookingService } from '@/services';
import { ReportFullDetailDto, ReportListItemDto, ReportDefenseDto, ReportEvidenceDto, BookingCancelPreviewDto } from '@/types/backend';
import { MediaType, ReportStatus } from '@/types/enums';
import { 
  Search,
  Eye,
  ArrowUpDown,
  Loader2,
  XCircle,
  Shield,
} from 'lucide-react';

const PAGE_SIZE = 10;

type SortField = 'id' | 'reporterName' | 'reportedUserName' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type ActionType = 'resolve' | 'dismiss';

const getStatusLabel = (status: ReportStatus | number | string): string => {
  let statusNum: number;
  if (typeof status === 'string') {
    statusNum = parseInt(status, 10);
    if (isNaN(statusNum)) {
      if (status === 'Pending') return 'Chờ xử lý';
      if (status === 'UnderReview') return 'Đang xem xét';
      if (status === 'Resolved') return 'Đã giải quyết';
      if (status === 'Dismissed') return 'Đã bác bỏ';
      return 'Không xác định';
    }
  } else if (typeof status === 'number') {
    statusNum = status;
  } else {
    statusNum = status as number;
  }

  switch (statusNum) {
    case ReportStatus.Pending:
    case 0:
      return 'Chờ xử lý';
    case ReportStatus.UnderReview:
    case 1:
      return 'Đang xem xét';
    case ReportStatus.Resolved:
    case 2:
      return 'Đã giải quyết';
    case ReportStatus.Dismissed:
    case 3:
      return 'Đã bác bỏ';
    default:
      return 'Không xác định';
  }
};

const getStatusColor = (status: ReportStatus | number | string): string => {
  let statusNum: number;
  if (typeof status === 'string') {
    statusNum = parseInt(status, 10);
    if (isNaN(statusNum)) {
      if (status === 'Pending') return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      if (status === 'UnderReview') return 'bg-blue-100 text-blue-800 border border-blue-200';
      if (status === 'Resolved') return 'bg-green-100 text-green-800 border border-green-200';
      if (status === 'Dismissed') return 'bg-red-100 text-red-800 border border-red-200';
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  } else if (typeof status === 'number') {
    statusNum = status;
  } else {
    statusNum = status as number;
  }

  switch (statusNum) {
    case ReportStatus.Pending:
    case 0:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case ReportStatus.UnderReview:
    case 1:
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case ReportStatus.Resolved:
    case 2:
      return 'bg-green-100 text-green-800 border border-green-200';
    case ReportStatus.Dismissed:
    case 3:
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

const isPendingOrUnderReviewStatus = (
  status: ReportStatus | number | string | undefined
): boolean => {
  if (status === undefined || status === null) return false;
  if (typeof status === 'string') {
    if (status === 'Pending' || status === '0') return true;
    if (status === 'UnderReview' || status === '1') return true;
    const parsed = parseInt(status, 10);
    return !isNaN(parsed) && (parsed === ReportStatus.Pending || parsed === ReportStatus.UnderReview);
  }
  const numeric = Number(status);
  return numeric === ReportStatus.Pending || numeric === ReportStatus.UnderReview;
};

const formatDate = (value?: string, withTime = false): string => {
  if (!value) return '---';
  const date = new Date(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};

const getInitials = (text?: string) => {
  if (!text) return 'NA';
  return text
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const normalizeMediaTypeValue = (
  mediaType: number | string | undefined
): number => {
  if (mediaType === undefined || mediaType === null) {
    return MediaType.Image;
  }
  if (typeof mediaType === 'string') {
    const parsed = parseInt(mediaType, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
    if (mediaType.toLowerCase().includes('image')) return MediaType.Image;
    if (mediaType.toLowerCase().includes('video')) return MediaType.Video;
  }
  return Number(mediaType);
};

const normalizeEvidenceList = (
  evidences?: ReportEvidenceDto[]
): ReportEvidenceDto[] | undefined =>
  evidences?.map((item) => ({
    ...item,
    mediaType: normalizeMediaTypeValue(item.mediaType),
  }));

export function ManageReports() {
  const { showSuccess, showError } = useCustomToast();
  const showErrorRef = useRef(showError);

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportFullDetailDto | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});
  const [tutorAvatars, setTutorAvatars] = useState<Record<string, string>>({});
  const [isDefenseWindowOpen, setIsDefenseWindowOpen] = useState(false);
  const [isReportResolved, setIsReportResolved] = useState(false);
  const [cancelBookingDialogOpen, setCancelBookingDialogOpen] = useState(false);
  const [cancelPreview, setCancelPreview] = useState<BookingCancelPreviewDto | null>(null);
  const [loadingCancelPreview, setLoadingCancelPreview] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ReportService.getAllReports();
      if (response.success && response.data) {
        setReports(response.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch reports', error);
      showErrorRef.current('Lỗi', 'Không thể tải danh sách báo cáo');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const loadReportDetail = useCallback(
    async (reportId: number) => {
      const response = await ReportService.getFullReportDetail(reportId);
      if (!response.success || !response.data) {
        throw new Error('Không thể tải chi tiết báo cáo');
      }

      const baseDetail = response.data;
      const enriched: ReportFullDetailDto = {
        ...baseDetail,
        reporterEvidences: normalizeEvidenceList(baseDetail.reporterEvidences),
        tutorEvidences: normalizeEvidenceList(baseDetail.tutorEvidences),
        adminEvidences: normalizeEvidenceList(baseDetail.adminEvidences),
      };

      let defenses: ReportDefenseDto[] = [];
      if (baseDetail.defenses && baseDetail.defenses.length > 0) {
        const defensesResponse = await ReportService.getDefenses(baseDetail.id);
        if (defensesResponse.success && defensesResponse.data) {
          defenses = defensesResponse.data.map((defense) => ({
            ...defense,
            evidences: normalizeEvidenceList(defense.evidences) ?? [],
          }));
        } else {
          defenses = baseDetail.defenses.map((defense) => ({
            ...defense,
            evidences: normalizeEvidenceList(defense.evidences) ?? [],
          }));
        }
      }

      const tutorEvidences = enriched.tutorEvidences ?? [];
      if (defenses.length > 0 && tutorEvidences.length > 0) {
        const usedEvidenceIds = new Set<number>();
        defenses = defenses.map((defense) => {
          let defenseEvidences = defense.evidences ?? [];

          if (defenseEvidences.length === 0) {
            const defenseTime = new Date(defense.createdAt).getTime();
            const relatedEvidences = tutorEvidences
              .filter((evidence) => {
                if (usedEvidenceIds.has(evidence.id)) return false;
                if (
                  evidence.submittedByEmail &&
                  defense.tutorEmail &&
                  evidence.submittedByEmail !== defense.tutorEmail
                ) {
                  return false;
                }
                const evidenceTime = new Date(evidence.createdAt).getTime();
                return Math.abs(evidenceTime - defenseTime) < 60000;
              })
              .sort((a, b) => {
                const aDiff = Math.abs(new Date(a.createdAt).getTime() - defenseTime);
                const bDiff = Math.abs(new Date(b.createdAt).getTime() - defenseTime);
                return aDiff - bDiff;
              })
              .slice(0, 10)
              .map((evidence) => {
                usedEvidenceIds.add(evidence.id);
                return {
                  ...evidence,
                  mediaType: normalizeMediaTypeValue(evidence.mediaType),
                };
              });

            defenseEvidences = relatedEvidences;
          }

          return {
            ...defense,
            evidences: defenseEvidences,
          };
        });
      }

      enriched.defenses = defenses;
      try {
        const canDefenseResponse = await ReportService.canSubmitDefense(reportId);
        setIsDefenseWindowOpen(!!canDefenseResponse.data && canDefenseResponse.success);
      } catch {
        setIsDefenseWindowOpen(false);
      }

      try {
        const isResolvedResponse = await ReportService.isReportResolved(reportId);
        if (isResolvedResponse.success && isResolvedResponse.data) {
          setIsReportResolved(isResolvedResponse.data === 'yes');
        } else {
          setIsReportResolved(false);
        }
      } catch {
        setIsReportResolved(false);
      }

      if (enriched.defenses && enriched.defenses.length > 0) {
        const uniqueTutorEmails = Array.from(
          new Set(enriched.defenses.map((defense) => defense.tutorEmail))
        ).filter(Boolean) as string[];

        if (uniqueTutorEmails.length > 0) {
          const nameMap: Record<string, string> = {};
          const avatarMap: Record<string, string> = {};

          await Promise.all(
            uniqueTutorEmails.map(async (email) => {
              try {
                const tutorResponse = await TutorService.getTutorByEmail(email);
                if (tutorResponse.success && tutorResponse.data) {
                  nameMap[email] = tutorResponse.data.userName || email;
                  avatarMap[email] = tutorResponse.data.avatarUrl || '';
                } else {
                  nameMap[email] = email;
                  avatarMap[email] = '';
                }
              } catch {
                nameMap[email] = email;
                avatarMap[email] = '';
              }
            })
          );

          setTutorNames(nameMap);
          setTutorAvatars(avatarMap);
        } else {
          setTutorNames({});
          setTutorAvatars({});
        }
      } else {
        setTutorNames({});
        setTutorAvatars({});
        enriched.defenses = [];
      }

      setSelectedReport(enriched);
    },
    []
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        const keyword = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          report.reporterName?.toLowerCase().includes(keyword) ||
          report.reportedUserName?.toLowerCase().includes(keyword) ||
          report.reporterEmail.toLowerCase().includes(keyword) ||
          report.reportedUserEmail.toLowerCase().includes(keyword) ||
          report.reason.toLowerCase().includes(keyword);

        const matchesStatus =
          statusFilter === 'all' ||
          report.status === Number(statusFilter);

        const createdAt = new Date(report.createdAt).getTime();
        const fromTime = dateFrom ? new Date(dateFrom).getTime() : null;
        const toTime = dateTo ? new Date(dateTo).getTime() + 86399000 : null;

        const matchesDate =
          (!fromTime || createdAt >= fromTime) &&
          (!toTime || createdAt <= toTime);

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        let aValue: number | string = '';
        let bValue: number | string = '';
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'reporterName':
            aValue = (a.reporterName || a.reporterEmail).toLowerCase();
            bValue = (b.reporterName || b.reporterEmail).toLowerCase();
          break;
          case 'reportedUserName':
            aValue = (a.reportedUserName || a.reportedUserEmail).toLowerCase();
            bValue = (b.reportedUserName || b.reportedUserEmail).toLowerCase();
          break;
        case 'createdAt':
          default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [reports, searchTerm, statusFilter, dateFrom, dateTo, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + PAGE_SIZE);

  const handleOpenDetail = async (reportId: number) => {
    setDetailDialogOpen(true);
    setSelectedReport(null);
    setDetailLoading(true);
    setIsDefenseWindowOpen(false);
    setIsReportResolved(false);
    try {
      await loadReportDetail(reportId);
    } catch (error) {
      console.error('Failed to fetch report detail', error);
      showErrorRef.current('Lỗi', 'Không thể tải chi tiết báo cáo');
      setDetailDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCancelBookingDialog = async () => {
    if (!selectedReport?.bookingId && !selectedReport?.booking?.id) {
      showError('Lỗi', 'Không tìm thấy thông tin booking');
      return;
    }
    const bookingId = selectedReport.bookingId || selectedReport.booking?.id;
    if (!bookingId) {
      showError('Lỗi', 'Không tìm thấy thông tin booking');
      return;
    }

    setLoadingCancelPreview(true);
    setCancelBookingDialogOpen(true);
    try {
      const response = await BookingService.getCancelPreview(bookingId);
      if (response.success && response.data) {
        setCancelPreview(response.data);
      } else {
        showError('Lỗi', response.message || 'Không thể lấy thông tin preview');
        setCancelBookingDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error loading cancel preview:', error);
      showError('Lỗi', 'Không thể lấy thông tin preview');
      setCancelBookingDialogOpen(false);
    } finally {
      setLoadingCancelPreview(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedReport?.bookingId && !selectedReport?.booking?.id) {
      showError('Lỗi', 'Không tìm thấy thông tin booking');
      return;
    }
    const bookingId = selectedReport.bookingId || selectedReport.booking?.id;
    if (!bookingId) {
      showError('Lỗi', 'Không tìm thấy thông tin booking');
      return;
    }

    setCancellingBooking(true);
    try {
      const response = await BookingService.cancelByLearner(bookingId);
      if (response.success) {
        showSuccess('Thành công', 'Đã hủy booking thành công');
        setCancelBookingDialogOpen(false);
        setCancelPreview(null);
        if (selectedReport) {
          await loadReportDetail(selectedReport.id);
        }
        fetchReports();
      } else {
        showError('Lỗi', response.message || 'Không thể hủy booking');
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      showError('Lỗi', 'Không thể hủy booking');
    } finally {
      setCancellingBooking(false);
    }
  };

  const handleOpenActionDialog = (type: ActionType) => {
    setActionType(type);
    setActionNote('');
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedReport || !actionType) return;
    if (!actionNote.trim()) {
      showError('Thiếu thông tin', 'Vui lòng nhập ghi chú xử lý');
      return;
    }

    setActionSubmitting(true);
    try {
      const status =
        actionType === 'resolve' ? ReportStatus.Resolved : ReportStatus.Dismissed;
      const response = await ReportService.updateReportByAdmin(selectedReport.id, {
        status,
        adminNotes: actionNote.trim(),
      });

      const updatedReport = response.success ? response.data : undefined;
      if (updatedReport) {
        showSuccess(
          'Thành công',
          actionType === 'resolve'
            ? 'Đã đánh dấu báo cáo là ĐÃ GIẢI QUYẾT'
            : 'Đã bác bỏ báo cáo'
        );

        setReports((prev) =>
          prev.map((report) =>
            report.id === selectedReport.id
              ? { ...report, status }
              : report
          )
        );

        if (selectedReport) {
          setDetailLoading(true);
          try {
            await loadReportDetail(selectedReport.id);
          } catch (error) {
            console.error('Failed to refresh report detail', error);
            showErrorRef.current('Lỗi', 'Không thể làm mới chi tiết báo cáo');
            setDetailDialogOpen(false);
          } finally {
            setDetailLoading(false);
          }
        }
      } else {
        showError('Lỗi', 'Không thể cập nhật trạng thái báo cáo');
      }
    } catch (error) {
      console.error('Failed to update report', error);
      showError('Lỗi', 'Không thể cập nhật trạng thái báo cáo');
    } finally {
      setActionSubmitting(false);
      setActionDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý báo cáo</h1>
        <p className="text-gray-600">
          Theo dõi, tìm kiếm và xử lý toàn bộ báo cáo từ người dùng.
        </p>
      </div>

      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                placeholder="Tìm theo tên/email người báo cáo, gia sư hoặc lý do..."
                />
              </div>
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto flex-1 min-w-[160px]"
                aria-label="Lọc từ ngày"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto flex-1 min-w-[160px]"
                aria-label="Lọc đến ngày"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={ReportStatus.Pending.toString()}>Chờ xử lý</SelectItem>
                  <SelectItem value={ReportStatus.UnderReview.toString()}>Đang xem xét</SelectItem>
                  <SelectItem value={ReportStatus.Resolved.toString()}>Đã giải quyết</SelectItem>
                  <SelectItem value={ReportStatus.Dismissed.toString()}>Đã bác bỏ</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách báo cáo</CardTitle>
          <Badge variant="outline" className="text-sm">
            Tổng: {reports.length}
          </Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tải dữ liệu báo cáo...
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-16 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      ID
                    </TableHead>
                  <TableHead className="text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('reporterName')}
                        className="h-8 px-2 text-sm font-medium text-gray-600"
                      >
                      Người báo cáo <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('reportedUserName')}
                        className="h-8 px-2 text-sm font-medium text-gray-600"
                      >
                        Bị báo cáo <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                    <TableHead className="text-left w-64">Lý do</TableHead>
                  <TableHead className="text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('createdAt')}
                        className="h-8 px-2 text-sm font-medium text-gray-600"
                      >
                        Ngày tạo <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-left">Trạng thái</TableHead>
                  <TableHead className="text-left">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-gray-500">
                        Không có báo cáo nào phù hợp với bộ lọc hiện tại
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReports.map((report, index) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm font-mono text-gray-600">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] font-semibold">
                            <AvatarImage src={report.reporterAvatarUrl} alt={report.reporterName} />
                            <AvatarFallback>{getInitials(report.reporterName || report.reporterEmail)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {report.reporterName || 'Ẩn danh'}
                            </p>
                            <p className="text-xs text-gray-500">{report.reporterEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] font-semibold">
                            <AvatarImage src={report.reportedAvatarUrl} alt={report.reportedUserName} />
                            <AvatarFallback>{getInitials(report.reportedUserName || report.reportedUserEmail)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {report.reportedUserName || report.reportedUserEmail}
                            </p>
                            <p className="text-xs text-gray-500">{report.reportedUserEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-2 text-sm text-gray-800">{report.reason}</p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(report.createdAt, true)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusLabel(report.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#257180] hover:bg-[#257180]/10"
                          onClick={() => handleOpenDetail(report.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Hiển thị {paginatedReports.length} / {filteredReports.length} báo cáo
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, idx) => (
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
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          aria-describedby={undefined}
        >
          <DialogHeader className="flex-shrink-0 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-900">Chi tiết báo cáo</DialogTitle>
              {selectedReport && isPendingOrUnderReviewStatus(selectedReport.status) && (
                <span
                  className={`text-base font-bold ${
                    isDefenseWindowOpen ? 'text-amber-700' : 'text-gray-600'
                  }`}
                >
                  {isDefenseWindowOpen ? 'Còn thời gian kháng cáo' : 'Đã quá thời gian kháng cáo'}
                </span>
              )}
            </div>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex flex-1 items-center justify-center py-16 text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tải chi tiết báo cáo...
              </div>
          ) : selectedReport ? (
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  {selectedReport.handledByAdminEmail && (
                    <Card className="border border-red-300 bg-red-50 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-red-900">
                          Xử lý bởi {selectedReport.handledByAdminEmail}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-red-200 bg-white p-4 text-sm text-red-900 whitespace-pre-wrap leading-relaxed">
                          {selectedReport.adminNotes && selectedReport.adminNotes.trim().length > 0
                            ? selectedReport.adminNotes
                            : 'Chưa có ghi chú xử lý'}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Card className="bg-white border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-gray-900">Thông tin cơ bản</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
              <div>
                          <Label className="text-sm text-gray-600">Người báo cáo</Label>
                          <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedReport.reporterAvatarUrl} alt={selectedReport.reporterName} />
                              <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                {selectedReport.reporterName?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {selectedReport.reporterName || 'Không xác định'}
                              </p>
                              <p className="truncate text-xs text-gray-500">{selectedReport.reporterEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                          <Label className="text-sm text-gray-600">Người bị báo cáo</Label>
                          <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedReport.reportedAvatarUrl} alt={selectedReport.reportedUserName} />
                              <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                {selectedReport.reportedUserName?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {selectedReport.reportedUserName || 'Không xác định'}
                              </p>
                              <p className="truncate text-xs text-gray-500">{selectedReport.reportedUserEmail}</p>
                            </div>
                  </div>
                </div>
              </div>

                      <div className="grid grid-cols-2 gap-4">
              <div>
                          <Label className="text-sm text-gray-600">Trạng thái</Label>
                          <div className="mt-2">
                            <Badge className={getStatusColor(selectedReport.status)}>
                              {getStatusLabel(selectedReport.status)}
                            </Badge>
                    </div>
                  </div>
                  <div>
                          <Label className="text-sm text-gray-600">Ngày tạo</Label>
                          <p className="mt-2 font-medium text-gray-900">
                            {formatDate(selectedReport.createdAt, true)}
                          </p>
                </div>
              </div>

                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-gray-900">Lý do báo cáo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg bg-gray-50 p-4 text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {selectedReport.reason}
                </div>
                    </CardContent>
                  </Card>

                  {selectedReport.reporterEvidences && selectedReport.reporterEvidences.length > 0 && (
                    <Card className="bg-white border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">
                          Bằng chứng từ người báo cáo ({selectedReport.reporterEvidences.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {selectedReport.reporterEvidences.map((evidence) => {
                            const typeValue = normalizeMediaTypeValue(evidence.mediaType);
                            const isImage = typeValue === MediaType.Image || typeValue === 0;
                            return (
                              <div key={evidence.id} className="relative">
                                <div
                                  className={`aspect-square rounded-lg border-2 border-gray-200 bg-gray-100 overflow-hidden ${
                                    isImage ? 'cursor-pointer' : ''
                                  }`}
                                  onClick={() => isImage && setPreviewImage(evidence.fileUrl)}
                                >
                                  {isImage ? (
                                    <img
                                      src={evidence.fileUrl}
                                      alt={evidence.caption || 'Evidence'}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <video src={evidence.fileUrl} controls className="h-full w-full object-cover" />
                                  )}
              </div>
                                {evidence.caption && (
                                  <p className="mt-2 text-xs text-gray-600 line-clamp-2">{evidence.caption}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedReport.adminEvidences && selectedReport.adminEvidences.length > 0 && (
                    <Card className="bg-white border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">
                          Bằng chứng từ admin ({selectedReport.adminEvidences.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {selectedReport.adminEvidences.map((evidence) => {
                            const typeValue = normalizeMediaTypeValue(evidence.mediaType);
                            const isImage = typeValue === MediaType.Image || typeValue === 0;
                            return (
                              <div key={evidence.id}>
                                <div
                                  className={`aspect-square rounded-lg border-2 border-gray-200 bg-gray-100 overflow-hidden ${
                                    isImage ? 'cursor-pointer' : ''
                                  }`}
                                  onClick={() => isImage && setPreviewImage(evidence.fileUrl)}
                                >
                                  {isImage ? (
                                    <img
                                      src={evidence.fileUrl}
                                      alt={evidence.caption || 'Evidence'}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <video src={evidence.fileUrl} controls className="h-full w-full object-cover" />
                                  )}
                </div>
                                {evidence.caption && (
                                  <p className="mt-2 text-xs text-gray-600 line-clamp-2">{evidence.caption}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="lg:col-span-1">
                  {selectedReport.defenses && selectedReport.defenses.length > 0 ? (
                    <Card className="sticky top-0 bg-white border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">
                          Kháng cáo ({selectedReport.defenses.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedReport.defenses.map((defense) => (
                          <div key={defense.id} className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-3 flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={tutorAvatars[defense.tutorEmail]}
                                  alt={tutorNames[defense.tutorEmail] || defense.tutorEmail}
                                />
                                <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                  {(tutorNames[defense.tutorEmail] || defense.tutorEmail)[0]?.toUpperCase() || 'T'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {tutorNames[defense.tutorEmail] || defense.tutorEmail}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(defense.createdAt, true)}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                              {defense.note}
                            </p>
                            {defense.evidences && defense.evidences.length > 0 && (
                              <div className="mt-3 border-t border-gray-200 pt-3">
                                <Label className="text-sm text-gray-600">
                                  Bằng chứng kháng cáo ({defense.evidences.length})
                                </Label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  {defense.evidences.map((evidence) => {
                                    const typeValue = normalizeMediaTypeValue(evidence.mediaType);
                                    const isImage = typeValue === MediaType.Image || typeValue === 0;
                                    return (
                                      <div key={evidence.id}>
                                        <div
                                          className={`aspect-square rounded-lg border border-gray-200 bg-gray-100 overflow-hidden ${
                                            isImage ? 'cursor-pointer' : ''
                                          }`}
                                          onClick={() => isImage && setPreviewImage(evidence.fileUrl)}
                                        >
                                          {isImage ? (
                                            <img
                                              src={evidence.fileUrl}
                                              alt={evidence.caption || 'Evidence'}
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            <video
                                              src={evidence.fileUrl}
                                              controls
                                              className="h-full w-full object-cover"
                                            />
                  )}
                </div>
                                        {evidence.caption && (
                                          <p className="mt-1 text-xs text-gray-600 line-clamp-2">{evidence.caption}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-gray-900">Kháng cáo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="py-8 text-center text-sm text-gray-500">Chưa có kháng cáo nào</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-500">Không có dữ liệu báo cáo</div>
          )}

          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <div className="flex w-full flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Đóng
              </Button>
              {selectedReport && isReportResolved && (selectedReport.bookingId || selectedReport.booking?.id) && (
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleOpenCancelBookingDialog}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Hủy lớp học
                </Button>
              )}
              {selectedReport &&
                !isDefenseWindowOpen &&
                isPendingOrUnderReviewStatus(selectedReport.status) && (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleOpenActionDialog('dismiss')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Bác bỏ báo cáo
                    </Button>
                    <Button
                      className="bg-[#257180] text-white hover:bg-[#1f5a66]"
                      onClick={() => handleOpenActionDialog('resolve')}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Đánh dấu đã giải quyết
                    </Button>
                  </>
                )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl" aria-describedby={undefined}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Bằng chứng"
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'resolve' ? 'Xác nhận đã giải quyết' : 'Bác bỏ báo cáo'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập ghi chú chi tiết về quyết định xử lý để lưu lại lịch sử.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="admin-note">Ghi chú xử lý</Label>
            <Textarea
              id="admin-note"
              rows={4}
              placeholder="VD: Đã liên hệ hai bên và hoàn tiền cho học viên..."
              value={actionNote}
              onChange={(event) => setActionNote(event.target.value)}
              className="mt-2"
              disabled={actionSubmitting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={actionSubmitting}
              className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={actionSubmitting || !actionNote.trim()}
              className={`text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                actionType === 'dismiss'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#257180] hover:bg-[#1f5a66]'
              }`}
            >
              {actionSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : actionType === 'dismiss' ? (
                'Bác bỏ báo cáo'
              ) : (
                'Đánh dấu đã giải quyết'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={cancelBookingDialogOpen} onOpenChange={setCancelBookingDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy lớp học</DialogTitle>
          </DialogHeader>
          {loadingCancelPreview ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#257180]" />
            </div>
          ) : cancelPreview ? (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số buổi còn lại:</span>
                  <span className="text-lg font-semibold text-gray-900">{cancelPreview.upcomingSchedules} buổi</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Số tiền nhận được:</span>
                  <span className="text-lg font-semibold text-[#257180]">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(cancelPreview.refundableAmount)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Bạn có chắc chắn muốn hủy lớp học này? Hành động này sẽ hoàn lại toàn bộ số tiền còn lại và hủy tất cả các buổi học chưa diễn ra.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-gray-600">Không thể tải thông tin preview</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelBookingDialogOpen(false);
                setCancelPreview(null);
              }}
              disabled={cancellingBooking}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={loadingCancelPreview || cancellingBooking || !cancelPreview}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancellingBooking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận hủy'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
