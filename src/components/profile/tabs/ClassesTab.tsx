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
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { BookingService } from '@/services';
import { BookingDto } from '@/types/backend';
import { BookingStatus, PaymentStatus, ScheduleStatus, TeachingMode } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useTutorProfiles } from '@/hooks/useTutorProfiles';
import { useSchedules } from '@/hooks/useSchedules';
import { useLearnerBookings } from '@/hooks/useLearnerBookings';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function ClassesTab() {
  const { user } = useAuth();
  const { showError } = useCustomToast();
  const { bookings, loading, loadBookings } = useLearnerBookings();
  const [allBookings, setAllBookings] = useState<BookingDto[]>([]); // Lưu tất cả bookings để tính counts
  const [filter, setFilter] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);
  const { tutorProfiles, loadTutorProfiles, getTutorProfile, loadTutorProfile } = useTutorProfiles();
  const { schedules, loading: loadingSchedules, loadSchedules, clearSchedules } = useSchedules();

  // Load tất cả bookings một lần khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user?.email) {
      // Load tất cả bookings (không filter) để tính counts
      loadBookings(user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // Cập nhật allBookings khi bookings thay đổi (chỉ khi load tất cả, không filter)
  useEffect(() => {
    // Chỉ cập nhật khi allBookings đang rỗng hoặc khi có dữ liệu mới
    if (allBookings.length === 0 && bookings.length > 0) {
      setAllBookings(bookings);
    } else if (bookings.length > allBookings.length) {
      // Nếu bookings nhiều hơn allBookings, có thể là load tất cả
      setAllBookings(bookings);
    }
  }, [bookings, allBookings.length]);

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
      // Load booking detail
      const bookingResponse = await BookingService.getById(selectedBookingId);
      if (bookingResponse.success && bookingResponse.data) {
        setSelectedBooking(bookingResponse.data);

        // Load tutor profile nếu chưa có
        const tutorEmail = bookingResponse.data.tutorSubject?.tutorEmail;
        if (tutorEmail) {
          await loadTutorProfile(tutorEmail);
        }
      }

      // Load schedules
      await loadSchedules(selectedBookingId);
    } catch (error: any) {
      showError('Lỗi khi tải chi tiết lớp học', error.message);
    }
  };

  const handleViewDetail = (bookingId: number) => {
    setSelectedBookingId(bookingId);
  };

  const handleBackToList = () => {
    setSelectedBookingId(null);
    setSelectedBooking(null);
    clearSchedules();
  };

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

  // Tính toán counts cho từng trạng thái dựa trên tất cả bookings
  const bookingCounts = useMemo(() => {
    return {
      all: allBookings.length,
      active: allBookings.filter(
        (b) =>
          EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Confirmed &&
          getCompletedSessions(b) < b.totalSessions
      ).length,
      pending: allBookings.filter(
        (b) => EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Pending
      ).length,
      completed: allBookings.filter(
        (b) => EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Completed
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
        getCompletedSessions(booking) < booking.totalSessions
      );
    if (filter === 'pending') return parsedStatus === BookingStatus.Pending;
    if (filter === 'completed') return parsedStatus === BookingStatus.Completed;
    if (filter === 'cancelled') return parsedStatus === BookingStatus.Cancelled;
    return true;
  });

  // Render detail view
  if (selectedBookingId && selectedBooking) {
    const tutorSubject = selectedBooking.tutorSubject;
    const tutorEmail = tutorSubject?.tutorEmail;
    const tutor = tutorEmail ? getTutorProfile(tutorEmail) : tutorSubject?.tutor;
    const subject = tutorSubject?.subject;
    const level = tutorSubject?.level;
    const completedSessions = schedules.filter(
      (s) => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Completed
    ).length;
    const progress = (completedSessions / selectedBooking.totalSessions) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Chi tiết lớp học</h2>
          </div>
        </div>

        {/* Booking Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex gap-4 flex-1">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={tutor?.avatarUrl} alt={tutor?.userName || 'Gia sư'} />
                  <AvatarFallback>
                    {tutor?.userName?.[0]?.toUpperCase() || 'GS'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {subject?.subjectName || 'Môn học'}
                        </h3>
                        {level && (
                          <Badge variant="outline" className="text-sm">
                            {level.name}
                          </Badge>
                        )}
                        <Badge className={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                          {EnumHelpers.getPaymentStatusLabel(selectedBooking.paymentStatus)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm truncate">
                        Gia sư: {tutor?.userName || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div className="flex flex-wrap sm:flex-col gap-2 items-start sm:items-end">
                      <Badge className={getBookingStatusColor(selectedBooking.status)}>
                        {EnumHelpers.getBookingStatusLabel(selectedBooking.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-80 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Tiến độ</span>
                    <span className="font-medium">
                      {completedSessions}/{selectedBooking.totalSessions} buổi
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng tiền:</span>
                    <span className="text-lg font-semibold text-[#257180]">
                      {formatCurrency(selectedBooking.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Giá/buổi: {formatCurrency(selectedBooking.unitPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  const scheduleDate = availability?.startDate
                    ? new Date(availability.startDate)
                    : null;

                  const isOnline = !!(schedule.meetingSession || schedule.hasMeetingSession);

                  // Tính endDate từ startDate + slot.endTime
                  let endDate: Date | null = null;
                  if (availability?.endDate) {
                    endDate = new Date(availability.endDate);
                  } else if (scheduleDate && slot) {
                    // Lấy thời gian từ slot.endTime và cộng vào startDate
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
                                  {EnumHelpers.parseScheduleStatus(schedule.status) === ScheduleStatus.Absent && (
                                    <XCircle className="h-5 w-5 text-gray-500" />
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

                                  {slot && (
                                    <div className="flex items-center gap-3">
                                      <div className="bg-white rounded-lg p-2 shadow-sm">
                                        <Clock className="h-5 w-5 text-[#257180]" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs text-gray-500">Thời gian</div>
                                        <div className="text-gray-900 font-medium">
                                          {slot.startTime} - {slot.endTime}
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
                                          {format(scheduleDate, "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })} - {format(endDate, "HH:mm", { locale: vi })}
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
            <Card className="hover:shadow-md transition-shadow">
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
              const completedSessions = getCompletedSessions(booking);
              const progress = (completedSessions / booking.totalSessions) * 100;

              return (
                <Card
                  key={booking.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
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
                            <span className="font-medium">
                              {completedSessions}/{booking.totalSessions} buổi
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
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
    </div>
  );
}
