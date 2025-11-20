"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { BookingService } from '@/services';
import { BookingDto } from '@/types/backend';
import { BookingStatus, PaymentStatus, ScheduleStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useSchedules } from '@/hooks/useSchedules';
import { useTutorBookings } from '@/hooks/useTutorBookings';
import { useLearnerProfiles } from '@/hooks/useLearnerProfiles';
import { useBookings } from '@/hooks/useBookings';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function TutorBookingsTab() {
  const { user } = useAuth();
  const { showError, showSuccess } = useCustomToast();
  const { bookings, loading, tutorId, loadingTutorId, loadTutorProfile, loadBookings } = useTutorBookings();
  const [filter, setFilter] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ bookingId: number | null; status: BookingStatus | null }>({ bookingId: null, status: null });
  const { schedules, loading: loadingSchedules, loadSchedulesByBookingId, clearSchedules } = useSchedules();
  const { learnerProfiles, loadLearnerProfiles, getLearnerProfile } = useLearnerProfiles();
  const { getBooking, loadBookingDetails } = useBookings();

  useEffect(() => {
    // Load tutor profile khi có email
    if (user?.email) {
      loadTutorProfile(user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]); // Loại bỏ loadTutorProfile khỏi dependency để tránh loop

  useEffect(() => {
    // Chỉ load bookings khi đã có tutorId hợp lệ và không đang loading tutorId
    // Luôn load tất cả bookings của tutor, filter sẽ xử lý ở FE
    if (tutorId && tutorId > 0 && !loadingTutorId && !loading) {
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId, loadingTutorId]); // Không thêm loading/filter vào dependency để tránh loop

  // Load learner profiles khi có bookings
  useEffect(() => {
    if (bookings.length > 0) {
      const learnerEmails = bookings
        .map((b) => b.learnerEmail)
        .filter((email): email is string => !!email);
      if (learnerEmails.length > 0) {
        loadLearnerProfiles(learnerEmails);
      }
    }
  }, [bookings, loadLearnerProfiles]);

  const handleUpdateStatus = async (bookingId: number, status: BookingStatus) => {
    try {
      const response = await BookingService.updateStatus(bookingId, status);
      if (response.success) {
        showSuccess(
          status === BookingStatus.Confirmed
            ? 'Đã chấp nhận'
            : 'Đã hủy'
        );

        // Reload bookings với filter hiện tại
        const params: {
          status?: BookingStatus;
        } = {};

        if (filter !== 'all') {
          switch (filter) {
            case 'active':
              params.status = BookingStatus.Confirmed;
              break;
            case 'pending':
              params.status = BookingStatus.Pending;
              break;
            case 'completed':
              params.status = BookingStatus.Completed;
              break;
            case 'cancelled':
              params.status = BookingStatus.Cancelled;
              break;
          }
        }

        loadBookings(params);

        if (selectedBookingId === bookingId) {
          handleBackToList();
        }
      } else {
        showError('Không thể cập nhật trạng thái', response.error?.message);
      }
    } catch (error: any) {
      showError('Lỗi khi cập nhật trạng thái', error.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
      case ScheduleStatus.Absent:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleViewDetail = async (bookingId: number) => {
    setSelectedBookingId(bookingId);
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      await loadSchedulesByBookingId(bookingId);
    }
  };

  const handleBackToList = () => {
    setSelectedBookingId(null);
    setSelectedBooking(null);
    clearSchedules();
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

  // Tính toán counts cho từng trạng thái (memo hóa)
  const bookingCounts = useMemo(() => {
    return {
      all: bookings.length,
      active: bookings.filter(
        (b) =>
          EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Confirmed &&
          getActiveSessions(b) > 0
      ).length,
      pending: bookings.filter(
        (b) => EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Pending
      ).length,
      completed: bookings.filter(
        (b) =>
          EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Confirmed &&
          getFinishedSessions(b) === b.totalSessions
      ).length,
      cancelled: bookings.filter(
        (b) => EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Cancelled
      ).length,
    };
  }, [bookings]);

  // Lọc bookings để hiển thị theo filter hiện tại
  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    const parsedStatus = EnumHelpers.parseBookingStatus(booking.status);
    if (filter === "active")
      return (
        parsedStatus === BookingStatus.Confirmed &&
        getActiveSessions(booking) > 0
      );
    if (filter === "pending") return parsedStatus === BookingStatus.Pending;
    if (filter === "completed")
      return (
        parsedStatus === BookingStatus.Confirmed &&
        getFinishedSessions(booking) === booking.totalSessions
      );
    if (filter === "cancelled") return parsedStatus === BookingStatus.Cancelled;
    return true;
  });

  // Render detail view: chỉ hiện bảng lịch / buổi học của booking được chọn
  if (selectedBookingId && selectedBooking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Lịch học của đơn #{selectedBookingId}
            </h2>
          </div>
        </div>

        {/* Schedules List */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Danh sách buổi học ({schedules.length})
          </h3>

          {loadingSchedules ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Chưa có buổi học nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {schedules
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
                  const booking = getBooking(schedule.bookingId, schedule.booking);
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

                  // Lấy endDate từ availability.endDate (đã là datetime đầy đủ)
                  let endDate: Date | null = null;
                  if (availability?.endDate) {
                    // availability.endDate đã có datetime đầy đủ, lấy trực tiếp
                    endDate = new Date(availability.endDate);
                  } else if (scheduleDate && slot?.endTime) {
                    // Nếu không có availability.endDate nhưng có slot, tính từ scheduleDate + slot.endTime
                    const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
                    endDate = new Date(scheduleDate);
                    endDate.setHours(endHours, endMinutes, 0, 0);
                  }

                  return (
                    <Card key={schedule.id} className="hover:shadow-md transition-shadow border-l-4 border-l-[#257180]">
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
                                      Zoom Meeting
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-gray-500 text-white border-gray-600">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      Offline
                                    </Badge>
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

                                  {schedule.meetingSession?.meetLink && (
                                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                                      <div className="bg-blue-50 rounded-lg p-2">
                                        <Video className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs text-gray-500">Link Zoom Meeting</div>
                                        <a
                                          href={schedule.meetingSession.meetLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-1 max-w-full"
                                          title={schedule.meetingSession.meetLink}
                                        >
                                          <span className="truncate break-all">
                                            {schedule.meetingSession.meetLink}
                                          </span>
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chỉ hiển thị loading khi đang load tutorId và chưa có tutorId
  if (loadingTutorId && !tutorId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
        <p className="ml-3 text-gray-600">Đang tải thông tin gia sư...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Lịch đặt</h2>
        <p className="text-gray-600 mt-1">Quản lý các đặt lịch từ học viên</p>
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
            Đang học (
            {bookingCounts.active}
            )
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="whitespace-nowrap data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
          >
            Chờ xác nhận (
            {bookingCounts.pending})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="whitespace-nowrap data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
          >
            Hoàn thành (
            {bookingCounts.completed})
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="whitespace-nowrap data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
          >
            Đã hủy (
            {bookingCounts.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {loading && bookings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
              <p className="ml-3 text-gray-600">Đang tải danh sách đặt lịch...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Không có đặt lịch nào</p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const learnerEmail = booking.learnerEmail;
              const learnerProfile = getLearnerProfile(learnerEmail);
              const tutorSubject = booking.tutorSubject;
              const subject = tutorSubject?.subject;
              const level = tutorSubject?.level;
              const nextSession = getNextSession(booking);
              const finishedSessions = getFinishedSessions(booking);
              const progress = (finishedSessions / booking.totalSessions) * 100;

              return (
                <Card
                  key={booking.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetail(booking.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Learner Info */}
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={learnerProfile?.profile.avatarUrl}
                            alt={learnerEmail || 'Học viên'}
                          />
                          <AvatarFallback>
                            {learnerEmail?.[0]?.toUpperCase() || 'HV'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">
                                  {subject?.subjectName || 'Môn học'}
                                </h3>
                                {level && (
                                  <Badge variant="outline" className="text-sm">
                                    {level.name}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600">
                                Học viên: {learnerEmail || 'Chưa có thông tin'}
                              </p>
                            </div>
                            <div className="flex flex-wrap sm:flex-col gap-2 items-start sm:items-end">
                              <Badge className={getBookingStatusColor(booking.status)}>
                                {EnumHelpers.getBookingStatusLabel(booking.status)}
                              </Badge>
                              <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                                {EnumHelpers.getPaymentStatusLabel(booking.paymentStatus)}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {level && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <span>Cấp độ: {level.name}</span>
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

                      {/* Progress & Actions */}
                      <div className="lg:w-80 space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Tiến độ</span>
                            <span className="font-medium">
                              {finishedSessions}/{booking.totalSessions} buổi
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giá/buổi:</span>
                            <span className="font-medium">{formatCurrency(booking.unitPrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="font-semibold text-[#257180]">
                              {formatCurrency(booking.totalAmount)}
                            </span>
                          </div>
                          {booking.systemFeeAmount && booking.systemFeeAmount > 0 && (
                            <>
                              <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-200">
                                <span>Phí hệ thống:</span>
                                <span className="font-medium text-gray-700">
                                  {formatCurrency(booking.systemFeeAmount)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm font-semibold text-green-600 pt-1 border-t border-gray-300">
                                <span>Số tiền nhận được:</span>
                                <span>
                                  {formatCurrency(booking.totalAmount - booking.systemFeeAmount)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {EnumHelpers.parseBookingStatus(booking.status) === BookingStatus.Pending && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDialog({ bookingId: booking.id, status: BookingStatus.Confirmed });
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Chấp nhận
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDialog({ bookingId: booking.id, status: BookingStatus.Cancelled });
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Hủy
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: mở chat
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

      <ConfirmDialog
        open={confirmDialog.bookingId !== null && confirmDialog.status !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ bookingId: null, status: null });
        }}
        title={
          confirmDialog.status === BookingStatus.Confirmed
            ? 'Xác nhận chấp nhận đơn'
            : 'Xác nhận hủy đơn'
        }
        description={
          confirmDialog.status === BookingStatus.Confirmed
            ? 'Bạn có chắc chắn muốn chấp nhận booking này không?'
            : 'Bạn có chắc chắn muốn hủy booking này không?'
        }
        confirmText={
          confirmDialog.status === BookingStatus.Confirmed
            ? 'Chấp nhận'
            : 'Hủy đơn'
        }
        cancelText="Đóng"
        type={confirmDialog.status === BookingStatus.Confirmed ? 'success' : 'error'}
        onConfirm={async () => {
          const { bookingId, status } = confirmDialog;
          setConfirmDialog({ bookingId: null, status: null });
          if (bookingId !== null && status !== null) {
            await handleUpdateStatus(bookingId, status);
          }
        }}
        onCancel={() => setConfirmDialog({ bookingId: null, status: null })}
      />
    </div>
  );
}

