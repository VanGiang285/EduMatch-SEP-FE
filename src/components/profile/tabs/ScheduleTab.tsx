"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/feedback/dialog';
import { Calendar, Clock, MapPin, Video, MessageCircle, Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleStatus, ScheduleChangeRequestStatus, TutorAvailabilityStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useSchedules } from '@/hooks/useSchedules';
import { useBookings } from '@/hooks/useBookings';
import { useTutorProfiles } from '@/hooks/useTutorProfiles';
import { useScheduleChangeRequests } from '@/hooks/useScheduleChangeRequests';
import { useTutorAvailability } from '@/hooks/useTutorAvailability';
import { useCustomToast } from '@/hooks/useCustomToast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ScheduleDto, ScheduleChangeRequestDto, TutorAvailabilityDto } from '@/types/backend';
import { useRouter } from 'next/navigation';

export function ScheduleTab() {
  const { user } = useAuth();
  const router = useRouter();
  const { schedules, loading, loadLearnerSchedules: loadSchedules } = useSchedules();
  const { loadBookingDetails, getBooking } = useBookings();
  const { getTutorProfile, loadTutorProfiles } = useTutorProfiles();
  const { fetchByScheduleId, create, loading: changeRequestLoading } = useScheduleChangeRequests();
  const {
    availabilities,
    timeSlots,
    weekDays,
    datesByDay,
    currentWeekStart,
    loadAvailabilities,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isLoading: loadingAvailabilities,
  } = useTutorAvailability();
  const { showError, showSuccess } = useCustomToast();
  const [pendingBySchedule, setPendingBySchedule] = useState<Record<number, boolean>>({});
  const [slotDialog, setSlotDialog] = useState<{
    open: boolean;
    schedule?: ScheduleDto;
    weekStart?: Date;
    selectedAvailabilityId?: number | null;
    reason?: string;
  }>({ open: false, selectedAvailabilityId: null, weekStart: undefined });

  useEffect(() => {
    if (user?.email) {
      const params: {
        startDate?: string;
        endDate?: string;
        status?: ScheduleStatus;
      } = {};

      // Chỉ lấy lịch sắp học (Upcoming) từ ngày hiện tại trở đi
      params.startDate = new Date().toISOString();
      params.status = ScheduleStatus.Upcoming;

      loadSchedules(user.email, params);
    }
  }, [user?.email, loadSchedules]);

  // Load booking details khi schedules thay đổi và booking chưa có
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

  // Load tutor profiles khi có bookings với tutorEmail
  useEffect(() => {
    if (schedules.length > 0) {
      const tutorEmails: string[] = [];

      schedules.forEach((schedule) => {
        const booking = getBooking(schedule.bookingId, schedule.booking);
        const tutorEmail = booking?.tutorSubject?.tutorEmail;

        if (tutorEmail && !tutorEmails.includes(tutorEmail)) {
          tutorEmails.push(tutorEmail);
        }
      });

      if (tutorEmails.length > 0) {
        loadTutorProfiles(tutorEmails);
      }
    }
  }, [schedules, getBooking, loadTutorProfiles]);

  // Load map scheduleId -> có Pending request
  useEffect(() => {
    const loadPendingBySchedule = async () => {
      if (!schedules || schedules.length === 0) {
        setPendingBySchedule({});
        return;
      }
      try {
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
      } catch (err) {
        // lỗi đã được hook setError, bỏ qua để không chặn UI
      }
    };
    loadPendingBySchedule();
  }, [schedules, fetchByScheduleId]);

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

  // Danh sách lịch sắp học (đã lọc Upcoming ở hook)
  const filteredSchedules = schedules;

  const buildBusyKey = (av?: TutorAvailabilityDto | null) => {
    if (!av?.startDate) return '';
    const date = av.startDate.split('T')[0];
    const hour = av.slot?.startTime?.split(':')[0]?.padStart(2, '0') || '';
    return `${date}-${hour}`;
  };

  // Map availability theo date-hour để tra nhanh
  const availabilityByKey = useMemo(() => {
    const map: Record<string, TutorAvailabilityDto> = {};
    availabilities.forEach(av => {
      if (!av.startDate) return;
      const dateKey = av.startDate.split('T')[0];
      const hour = av.slot?.startTime?.split(':')[0]?.padStart(2, '0') || '';
      if (dateKey && hour) {
        map[`${dateKey}-${hour}`] = av;
      }
    });
    return map;
  }, [availabilities]);

  const learnerBusyMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    schedules
      .filter(s => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming)
      .forEach(s => {
        const key = buildBusyKey(s.availability);
        if (key) map[key] = true;
      });
    return map;
  }, [schedules]);

  const getWeekDateKey = useCallback(
    (dayKey: string): string => {
      const idx = weekDays.findIndex(d => d.key === dayKey);
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + (idx >= 0 ? idx : 0));
      return date.toISOString().split('T')[0];
    },
    [currentWeekStart, weekDays]
  );

  // Chỉ hiển thị nút yêu cầu đổi lịch khi cách hiện tại >= 12h và chưa có request Pending cho schedule đó
  const canRequestChange = useCallback(
    (schedule: ScheduleDto): boolean => {
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
    },
    [pendingBySchedule]
  );

  const handleOpenSlotDialog = useCallback(
    async (schedule: ScheduleDto) => {
      const booking = getBooking(schedule.bookingId, schedule.booking);
      const tutorSubject = booking?.tutorSubject;
      const tutorId = tutorSubject?.tutor?.id || tutorSubject?.tutorId;
      if (!tutorId) {
        setSlotDialog({ open: true, schedule, selectedAvailabilityId: null, weekStart: undefined });
        return;
      }

      await loadAvailabilities(tutorId);
      goToCurrentWeek();
      setSlotDialog({
        open: true,
        schedule,
        selectedAvailabilityId: null,
        weekStart: currentWeekStart,
        reason: '',
      });
    },
    [getBooking, loadAvailabilities, goToCurrentWeek, currentWeekStart]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
      </div>
    );
  }

  // ( chỉ hiển thị danh sách)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Lịch học sắp tới</h2>
          <p className="text-gray-600 mt-1">Chỉ hiển thị các buổi học sắp diễn ra.</p>
        </div>
      </div>

      {/* Danh sách lịch sắp học */}
      {filteredSchedules.length === 0 ? (
        <Card className="hover:shadow-md transition-shadow bg-white border border-[#257180]/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-600">Chưa có lịch học nào sắp diễn ra</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map((schedule) => {
            const availability = schedule.availability;
            const slot = availability?.slot;

            // Lấy booking từ schedule hoặc từ hook (nếu schedule chỉ có bookingId)
            const booking = getBooking(schedule.bookingId, schedule.booking);
            // Từ booking lấy tutorSubject (tutorSubjectId)
            const tutorSubject = booking?.tutorSubject;
            // Từ tutorSubject lấy subject (môn học) và level
            const subject = tutorSubject?.subject;
            const level = tutorSubject?.level;
            // Lấy tutorEmail và tutor profile
            const tutorEmail = tutorSubject?.tutorEmail;
            const tutorProfile = tutorEmail ? getTutorProfile(tutorEmail) : undefined;

            const scheduleDate = availability?.startDate
              ? new Date(availability.startDate)
              : null;

            const isOnline = !!(schedule.meetingSession || schedule.hasMeetingSession);

            // Tính endDate từ startDate + slot.endTime
            return (
              <Card
                key={schedule.id}
                className="hover:shadow-md transition-shadow border border-[#257180]/20 border-l-4 border-l-[#257180] bg-white"
              >
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
                                Zoom Meeting
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
                              Gia sư: {tutorProfile?.userName || tutorEmail || 'Chưa có thông tin'}
                            </p>
                            {tutorEmail && (
                              <p className="text-xs text-gray-500 mt-1">
                                Email: {tutorEmail}
                              </p>
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
                                  <div className="text-xs text-gray-500">Bắt đầu - Kết thúc</div>
                                  <div className="text-gray-900 font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="lg"
                              className="flex-1 hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Nhắn tin
                            </Button>
                            {canRequestChange(schedule) && (
                              <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 border-dashed border-[#257180] text-[#257180] hover:bg-[#257180] hover:text-white"
                                onClick={() => handleOpenSlotDialog(schedule)}
                              >
                                Yêu cầu đổi lịch
                              </Button>
                            )}
                            {isOnline && schedule.meetingSession && (
                              <Button
                                size="lg"
                                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog hiển thị lịch rảnh của gia sư (lọc >=12h và không trùng lịch học của learner) */}
      <Dialog open={slotDialog.open} onOpenChange={(open) => setSlotDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader className="space-y-2">
            <DialogTitle>Lịch rảnh của gia sư</DialogTitle>
            {slotDialog.schedule && (() => {
              const booking = getBooking(slotDialog.schedule!.bookingId, slotDialog.schedule!.booking);
              const tutorSubject = booking?.tutorSubject;
              const subject = tutorSubject?.subject;
              const level = tutorSubject?.level;
              const tutorEmail = tutorSubject?.tutorEmail;
              const tutorProfile = tutorEmail ? getTutorProfile(tutorEmail) : tutorSubject?.tutor;
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
                  <div className="text-gray-700">
                    Gia sư: <span className="font-medium">{tutorProfile?.userName || tutorEmail || 'Chưa có thông tin'}</span>
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
            <DialogDescription>
              Chỉ hiển thị các slot cách hiện tại ≥ 12h và không trùng lịch học của bạn.
            </DialogDescription>
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

              const isLearnerBusy = (dateKey: string, hour: string) => {
                const key = `${dateKey}-${hour}`;
                return learnerBusyMap[key] === true;
              };

              const getSlot = (dateKey: string, hour: string) =>
                availabilityByKey[`${dateKey}-${hour}`];

              return (
                <Card className="border border-[#FD8B51]/40">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {weekRangeLabel}
                      </div>
                      <div className="text-xs text-gray-500">Lịch trống của gia sư (≥12h, không trùng lịch học của bạn)</div>
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
                          {times.map(t => {
                            const hour = t.split(':')[0].padStart(2, '0');
                            return (
                              <React.Fragment key={t}>
                                <div className="bg-gray-50 border-b border-r p-2 text-sm font-semibold text-gray-700">{t}</div>
                                {dates.map(d => {
                                  const av = getSlot(d, hour);
                                  if (!av) {
                                    return (
                                      <div key={`${d}-${t}`} className="border-b border-r bg-gray-100 text-center text-xs text-gray-400 p-2">
                                        -
                                      </div>
                                    );
                                  }

                                  const status = EnumHelpers.parseTutorAvailabilityStatus(av.status);
                                  const tooClose = isTooClose(av.startDate);
                                  const busy = isLearnerBusy(d, hour);
                                  const isSelected = slotDialog.selectedAvailabilityId === av.id;

                                  let bg = 'bg-green-100 text-green-800 border-green-200';
                                  let label = 'Lịch rảnh';
                                  let disabled = false;

                                  if (status === TutorAvailabilityStatus.Booked) {
                                    bg = 'bg-red-100 text-red-800 border-red-200';
                                    label = 'Đã booked';
                                    disabled = true;
                                  } else if (status !== TutorAvailabilityStatus.Available) {
                                    bg = 'bg-gray-100 text-gray-400 border-gray-200';
                                    label = 'Không có lịch';
                                    disabled = true;
                                  } else {
                                    if (tooClose) {
                                      bg = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                                      label = 'Quá gần (<12h)';
                                      disabled = true;
                                    }
                                    if (busy) {
                                      bg = 'bg-orange-100 text-orange-800 border-orange-200';
                                      label = 'Bạn đã có lịch';
                                      disabled = true;
                                    }
                                    if (isSelected) {
                                      bg = 'bg-orange-200 text-orange-900 border-orange-300';
                                      label = 'Đã chọn';
                                      disabled = false;
                                    }
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
                                      className={`border-b border-r p-2 text-center text-sm font-semibold transition ${bg} ${disabled && !isSelected ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm'
                                        }`}
                                      title={`${label} • ${av.slot?.startTime?.slice(0, 5)} - ${av.slot?.endTime?.slice(0, 5)}`}
                                    >
                                      {av.slot?.startTime?.slice(0, 5)} - {av.slot?.endTime?.slice(0, 5)}
                                    </button>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div>
                        <span>Lịch rảnh</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-200 rounded border border-orange-300"></div>
                        <span>Đã chọn</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-100 rounded border border-orange-200"></div>
                        <span>Bạn đã có lịch</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-100 rounded border border-yellow-200"></div>
                        <span>Quá gần (&lt;12h)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-100 rounded border border-red-200"></div>
                        <span>Đã booked</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-100 rounded border border-gray-200"></div>
                        <span>Không có lịch</span>
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
            >
              Hủy
            </Button>
            <Button
              className="bg-[#FD8B51] hover:bg-[#CB6040] text-white"
              disabled={
                !slotDialog.selectedAvailabilityId ||
                !slotDialog.schedule?.availability?.id ||
                !user?.email ||
                changeRequestLoading
              }
              onClick={async () => {
                const schedule = slotDialog.schedule;
                const newAvailabilityId = slotDialog.selectedAvailabilityId;
                if (!schedule || !newAvailabilityId) {
                  showError('Vui lòng chọn slot mới.');
                  return;
                }

                const booking = getBooking(schedule.bookingId, schedule.booking);
                const tutorEmail = booking?.tutorSubject?.tutorEmail;
                const oldAvailabilityId = schedule.availability?.id;

                if (!user?.email || !tutorEmail) {
                  showError('Thiếu thông tin người gửi hoặc gia sư.');
                  return;
                }
                if (!oldAvailabilityId) {
                  showError('Không tìm thấy lịch cũ của buổi học.');
                  return;
                }

                const payload = {
                  scheduleId: schedule.id,
                  requesterEmail: user.email,
                  requestedToEmail: tutorEmail,
                  oldAvailabilitiId: oldAvailabilityId,
                  newAvailabilitiId: newAvailabilityId,
                  reason: slotDialog.reason?.trim() || undefined,
                };

                const created = await create(payload);
                if (created) {
                  showSuccess('Đã gửi yêu cầu đổi lịch.');
                  setPendingBySchedule(prev => ({ ...prev, [schedule.id]: true }));
                  setSlotDialog({ open: false, schedule: undefined, weekStart: undefined, selectedAvailabilityId: null, reason: '' });
                } else {
                  showError('Gửi yêu cầu đổi lịch thất bại.');
                }
              }}
            >
              Tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
