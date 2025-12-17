"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Button } from '@/components/ui/basic/button';
import { Progress } from '@/components/ui/feedback/progress';
import {
  BookOpen,
  Calendar,
  MapPin,
  Video,
  MessageCircle,
  Loader2,
  TrendingUp,
  Wallet,
  CheckCircle2,
  GraduationCap,
  Users,
} from 'lucide-react';
import { BookingDto, ScheduleDto } from '@/types/backend';
import { BookingStatus, ScheduleStatus, TeachingMode } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useLearnerProfiles } from '@/hooks/useLearnerProfiles';
import { useTutorProfiles } from '@/hooks/useTutorProfiles';
import { useBookings } from '@/hooks/useBookings';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ClassDetail } from './ClassDetail';
import { Label } from '@/components/ui/form/label';
import { ScheduleService } from '@/services';

const NextSessionDisplay = ({ booking, tutorEmail }: { booking: BookingDto; tutorEmail?: string }) => {
  const [nextSessionDate, setNextSessionDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextSession = async () => {
      if (!tutorEmail || !booking.id) {
        setNextSessionDate(null);
        setLoading(false);
        return;
      }

      const bookingId = booking.id;

      try {
        const result = await ScheduleService.getByTutorEmailAndStatus(
          tutorEmail,
          bookingId,
          {
            status: ScheduleStatus.Upcoming,
            take: 1,
          }
        );

        if (result.success && result.data && result.data.length > 0) {
          const schedule = result.data[0];
          const startDate = schedule.availability?.startDate;
          if (startDate) {
            setNextSessionDate(startDate);
          } else {
            setNextSessionDate(null);
          }
        } else {
          setNextSessionDate(null);
        }
      } catch (error) {
        console.error('Error fetching next session:', error);
        setNextSessionDate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNextSession();
  }, [booking.id, tutorEmail]);

  if (loading) {
    return (
      <p className="text-sm text-gray-600">Đang tải...</p>
    );
  }

  if (!nextSessionDate) {
    return (
      <p className="text-sm text-gray-600">
        Chưa có buổi dạy sắp tới.
      </p>
    );
  }

  return (
    <>
      <p className="font-semibold text-gray-900 mb-1">
        {new Date(nextSessionDate).toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        })}
      </p>
      <p className="text-2xl font-bold text-green-600">
        {new Date(nextSessionDate).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </>
  );
};

export function TutorBookingsTab() {
  const { user } = useAuth();
  const { showError, showSuccess } = useCustomToast();
  const {
    bookings,
    loading,
    tutorId,
    loadingTutorId,
    loadTutorProfile,
    loadTutorBookings: loadBookings,
    updateStatus: updateBookingStatus,
    getBookingById,
  } = useBookings();
  const [filter, setFilter] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ bookingId: number | null; status: BookingStatus | null }>({ bookingId: null, status: null });
  const { loadLearnerProfiles, getLearnerProfile } = useLearnerProfiles();
  const { loadTutorProfiles, getTutorProfile } = useTutorProfiles();
  const [schedulesByBookingId, setSchedulesByBookingId] = useState<Map<number, ScheduleDto[]>>(new Map());
  const loadedScheduleIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Load tutor profile khi có email
    if (user?.email) {
      loadTutorProfile(user.email);
      loadTutorProfiles([user.email]);
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
      const updated = await updateBookingStatus(bookingId, status);
      if (updated) {
        showSuccess(
          status === BookingStatus.Confirmed ? 'Đã chấp nhận' : 'Đã hủy'
        );

        const params: { status?: BookingStatus } = {};

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
        showError('Không thể cập nhật trạng thái', 'Vui lòng thử lại sau.');
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

  // NOTE: Trạng thái lớp dạy = booking.status (source of truth).


  const handleViewDetail = async (bookingId: number) => {
    const bookingFromList = bookings.find((b) => b.id === bookingId);
    if (bookingFromList) {
      setSelectedBooking(bookingFromList);
      setSelectedBookingId(bookingId);
    } else {
      try {
        const detail = await getBookingById(bookingId);
        if (detail) {
          setSelectedBooking(detail);
          setSelectedBookingId(bookingId);
          if (detail.learnerEmail) {
            await loadLearnerProfiles([detail.learnerEmail]);
          }
        }
      } catch (error: any) {
        showError('Lỗi khi tải chi tiết lớp học', error.message);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedBookingId(null);
    setSelectedBooking(null);
  };

  // Tính toán counts cho từng trạng thái (memo hóa)
  const bookingCounts = useMemo(() => {
    return {
      all: bookings.length,
      active: bookings.filter(
        (b) =>
          EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Confirmed
      ).length,
      pending: bookings.filter(
        (b) => EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Pending
      ).length,
      completed: bookings.filter(
        (b) =>
          EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Completed
      ).length,
      cancelled: bookings.filter(
        (b) => EnumHelpers.parseBookingStatus(b.status) === BookingStatus.Cancelled
      ).length,
    };
  }, [bookings]);

  const totalEarnings = useMemo(() => {
    return bookings
      .filter(b => {
        const status = EnumHelpers.parseBookingStatus(b.status);
        return status === BookingStatus.Confirmed || status === BookingStatus.Completed;
      })
      .reduce((sum, b) => sum + (b.tutorReceiveAmount || 0), 0);
  }, [bookings]);

  const totalCompletedSessions = useMemo(() => {
    return bookings.reduce((sum, b) => {
      const schedules = schedulesByBookingId.get(b.id) || b.schedules || [];
      const done = schedules.filter((s) => {
        const st = EnumHelpers.parseScheduleStatus(s.status);
        return st !== ScheduleStatus.Upcoming && st !== ScheduleStatus.InProgress;
      }).length;
      return sum + done;
    }, 0);
  }, [bookings, schedulesByBookingId]);

  // Lọc bookings để hiển thị theo filter hiện tại
  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    if (filter === "all") return true;
    const parsedStatus = EnumHelpers.parseBookingStatus(booking.status);
    if (filter === "active")
      return parsedStatus === BookingStatus.Confirmed;
    if (filter === "pending") return parsedStatus === BookingStatus.Pending;
    if (filter === "completed")
      return parsedStatus === BookingStatus.Completed;
    if (filter === "cancelled") return parsedStatus === BookingStatus.Cancelled;
    return true;
  }), [bookings, filter]);

  const filteredBookingIdsKey = useMemo(() => filteredBookings.map(b => b.id).join(','), [filteredBookings]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      const idsToLoad = filteredBookings
        .map((b) => b.id)
        .filter((id) => typeof id === 'number' && !loadedScheduleIdsRef.current.has(id));

      if (idsToLoad.length === 0) return;

      idsToLoad.forEach((id) => loadedScheduleIdsRef.current.add(id));

      await Promise.all(
        idsToLoad.map(async (bookingId) => {
          try {
            const res = await ScheduleService.getAllNoPaging(bookingId);
            if (ignore) return;
            if (res.success && res.data) {
              setSchedulesByBookingId((prev) => {
                const next = new Map(prev);
                next.set(bookingId, res.data || []);
                return next;
              });
            }
          } catch {
            // ignore
          }
        })
      );
    };

    load();

    return () => {
      ignore = true;
    };
  }, [filteredBookingIdsKey, filteredBookings]);

  // Render detail view: sử dụng ClassDetail component
  if (selectedBookingId && selectedBooking) {
    return (
      <ClassDetail
        booking={selectedBooking}
        userRole="tutor"
        onBack={handleBackToList}
      />
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
        <h2 className="text-2xl font-semibold text-gray-900">Lớp dạy của tôi</h2>
        <p className="text-gray-600 mt-1">
          Quản lý và theo dõi các lớp học bạn đang giảng dạy
        </p>
      </div>

      {/* Stats theo mockup */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-300 bg-white transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang dạy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingCounts.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300 bg-white transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingCounts.completed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300 bg-white transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Buổi đã dạy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalCompletedSessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300 bg-white transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Thu nhập</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(totalEarnings / 1000000).toFixed(1)}tr
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter trạng thái giống Mockups */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Trạng thái lớp dạy:</span>
          <span className="text-gray-800">
            {filter === "all"
              ? "Tất cả"
              : filter === "active"
              ? "Đang dạy"
              : filter === "pending"
              ? "Chờ xác nhận"
              : filter === "completed"
              ? "Hoàn thành"
              : "Đã hủy"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            className={
              filter === "active"
                ? "bg-[#257180] text-white"
                : "border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            }
            onClick={() => setFilter("active")}
          >
            Đang dạy ({bookingCounts.active})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            className={
              filter === "pending"
                ? "bg-[#257180] text-white"
                : "border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            }
            onClick={() => setFilter("pending")}
          >
            Chờ xác nhận ({bookingCounts.pending})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            className={
              filter === "completed"
                ? "bg-[#257180] text-white"
                : "border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            }
            onClick={() => setFilter("completed")}
          >
            Hoàn thành ({bookingCounts.completed})
          </Button>
          <Button
            variant={filter === "cancelled" ? "default" : "outline"}
            size="sm"
            className={
              filter === "cancelled"
                ? "bg-[#257180] text-white"
                : "border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            }
            onClick={() => setFilter("cancelled")}
          >
            Đã hủy ({bookingCounts.cancelled})
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            className={
              filter === "all"
                ? "bg-[#257180] text-white"
                : "border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
            }
            onClick={() => setFilter("all")}
          >
            Tất cả ({bookingCounts.all})
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading && bookings.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600">Không có lớp dạy nào</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const bookingStatus = EnumHelpers.parseBookingStatus(booking.status);
              const learnerEmail = booking.learnerEmail;
              const learnerProfile = getLearnerProfile(learnerEmail);
              const learnerName = learnerProfile?.user?.userName || learnerEmail || 'Học viên';
              const tutorSubject = booking.tutorSubject;
              const subject = tutorSubject?.subject;
              const level = tutorSubject?.level;
              const tutor = (user?.email ? getTutorProfile(user.email) : undefined) || tutorSubject?.tutor;
              const tutorEmailForSchedules = user?.email || tutorSubject?.tutorEmail;
              const schedulesForBooking = schedulesByBookingId.get(booking.id) || booking.schedules || [];
              const totalSessionsForDisplay = schedulesForBooking.length;
              const doneSessions = schedulesForBooking.filter((s) => {
                const st = EnumHelpers.parseScheduleStatus(s.status);
                return st !== ScheduleStatus.Upcoming && st !== ScheduleStatus.InProgress;
              }).length;
              const remainingSessionsForDisplay = Math.max(totalSessionsForDisplay - doneSessions, 0);
              const percentForDisplay =
                totalSessionsForDisplay > 0 ? Math.round((doneSessions / totalSessionsForDisplay) * 100) : 0;

              return (
                <Card
                  key={booking.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-300"
                >
                  <div className="bg-gradient-to-r from-[#257180] to-[#1f5a66] px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-2">
                          {subject?.subjectName || 'Môn học'}
                          {level ? ` - ${level.name}` : ''}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getBookingStatusColor(booking.status)}>
                            {EnumHelpers.getBookingStatusLabel(booking.status)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-white/10 text-white border-white/20"
                          >
                            {doneSessions}/{totalSessionsForDisplay} buổi dạy
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4 text-[#257180]" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Thông tin học viên
                          </span>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Avatar className="h-16 w-16 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] shadow-sm">
                            <AvatarImage
                              src={learnerProfile?.profile.avatarUrl}
                              alt={learnerName}
                              className="object-cover rounded-lg"
                            />
                            <AvatarFallback className="rounded-lg font-semibold">
                              {learnerName
                                ? learnerName
                                    .split(' ')
                                    .slice(-2)
                                    .map((n) => n[0])
                                    .join('') || learnerName[0]?.toUpperCase()
                                : 'HV'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xl font-semibold text-gray-900 mb-2">
                                {learnerName}
                              </p>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4 text-[#257180] flex-shrink-0" />
                                  <span className="text-gray-600">Học viên của bạn</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center md:items-end">
                              <Label className="text-xs text-gray-500 mb-1">Thu nhập</Label>
                              <p className="text-2xl font-semibold text-[#257180] mb-2">
                                {formatCurrency(booking.tutorReceiveAmount || 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-[#257180]" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Thông tin lớp học
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              {tutor?.teachingModes !== undefined && EnumHelpers.parseTeachingMode(tutor.teachingModes) === TeachingMode.Online ? (
                                <Video className="w-5 h-5 text-[#257180]" />
                              ) : (
                                <MapPin className="w-5 h-5 text-[#257180]" />
                              )}
                              <span className="text-xs text-gray-500">Hình thức</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {tutor?.teachingModes !== undefined
                                ? EnumHelpers.getTeachingModeLabel(tutor.teachingModes)
                                : 'Chưa cập nhật'}
                            </p>
                            {(tutor?.subDistrict || tutor?.province) && (
                              <div className="flex items-start gap-1.5 mt-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {tutor.subDistrict?.name && tutor.province?.name
                                    ? `${tutor.subDistrict.name}, ${tutor.province.name}`
                                    : tutor.province?.name || 'Việt Nam'}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-[#257180]" />
                              <span className="text-xs text-gray-500">Thời gian</span>
                            </div>
                            {(() => {
                              const schedules = (schedulesForBooking || []).filter(
                                (s) => s.availability?.startDate
                              );

                              if (schedules.length === 0) {
                                return (
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">Bắt đầu:</span> Chưa cập nhật
                                  </p>
                                );
                              }

                              const sorted = [...schedules].sort(
                                (a, b) =>
                                  new Date(a.availability!.startDate).getTime() -
                                  new Date(b.availability!.startDate).getTime()
                              );
                              const first = sorted[0];

                              const start = new Date(first.availability!.startDate);
                              const slot = first.availability?.slot;
                              if (slot?.startTime) {
                                const [h, m] = slot.startTime.split(':').map(Number);
                                start.setHours(h, m, 0, 0);
                              }

                              const startDate = start.toLocaleDateString('vi-VN');
                              const startTime = start.toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              });

                              const datesOnly = sorted
                                .map((s) => new Date(s.availability!.startDate))
                                .sort((a, b) => a.getTime() - b.getTime());

                              const endDate =
                                datesOnly.length > 1
                                  ? datesOnly[datesOnly.length - 1].toLocaleDateString('vi-VN')
                                  : null;

                              return (
                                <>
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">Bắt đầu:</span> {startDate} lúc {startTime}
                                  </p>
                                  {endDate && (
                                    <p className="text-sm text-gray-900 mt-1">
                                      <span className="font-medium">Kết thúc:</span> {endDate}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Wallet className="w-5 h-5 text-[#257180]" />
                              <span className="text-xs text-gray-500">Tổng chi phí</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(booking.tutorReceiveAmount || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {booking.totalSessions} buổi
                            </p>
                          </div>

                          {bookingStatus !== BookingStatus.Completed && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <span className="text-xs text-blue-700 font-medium">
                                  Tiến độ giảng dạy
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-gray-900">
                                    {doneSessions}/{totalSessionsForDisplay}
                                  </span>
                                  <span className="text-sm font-medium text-blue-700">
                                    {percentForDisplay}%
                                  </span>
                                </div>
                                <Progress
                                  value={percentForDisplay}
                                  className="h-2.5 bg-white"
                                />
                                <p className="text-xs text-gray-600">
                                  Còn {remainingSessionsForDisplay} buổi dạy
                                </p>
                              </div>
                            </div>
                          )}

                          {bookingStatus !== BookingStatus.Completed && (
                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-green-600" />
                                <span className="text-xs text-green-700 font-medium">
                                  Buổi dạy tiếp theo
                                </span>
                              </div>
                              <NextSessionDisplay booking={booking} tutorEmail={tutorEmailForSchedules} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2 border-t border-[#257180]/20">
                        <Button
                          variant="outline"
                          className="flex-1 min-w-[140px] border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(booking.id);
                          }}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Xem chi tiết lớp dạy
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 min-w-[140px] border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Nhắn tin với học viên
                        </Button>
                        {bookingStatus === BookingStatus.Pending && (
                          <>
                            <Button
                              variant="outline"
                              className="flex-1 min-w-[140px] border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDialog({
                                  bookingId: booking.id,
                                  status: BookingStatus.Cancelled,
                                });
                              }}
                            >
                              Huỷ đơn
                            </Button>
                            <Button
                              className="flex-1 min-w-[140px] bg-[#257180] hover:bg-[#1f5a66] text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDialog({
                                  bookingId: booking.id,
                                  status: BookingStatus.Confirmed,
                                });
                              }}
                            >
                              Xác nhận
                            </Button>
                          </>
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

