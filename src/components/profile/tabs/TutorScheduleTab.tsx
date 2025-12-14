"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Calendar, Clock, MapPin, Video, MessageCircle, Loader2, CheckCircle, XCircle, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleDto } from '@/types/backend';
import { ScheduleStatus, ScheduleChangeRequestStatus, TutorAvailabilityStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { useLearnerProfiles } from '@/hooks/useLearnerProfiles';
import { useSchedules } from '@/hooks/useSchedules';
import { useTutorAvailability } from '@/hooks/useTutorAvailability';
import { useTutorProfiles } from '@/hooks/useTutorProfiles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/feedback/dialog';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useScheduleChangeRequests } from '@/hooks/useScheduleChangeRequests';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';

export function TutorScheduleTab() {
  const { user } = useAuth();
  const { showError, showWarning } = useCustomToast();
  const { getBooking, loadBookingDetails } = useBookings();
  const { getLearnerProfile, loadLearnerProfiles } = useLearnerProfiles();
  const { schedules, loading, loadSchedulesByTutorEmail } = useSchedules();
  const {
    schedules: learnerSchedules,
    loadSchedulesByLearnerEmail,
  } = useSchedules();
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
  const { getTutorProfile, loadTutorProfiles } = useTutorProfiles();
  const { fetchByScheduleId, create, loading: loadingChangeReq } = useScheduleChangeRequests();
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'all'>('all');
  const [pendingBySchedule, setPendingBySchedule] = useState<Record<number, boolean>>({});
  const [slotDialog, setSlotDialog] = useState<{
    open: boolean;
    schedule?: ScheduleDto;
    selectedAvailabilityId?: number | null;
    reason?: string;
  }>({ open: false, selectedAvailabilityId: null });

  useEffect(() => {
    if (user?.email) {
      loadSchedules();
    }
  }, [user?.email]);

  // Load map scheduleId -> có Pending request (để ẩn nút nếu đã pending)
  useEffect(() => {
    const loadPending = async () => {
      if (!schedules || schedules.length === 0) {
        setPendingBySchedule({});
        return;
      }
      const results = await Promise.all(
        schedules.map(async (s) => {
          const list = await fetchByScheduleId(
            s.id,
            ScheduleChangeRequestStatus.Pending
          );
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
  }, [schedules, fetchByScheduleId]);

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

  // Load learner profiles khi có bookings với learnerEmail
  useEffect(() => {
    if (schedules.length > 0) {
      const learnerEmails: string[] = [];

      schedules.forEach((schedule) => {
        const booking = getBooking(schedule.bookingId, schedule.booking);
        const learnerEmail = booking?.learnerEmail;

        if (learnerEmail && !learnerEmails.includes(learnerEmail)) {
          learnerEmails.push(learnerEmail);
        }
      });

      if (learnerEmails.length > 0) {
        loadLearnerProfiles(learnerEmails);
      }
    }
  }, [schedules, getBooking, loadLearnerProfiles]);

  // Load lịch upcoming của learner khi mở dialog
  const loadLearnerUpcoming = useCallback(
    async (learnerEmail?: string) => {
      if (!learnerEmail) return;
      await loadSchedulesByLearnerEmail(learnerEmail, { status: ScheduleStatus.Upcoming });
    },
    [loadSchedulesByLearnerEmail]
  );

  const loadSchedules = useCallback(async () => {
    if (!user?.email) return;

    const params: {
      startDate?: string;
      endDate?: string;
      status?: ScheduleStatus;
    } = {};

    // Chỉ lấy từ hiện tại trở đi
    params.startDate = new Date().toISOString();

    await loadSchedulesByTutorEmail(user.email, params);
  }, [user?.email, loadSchedulesByTutorEmail]);

  // Chỉ cho phép đổi lịch nếu sắp diễn ra, còn >=12h và chưa có pending
  const canRequestChange = useCallback((schedule: ScheduleDto) => {
    const avStart = schedule.availability?.startDate
      ? new Date(schedule.availability.startDate)
      : null;
    if (!avStart) return false;
    const diffMs = avStart.getTime() - Date.now();
    if (diffMs < 12 * 60 * 60 * 1000) return false; // dưới 12h

    const status = EnumHelpers.parseScheduleStatus(schedule.status);
    if (status !== ScheduleStatus.Upcoming) return false;

    const hasPending = !!pendingBySchedule[schedule.id];
    return !hasPending;
  }, [pendingBySchedule]);

  const buildBusyKey = (startDate?: string, slotStart?: string) => {
    if (!startDate) return '';
    const date = startDate.split('T')[0];
    const hour = slotStart?.split(':')[0]?.padStart(2, '0') || '';
    return `${date}-${hour}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getDayOfWeek = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
      return days[date.getDay()];
    } catch {
      return '';
    }
  };

  const displaySchedules = useMemo(() => {
    const allowed = [ScheduleStatus.Upcoming, ScheduleStatus.InProgress];
    return schedules
      .filter((s) => allowed.includes(EnumHelpers.parseScheduleStatus(s.status)))
      .filter((s) =>
        statusFilter === 'all'
          ? true
          : EnumHelpers.parseScheduleStatus(s.status) === statusFilter
      );
  }, [schedules, statusFilter]);

  const getStatusBadgeVariant = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Upcoming:
        return 'default';
      case ScheduleStatus.InProgress:
        return 'default';
      case ScheduleStatus.Completed:
        return 'secondary';
      case ScheduleStatus.Cancelled:
        return 'destructive';
      case ScheduleStatus.Pending:
        return 'outline';
      case ScheduleStatus.Processing:
        return 'default';
      default:
        return 'default';
    }
  };

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

  // Map lịch học của learner để chèn vào lưới
  const learnerBusyMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    learnerSchedules
      .filter(s => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming)
      .forEach(s => {
        const key = buildBusyKey(s.availability?.startDate, s.availability?.slot?.startTime);
        if (key) map[key] = true;
      });
    return map;
  }, [learnerSchedules]);

  const learnerBusyInfoMap = useMemo(() => {
    const map: Record<string, { startTime?: string; endTime?: string }> = {};
    learnerSchedules
      .filter(s => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming)
      .forEach(s => {
        const key = buildBusyKey(s.availability?.startDate, s.availability?.slot?.startTime);
        if (!key) return;
        const start = s.availability?.slot?.startTime?.slice(0, 5);
        const end = s.availability?.slot?.endTime?.slice(0, 5);
        map[key] = { startTime: start, endTime: end };
      });
    return map;
  }, [learnerSchedules]);

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

  const isTooClose = useCallback((startDate?: string) => {
    if (!startDate) return false;
    const start = new Date(startDate).getTime();
    return start - Date.now() < 12 * 60 * 60 * 1000;
  }, []);

  const isLearnerBusy = useCallback(
    (dateKey: string, hour: string) => {
      const key = `${dateKey}-${hour}`;
      return learnerBusyMap[key] === true;
    },
    [learnerBusyMap]
  );

  const getSlot = useCallback(
    (dateKey: string, hour: string) => availabilityByKey[`${dateKey}-${hour}`],
    [availabilityByKey]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Lịch dạy của tôi</h2>
          <p className="text-gray-600 mt-1">Quản lý các buổi dạy</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter === 'all' ? 'all' : statusFilter.toString()}
            onValueChange={(value) =>
              setStatusFilter(value === 'all' ? 'all' : (Number(value) as ScheduleStatus))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={ScheduleStatus.Upcoming.toString()}>Sắp diễn ra</SelectItem>
              <SelectItem value={ScheduleStatus.InProgress.toString()}>Đang học</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {displaySchedules.length === 0 ? (
        <Card className="hover:shadow-md transition-shadow bg-white border border-[#257180]/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-600">Chưa có lịch dạy nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displaySchedules.map((schedule) => {
            const availability = schedule.availability;
            const slot = availability?.slot;

            // Lấy booking từ schedule hoặc từ hook (nếu schedule chỉ có bookingId)
            const booking = getBooking(schedule.bookingId, schedule.booking);
            const learnerEmail = booking?.learnerEmail;
            // Lấy learner profile từ useLearnerProfiles
            const learnerProfile = learnerEmail ? getLearnerProfile(learnerEmail) : undefined;
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

            return (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow bg-white border border-[#257180]/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Date Box */}
                    {scheduleDate && availability && (
                      <div className="flex-shrink-0">
                        <div className="bg-[#257180]/10 rounded-lg p-6 text-center w-28 h-28 flex flex-col items-center justify-center border-2 border-[#257180]/20">
                          <div className="text-4xl font-bold text-[#257180] leading-none">
                            {scheduleDate.getDate()}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mt-1">
                            Tháng {scheduleDate.getMonth() + 1}
                          </div>
                          <div className="text-xs font-medium text-gray-600 mt-1 uppercase">
                            {getDayOfWeek(availability.startDate)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Schedule Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#F2E5BF]">
                              {learnerProfile?.profile.avatarUrl ? (
                                <img
                                  src={learnerProfile.profile.avatarUrl}
                                  alt={learnerProfile.user?.userName || 'Học viên'}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full rounded-lg flex items-center justify-center text-lg font-bold text-[#257180] bg-[#F2E5BF]">
                                  {learnerProfile?.user?.userName
                                    ? learnerProfile.user.userName.slice(0, 2).toUpperCase()
                                    : learnerEmail
                                      ? learnerEmail.slice(0, 2).toUpperCase()
                                      : 'HV'}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {subject?.subjectName || 'Môn học'}
                              {level && (
                                <span className="ml-2 text-base font-normal text-gray-500">
                                  - {level.name}
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-600">
                              Học viên: {learnerProfile?.user?.userName || 'Chưa có thông tin'}
                            </p>
                            {learnerEmail && (
                              <p className="text-sm text-gray-500">
                                Email: {learnerEmail || 'Chưa có thông tin'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={getStatusColor(EnumHelpers.parseScheduleStatus(schedule.status))}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(EnumHelpers.parseScheduleStatus(schedule.status))}
                              {EnumHelpers.getScheduleStatusLabel(schedule.status)}
                            </span>
                          </Badge>
                          {isOnline && (
                            <Badge
                              variant="secondary"
                              className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20"
                            >
                              <Video className="h-3 w-3 mr-1" />
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {scheduleDate && endDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(scheduleDate, "HH:mm", { locale: vi })} - {format(endDate, "HH:mm", { locale: vi })}
                            </span>
                          </div>
                        )}
                        {isOnline && schedule.meetingSession?.meetLink && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Video className="h-4 w-4" />
                            <a
                              href={schedule.meetingSession.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              Link lớp học online
                            </a>
                          </div>
                        )}
                        {!isOnline && learnerProfile?.profile.addressLine && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{learnerProfile.profile.addressLine}</span>
                          </div>
                        )}
                        {schedule.attendanceNote && (
                          <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                            <strong>Ghi chú:</strong> {schedule.attendanceNote}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Nhắn tin
                        </Button>

                        {canRequestChange(schedule) && (
                          <Button
                            size="lg"
                            variant="outline"
                            className="flex-1 border-[#257180] text-[#257180] hover:bg-[#257180] hover:text-white"
                            onClick={async () => {
                              const booking = getBooking(schedule.bookingId, schedule.booking);
                              const learnerEmail = booking?.learnerEmail;
                              const tutorId = booking?.tutorSubject?.tutor?.id || booking?.tutorSubject?.tutorId;
                              if (!learnerEmail || !tutorId) {
                                showError('Thiếu thông tin learner hoặc tutor');
                                return;
                              }
                              await loadLearnerUpcoming(learnerEmail);
                              await loadAvailabilities(tutorId);
                              goToCurrentWeek();
                              setSlotDialog({
                                open: true,
                                schedule,
                                selectedAvailabilityId: null,
                                reason: '',
                              });
                            }}
                            disabled={loadingChangeReq || loadingAvailabilities}
                          >
                            Yêu cầu chuyển lịch
                          </Button>
                        )}
                        {schedule.meetingSession && (
                          <Button
                            size="lg"
                            className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Vào lớp học
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
      )}

      {/* Dialog xem lịch rảnh và chọn slot mới */}
      <Dialog open={slotDialog.open} onOpenChange={(open) => setSlotDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-y-auto border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader className="space-y-2">
            <DialogTitle>Chọn lịch dạy mới</DialogTitle>
            {slotDialog.schedule && (() => {
              const booking = getBooking(slotDialog.schedule!.bookingId, slotDialog.schedule!.booking);
              const learnerEmail = booking?.learnerEmail;
              const subject = booking?.tutorSubject?.subject;
              const level = booking?.tutorSubject?.level;
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
                      <Badge variant="outline" className="text-xs border-[#257180] text-[#257180]">
                        {level.name}
                      </Badge>
                    )}
                  </div>
                  {learnerEmail && (
                    <div className="text-gray-700">
                      Học viên: <span className="font-medium">{learnerEmail}</span>
                    </div>
                  )}
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

              return (
                <Card className="border border-gray-300">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {weekRangeLabel}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="flex items-center gap-2">
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
                      <Button variant="outline" size="sm" onClick={goToNextWeek} className="flex items-center gap-2">
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
                                  const av = getSlot(d, hour);
                                  const busy = isLearnerBusy(d, hour);
                                  const busyInfo = learnerBusyInfoMap[`${d}-${hour}`];

                                  if (!av) {
                                    if (busy) {
                                      const startDisplay = busyInfo?.startTime || t;
                                      const endDisplay = busyInfo?.endTime ? ` - ${busyInfo.endTime}` : '';
                                      return (
                                        <div
                                          key={`${d}-${t}`}
                                          className="border-b border-r bg-rose-300 text-center text-[11px] text-rose-900 p-2 font-semibold"
                                          title="Học viên bận giờ này"
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

                                  let buttonClass = '';
                                  let disabled = false;

                                  if (busy) {
                                    buttonClass = 'bg-rose-300 text-rose-900 cursor-not-allowed border border-rose-500';
                                    disabled = true;
                                  } else if (tooClose) {
                                    buttonClass = 'bg-orange-100 text-orange-900 cursor-not-allowed border border-orange-200';
                                    disabled = true;
                                  } else if (isSelected) {
                                    buttonClass = 'bg-amber-300 text-amber-900 border-amber-500';
                                  } else {
                                    buttonClass = 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300';
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
                        <span className="font-medium text-emerald-800">Lịch rảnh</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-amber-300 rounded border border-amber-500"></div>
                        <span className="font-medium text-amber-800">Đã chọn</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-100 rounded border border-orange-200"></div>
                        <span className="font-medium text-orange-700">Quá gần (cần cách ≥12h)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-rose-300 rounded border border-rose-500"></div>
                        <span className="font-medium text-rose-900">Học viên bận</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-slate-200 rounded border border-slate-400"></div>
                        <span className="font-medium text-slate-800">Không rảnh/đã booked</span>
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
                setSlotDialog({ open: false, schedule: undefined, selectedAvailabilityId: null, reason: '' })
              }
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
                  showError('Vui lòng chọn slot mới.');
                  return;
                }

                const booking = getBooking(schedule.bookingId, schedule.booking);
                const learnerEmail = booking?.learnerEmail;
                const oldAvailabilityId = schedule.availability?.id;

                if (!user?.email || !learnerEmail) {
                  showError('Thiếu thông tin người gửi hoặc học viên.');
                  return;
                }
                if (!oldAvailabilityId) {
                  showError('Không tìm thấy lịch cũ của buổi học.');
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

                const created = await create(payload);
                if (created) {
                  setPendingBySchedule(prev => ({ ...prev, [schedule.id]: true }));
                  setSlotDialog({ open: false, schedule: undefined, selectedAvailabilityId: null, reason: '' });
                } else {
                  showError('Gửi yêu cầu đổi lịch thất bại.');
                }
              }}
            >
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

