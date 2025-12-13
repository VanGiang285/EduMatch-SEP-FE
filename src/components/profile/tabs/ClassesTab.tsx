"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Button } from '@/components/ui/basic/button';
import { Progress } from '@/components/ui/feedback/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import {
  BookOpen,
  Calendar,
  MapPin,
  Video,
  MessageCircle,
  MoreHorizontal,
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { BookingDto } from '@/types/backend';
import {
  BookingStatus,
  PaymentStatus,
  ScheduleCompletionStatus,
  ScheduleStatus,
  TeachingMode,
} from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useCustomToast } from '@/hooks/useCustomToast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useTutorProfiles } from '@/hooks/useTutorProfiles';
import { useWalletContext } from '@/contexts/WalletContext';
import { useSchedules } from '@/hooks/useSchedules';
import { useBookings } from '@/hooks/useBookings';
import { BookingNotesPanel } from '@/components/booking/BookingNotesPanel';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { ReportService, MediaService } from '@/services';
import { ReportCreateRequest, BasicEvidenceRequest } from '@/types/requests';
import { MediaType } from '@/types/enums';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/feedback/dialog';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Input } from '@/components/ui/form/input';

export function ClassesTab() {
  const { user } = useAuth();
  const { refetch: refetchWallet } = useWalletContext();
  const { showError, showSuccess, showWarning } = useCustomToast();
  const router = useRouter();
  const {
    bookings,
    loading,
    loadLearnerBookings: loadBookings,
    updateStatus: updateBookingStatus,
    getBookingById,
    loadBookingDetails,
    getBooking: getBookingFromCache,
  } = useBookings();
  const [allBookings, setAllBookings] = useState<BookingDto[]>([]); // Lưu tất cả bookings để tính counts
  const [filter, setFilter] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);
  const [cancelDialogBookingId, setCancelDialogBookingId] = useState<number | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportingSchedule, setReportingSchedule] = useState<{ scheduleId: number; bookingId: number; tutorEmail: string } | null>(null);
  const [reportFormData, setReportFormData] = useState({ reason: '', evidences: [] as BasicEvidenceRequest[] });
  const [uploadingReportFiles, setUploadingReportFiles] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const { loadTutorProfiles, getTutorProfile, loadTutorProfile } = useTutorProfiles();
  const {
    schedules,
    loading: loadingSchedules,
    loadSchedulesByBookingId,
    clearSchedules,
    finishSchedule,
  } = useSchedules();
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<'all' | ScheduleStatus>('all');

  // Load tất cả bookings một lần khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user?.email) {
      // Load tất cả bookings (không filter) để tính counts
      loadBookings(user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // Đồng bộ allBookings với dữ liệu bookings mới nhất từ hook
  useEffect(() => {
    setAllBookings(bookings);
  }, [bookings]);

  // Load tutor profiles khi có bookings
  useEffect(() => {
    if (allBookings.length > 0) {
      const tutorEmails = new Set<string>();
      allBookings.forEach((booking) => {
        const tutorEmail = booking.tutorSubject?.tutorEmail;
        if (tutorEmail) {
          tutorEmails.add(tutorEmail);
        }
      });

      if (tutorEmails.size > 0) {
        loadTutorProfiles(Array.from(tutorEmails));
      }
    }
  }, [allBookings, loadTutorProfiles]);

  useEffect(() => {
    if (selectedBookingId) {
      loadBookingDetail();
    }
  }, [selectedBookingId]);


  const loadBookingDetail = async () => {
    if (!selectedBookingId) return;

    try {
      const bookingDetail = await getBookingById(selectedBookingId);
      if (bookingDetail) {
        setSelectedBooking(bookingDetail);

        const tutorEmail = bookingDetail.tutorSubject?.tutorEmail;
        if (tutorEmail) {
          await loadTutorProfile(tutorEmail);
        }
      } else {
        showError('Không thể tải chi tiết lớp học', 'Vui lòng thử lại sau.');
      }

      await loadSchedulesByBookingId(selectedBookingId);
    } catch (error: any) {
      showError('Lỗi khi tải chi tiết lớp học', error.message);
    }
  };

  // Load booking details khi schedules thay đổi
  useEffect(() => {
    if (schedules.length > 0) {
      const bookingIdsToLoad = schedules
        .filter((schedule) => schedule.bookingId && !schedule.booking)
        .map((schedule) => schedule.bookingId!);

      if (bookingIdsToLoad.length > 0) {
        loadBookingDetails(bookingIdsToLoad);
      }
    }
  }, [schedules, loadBookingDetails]);

  const handleViewDetail = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setScheduleStatusFilter('all');
  };

  const handleBackToList = () => {
    setSelectedBookingId(null);
    setSelectedBooking(null);
    clearSchedules();
    setScheduleStatusFilter('all');
  };
  const filteredSchedules = useMemo(() => {
    if (scheduleStatusFilter === 'all') return schedules;
    return schedules.filter(
      (schedule) => EnumHelpers.parseScheduleStatus(schedule.status) === scheduleStatusFilter
    );
  }, [scheduleStatusFilter, schedules]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getBookingStatusColor = (status: BookingStatus | string) => {
    const parsedStatus = EnumHelpers.parseBookingStatus(status);
    switch (parsedStatus) {
      case BookingStatus.Pending:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case BookingStatus.Confirmed:
        return 'bg-green-100 text-green-800 border-green-200';
      case BookingStatus.Completed:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case BookingStatus.Cancelled:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus | string) => {
    const parsedStatus = EnumHelpers.parsePaymentStatus(status);
    switch (parsedStatus) {
      case PaymentStatus.Pending:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case PaymentStatus.Paid:
        return 'bg-green-100 text-green-800 border-green-200';
      case PaymentStatus.Refunded:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScheduleStatusColor = (status: ScheduleStatus | string) => {
    const parsedStatus = EnumHelpers.parseScheduleStatus(status);
    switch (parsedStatus) {
      case ScheduleStatus.Upcoming:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ScheduleStatus.InProgress:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ScheduleStatus.Completed:
        return 'bg-green-100 text-green-800 border-green-200';
      case ScheduleStatus.Cancelled:
        return 'bg-red-100 text-red-800 border-red-200';
      case ScheduleStatus.Pending:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ScheduleStatus.Processing:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextSession = (booking: BookingDto) => {
    if (!booking.schedules || booking.schedules.length === 0) return null;

    const upcomingSchedules = booking.schedules
      .filter(
        (s) =>
          EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming &&
          s.availability?.startDate &&
          new Date(s.availability.startDate) > new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.availability?.startDate || 0).getTime() -
          new Date(b.availability?.startDate || 0).getTime()
      );

    return upcomingSchedules.length > 0 ? upcomingSchedules[0].availability?.startDate : null;
  };

  const getCompletedSessions = (booking: BookingDto) => {
    if (!booking.schedules) return 0;
    return booking.schedules.filter(
      (s) => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Completed
    ).length;
  };

  const getActiveSessions = (booking: BookingDto) => {
    if (!booking.schedules) return 0;
    return booking.schedules.filter(
      (s) => {
        const status = EnumHelpers.parseScheduleStatus(s.status);
        return status === ScheduleStatus.Upcoming || status === ScheduleStatus.InProgress;
      }
    ).length;
  };

  const getFinishedSessions = (booking: BookingDto) => {
    if (!booking.schedules) return 0;
    return booking.schedules.filter(
      (s) => {
        const status = EnumHelpers.parseScheduleStatus(s.status);
        return status !== ScheduleStatus.Upcoming && status !== ScheduleStatus.InProgress;
      }
    ).length;
  };

  const getScheduleStatusSummary = (booking: BookingDto) => {
    if (!booking.schedules || booking.schedules.length === 0) return [];

    const summaryMap = new Map<ScheduleStatus, number>();
    booking.schedules.forEach((schedule) => {
      const status = EnumHelpers.parseScheduleStatus(schedule.status);
      summaryMap.set(status, (summaryMap.get(status) || 0) + 1);
    });

    return Array.from(summaryMap.entries())
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => a.status - b.status);
  };

  const getScheduleStatusBgColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Upcoming:
        return 'bg-blue-400';
      case ScheduleStatus.InProgress:
        return 'bg-yellow-400';
      case ScheduleStatus.Completed:
        return 'bg-green-500';
      case ScheduleStatus.Cancelled:
        return 'bg-red-400';
      case ScheduleStatus.Pending:
        return 'bg-yellow-400';
      case ScheduleStatus.Processing:
        return 'bg-blue-400';
      default:
        return 'bg-gray-300';
    }
  };

  const handleOpenReportDialog = (schedule: any) => {
    const booking = getBookingFromCache(schedule.bookingId, schedule.booking);
    const tutorEmail = booking?.tutorSubject?.tutor?.email || booking?.tutorEmail;
    if (!tutorEmail) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư');
      return;
    }
    setReportingSchedule({
      scheduleId: schedule.id,
      bookingId: schedule.bookingId,
      tutorEmail: tutorEmail,
    });
    setReportFormData({ reason: '', evidences: [] });
    setShowReportDialog(true);
  };

  const handleReportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!user?.email) {
      showError('Lỗi', 'Vui lòng đăng nhập');
      return;
    }

    setUploadingReportFiles(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const isVideo = file.type.startsWith('video/');
        const mediaType: 'Image' | 'Video' = isVideo ? 'Video' : 'Image';
        const response = await MediaService.uploadFile({
          file,
          ownerEmail: user.email!,
          mediaType,
        });
        if (response.success && response.data?.data) {
          const url = response.data.data.secureUrl || response.data.data.originalUrl;
          return {
            mediaType: isVideo ? MediaType.Video : MediaType.Image,
            mediaUrl: url,
            filePublicId: response.data.data.publicId,
          } as BasicEvidenceRequest;
        }
        throw new Error('Upload failed');
      });

      const uploadedEvidences = await Promise.all(uploadPromises);
      setReportFormData((prev) => ({
        ...prev,
        evidences: [...prev.evidences, ...uploadedEvidences],
      }));
      showSuccess('Tải lên thành công', `${uploadedEvidences.length} file đã được tải lên`);
    } catch (error: any) {
      console.error('Error uploading report files:', error);
      showError('Lỗi', 'Không thể tải lên file. Vui lòng thử lại.');
    } finally {
      setUploadingReportFiles(false);
    }
  };

  const handleRemoveReportEvidence = (index: number) => {
    setReportFormData((prev) => ({
      ...prev,
      evidences: prev.evidences.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitReport = async () => {
    if (!reportingSchedule || !reportFormData.reason.trim()) {
      showError('Lỗi', 'Vui lòng nhập lý do báo cáo');
      return;
    }

    setSubmittingReport(true);
    try {
      const request: ReportCreateRequest = {
        reportedUserEmail: reportingSchedule.tutorEmail,
        reason: reportFormData.reason.trim(),
        bookingId: reportingSchedule.bookingId,
        evidences: reportFormData.evidences.length > 0 ? reportFormData.evidences : undefined,
      };

      const response = await ReportService.createReport(request);
      if (response.success) {
        showSuccess('Thành công', 'Báo cáo đã được gửi thành công');
        setShowReportDialog(false);
        setReportingSchedule(null);
        setReportFormData({ reason: '', evidences: [] });
      } else {
        showError('Lỗi', response.message || 'Không thể tạo báo cáo');
      }
    } catch (error: any) {
      console.error('Error creating report:', error);
      showError('Lỗi', 'Không thể tạo báo cáo. Vui lòng thử lại.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const updated = await updateBookingStatus(bookingId, BookingStatus.Cancelled);
      if (updated) {
        showSuccess('Đã hủy booking thành công');

        // Reload bookings và wallet song song để cập nhật dữ liệu
        if (user?.email) {
          await loadBookings(user.email);
        }

        // Nếu đang ở detail của booking vừa hủy thì quay về list
        if (selectedBookingId === bookingId) {
          handleBackToList();
        }
      } else {
        showError('Không thể hủy booking', 'Vui lòng thử lại sau.');
      }
    } catch (error: any) {
      showError('Lỗi khi hủy booking', error.message);
    }
  };

  const bookingCounts = useMemo(() => {
    return {
      all: allBookings.length,
      active: allBookings.filter(
        (b) =>
          EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Confirmed &&
          getActiveSessions(b) > 0
      ).length,
      pending: allBookings.filter(
        (b) => EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Pending
      ).length,
      completed: allBookings.filter(
        (b) =>
          EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Confirmed &&
          getFinishedSessions(b) === b.totalSessions
      ).length,
      cancelled: allBookings.filter(
        (b) => EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Cancelled
      ).length,
    };
  }, [allBookings]);

  // Filter bookings để hiển thị dựa trên filter hiện tại
  const filteredBookings = allBookings.filter((booking) => {
    if (filter === 'all') return true;
    const parsedStatus = EnumHelpers.parseBookingStatus(booking.status);
    if (filter === 'active')
      return (
        parsedStatus === BookingStatus.Confirmed &&
        getActiveSessions(booking) > 0
      );
    if (filter === 'pending') return parsedStatus === BookingStatus.Pending;
    if (filter === 'completed')
      return (
        parsedStatus === BookingStatus.Confirmed &&
        getFinishedSessions(booking) === booking.totalSessions
      );
    if (filter === 'cancelled') return parsedStatus === BookingStatus.Cancelled;
    return true;
  });

  // Render detail view: chỉ hiện danh sách buổi học của booking
  if (selectedBookingId && selectedBooking) {
    const tutorSubject = selectedBooking.tutorSubject;
    const subject = tutorSubject?.subject;
    const level = tutorSubject?.level;
    const tutorName = tutorSubject?.tutor?.userName;
    const tutorEmail = tutorSubject?.tutorEmail;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-gray-500">Môn học</p>
            <p className="text-sm font-semibold text-gray-900">{subject?.subjectName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Cấp độ</p>
            <p className="text-sm font-semibold text-gray-900">{level?.name || 'Không xác định'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Email gia sư</p>
            <p className="text-sm font-semibold text-gray-900">
              {tutorEmail || 'Chưa có thông tin'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Trạng thái đơn</p>
            <Badge className={getBookingStatusColor(selectedBooking.status)}>
              {EnumHelpers.getBookingStatusLabel(selectedBooking.status)}
            </Badge>
          </div>
        </div>

        <div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: 'Tất cả' },
                { value: ScheduleStatus.Upcoming, label: 'Sắp diễn ra' },
                { value: ScheduleStatus.InProgress, label: 'Đang học' },
                { value: ScheduleStatus.Completed, label: 'Hoàn thành' },
                { value: ScheduleStatus.Cancelled, label: 'Đã hủy' },
                { value: ScheduleStatus.Pending, label: 'Chờ xử lý' },
                { value: ScheduleStatus.Processing, label: 'Đang xử lý' },
              ].map((option) => (
                <Button
                  key={`schedule-filter-${option.label}`}
                  size="sm"
                  variant={scheduleStatusFilter === option.value ? 'default' : 'outline'}
                  className={
                    scheduleStatusFilter === option.value
                      ? 'bg-[#257180] text-white'
                      : 'text-gray-600'
                  }
                  onClick={() => setScheduleStatusFilter(option.value)}
                >
                  {option.label}
                  {option.value === 'all'
                    ? schedules.length > 0 && <span className="ml-1 text-xs">({schedules.length})</span>
                    : schedules.length > 0 && (
                      <span className="ml-1 text-xs">
                        (
                        {
                          schedules.filter(
                            (schedule) =>
                              EnumHelpers.parseScheduleStatus(schedule.status) === option.value
                          ).length
                        }
                        )
                      </span>
                    )}
                </Button>
              ))}
            </div>
          </div>

          {loadingSchedules ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : filteredSchedules.length === 0 ? (
            <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Chưa có buổi học nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSchedules
                .sort((a, b) => {
                  const dateA = a.availability?.startDate
                    ? new Date(a.availability.startDate).getTime()
                    : 0;
                  const dateB = b.availability?.startDate
                    ? new Date(b.availability.startDate).getTime()
                    : 0;
                  return dateA - dateB;
                })
                .map((schedule) => {
                  const availability = schedule.availability;
                  const slot = availability?.slot;

                  // Lấy booking từ schedule hoặc từ hook (nếu schedule chỉ có bookingId)
                  const booking = getBookingFromCache(schedule.bookingId, schedule.booking);
                  // Từ booking lấy tutorSubject (tutorSubjectId)
                  const tutorSubject = booking?.tutorSubject;
                  // Từ tutorSubject lấy subject (môn học) và level
                  const subject = tutorSubject?.subject;
                  const level = tutorSubject?.level;

                  // Lấy startDate và endDate từ availability (đã là datetime đầy đủ như "2025-11-02T15:00:00")
                  let scheduleDate: Date | null = null;
                  if (availability?.startDate) {
                    scheduleDate = new Date(availability.startDate);
                    // Nếu có slot.startTime, override time từ slot
                    if (slot?.startTime) {
                      const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
                      scheduleDate.setHours(startHours, startMinutes, 0, 0);
                    }
                    // Nếu không có slot, scheduleDate đã có time từ availability.startDate
                  }

                  const isOnline = !!(schedule.meetingSession || schedule.hasMeetingSession);

                  // Lấy endDate: ưu tiên lấy từ slot.endTime, nếu không có mới dùng availability.endDate
                  let endDate: Date | null = null;
                  if (scheduleDate && slot?.endTime) {
                    // Ưu tiên: tính từ scheduleDate + slot.endTime
                    const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
                    endDate = new Date(scheduleDate);
                    endDate.setHours(endHours, endMinutes, 0, 0);
                  } else if (availability?.endDate) {
                    // Fallback: dùng availability.endDate nếu không có slot.endTime
                    endDate = new Date(availability.endDate);
                  }

                  const parsedScheduleStatus = EnumHelpers.parseScheduleStatus(schedule.status);
                  // Chỉ hiện nút khi buổi học ở trạng thái Pending
                  const isPending = parsedScheduleStatus === ScheduleStatus.Pending;

                  return (
                    <Card key={schedule.id} className="hover:shadow-md transition-shadow border border-[#257180]/20 border-l-4 border-l-[#257180] bg-white">
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
                                {/* Subject và Level */}
                                {(subject || level) && (
                                  <div className="mb-3">
                                    <h4 className="font-semibold text-lg text-gray-900">
                                      {subject?.subjectName || 'Môn học'}
                                      {level && (
                                        <span className="ml-2 text-base font-normal text-gray-500">
                                          - {level.name}
                                        </span>
                                      )}
                                    </h4>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  <Badge className={getScheduleStatusColor(schedule.status)}>
                                    {EnumHelpers.getScheduleStatusLabel(schedule.status)}
                                  </Badge>
                                  {isOnline ? (
                                    <Badge className="bg-blue-500 text-white border-blue-600">
                                      <Video className="h-3 w-3 mr-1" />
                                      Online
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-gray-500 text-white border-gray-600">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      Offline
                                    </Badge>
                                  )}
                                  {EnumHelpers.parseScheduleStatus(schedule.status) === ScheduleStatus.Completed && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  )}
                                  {EnumHelpers.parseScheduleStatus(schedule.status) === ScheduleStatus.Cancelled && (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  )}
                                  {EnumHelpers.parseScheduleStatus(schedule.status) === ScheduleStatus.Pending && (
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                  )}
                                  {EnumHelpers.parseScheduleStatus(schedule.status) === ScheduleStatus.Processing && (
                                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                  )}
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



                                  {scheduleDate && endDate && (
                                    <div className="flex items-center gap-3">
                                      <div className="bg-white rounded-lg p-2 shadow-sm">
                                        <Clock className="h-5 w-5 text-[#257180]" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs text-gray-500">Bắt đầu - Kết thúc</div>
                                        <div className="text-gray-900 font-medium">
                                          {format(scheduleDate, "HH:mm", { locale: vi })} - {format(endDate, "HH:mm", { locale: vi })}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {isOnline && schedule.meetingSession && (
                                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                                      <div className="bg-blue-50 rounded-lg p-2">
                                        <Video className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs text-gray-500">Link lớp học</div>
                                        <a
                                          href={schedule.meetingSession.meetLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-1"
                                        >
                                          Tham gia lớp học online
                                          <Video className="h-4 w-4" />
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {schedule.attendanceNote && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <div className="text-xs text-gray-500 mb-1">Ghi chú</div>
                                      <div className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                                        {schedule.attendanceNote}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isPending && (
                              <div className="mt-4 flex justify-end gap-2">
                                <Button
                                  onClick={() => handleOpenReportDialog(schedule)}
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Báo cáo
                                </Button>
                                <Button
                                  onClick={async () => {
                                    const success = await finishSchedule(schedule.id);
                                    if (success) {
                                      showSuccess('Đã xác nhận buổi học thành công');
                                      // Refetch số dư ví để cập nhật ngay (tutor sẽ thấy tiền cộng ngay)
                                      try {
                                        await refetchWallet();
                                      } catch (err) {
                                        console.error('Không thể refetch ví sau khi xác nhận buổi học', err);
                                        showWarning(
                                          'Không thể tải lại số dư',
                                          'Vui lòng tải lại trang để xem số dư mới.'
                                        );
                                      }
                                    } else {
                                      showError('Không thể xác nhận buổi học', 'Vui lòng thử lại sau.');
                                    }
                                  }}
                                  disabled={loadingSchedules}
                                  className="bg-[#257180] text-white hover:bg-[#1f616f]"
                                >
                                  Xác nhận đã học
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>

        <BookingNotesPanel bookingId={selectedBookingId} />
      </div>
    );
  }

  // Render list view
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Lớp học của tôi</h2>
        <p className="text-gray-600 mt-1">Quản lý tất cả các khóa học đã đặt</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="w-full overflow-x-auto flex flex-wrap sm:flex-nowrap gap-2">
          <TabsTrigger
            value="all"
            className="whitespace-nowrap data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
          >
            Tất cả ({bookingCounts.all})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="whitespace-nowrap data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
          >
            Đang học ({bookingCounts.active})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="whitespace-nowrap data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
          >
            Chờ xác nhận ({bookingCounts.pending})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="whitespace-nowrap data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
          >
            Hoàn thành ({bookingCounts.completed})
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="whitespace-nowrap data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
          >
            Đã hủy ({bookingCounts.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow bg-white border border-[#257180]/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Không có lớp học nào</p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const tutorSubject = booking.tutorSubject;
              const tutorEmail = tutorSubject?.tutorEmail;
              const tutor = tutorEmail ? getTutorProfile(tutorEmail) : tutorSubject?.tutor;
              const subject = tutorSubject?.subject;
              const level = tutorSubject?.level;
              const nextSession = getNextSession(booking);
              const finishedSessions = getFinishedSessions(booking);
              const progress = (finishedSessions / booking.totalSessions) * 100;
              const scheduleStatusSummary = getScheduleStatusSummary(booking);

              return (
                <Card
                  key={booking.id}
                  className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-[#257180]/20"
                  onClick={() => handleViewDetail(booking.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Tutor Info */}
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={tutor?.avatarUrl} alt={tutor?.userName || 'Gia sư'} />
                          <AvatarFallback>
                            {tutor?.userName?.[0]?.toUpperCase() || 'GS'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {subject?.subjectName || 'Môn học'}
                                </h3>
                                {level && (
                                  <Badge variant="outline" className="text-sm">
                                    {level.name}
                                  </Badge>
                                )}
                                <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                                  {EnumHelpers.getPaymentStatusLabel(booking.paymentStatus)}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm">
                                Gia sư: {tutor?.userName || 'Chưa có thông tin'}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <Badge className={getBookingStatusColor(booking.status)}>
                                {EnumHelpers.getBookingStatusLabel(booking.status)}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {tutor?.teachingModes !== undefined && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                {EnumHelpers.parseTeachingMode(tutor.teachingModes) === TeachingMode.Online ? (
                                  <Video className="h-4 w-4" />
                                ) : (
                                  <MapPin className="h-4 w-4" />
                                )}
                                <span>{EnumHelpers.getTeachingModeLabel(tutor.teachingModes)}</span>
                                {level && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span>{level.name}</span>
                                  </>
                                )}
                              </div>
                            )}
                            {nextSession && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Buổi tiếp theo:{' '}
                                  {format(new Date(nextSession), "dd/MM/yyyy 'lúc' HH:mm", {
                                    locale: vi,
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress & Stats */}
                      <div className="lg:w-80 space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Tiến độ</span>
                          </div>
                          {scheduleStatusSummary.length > 0 ? (
                            <>
                              <div className="flex h-2 w-full overflow-hidden rounded bg-gray-200">
                                {scheduleStatusSummary.map(({ status, count }) => (
                                  <div
                                    key={`${booking.id}-${status}`}
                                    className={`${getScheduleStatusBgColor(status)} h-full`}
                                    style={{
                                      width: `${(count / booking.totalSessions) * 100}%`,
                                    }}
                                    title={`${EnumHelpers.getScheduleStatusLabel(status)}: ${count} buổi`}
                                  />
                                ))}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                {scheduleStatusSummary.map(({ status, count }) => (
                                  <div key={`legend-${booking.id}-${status}`} className="flex items-center gap-1">
                                    <span
                                      className={`inline-block h-2 w-2 rounded-full ${getScheduleStatusBgColor(status)}`}
                                    />
                                    <span>
                                      {EnumHelpers.getScheduleStatusLabel(status)}: {count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <Progress value={progress} className="h-2" />
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tổng tiền:</span>
                            <span className="text-lg font-semibold text-[#257180]">
                              {formatCurrency(booking.totalAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Giá/buổi: {formatCurrency(booking.unitPrice)}</span>
                          </div>

                          <div className="pt-2 border-t border-gray-200 space-y-2">
                            {EnumHelpers.parseBookingStatus(booking.status) === BookingStatus.Pending && (
                              <Button
                                size="sm"
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancelDialogBookingId(booking.id);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Hủy đơn
                              </Button>
                            )}

                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Navigate to chat
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Nhắn tin
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(booking.id);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog cho Hủy đơn */}
      <ConfirmDialog
        open={cancelDialogBookingId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelDialogBookingId(null);
        }}
        title="Xác nhận hủy đơn"
        description="Bạn có chắc chắn muốn hủy booking này không?"
        confirmText="Hủy đơn"
        cancelText="Đóng"
        type="error"
        onConfirm={async () => {
          const id = cancelDialogBookingId;
          setCancelDialogBookingId(null);
          if (id != null) {
            await handleCancelBooking(id);
          }
        }}
        onCancel={() => setCancelDialogBookingId(null)}
      />

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo báo cáo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Gia sư báo cáo</Label>
              <Input
                value={reportingSchedule?.tutorEmail || ''}
                disabled
                className="mt-2 bg-gray-50"
              />
            </div>
            <div>
              <Label>Lý do báo cáo *</Label>
              <Textarea
                value={reportFormData.reason}
                onChange={(e) => setReportFormData((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Nhập lý do báo cáo..."
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
                    onChange={handleReportFileChange}
                    disabled={uploadingReportFiles}
                    className="flex-1"
                  />
                  {uploadingReportFiles && <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />}
                </div>
                {reportFormData.evidences.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {reportFormData.evidences.map((evidence, index) => {
                      const isImage = evidence.mediaType === MediaType.Image || evidence.mediaType === 0;
                      return (
                        <div key={index} className="relative group">
                          {isImage ? (
                            <img
                              src={evidence.mediaUrl}
                              alt="Evidence"
                              className="w-full h-24 object-cover rounded border"
                            />
                          ) : (
                            <video
                              src={evidence.mediaUrl}
                              controls
                              className="w-full h-24 object-cover rounded border"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReportEvidence(index)}
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
              onClick={() => {
                setShowReportDialog(false);
                setReportingSchedule(null);
                setReportFormData({ reason: '', evidences: [] });
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={submittingReport || !reportFormData.reason.trim()}
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {submittingReport ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Tạo báo cáo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
