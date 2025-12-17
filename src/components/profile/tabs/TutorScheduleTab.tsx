"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Separator } from '@/components/ui/layout/separator';
import { Calendar, Clock, MapPin, Video, MessageCircle, Loader2, CheckCircle, XCircle, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleDto } from '@/types/backend';
import { ScheduleStatus, ScheduleChangeRequestStatus, TutorAvailabilityStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { useLearnerProfiles } from '@/hooks/useLearnerProfiles';
import { useSchedules } from '@/hooks/useSchedules';
import { useTutorAvailability } from '@/hooks/useTutorAvailability';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/feedback/dialog';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
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
  const { fetchByScheduleId, create, loading: loadingChangeReq } = useScheduleChangeRequests();
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingBySchedule, setPendingBySchedule] = useState<Record<number, boolean>>({});
  const [slotDialog, setSlotDialog] = useState<{
    open: boolean;
    schedule?: ScheduleDto;
    selectedAvailabilityId?: number | null;
    reason?: string;
  }>({ open: false, selectedAvailabilityId: null });
  // State/hàm hủy lịch dạy đã được tắt theo yêu cầu – giữ logic liên quan khác, bỏ state dư thừa

  const loadSchedules = useCallback(async () => {
    if (!user?.email) return;

    const params: {
      startDate?: string;
      endDate?: string;
      status?: ScheduleStatus;
    } = {};

    await loadSchedulesByTutorEmail(user.email, params);
  }, [user?.email, loadSchedulesByTutorEmail]);

  useEffect(() => {
    if (user?.email) {
      loadSchedules();
    }
  }, [user?.email, loadSchedules]);

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


  const displaySchedules = useMemo(() => {
    return schedules
      .filter((s) =>
        statusFilter === 'all'
          ? true
          : EnumHelpers.parseScheduleStatus(s.status) === statusFilter
      );
  }, [schedules, statusFilter]);

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

  const getCalendarStatusColor = (status: ScheduleStatus | string) => {
    const parsed = EnumHelpers.parseScheduleStatus(status);
    switch (parsed) {
      case ScheduleStatus.Completed:
        return 'bg-green-500 text-white';
      case ScheduleStatus.InProgress:
        return 'bg-amber-500 text-white';
      case ScheduleStatus.Processing:
        return 'bg-indigo-500 text-white';
      case ScheduleStatus.Pending:
        return 'bg-gray-400 text-white';
      case ScheduleStatus.Upcoming:
        return 'bg-blue-500 text-white';
      case ScheduleStatus.Cancelled:
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getSessionStatusBadge = (status: ScheduleStatus | string) => {
    const parsed = EnumHelpers.parseScheduleStatus(status);
    switch (parsed) {
      case ScheduleStatus.Completed:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-gray-300">Đã dạy</Badge>;
      case ScheduleStatus.InProgress:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-gray-300">Đang diễn ra</Badge>;
      case ScheduleStatus.Processing:
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-gray-300">Đang xử lý</Badge>;
      case ScheduleStatus.Pending:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300">Chờ xác nhận</Badge>;
      case ScheduleStatus.Upcoming:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-gray-300">Sắp tới</Badge>;
      case ScheduleStatus.Cancelled:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-gray-300">Đã hủy</Badge>;
      default:
        return null;
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

  const getScheduleTimeRange = (schedule: ScheduleDto) => {
    const startDateStr = schedule.availability?.startDate;
    if (!startDateStr) {
      return { start: null as Date | null, end: null as Date | null, durationMinutes: null as number | null };
    }

    const start = new Date(startDateStr);
    const slot = schedule.availability?.slot;

    const parseHm = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
    };

    if (slot?.startTime) {
      const { h, m } = parseHm(slot.startTime);
      start.setHours(h, m, 0, 0);
    }

    let end: Date | null = null;
    if (slot?.endTime) {
      const { h, m } = parseHm(slot.endTime);
      end = new Date(start);
      end.setHours(h, m, 0, 0);
    } else if (schedule.availability?.endDate) {
      end = new Date(schedule.availability.endDate);
    }

    const durationMinutes = end ? Math.max(Math.round((end.getTime() - start.getTime()) / 60000), 0) : null;
    return { start, end, durationMinutes };
  };

  const sortedSchedules = useMemo(() => {
    return [...displaySchedules].sort((a, b) => {
      const dateA = a.availability?.startDate ? new Date(a.availability.startDate).getTime() : 0;
      const dateB = b.availability?.startDate ? new Date(b.availability.startDate).getTime() : 0;
      return dateA - dateB;
    });
  }, [displaySchedules]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getSessionsForDate = (day: number, month: number, year: number) => {
    return displaySchedules.filter(schedule => {
      const startDate = schedule.availability?.startDate;
      if (!startDate) return false;
      const scheduleDate = new Date(startDate);
      return (
        scheduleDate.getFullYear() === year &&
        scheduleDate.getMonth() === month &&
        scheduleDate.getDate() === day
      );
    });
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    const daySessions = getSessionsForDate(day, month, year);
    if (daySessions.length > 0) {
      setSelectedDate({ day, month, year });
      setIsDialogOpen(true);
    }
  };

  const selectedDaySessions = selectedDate
    ? getSessionsForDate(selectedDate.day, selectedDate.month, selectedDate.year)
    : [];

  // Hàm hủy lịch dạy không còn được sử dụng vì đã tắt chức năng hủy lịch theo yêu cầu

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
              <SelectItem value={ScheduleStatus.Pending.toString()}>Chờ xử lý</SelectItem>
              <SelectItem value={ScheduleStatus.Processing.toString()}>Đang xử lý</SelectItem>
              <SelectItem value={ScheduleStatus.Completed.toString()}>Hoàn thành</SelectItem>
              <SelectItem value={ScheduleStatus.Cancelled.toString()}>Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {displaySchedules.length === 0 ? (
        <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
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
              <Card key={schedule.id} className="hover:shadow-md transition-shadow bg-white border border-gray-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Date Box */}
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

                    {/* Schedule Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(EnumHelpers.parseScheduleStatus(schedule.status))}`}>
                              {getStatusIcon(EnumHelpers.parseScheduleStatus(schedule.status))}
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
                              const booking = getBooking(schedule.bookingId, schedule.booking);
                              const learnerEmail = booking?.learnerEmail;
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
                                reason: '',
                              });
                            }}
                            disabled={loadingChangeReq || loadingAvailabilities}
                          >
                            Yêu cầu chuyển lịch
                          </Button>
                        )}
                        {isOnline && schedule.meetingSession && 
                          [ScheduleStatus.Upcoming, ScheduleStatus.InProgress].includes(
                            EnumHelpers.parseScheduleStatus(schedule.status)
                          ) && (
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
      )}

      {/* Lịch dạy theo tháng */}
      {sortedSchedules.length > 0 && (
        <Card className="border border-gray-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#257180]" />
                  Lịch dạy tháng {selectedMonth + 1}/{selectedYear}
                </CardTitle>
                <p className="text-gray-600">
                  Tổng {sortedSchedules.length} buổi ({sortedSchedules.filter(s => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Completed).length} đã dạy, {
                    sortedSchedules.filter(s => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming).length
                  } sắp tới)
                </p>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px] border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-300 shadow-lg">
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        Tháng {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (!isNaN(year) && year >= 2020 && year <= 2100) {
                      setSelectedYear(year);
                    }
                  }}
                  className="w-[120px] border-gray-300"
                  min="2020"
                  max="2100"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: getFirstDayOfMonth(selectedMonth, selectedYear) }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => {
                  const day = i + 1;
                  const daySessions = getSessionsForDate(day, selectedMonth, selectedYear);
                  const isTodayDate = isToday(day, selectedMonth, selectedYear);

                  return (
                    <div
                      key={day}
                      className={`aspect-square p-2 rounded-lg border-2 ${
                        isTodayDate
                          ? 'border-[#257180] bg-[#257180]/5'
                          : 'border-[#257180]/20 bg-white'
                      } ${daySessions.length > 0 ? 'cursor-pointer hover:border-[#257180]' : ''} transition-colors`}
                      onClick={() => handleDayClick(day, selectedMonth, selectedYear)}
                    >
                      <p className={`text-center font-medium mb-1 ${
                        isTodayDate ? 'text-[#257180]' : 'text-gray-900'
                      }`}>
                        {day}
                      </p>
                      <div className="space-y-1">
                        {daySessions.map((session) => {
                          const { start } = getScheduleTimeRange(session);
                          const statusColor = getCalendarStatusColor(session.status);
                          return (
                            <div
                              key={session.id}
                              className={`text-[10px] px-1 py-0.5 rounded text-center ${statusColor}`}
                            >
                              {start ? format(start, 'HH:mm', { locale: vi }) : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-6 border-[#257180]/20" />

            <div className="flex items-center gap-4 flex-wrap mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-xs text-gray-600">Đã dạy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded" />
                <span className="text-xs text-gray-600">Đang diễn ra</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-500 rounded" />
                <span className="text-xs text-gray-600">Đang xử lý</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded" />
                <span className="text-xs text-gray-600">Chờ xác nhận</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-xs text-gray-600">Sắp tới</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-xs text-gray-600">Đã hủy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#257180] rounded" />
                <span className="text-xs text-gray-600">Hôm nay</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog hiển thị buổi dạy trong ngày */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-gray-300 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDate
                ? format(new Date(selectedDate.year, selectedDate.month, selectedDate.day), "EEEE, dd/MM/yyyy", { locale: vi })
                : 'Buổi dạy'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDaySessions.map((schedule) => {
              const status = EnumHelpers.parseScheduleStatus(schedule.status);
              const booking = getBooking(schedule.bookingId, schedule.booking);
              const tutorSubject = booking?.tutorSubject;
              const subject = tutorSubject?.subject;
              const level = tutorSubject?.level;
              const { start, end } = getScheduleTimeRange(schedule);
              const statusBgColor = 
                status === ScheduleStatus.Completed
                  ? 'bg-green-50 border-l-green-500'
                  : status === ScheduleStatus.InProgress
                  ? 'bg-amber-50 border-l-amber-500'
                  : status === ScheduleStatus.Processing
                  ? 'bg-indigo-50 border-l-indigo-500'
                  : status === ScheduleStatus.Pending
                  ? 'bg-gray-50 border-l-gray-400'
                  : status === ScheduleStatus.Upcoming
                  ? 'bg-blue-50 border-l-blue-500'
                  : status === ScheduleStatus.Cancelled
                  ? 'bg-red-50 border-l-red-500'
                  : 'bg-gray-50 border-l-gray-400';
              return (
                <Card key={schedule.id} className={`border-l-4 border border-gray-300 ${statusBgColor}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getSessionStatusBadge(schedule.status)}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {subject?.subjectName || 'Môn học'}
                      {level && ` - ${level.name}`}
                    </h4>
                    {start && (
                      <p className="text-sm text-gray-600">
                        {format(start, 'HH:mm', { locale: vi })} - {end ? format(end, 'HH:mm', { locale: vi }) : '...'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

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
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="font-medium">{level.name}</span>
                      </div>
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

                const created = await create(payload);
                if (created) {
                  setPendingBySchedule(prev => ({ ...prev, [schedule.id]: true }));
                  setSlotDialog({ open: false, schedule: undefined, selectedAvailabilityId: null, reason: '' });
                } else {
                  toast.error('Gửi yêu cầu đổi lịch thất bại.');
                }
              }}
            >
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog hủy lịch dạy đã được tắt theo yêu cầu – giữ lại state/handler để tránh lỗi nhưng không hiển thị UI */}
    </div>
  );
}

