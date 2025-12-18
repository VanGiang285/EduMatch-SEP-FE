"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Textarea } from '@/components/ui/form/textarea';
import { Label } from '@/components/ui/form/label';
import { Input } from '@/components/ui/form/input';
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
  Calendar,
  Clock,
  Video,
  Wallet,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  MessageCircle,
  Bell,
  Shield,
  ChevronRight,
  Loader2,
  MapPin,
  PlayCircle,
  CheckCircle,
  XCircle,
  X,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { useLearnerProfiles } from '@/hooks/useLearnerProfiles';
import { useSchedules } from '@/hooks/useSchedules';
import { useScheduleChangeRequests } from '@/hooks/useScheduleChangeRequests';
import { useTutorAvailability } from '@/hooks/useTutorAvailability';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { BookingDto, ScheduleDto, ReportListItemDto, TutorMonthlyEarningDto, ReportFullDetailDto } from '@/types/backend';
import { ScheduleStatus, ScheduleChangeRequestStatus, TutorAvailabilityStatus, MediaType, ReportStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TutorDashboardService } from '@/services/tutorDashboardService';
import { ReportService, MediaService, TutorService } from '@/services';
import { ReportDefenseCreateRequest, BasicEvidenceRequest } from '@/types/requests';
import { toast } from 'sonner';
import { WalletService } from '@/services/walletService';

export function DashboardTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAuthenticated } = useAuthContext();
  const { openChatWithTutor } = useChatContext();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { getBooking, loadBookingDetails } = useBookings();
  const { getLearnerProfile, loadLearnerProfiles } = useLearnerProfiles();
  const { loadSchedulesByLearnerEmail } = useSchedules();
  const { fetchByScheduleId, create: createChangeRequest, loading: loadingChangeReq } = useScheduleChangeRequests();
  const {
    availabilities,
    timeSlots,
    weekDays,
    currentWeekStart,
    loadAvailabilities,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isLoading: loadingAvailabilities,
  } = useTutorAvailability(12);

  const [todaySchedules, setTodaySchedules] = useState<ScheduleDto[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<ScheduleDto[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingDto[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<TutorMonthlyEarningDto[]>([]);
  const [currentMonthEarning, setCurrentMonthEarning] = useState<TutorMonthlyEarningDto | undefined>(undefined);
  const [reportsPendingDefense, setReportsPendingDefense] = useState<ReportListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [pendingBySchedule, setPendingBySchedule] = useState<Record<number, boolean>>({});
  const [slotDialog, setSlotDialog] = useState<{
    open: boolean;
    schedule?: ScheduleDto;
    weekStart?: Date;
    selectedAvailabilityId?: number | null;
    reason?: string;
  }>({ open: false, selectedAvailabilityId: null, weekStart: undefined });

  const [selectedReport, setSelectedReport] = useState<ReportFullDetailDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDefenseDialog, setShowDefenseDialog] = useState(false);
  const [defenseFormData, setDefenseFormData] = useState({
    note: '',
    evidences: [] as BasicEvidenceRequest[],
  });
  const [uploadingDefense, setUploadingDefense] = useState(false);
  const [, setUploadingDefenseFiles] = useState<File[]>([]);
  const [, setUploadedDefenseUrls] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showConfirmDefense, setShowConfirmDefense] = useState(false);
  const [canSubmitDefense, setCanSubmitDefense] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});
  const [tutorAvatars, setTutorAvatars] = useState<Record<string, string>>({});

  const loadDashboardData = useCallback(async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const [
        todaySchedulesRes,
        upcomingLessonsRes,
        pendingBookingsRes,
        monthlyEarningsRes,
        currentMonthEarningRes,
        reportsPendingDefenseRes,
      ] = await Promise.all([
        TutorDashboardService.getTodaySchedules(),
        TutorDashboardService.getUpcomingLessons(),
        TutorDashboardService.getPendingBookings(),
        TutorDashboardService.getMonthlyEarnings(selectedYear),
        TutorDashboardService.getCurrentMonthEarning(),
        TutorDashboardService.getReportsPendingDefense(),
      ]);

      if (todaySchedulesRes.success && todaySchedulesRes.data) {
        const schedules = Array.isArray(todaySchedulesRes.data) ? todaySchedulesRes.data : [];
        setTodaySchedules(schedules);
        const bookingIds = schedules
          .filter((s) => s.bookingId && !s.booking)
          .map((s) => s.bookingId!);
        if (bookingIds.length > 0) {
          loadBookingDetails(bookingIds);
        }
        const learnerEmails = schedules
          .map((s) => {
            const booking = getBooking(s.bookingId, s.booking);
            return booking?.learnerEmail;
          })
          .filter((email): email is string => Boolean(email));
        if (learnerEmails.length > 0) {
          loadLearnerProfiles(learnerEmails);
        }
      }
      if (upcomingLessonsRes.success && upcomingLessonsRes.data) {
        const lessons = Array.isArray(upcomingLessonsRes.data) ? upcomingLessonsRes.data : [];
        setUpcomingLessons(lessons);
        const bookingIds = lessons
          .filter((s) => s.bookingId && !s.booking)
          .map((s) => s.bookingId!);
        if (bookingIds.length > 0) {
          loadBookingDetails(bookingIds);
        }
        const learnerEmails = lessons
          .map((s) => {
            const booking = getBooking(s.bookingId, s.booking);
            return booking?.learnerEmail;
          })
          .filter((email): email is string => Boolean(email));
        if (learnerEmails.length > 0) {
          loadLearnerProfiles(learnerEmails);
        }
      }
      if (pendingBookingsRes.success && pendingBookingsRes.data) {
        setPendingBookings(Array.isArray(pendingBookingsRes.data) ? pendingBookingsRes.data : []);
      }
      if (monthlyEarningsRes.success && monthlyEarningsRes.data) {
        setMonthlyEarnings(Array.isArray(monthlyEarningsRes.data) ? monthlyEarningsRes.data : []);
      }
      if (currentMonthEarningRes.success && currentMonthEarningRes.data) {
        setCurrentMonthEarning(currentMonthEarningRes.data);
      }
      if (reportsPendingDefenseRes.success && reportsPendingDefenseRes.data) {
        setReportsPendingDefense(Array.isArray(reportsPendingDefenseRes.data) ? reportsPendingDefenseRes.data : []);
      }
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, selectedYear, getBooking, loadBookingDetails, loadLearnerProfiles]);

  useEffect(() => {
    if (!hasLoaded && user?.email) {
      loadDashboardData();
    }
  }, [user?.email, hasLoaded, loadDashboardData]);

  useEffect(() => {
    const loadPending = async () => {
      const allSchedules = [...todaySchedules, ...upcomingLessons];
      if (allSchedules.length === 0) {
        setPendingBySchedule({});
        return;
      }
      const results = await Promise.all(
        allSchedules.map(async (s) => {
          const list = await fetchByScheduleId(s.id, ScheduleChangeRequestStatus.Pending);
          return { id: s.id, hasPending: !!(list && list.length > 0) };
        })
      );
      const map: Record<number, boolean> = {};
      results.forEach(r => {
        map[r.id] = r.hasPending;
      });
      setPendingBySchedule(map);
    };
    loadPending();
  }, [todaySchedules, upcomingLessons, fetchByScheduleId]);

  const canRequestChange = useCallback((schedule: ScheduleDto) => {
    const avStart = schedule.availability?.startDate
            ? new Date(schedule.availability.startDate)
            : null;
    if (!avStart) return false;
    const diffMs = avStart.getTime() - Date.now();
    if (diffMs < 12 * 60 * 60 * 1000) return false;

    const status = EnumHelpers.parseScheduleStatus(schedule.status);
    if (status !== ScheduleStatus.Upcoming) return false;

    const hasPending = !!pendingBySchedule[schedule.id];
    return !hasPending;
  }, [pendingBySchedule]);

  // intentionally omitted: getScheduleTimeRange (not used in current dashboard layout)

  const getStatusIcon = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Upcoming:
        return <Calendar className="h-4 w-4" />;
      case ScheduleStatus.InProgress:
        return <PlayCircle className="h-4 w-4" />;
      case ScheduleStatus.Completed:
        return <CheckCircle className="h-4 w-4" />;
      case ScheduleStatus.Cancelled:
        return <XCircle className="h-4 w-4" />;
      case ScheduleStatus.Pending:
        return <Clock className="h-4 w-4" />;
      case ScheduleStatus.Processing:
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Upcoming:
        return 'bg-blue-100 text-blue-800 border-gray-300';
      case ScheduleStatus.InProgress:
        return 'bg-yellow-100 text-yellow-800 border-gray-300';
      case ScheduleStatus.Completed:
        return 'bg-green-100 text-green-800 border-gray-300';
      case ScheduleStatus.Cancelled:
        return 'bg-red-100 text-red-800 border-gray-300';
      case ScheduleStatus.Pending:
        return 'bg-yellow-100 text-yellow-800 border-gray-300';
      case ScheduleStatus.Processing:
        return 'bg-blue-100 text-blue-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // intentionally omitted: getSessionStatusBadge (not used in current dashboard layout)

  const loadLearnerUpcoming = useCallback(
    async (learnerEmail?: string) => {
      if (!learnerEmail) return;
      await loadSchedulesByLearnerEmail(learnerEmail, { status: ScheduleStatus.Upcoming });
    },
    [loadSchedulesByLearnerEmail]
  );

  const buildBusyKey = useCallback((av?: any) => {
    if (!av?.startDate) return '';
    const date = av.startDate.split('T')[0];
    const hour = av.slot?.startTime?.split(':')[0]?.padStart(2, '0') || '';
    return `${date}-${hour}`;
  }, []);

  const learnerBusyMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    const allSchedules = [...todaySchedules, ...upcomingLessons];
    allSchedules
      .filter(s => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming)
      .forEach(s => {
        const key = buildBusyKey(s.availability);
        if (key) map[key] = true;
      });
    return map;
  }, [todaySchedules, upcomingLessons, buildBusyKey]);

  const learnerBusyInfoMap = useMemo(() => {
    const map: Record<
      string,
      { label: string; startTime?: string; endTime?: string }
    > = {};
    const allSchedules = [...todaySchedules, ...upcomingLessons];
    allSchedules
      .filter(s => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming)
      .forEach(s => {
        const key = buildBusyKey(s.availability);
        if (!key) return;
        const booking = getBooking(s.bookingId, s.booking);
        const subjectName = booking?.tutorSubject?.subject?.subjectName;
        const start = s.availability?.slot?.startTime?.slice(0, 5);
        const end = s.availability?.slot?.endTime?.slice(0, 5);
        const label =
          subjectName && start && end
            ? `${subjectName} (${start}-${end})`
            : start && end
              ? `${start}-${end}`
              : subjectName || 'Bạn đã có lịch';
        map[key] = { label, startTime: start, endTime: end };
      });
    return map;
  }, [todaySchedules, upcomingLessons, buildBusyKey, getBooking]);

  const availabilityByKey = useMemo(() => {
    const map: Record<string, any> = {};
    availabilities.forEach(av => {
      if (!av.startDate) return;
      if (EnumHelpers.parseTutorAvailabilityStatus(av.status) !== TutorAvailabilityStatus.Available) return;
      const dateKey = av.startDate.split('T')[0];
      const hour = av.slot?.startTime?.split(':')[0]?.padStart(2, '0') || '';
      if (dateKey && hour) map[`${dateKey}-${hour}`] = av;
    });
    return map;
  }, [availabilities]);

  const getWeekDateKey = useCallback(
    (dayKey: string): string => {
      const idx = weekDays.findIndex(d => d.key === dayKey);
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + (idx >= 0 ? idx : 0));
      return date.toISOString().split('T')[0];
    },
    [currentWeekStart, weekDays]
  );


  const formatCurrency = (amount: number) =>
    WalletService.formatCurrency(amount);

  const getEarningAmount = (item?: TutorMonthlyEarningDto) => {
    if (!item) return 0;
    const v = (item.earning ?? item.totalEarnings ?? 0) as number;
    return Number.isFinite(v) ? v : 0;
  };

  const handleOpenChat = async (schedule: ScheduleDto, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.warning('Bạn cần đăng nhập để nhắn tin với học viên.');
      router.push('/login');
      return;
    }

    const booking = getBooking(schedule.bookingId, schedule.booking);
    const tutorSubject = booking?.tutorSubject;
    const tutorId = tutorSubject?.tutor?.id || tutorSubject?.tutorId;
    const tutorEmail = tutorSubject?.tutorEmail || tutorSubject?.tutor?.userEmail;
    const tutorName = tutorSubject?.tutor?.userName;
    const tutorAvatar = tutorSubject?.tutor?.avatarUrl;

    if (!tutorId || !tutorEmail) {
      toast.error('Không tìm thấy thông tin gia sư để nhắn tin.');
      return;
    }

    await openChatWithTutor(
      tutorId,
      tutorEmail,
      tutorName,
      tutorAvatar
    );
  };

  const revenueByMonth = useMemo(() => {
    if (monthlyEarnings.length === 0) {
      return Array.from({ length: 12 }, (_, idx) => ({
        month: `Tháng ${idx + 1}`,
        revenue: 0,
      }));
    }

    return Array.from({ length: 12 }, (_, idx) => {
      const month = idx + 1;
      const found = monthlyEarnings.find((m) => m.month === month && m.year === selectedYear);
      return {
        month: `Tháng ${month}`,
        revenue: getEarningAmount(found),
      };
    });
  }, [monthlyEarnings, selectedYear]);

  const handleViewReportDetail = async (report: ReportListItemDto) => {
    try {
      const response = await ReportService.getFullReportDetail(report.id);
      if (response.success && response.data) {
        const reportData = response.data;
        const tutorEvidences = reportData.tutorEvidences ?? [];
        if (reportData.reporterEvidences) {
          reportData.reporterEvidences = reportData.reporterEvidences.map((ev) => ({
            ...ev,
            mediaType: normalizeMediaType(ev.mediaType),
          }));
        }
        let defenses = reportData.defenses || [];
        if (defenses.length > 0) {
          const defensesResponse = await ReportService.getDefenses(reportData.id);
          if (defensesResponse.success && defensesResponse.data) {
            defenses = defensesResponse.data;
          }

          defenses = defenses.map((defense) => ({
            ...defense,
            evidences: (defense.evidences || []).map((ev) => ({
              ...ev,
              mediaType: normalizeMediaType(ev.mediaType),
            })),
          }));

          if (tutorEvidences.length > 0) {
            const usedEvidenceIds = new Set<number>();
            defenses = defenses.map((defense) => {
              if (!defense.evidences || defense.evidences.length === 0) {
                const defenseDate = new Date(defense.createdAt).getTime();
                const relatedEvidences = tutorEvidences
                  .filter((ev) => {
                    if (usedEvidenceIds.has(ev.id)) return false;
                    if (ev.submittedByEmail && defense.tutorEmail && ev.submittedByEmail !== defense.tutorEmail) return false;
                    const evDate = new Date(ev.createdAt).getTime();
                    const timeDiff = Math.abs(evDate - defenseDate);
                    return timeDiff < 60000;
                  })
                  .sort((a, b) => {
                    const aDiff = Math.abs(new Date(a.createdAt).getTime() - defenseDate);
                    const bDiff = Math.abs(new Date(b.createdAt).getTime() - defenseDate);
                    return aDiff - bDiff;
                  });
                
                if (relatedEvidences.length > 0) {
                  const closestEvidences = relatedEvidences.slice(0, 10);
                  const evidenceList = closestEvidences.map((ev) => {
                    usedEvidenceIds.add(ev.id);
                    return {
                      ...ev,
                      mediaType: normalizeMediaType(ev.mediaType),
                    };
                  });
                  return { ...defense, evidences: evidenceList };
                }
              }
              return {
                ...defense,
                evidences: (defense.evidences || []).map((ev) => ({
                  ...ev,
                  mediaType: normalizeMediaType(ev.mediaType),
                })),
              };
            });
          }
          reportData.defenses = defenses;
          
          const uniqueTutorEmails = Array.from(
            new Set(
              defenses
                .map((d) => d.tutorEmail)
                .filter((email): email is string => Boolean(email))
            )
          );
          const tutorNameMap: Record<string, string> = {};
          const tutorAvatarMap: Record<string, string> = {};
          await Promise.all(
            uniqueTutorEmails.map(async (email) => {
            try {
              const tutorResponse = await TutorService.getTutorByEmail(email);
              if (tutorResponse.success && tutorResponse.data) {
                tutorNameMap[email] = tutorResponse.data.userName || email;
                tutorAvatarMap[email] = tutorResponse.data.avatarUrl || '';
              } else {
                tutorNameMap[email] = email;
                tutorAvatarMap[email] = '';
              }
            } catch {
              tutorNameMap[email] = email;
              tutorAvatarMap[email] = '';
            }
            })
          );
          setTutorNames(tutorNameMap);
          setTutorAvatars(tutorAvatarMap);
        }
        setSelectedReport(reportData);
        const canDefenseResponse = await ReportService.canSubmitDefense(report.id);
        setCanSubmitDefense(!!canDefenseResponse.data && canDefenseResponse.success);
        setShowDetailDialog(true);
      } else {
        toast.error('Không thể tải chi tiết báo cáo');
      }
    } catch (error) {
      console.error('Error fetching report detail:', error);
      toast.error('Không thể tải chi tiết báo cáo');
    }
  };

  const isPendingOrUnderReviewStatus = (status: ReportStatus | number | string | undefined): boolean => {
    if (status === undefined || status === null) return false;
    if (typeof status === 'string') {
      if (status === 'Pending' || status === '0') return true;
      if (status === 'UnderReview' || status === '1') return true;
      const parsed = parseInt(status, 10);
      return !isNaN(parsed) && (parsed === 0 || parsed === 1);
    }
    if (typeof status === 'number') {
      return status === 0 || status === 1 || status === ReportStatus.Pending || status === ReportStatus.UnderReview;
    }
    return status === ReportStatus.Pending || status === ReportStatus.UnderReview;
  };

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const normalizeMediaType = (mediaType: number | string | undefined): number => {
    if (mediaType === undefined || mediaType === null) return MediaType.Video;
    if (typeof mediaType === 'string') {
      const parsed = parseInt(mediaType, 10);
      if (!isNaN(parsed)) return parsed;
      if (mediaType.toLowerCase() === 'image') return MediaType.Image;
      if (mediaType.toLowerCase() === 'video') return MediaType.Video;
      return MediaType.Video;
    }
    return Number(mediaType);
  };

  const handleDefenseFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File ${file.name} vượt quá 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingDefense(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const mediaType = file.type.startsWith('image/') ? 'Image' : 'Video';
        const response = await MediaService.uploadFile({
          file,
          ownerEmail: user.email!,
          mediaType: mediaType as 'Image' | 'Video',
        });

        const uploadPayload = response.data as any;
        const secureUrl =
          uploadPayload?.secureUrl ?? uploadPayload?.data?.secureUrl;
        const publicId =
          uploadPayload?.publicId ?? uploadPayload?.data?.publicId;

        if (secureUrl) {
          const mediaTypeNum =
            mediaType === 'Image' ? MediaType.Image : MediaType.Video;
          return {
            url: secureUrl,
            publicId: publicId || undefined,
            mediaType: mediaTypeNum,
            file,
          };
        } else {
          throw new Error(`Không thể upload file ${file.name}`);
        }
      });

      const results = await Promise.all(uploadPromises);
      setDefenseFormData(prev => ({
        ...prev,
        evidences: [
          ...prev.evidences,
          ...results.map(r => ({
            mediaType: r.mediaType,
            fileUrl: r.url,
            filePublicId: r.publicId,
            caption: '',
          })),
        ],
      }));
      toast.success(`Đã upload ${results.length} file thành công`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Không thể upload file');
    } finally {
      setUploadingDefense(false);
      e.target.value = '';
    }
  };

  const handleRemoveDefenseFile = (index: number) => {
    setDefenseFormData(prev => ({
      ...prev,
      evidences: prev.evidences.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitDefense = async () => {
    if (!selectedReport) return;
    if (!defenseFormData.note.trim()) {
      toast.error('Vui lòng điền nội dung kháng cáo');
      return;
    }

    setShowConfirmDefense(false);
    try {
      setIsProcessing(true);
      const evidences = defenseFormData.evidences.length > 0 ? defenseFormData.evidences.map(ev => ({
        mediaType: typeof ev.mediaType === 'number' ? ev.mediaType : (ev.mediaType === MediaType.Image ? 0 : 1),
        fileUrl: ev.fileUrl,
        filePublicId: ev.filePublicId,
        caption: ev.caption,
      })) : undefined;
      const request: ReportDefenseCreateRequest = {
        note: defenseFormData.note.trim(),
        evidences: evidences,
      };
      const response = await ReportService.addDefense(selectedReport.id, request);
      if (response.success) {
        toast.success('Đã gửi kháng cáo');
        setShowDefenseDialog(false);
        setDefenseFormData({ note: '', evidences: [] });
        setUploadingDefenseFiles([]);
        setUploadedDefenseUrls([]);
        const detailResponse = await ReportService.getFullReportDetail(selectedReport.id);
        if (detailResponse.success && detailResponse.data) {
          const reportData = detailResponse.data;
          if (reportData.reporterEvidences) {
            reportData.reporterEvidences = reportData.reporterEvidences.map(ev => ({
              ...ev,
              mediaType: normalizeMediaType(ev.mediaType),
            }));
          }
          const tutorEvidences = reportData.tutorEvidences ?? [];
          if (reportData.defenses && reportData.defenses.length > 0) {
            const defensesResponse = await ReportService.getDefenses(reportData.id);
            if (defensesResponse.success && defensesResponse.data) {
              for (const defenseFromApi of defensesResponse.data) {
                const existingDefense = reportData.defenses.find(d => d.id === defenseFromApi.id);
                if (existingDefense && defenseFromApi.evidences && defenseFromApi.evidences.length > 0) {
                  existingDefense.evidences = defenseFromApi.evidences.map(ev => ({
                    ...ev,
                    mediaType: normalizeMediaType(ev.mediaType),
                  }));
                }
              }
            }
            if (tutorEvidences.length > 0) {
              const usedEvidenceIds = new Set<number>();
            for (const defense of reportData.defenses) {
                if (!defense.evidences || defense.evidences.length === 0) {
                  const defenseDate = new Date(defense.createdAt).getTime();
                  const relatedEvidences = tutorEvidences
                    .filter(ev => {
                      if (usedEvidenceIds.has(ev.id)) return false;
                      if (ev.submittedByEmail && defense.tutorEmail && ev.submittedByEmail !== defense.tutorEmail) return false;
                      const evDate = new Date(ev.createdAt).getTime();
                      const timeDiff = Math.abs(evDate - defenseDate);
                      return timeDiff < 60000;
                    })
                    .sort((a, b) => {
                      const aDiff = Math.abs(new Date(a.createdAt).getTime() - defenseDate);
                      const bDiff = Math.abs(new Date(b.createdAt).getTime() - defenseDate);
                      return aDiff - bDiff;
                    });
                  
                  if (relatedEvidences.length > 0) {
                  const closestEvidences = relatedEvidences.slice(0, 10);
                  defense.evidences = closestEvidences.map(ev => {
                      usedEvidenceIds.add(ev.id);
                      return {
                        ...ev,
                        mediaType: normalizeMediaType(ev.mediaType),
                      };
                    });
                  }
                }
              }
            }
            reportData.defenses = reportData.defenses.map(defense => ({
              ...defense,
              evidences: defense.evidences?.map(ev => ({
                ...ev,
                mediaType: normalizeMediaType(ev.mediaType),
              })),
            }));
            
            const uniqueTutorEmails = Array.from(
              new Set(
                reportData.defenses
                  .map((d) => d.tutorEmail)
                  .filter((email): email is string => Boolean(email))
              )
            );
            const tutorNameMap: Record<string, string> = {};
            const tutorAvatarMap: Record<string, string> = {};
            for (const email of uniqueTutorEmails) {
              try {
                const tutorResponse = await TutorService.getTutorByEmail(email);
                if (tutorResponse.success && tutorResponse.data) {
                  tutorNameMap[email] = tutorResponse.data.userName || email;
                  tutorAvatarMap[email] = tutorResponse.data.avatarUrl || '';
                } else {
                  tutorNameMap[email] = email;
                  tutorAvatarMap[email] = '';
                }
              } catch {
                tutorNameMap[email] = email;
                tutorAvatarMap[email] = '';
              }
            }
            setTutorNames(tutorNameMap);
            setTutorAvatars(tutorAvatarMap);
          }
          setSelectedReport(reportData);
        }
        await loadDashboardData();
      } else {
        toast.error(response.message || 'Không thể gửi kháng cáo');
      }
    } catch (error) {
      console.error('Error submitting defense:', error);
      toast.error('Không thể gửi kháng cáo');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && !hasLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#257180] mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#257180] to-[#1f5a66] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Chào mừng trở lại!</h1>
              <p className="text-white/90 text-lg">
                Bảng điều khiển giảng dạy của bạn - {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 border-gray-300"
                onClick={() => router.push('/profile?tab=classes')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Xem tất cả lớp
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Buổi hôm nay</p>
                  <p className="text-2xl font-bold text-white">{todaySchedules.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Chờ xác nhận</p>
                  <p className="text-2xl font-bold text-white">{pendingBookings.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Báo cáo</p>
                  <p className="text-2xl font-bold text-white">{reportsPendingDefense.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Thu nhập tháng</p>
                  <p className="text-2xl font-bold text-white">
                    {`${(getEarningAmount(currentMonthEarning) / 1000000).toFixed(1)}tr`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#257180]" />
                    Lịch dạy hôm nay
                  </CardTitle>
                  <Badge variant="outline" className="text-[#257180] border-gray-300">
                    {todaySchedules.length} buổi
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {todaySchedules.length > 0 ? (
                  <div className="space-y-4">
                    {todaySchedules.map((schedule) => {
                      const availability = schedule.availability;
                      const slot = availability?.slot;
                      const booking = getBooking(schedule.bookingId, schedule.booking);
                      const learnerEmail = booking?.learnerEmail;
                      const learnerProfile = learnerEmail ? getLearnerProfile(learnerEmail) : undefined;
                      const tutorSubject = booking?.tutorSubject;
                      const subject = tutorSubject?.subject;
                      const level = tutorSubject?.level;

                      let scheduleDate: Date | null = null;
                      if (availability?.startDate) {
                        scheduleDate = new Date(availability.startDate);
                        if (slot?.startTime) {
                          const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
                          scheduleDate.setHours(startHours, startMinutes, 0, 0);
                        }
                      }

                      const isOnline = !!(schedule.meetingSession || schedule.hasMeetingSession);
                      const status = EnumHelpers.parseScheduleStatus(schedule.status);

                      let endDate: Date | null = null;
                      if (scheduleDate && slot?.endTime) {
                        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
                        endDate = new Date(scheduleDate);
                        endDate.setHours(endHours, endMinutes, 0, 0);
                      } else if (availability?.endDate) {
                        endDate = new Date(availability.endDate);
                      }

                      return (
                        <Card key={schedule.id} className="hover:shadow-md transition-shadow bg-white border border-gray-300">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {scheduleDate && (
                                <div className="flex-shrink-0">
                                  <div className="bg-gradient-to-br from-[#257180] to-[#1a5a66] rounded-lg p-4 text-center w-28 h-28 flex flex-col items-center justify-center text-white shadow-md">
                                    <div className="text-4xl font-bold leading-none">
                                      {scheduleDate.getDate()}
                            </div>
                                    <div className="text-sm font-medium mt-1 opacity-90">
                                      Tháng {scheduleDate.getMonth() + 1}
                                    </div>
                                    <div className="text-xs font-medium mt-1 opacity-80">
                                      {format(scheduleDate, 'EEE', { locale: vi })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(status)}`}>
                                        {getStatusIcon(status)}
                                        <span>{EnumHelpers.getScheduleStatusLabel(schedule.status)}</span>
                              </div>
                                      {isOnline ? (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white border border-gray-300">
                                          <Video className="h-3 w-3" />
                                          <span>Zoom Meeting</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-gray-500 text-white border border-gray-300">
                                          <MapPin className="h-3 w-3" />
                                          <span>Offline</span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="mb-3">
                                      <h3 className="font-semibold text-lg text-gray-900">
                                        {subject?.subjectName || 'Môn học'}
                                        {level && (
                                          <span className="ml-2 text-base font-normal text-gray-500">
                                            - {level.name}
                                          </span>
                                        )}
                                      </h3>
                                      <p className="text-gray-600 text-sm mt-1">
                                        Học viên: {learnerProfile?.user?.userName || learnerEmail || 'Chưa có thông tin'}
                                      </p>
                                      {learnerEmail && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Email: {learnerEmail}
                                        </p>
                                      )}
                              </div>
                            </div>
                          </div>

                                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                                  {scheduleDate && (
                                    <div className="flex items-center gap-3">
                                      <div className="bg-white rounded-lg p-2 shadow-sm">
                                        <Calendar className="h-5 w-5 text-[#257180]" />
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Ngày học</div>
                                        <div className="text-gray-900 font-medium">
                                          {format(scheduleDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {slot && (
                                    <div className="flex items-center gap-3">
                                      <div className="bg-white rounded-lg p-2 shadow-sm">
                                        <Clock className="h-5 w-5 text-[#257180]" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs text-gray-500">Bắt đầu - Kết thúc</div>
                                        <div className="text-gray-900 font-medium">
                                          {slot.startTime?.slice(0, 5) || '--:--'} - {slot.endTime?.slice(0, 5) || '--:--'}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="lg"
                                    className="min-w-[140px] border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                                    onClick={(e) => handleOpenChat(schedule, e)}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Nhắn tin
                                  </Button>

                                  {canRequestChange(schedule) && (
                                    <Button
                                      size="lg"
                                      variant="outline"
                                      className="min-w-[140px] border-gray-300 bg-white text-[#257180] hover:bg-[#257180] hover:text-white hover:border-[#257180]"
                                      onClick={async () => {
                                        const tutorId = booking?.tutorSubject?.tutor?.id || booking?.tutorSubject?.tutorId;
                                        if (!learnerEmail || !tutorId) {
                                          toast.error('Thiếu thông tin learner hoặc tutor');
                                          return;
                                        }
                                        await loadLearnerUpcoming(learnerEmail);
                                        await loadAvailabilities(tutorId);
                                        goToCurrentWeek();
                                        setSlotDialog({
                                          open: true,
                                          schedule,
                                          selectedAvailabilityId: null,
                                          weekStart: currentWeekStart,
                                          reason: '',
                                        });
                                      }}
                                      disabled={loadingChangeReq || loadingAvailabilities}
                                    >
                                      Yêu cầu chuyển lịch
                                    </Button>
                                  )}
                                  {isOnline && schedule.meetingSession && 
                                    [ScheduleStatus.Upcoming, ScheduleStatus.InProgress].includes(status) && (
                                    <Button
                                      size="lg"
                                      className="min-w-[140px] bg-[#257180] hover:bg-[#257180]/90 text-white"
                                      onClick={() => {
                                        window.open(schedule.meetingSession!.meetLink, '_blank');
                                      }}
                                    >
                                      <Video className="h-4 w-4 mr-2" />
                                      Tham gia
                            </Button>
                          )}
                        </div>
                      </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Không có buổi dạy nào hôm nay</p>
                    <p className="text-sm text-gray-500 mt-1">Hãy nghỉ ngơi và chuẩn bị cho các buổi học sắp tới!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#257180]" />
                    Buổi học sắp tới
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                    onClick={() => router.push('/profile?tab=classes')}
                  >
                    Xem tất cả
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingLessons.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingLessons.slice(0, 4).map((schedule) => {
                      const availability = schedule.availability;
                      const slot = availability?.slot;
                      const booking = getBooking(schedule.bookingId, schedule.booking);
                      const learnerEmail = booking?.learnerEmail;
                      const learnerProfile = learnerEmail ? getLearnerProfile(learnerEmail) : undefined;
                      const tutorSubject = booking?.tutorSubject;
                      const subject = tutorSubject?.subject;
                      const level = tutorSubject?.level;

                      let scheduleDate: Date | null = null;
                      if (availability?.startDate) {
                        scheduleDate = new Date(availability.startDate);
                        if (slot?.startTime) {
                          const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
                          scheduleDate.setHours(startHours, startMinutes, 0, 0);
                        }
                      }

                      const isOnline = !!(schedule.meetingSession || schedule.hasMeetingSession);
                      const status = EnumHelpers.parseScheduleStatus(schedule.status);

                      let endDate: Date | null = null;
                      if (scheduleDate && slot?.endTime) {
                        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
                        endDate = new Date(scheduleDate);
                        endDate.setHours(endHours, endMinutes, 0, 0);
                      } else if (availability?.endDate) {
                        endDate = new Date(availability.endDate);
                      }

                      return (
                        <Card key={schedule.id} className="hover:shadow-md transition-shadow bg-white border border-gray-300">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {scheduleDate && (
                                <div className="flex-shrink-0">
                                  <div className="bg-gradient-to-br from-[#257180] to-[#1a5a66] rounded-lg p-4 text-center w-28 h-28 flex flex-col items-center justify-center text-white shadow-md">
                                    <div className="text-4xl font-bold leading-none">
                                      {scheduleDate.getDate()}
                          </div>
                                    <div className="text-sm font-medium mt-1 opacity-90">
                                      Tháng {scheduleDate.getMonth() + 1}
                                    </div>
                                    <div className="text-xs font-medium mt-1 opacity-80">
                                      {format(scheduleDate, 'EEE', { locale: vi })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(status)}`}>
                                        {getStatusIcon(status)}
                                        <span>{EnumHelpers.getScheduleStatusLabel(schedule.status)}</span>
                            </div>
                                      {isOnline ? (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white border border-gray-300">
                                          <Video className="h-3 w-3" />
                                          <span>Zoom Meeting</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-gray-500 text-white border border-gray-300">
                                          <MapPin className="h-3 w-3" />
                                          <span>Offline</span>
                                        </div>
                                      )}
                            </div>

                                    <div className="mb-3">
                                      <h3 className="font-semibold text-lg text-gray-900">
                                        {subject?.subjectName || 'Môn học'}
                                        {level && (
                                          <span className="ml-2 text-base font-normal text-gray-500">
                                            - {level.name}
                                          </span>
                                        )}
                                      </h3>
                                      <p className="text-gray-600 text-sm mt-1">
                                        Học viên: {learnerProfile?.user?.userName || learnerEmail || 'Chưa có thông tin'}
                                      </p>
                                      {learnerEmail && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Email: {learnerEmail}
                                        </p>
                                      )}
                          </div>
                        </div>
                      </div>

                                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                                  {scheduleDate && (
                                    <div className="flex items-center gap-3">
                                      <div className="bg-white rounded-lg p-2 shadow-sm">
                                        <Calendar className="h-5 w-5 text-[#257180]" />
                    </div>
                                      <div>
                                        <div className="text-xs text-gray-500">Ngày học</div>
                                        <div className="text-gray-900 font-medium">
                                          {format(scheduleDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {slot && (
                                    <div className="flex items-center gap-3">
                                      <div className="bg-white rounded-lg p-2 shadow-sm">
                                        <Clock className="h-5 w-5 text-[#257180]" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs text-gray-500">Bắt đầu - Kết thúc</div>
                                        <div className="text-gray-900 font-medium">
                                          {slot.startTime?.slice(0, 5) || '--:--'} - {slot.endTime?.slice(0, 5) || '--:--'}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="lg"
                                    className="min-w-[140px] border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                                    onClick={(e) => handleOpenChat(schedule, e)}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Nhắn tin
                                  </Button>

                                  {canRequestChange(schedule) && (
                                    <Button
                                      size="lg"
                                      variant="outline"
                                      className="min-w-[140px] border-gray-300 bg-white text-[#257180] hover:bg-[#257180] hover:text-white hover:border-[#257180]"
                                      onClick={async () => {
                                        const tutorId = booking?.tutorSubject?.tutor?.id || booking?.tutorSubject?.tutorId;
                                        if (!learnerEmail || !tutorId) {
                                          toast.error('Thiếu thông tin learner hoặc tutor');
                                          return;
                                        }
                                        await loadLearnerUpcoming(learnerEmail);
                                        await loadAvailabilities(tutorId);
                                        goToCurrentWeek();
                                        setSlotDialog({
                                          open: true,
                                          schedule,
                                          selectedAvailabilityId: null,
                                          weekStart: currentWeekStart,
                                          reason: '',
                                        });
                                      }}
                                      disabled={loadingChangeReq || loadingAvailabilities}
                                    >
                                      Yêu cầu chuyển lịch
                                    </Button>
                                  )}
                                  {isOnline && schedule.meetingSession && 
                                    [ScheduleStatus.Upcoming, ScheduleStatus.InProgress].includes(status) && (
                                    <Button
                                      size="lg"
                                      className="min-w-[140px] bg-[#257180] hover:bg-[#257180]/90 text-white"
                                      onClick={() => {
                                        window.open(schedule.meetingSession!.meetLink, '_blank');
                                      }}
                                    >
                                      <Video className="h-4 w-4 mr-2" />
                                      Tham gia
                                    </Button>
                                  )}
                                </div>
                              </div>
                </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Không có buổi học sắp tới</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-gray-900">Thu nhập theo tháng</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Năm:</span>
                    <input
                      type="number"
                      className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                      value={selectedYear}
                      min={2000}
                      max={9999}
                      onChange={(e) => {
                        const value = parseInt(e.target.value || '0', 10);
                        if (!isNaN(value)) {
                          setSelectedYear(value);
                        }
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {revenueByMonth.length > 0 && (
                  <div>
                      <h4 className="font-medium text-gray-900 mb-4">Biểu đồ thu nhập theo tháng</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                          <Tooltip
                              formatter={(value: number) => [formatCurrency(value), 'Thu nhập']}
                              labelFormatter={(label) => `${label}`}
                            />
                            <Bar dataKey="revenue" name="Thu nhập" fill="#257180" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#257180]" />
                  Chờ xác nhận
                  {pendingBookings.length > 0 && (
                    <Badge className="bg-red-500 text-white ml-auto">
                      {pendingBookings.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {pendingBookings.slice(0, 2).map((booking) => {
                      const learnerEmail = booking.learnerEmail || 'Học viên';
                      const subjectName = booking.tutorSubject?.subject?.subjectName || 'Môn học';
                      const levelName = booking.tutorSubject?.level?.name || 'Cấp độ';
                      const className = `${subjectName} - ${levelName}`;
                      const proposedDate = booking.schedules?.[0]?.availability?.startDate;
                      const proposedTime = proposedDate
                        ? format(new Date(proposedDate), 'HH:mm', { locale: vi })
                        : undefined;

                      return (
                        <div
                          key={booking.id}
                        className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#257180] text-white text-sm">
                                {learnerEmail[0]?.toUpperCase() || 'HV'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1">
                                {learnerEmail}
                            </h4>
                              <p className="text-sm text-gray-600 mb-2">{className}</p>
                              <Badge className="bg-blue-100 text-blue-800">Buổi học mới</Badge>
                          </div>
                        </div>

                          {proposedDate && (
                          <div className="bg-white p-3 rounded border border-yellow-300 mb-3">
                            <p className="text-xs text-gray-500 mb-1">Đề xuất:</p>
                            <p className="text-sm font-medium text-gray-900">
                                {format(new Date(proposedDate), "EEEE, dd/MM/yyyy", { locale: vi })}
                            </p>
                              {proposedTime && (
                                <p className="text-sm text-gray-600">{proposedTime}</p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => router.push(`/profile?tab=classes&bookingId=${booking.id}`)}
                          >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Xem chi tiết
                          </Button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Không có yêu cầu nào</p>
                    <p className="text-sm text-gray-500 mt-1">Tất cả đã được xử lý</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#257180]" />
                  Báo cáo chờ phản hồi
                  {reportsPendingDefense.length > 0 && (
                    <Badge className="bg-red-500 text-white ml-auto">
                      {reportsPendingDefense.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportsPendingDefense.length > 0 ? (
                  <div className="space-y-3">
                    {reportsPendingDefense.map((report) => {
                      const reporterName = report.reporterName || report.reporterEmail || 'Học viên';

                      return (
                      <div
                        key={report.id}
                        className="p-4 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => handleViewReportDetail(report)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-red-600 text-white text-sm">
                                {reporterName[0]?.toUpperCase() || 'HV'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1">
                                {reporterName}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {format(new Date(report.createdAt), "EEEE, dd/MM/yyyy", { locale: vi })}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border border-red-300 mb-3">
                          <p className="text-xs font-medium text-red-700 mb-1">Lý do:</p>
                            <p className="text-sm font-medium text-gray-900 mb-2">{report.reason || 'Không xác định'}</p>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-[#257180] hover:bg-[#1f5a66]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewReportDetail(report);
                            }}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                        </Button>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Không có báo cáo nào</p>
                    <p className="text-sm text-gray-500 mt-1">Giữ vững phong độ!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showDetailDialog && selectedReport && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border-gray-300 shadow-lg" aria-describedby={undefined}>
            <DialogHeader className="flex-shrink-0 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <DialogTitle className="text-xl font-semibold text-gray-900">Chi tiết báo cáo</DialogTitle>
                {isPendingOrUnderReviewStatus(selectedReport.status) && !canSubmitDefense && (
                  <span className="text-base font-bold text-gray-700">
                    Đã quá thời gian kháng cáo
                  </span>
                )}
              </div>
            </DialogHeader>
            {selectedReport && (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Người báo cáo</Label>
                          <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Avatar className="h-10 w-10 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] shadow-sm">
                              <AvatarImage src={selectedReport.reporterAvatarUrl} alt={selectedReport.reporterName} />
                              <AvatarFallback className="rounded-lg bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                {selectedReport.reporterName?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{selectedReport.reporterName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 truncate">{selectedReport.reporterEmail}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Người bị báo cáo</Label>
                          <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Avatar className="h-10 w-10 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] shadow-sm">
                              <AvatarImage src={selectedReport.reportedAvatarUrl} alt={selectedReport.reportedUserName} />
                              <AvatarFallback className="rounded-lg bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                {selectedReport.reportedUserName?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{selectedReport.reportedUserName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 truncate">{selectedReport.reportedUserEmail}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Trạng thái</Label>
                          <p className="mt-2 text-sm font-medium text-gray-900">
                            {getStatusLabel(selectedReport.status)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Ngày tạo</Label>
                          <p className="font-medium text-gray-900 mt-2">{formatDateTime(selectedReport.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Lý do báo cáo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {selectedReport.reason}
                    </p>
                  </CardContent>
                </Card>

                {selectedReport.handledByAdminEmail && (
                  <Card className="border border-gray-300 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-red-900">
                        Xử lý bởi {selectedReport.handledByAdminEmail}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-900 mt-2 p-3 bg-white/70 rounded-lg border border-red-200 whitespace-pre-wrap">
                        {selectedReport.adminNotes && selectedReport.adminNotes.trim().length > 0
                          ? selectedReport.adminNotes
                          : 'Chưa có ghi chú xử lý'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {selectedReport.reporterEvidences && selectedReport.reporterEvidences.length > 0 && (
                  <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-gray-900">
                        Bằng chứng từ người báo cáo ({selectedReport.reporterEvidences.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedReport.reporterEvidences.map((evidence) => {
                          const mediaTypeNum = normalizeMediaType(evidence.mediaType);
                          const isImage = mediaTypeNum === MediaType.Image || mediaTypeNum === 0;
                          return (
                            <div key={evidence.id} className="relative group">
                              <div 
                                className={`aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 ${isImage ? 'cursor-pointer' : ''}`}
                                onClick={() => isImage && setPreviewImage(evidence.fileUrl)}
                              >
                                {isImage ? (
                                  <img
                                    src={evidence.fileUrl}
                                    alt={evidence.caption || 'Evidence'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <video
                                    src={evidence.fileUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              {evidence.caption && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2 text-left">{evidence.caption}</p>
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
                      <Card className="bg-white border border-[#257180]/20 sticky top-0 transition-shadow hover:shadow-md">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-gray-900">
                            Kháng cáo
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
                            {selectedReport.defenses.map((defense) => (
                              <div key={defense.id} className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar className="h-10 w-10 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] shadow-sm">
                                    <AvatarImage src={tutorAvatars[defense.tutorEmail]} alt={tutorNames[defense.tutorEmail] || defense.tutorEmail} />
                                    <AvatarFallback className="rounded-lg bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                      {(tutorNames[defense.tutorEmail] || defense.tutorEmail)[0]?.toUpperCase() || 'T'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 truncate">{tutorNames[defense.tutorEmail] || defense.tutorEmail}</p>
                                    <p className="text-xs text-gray-500">{formatDateTime(defense.createdAt)}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-900 mb-3 leading-relaxed whitespace-pre-wrap">{defense.note}</p>
                                {defense.evidences && defense.evidences.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <Label className="text-sm text-gray-600 mb-2 block">Bằng chứng kháng cáo ({defense.evidences.length})</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {defense.evidences.map((evidence) => {
                                        const mediaTypeNum = normalizeMediaType(evidence.mediaType);
                                        const isImage = mediaTypeNum === MediaType.Image || mediaTypeNum === 0;
                                        return (
                                          <div key={evidence.id} className="relative">
                                            <div 
                                              className={`aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 ${isImage ? 'cursor-pointer' : ''}`}
                                              onClick={() => isImage && setPreviewImage(evidence.fileUrl)}
                                            >
                                              {isImage ? (
                                                <img
                                                  src={evidence.fileUrl}
                                                  alt={evidence.caption || 'Evidence'}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <video
                                                  src={evidence.fileUrl}
                                                  controls
                                                  className="w-full h-full object-cover"
                                                />
                                              )}
                                            </div>
                                            {evidence.caption && (
                                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{evidence.caption}</p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-gray-900">Kháng cáo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500 text-center py-8">Chưa có kháng cáo</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              {isPendingOrUnderReviewStatus(selectedReport.status) && (
                canSubmitDefense ? (
                  <Button
                    onClick={() => {
                      setDefenseFormData({ note: '', evidences: [] });
                      setUploadingDefenseFiles([]);
                      setUploadedDefenseUrls([]);
                      setShowDefenseDialog(true);
                    }}
                    className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Kháng cáo
                  </Button>
                ) : (
                  <span className="text-base font-semibold text-gray-600">
                    Đã quá thời gian kháng cáo
                  </span>
                )
              )}
              <Button
                variant="outline"
                onClick={() => setShowDetailDialog(false)}
                className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showDefenseDialog && selectedReport && (
        <Dialog open={showDefenseDialog} onOpenChange={setShowDefenseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-gray-300 shadow-lg">
            <DialogHeader>
              <DialogTitle>Gửi kháng cáo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nội dung kháng cáo *</Label>
                <Textarea
                  value={defenseFormData.note}
                  onChange={(e) => setDefenseFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Nhập nội dung kháng cáo..."
                  className="mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label>Bằng chứng (tùy chọn)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleDefenseFileSelect}
                      disabled={uploadingDefense}
                      className="flex-1"
                    />
                    {uploadingDefense && <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />}
                  </div>
                  {defenseFormData.evidences.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {defenseFormData.evidences.map((evidence, index) => {
                        const isImage = evidence.mediaType === MediaType.Image || evidence.mediaType === 0;
                        return (
                          <div key={index} className="relative group">
                            {isImage ? (
                              <div className="relative w-full h-24 rounded border overflow-hidden bg-gray-100">
                                <Image
                                  src={evidence.fileUrl}
                                  alt="Evidence"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                />
                              </div>
                            ) : (
                              <video
                                src={evidence.fileUrl}
                                controls
                                className="w-full h-24 object-cover rounded border"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDefenseFile(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDefenseDialog(false)}
                className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
              >
                Hủy
              </Button>
              <Button
                onClick={() => setShowConfirmDefense(true)}
                disabled={isProcessing || !defenseFormData.note.trim()}
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Gửi kháng cáo'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showConfirmDefense && (
        <AlertDialog open={showConfirmDefense} onOpenChange={setShowConfirmDefense}>
          <AlertDialogContent className="border-gray-300">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận gửi kháng cáo</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn gửi kháng cáo này không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSubmitDefense}
                className="bg-[#257180] hover:bg-[#257180]/90"
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-gray-300 shadow-lg" aria-describedby={undefined}>
            <div className="relative w-full h-full flex items-center justify-center bg-black/90">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={slotDialog.open} onOpenChange={(open) => setSlotDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-y-auto border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader className="space-y-2">
            <DialogTitle>Lịch rảnh của gia sư</DialogTitle>
            {slotDialog.schedule && (() => {
              const booking = getBooking(slotDialog.schedule!.bookingId, slotDialog.schedule!.booking);
              const tutorSubject = booking?.tutorSubject;
              const subject = tutorSubject?.subject;
              const level = tutorSubject?.level;
              const tutorEmail = tutorSubject?.tutorEmail;
              const tutorProfile = tutorSubject?.tutor;
              const currentAvailability = slotDialog.schedule?.availability;
              const currentSlot = currentAvailability?.slot;
              const currentStart = currentAvailability?.startDate
                ? new Date(currentAvailability.startDate)
                : undefined;
              return (
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-base">
                      {subject?.subjectName || 'Môn học'}
                    </span>
                    {level && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="font-medium">{level.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700">
                    Gia sư: <span className="font-medium">{tutorProfile?.userName || tutorEmail || user?.email || 'Chưa có thông tin'}</span>
                  </div>
                  {currentStart && currentSlot && (
                    <div className="text-gray-700 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">Buổi hiện tại:</span>
                      <span>
                        {format(currentStart, "EEEE, dd/MM/yyyy", { locale: vi })} • {currentSlot.startTime} - {currentSlot.endTime}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogHeader>

          {loadingAvailabilities ? (
            <div className="flex items-center justify-center py-6 gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin text-[#257180]" />
              Đang tải lịch rảnh...
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="py-4 text-center text-gray-600">
              Không có lịch rảnh phù hợp.
            </div>
          ) : (
            (() => {
              const dates = weekDays.map(day => getWeekDateKey(day.key));
              const times = timeSlots.map(ts => ts.startTime.slice(0, 5)).sort();

              const weekEnd = new Date(currentWeekStart);
              weekEnd.setDate(currentWeekStart.getDate() + 6);
              const weekRangeLabel = `${format(currentWeekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`;

              const isTooClose = (startDate?: string) => {
                if (!startDate) return false;
                const start = new Date(startDate).getTime();
                return start - Date.now() < 12 * 60 * 60 * 1000;
              };

              const isLearnerBusyCheck = (dateKey: string, hour: string) => {
                const key = `${dateKey}-${hour}`;
                return learnerBusyMap[key] === true;
              };

              const getSlotCheck = (dateKey: string, hour: string) =>
                availabilityByKey[`${dateKey}-${hour}`];

              return (
                <Card className="border border-gray-300">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {weekRangeLabel}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="flex items-center gap-2 border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
                        <ChevronLeft className="w-4 h-4" />
                        Tuần trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToCurrentWeek}
                        className="bg-[#FD8B51] text-white hover:bg-[#CB6040] border-[#FD8B51]"
                      >
                        Về tuần hiện tại
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToNextWeek} className="flex items-center gap-2 border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
                        Tuần sau
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <div className="min-w-[700px]">
                        <div className="grid" style={{ gridTemplateColumns: `120px repeat(${dates.length}, 1fr)` }}>
                          <div className="bg-white border-b border-r p-2 text-sm font-semibold text-gray-700">Giờ</div>
                          {dates.map((d, idx) => {
                            const dateObj = new Date(d);
                            return (
                              <div key={d} className="bg-white border-b border-r p-2 text-sm font-semibold text-gray-700 text-center">
                                <div>{weekDays[idx]?.label || format(dateObj, 'EEEE', { locale: vi })}</div>
                                <div className="text-xs text-gray-500">{format(dateObj, 'dd/MM')}</div>
                              </div>
                            );
                          })}
                          {times.map((t: string) => {
                            const hour = t.split(':')[0].padStart(2, '0');
                            return (
                              <React.Fragment key={t}>
                                <div className="bg-gray-50 border-b border-r p-2 text-sm font-semibold text-gray-700">{t}</div>
                                {dates.map(d => {
                                  const av = getSlotCheck(d, hour);
                                  const busy = isLearnerBusyCheck(d, hour);
                                  const busyInfo = learnerBusyInfoMap[`${d}-${hour}`];

                                  if (!av) {
                                    if (busy) {
                                      const startDisplay = busyInfo?.startTime || t;
                                      const endDisplay = busyInfo?.endTime ? ` - ${busyInfo.endTime}` : '';
                                      const busyTitle = `Bạn đã có lịch${busyInfo?.label ? ` • ${busyInfo.label}` : ''}${endDisplay ? ` • ${startDisplay}${endDisplay}` : ` • ${startDisplay}`
                                        }`;
                                      return (
                                        <div
                                          key={`${d}-${t}`}
                                          className="border-b border-r bg-rose-300 text-center text-[11px] text-rose-900 p-2 font-semibold"
                                          title={busyTitle}
                                        >
                                          <div className="text-[11px] leading-tight">
                                            {startDisplay}
                                            {endDisplay}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div
                                        key={`${d}-${t}`}
                                        className="border-b border-r bg-gray-100 text-center text-[11px] text-gray-500 p-2 font-semibold"
                                        title="Slot không rảnh"
                                      >
                                        ✕
                                      </div>
                                    );
                                  }

                                  const status = EnumHelpers.parseTutorAvailabilityStatus(av.status);
                                  const tooClose = isTooClose(av.startDate);
                                  const isSelected = slotDialog.selectedAvailabilityId === av.id;

                                  // Slot không rảnh (Booked/Unavailable)
                                  if (status !== TutorAvailabilityStatus.Available) {
                                    return (
                                      <div
                                        key={`${d}-${t}`}
                                        className="border-b border-r bg-slate-100 text-center text-[11px] text-slate-500 p-2 font-semibold"
                                      >
                                        ✕
                                      </div>
                                    );
                                  }

                                  // Trạng thái hiển thị (theo kiểu TutorDetailProfilePage)
                                  let buttonClass = '';
                                  let buttonContent = '';
                                  let disabled = false;

                                  if (busy) {
                                    const startDisplay = busyInfo?.startTime || av.slot?.startTime?.slice(0, 5) || '';
                                    const endDisplay = busyInfo?.endTime
                                      ? ` - ${busyInfo.endTime}`
                                      : av.slot?.endTime
                                        ? ` - ${av.slot.endTime.slice(0, 5)}`
                                        : '';
                                    buttonClass = 'bg-rose-300 text-rose-900 cursor-not-allowed border border-rose-500';
                                    buttonContent = `${startDisplay}${endDisplay}`;
                                    disabled = true;
                                  } else if (tooClose) {
                                    buttonClass = 'bg-orange-100 text-orange-900 cursor-not-allowed border border-orange-200';
                                    buttonContent = '⚠';
                                    disabled = true;
                                  } else if (isSelected) {
                                    buttonClass = 'bg-amber-300 text-amber-900 border-amber-500';
                                    buttonContent = '';
                                    disabled = false;
                                  } else {
                                    buttonClass = 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300';
                                    buttonContent = '';
                                    disabled = false;
                                  }

                                  return (
                                    <button
                                      key={`${d}-${t}-slot`}
                                      disabled={disabled && !isSelected}
                                      onClick={() =>
                                        setSlotDialog(prev =>
                                          isSelected
                                            ? { ...prev, selectedAvailabilityId: null }
                                            : { ...prev, selectedAvailabilityId: av.id }
                                        )
                                      }
                                      className={`border-b border-r p-2 text-center text-xs font-semibold transition ${buttonClass} ${disabled && !isSelected ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm'}`}
                                    >
                                      <div className="text-[11px] leading-tight">
                                        {av.slot?.startTime?.slice(0, 5)} - {av.slot?.endTime?.slice(0, 5)}
                                      </div>
                                      {buttonContent && <div className="text-[11px] leading-tight">{buttonContent}</div>}
                                    </button>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-700">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-emerald-200 rounded border border-emerald-400"></div>
                        <span className="font-medium text-emerald-800">Lịch rảnh </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-amber-300 rounded border border-amber-500"></div>
                        <span className="font-medium text-amber-800">Đã chọn </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-100 rounded border border-orange-200"></div>
                        <span className="font-medium text-orange-700">Quá gần (cần cách ≥12h)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-rose-300 rounded border border-rose-500"></div>
                        <span className="font-medium text-rose-900">Bạn đã có lịch</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-slate-200 rounded border border-slate-400"></div>
                        <span className="font-medium text-slate-800"> Không rảnh/đã booked</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700">Lý do (tùy chọn, tối đa 200 ký tự)</label>
                      <textarea
                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#257180]"
                        rows={3}
                        maxLength={200}
                        placeholder="Nhập lý do muốn đổi lịch (tối đa 200 ký tự)"
                        value={slotDialog.reason || ''}
                        onChange={(e) =>
                          setSlotDialog(prev => ({ ...prev, reason: e.target.value }))
                        }
                      />
                      <div className="text-xs text-gray-500 text-right">
                        {(slotDialog.reason?.length || 0)}/200
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()
          )}

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() =>
                setSlotDialog({ open: false, schedule: undefined, weekStart: undefined, selectedAvailabilityId: null, reason: '' })
              }
              className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            >
              Hủy
            </Button>
            <Button
              className="bg-[#FD8B51] hover:bg-[#CB6040] text-white"
              disabled={
                !slotDialog.selectedAvailabilityId ||
                !slotDialog.schedule?.availability?.id ||
                !user?.email ||
                loadingChangeReq
              }
              onClick={async () => {
                const schedule = slotDialog.schedule;
                const newAvailabilityId = slotDialog.selectedAvailabilityId;
                if (!schedule || !newAvailabilityId) {
                  toast.error('Vui lòng chọn slot mới.');
                  return;
                }

                const booking = getBooking(schedule.bookingId, schedule.booking);
                const learnerEmail = booking?.learnerEmail;
                const oldAvailabilityId = schedule.availability?.id;

                if (!user?.email || !learnerEmail) {
                  toast.error('Thiếu thông tin người gửi hoặc học viên.');
                  return;
                }
                if (!oldAvailabilityId) {
                  toast.error('Không tìm thấy lịch cũ của buổi học.');
                  return;
                }

                const payload = {
                  scheduleId: schedule.id,
                  requesterEmail: user.email,
                  requestedToEmail: learnerEmail,
                  oldAvailabilitiId: oldAvailabilityId,
                  newAvailabilitiId: newAvailabilityId,
                  reason: slotDialog.reason?.trim() || undefined,
                };

                const created = await createChangeRequest(payload);
                if (created) {
                  toast.success('Đã gửi yêu cầu đổi lịch.');
                  setPendingBySchedule(prev => ({ ...prev, [schedule.id]: true }));
                  setSlotDialog({ open: false, schedule: undefined, weekStart: undefined, selectedAvailabilityId: null, reason: '' });
                  await loadDashboardData();
                } else {
                  toast.error('Gửi yêu cầu đổi lịch thất bại.');
                }
              }}
            >
              {loadingChangeReq ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Tiếp tục'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
