"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Calendar, Clock, MapPin, Video, MessageCircle, Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { ScheduleStatus, TeachingMode } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useLearnerSchedules } from '@/hooks/useLearnerSchedules';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ScheduleDto } from '@/types/backend';

export function ScheduleTab() {
  const { user } = useAuth();
  const { showError } = useCustomToast();
  const { schedules, loading, loadSchedules, clearSchedules } = useLearnerSchedules();
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user?.email) {
      const params: {
        startDate?: string;
        endDate?: string;
        status?: ScheduleStatus;
      } = {};

      if (filter === 'upcoming') {
        params.startDate = new Date().toISOString();
        params.status = ScheduleStatus.Upcoming;
      } else {
        // Load tất cả schedules cho calendar view
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        params.startDate = start.toISOString();
        params.endDate = end.toISOString();
      }

      loadSchedules(user.email, params);
    }
  }, [user?.email, filter, loadSchedules, currentMonth]);

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

  // Lấy schedules theo ngày
  const getSchedulesByDate = (date: Date): ScheduleDto[] => {
    return schedules.filter((schedule) => {
      const scheduleDate = schedule.availability?.startDate
        ? new Date(schedule.availability.startDate)
        : null;
      return scheduleDate && isSameDay(scheduleDate, date);
    });
  };

  // Tạo calendar days
  const calendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Thứ 2 là ngày đầu tuần
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Thứ 2 là ngày đầu tuần
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isSameMonth(date, currentMonth)) {
      if (selectedDate && isSameDay(date, selectedDate)) {
        // Click lại vào ngày đã chọn thì bỏ chọn
        setSelectedDate(null);
      } else {
        setSelectedDate(date);
      }
    }
  };

  // Lọc schedules theo ngày được chọn
  const filteredSchedules = selectedDate
    ? getSchedulesByDate(selectedDate)
    : schedules;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
      </div>
    );
  }

  const renderCalendarView = () => {
    const days = calendarDays();
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const today = new Date();

    return (
      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const daySchedules = getSchedulesByDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative h-24 p-1.5 rounded-lg border transition-all text-left
                    ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-900 bg-white hover:bg-gray-50'}
                    ${isToday ? 'border-[#257180] border-2 bg-[#257180]/5' : 'border-gray-200'}
                    ${isSelected ? 'bg-[#257180] text-white' : ''}
                    ${daySchedules.length > 0 ? 'font-semibold' : ''}
                  `}
                >
                  <div className="text-sm mb-1 font-semibold">{format(day, 'd')}</div>
                  {daySchedules.length > 0 && (
                    <div className="space-y-0.5">
                      {daySchedules.slice(0, 2).map((schedule) => {
                        const slot = schedule.availability?.slot;
                        const status = EnumHelpers.parseScheduleStatus(schedule.status);
                        const isOnline = !!(schedule.meetingSession || schedule.hasMeetingSession);
                        const color =
                          status === ScheduleStatus.Completed
                            ? 'bg-green-500'
                            : status === ScheduleStatus.Cancelled || status === ScheduleStatus.Absent
                              ? 'bg-red-500'
                              : status === ScheduleStatus.InProgress
                                ? 'bg-yellow-500'
                                : 'bg-blue-500';
                        return (
                          <div
                            key={schedule.id}
                            className={`text-[10px] px-1 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'} truncate`}
                            title={slot ? `${slot.startTime} - ${slot.endTime}${isOnline ? ' (Zoom Meeting)' : ''}` : ''}
                          >
                            {slot ? (
                              <div className="flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                <span className="truncate">{slot.startTime}</span>
                                {isOnline && <Video className="h-2.5 w-2.5 ml-0.5" />}
                              </div>
                            ) : (
                              <div className={`w-1.5 h-1.5 rounded-full mx-auto ${isSelected ? 'bg-white' : color}`} />
                            )}
                          </div>
                        );
                      })}
                      {daySchedules.length > 2 && (
                        <div className={`text-[10px] text-center ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                          +{daySchedules.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Schedules Panel */}
          {selectedDate && getSchedulesByDate(selectedDate).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Lịch học ngày {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                >
                  Đóng
                </Button>
              </div>
              <div className="space-y-3">
                {getSchedulesByDate(selectedDate)
                  .sort((a, b) => {
                    const slotA = a.availability?.slot?.startTime || '';
                    const slotB = b.availability?.slot?.startTime || '';
                    return slotA.localeCompare(slotB);
                  })
                  .map((schedule) => {
                    const availability = schedule.availability;
                    const slot = availability?.slot;
                    const tutor = availability?.tutor;
                    const booking = schedule.booking;
                    const tutorSubject = booking?.tutorSubject;
                    const subject = tutorSubject?.subject;
                    const level = tutorSubject?.level;
                    const isOnline = !!(schedule.meetingSession || schedule.hasMeetingSession);

                    return (
                      <Card key={schedule.id} className="border-l-4 border-l-[#257180]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
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
                              <h5 className="font-semibold text-gray-900 mb-1">
                                {subject?.subjectName || 'Môn học'}
                                {level && <span className="text-sm font-normal text-gray-500 ml-2">- {level.name}</span>}
                              </h5>
                              <p className="text-sm text-gray-600 mb-2">
                                Gia sư: {user?.email || 'Chưa có thông tin'}
                              </p>
                              {slot && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                                  <Clock className="h-4 w-4 text-[#257180]" />
                                  <span>{slot.startTime} - {slot.endTime}</span>
                                </div>
                              )}
                              {schedule.meetingSession?.meetLink && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-500 mb-0.5">Link Zoom Meeting</div>
                                  <a
                                    href={schedule.meetingSession.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                  >
                                    <Video className="h-4 w-4" />
                                    <span className="truncate max-w-[220px]" title={schedule.meetingSession.meetLink}>
                                      {schedule.meetingSession.meetLink}
                                    </span>
                                  </a>
                                </div>
                              )}
                              {!isOnline && tutor?.addressLine && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{tutor.addressLine}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Lịch học sắp tới</h2>
          <p className="text-gray-600 mt-1">Các buổi học của bạn</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'upcoming' ? 'bg-[#257180] text-white hover:bg-[#257180]/90' : ''}
            onClick={() => setFilter('upcoming')}
          >
            Sắp tới
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'all' ? 'bg-[#257180] text-white hover:bg-[#257180]/90' : ''}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          className={viewMode === 'calendar' ? 'bg-[#257180] text-white hover:bg-[#257180]/90' : ''}
          onClick={() => {
            setViewMode('calendar');
            setSelectedDate(null);
          }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Lịch
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          className={viewMode === 'list' ? 'bg-[#257180] text-white hover:bg-[#257180]/90' : ''}
          onClick={() => {
            setViewMode('list');
            setSelectedDate(null);
          }}
        >
          <List className="h-4 w-4 mr-2" />
          Danh sách
        </Button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && renderCalendarView()}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {selectedDate && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Lịch học ngày {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDate(null);
                  setFilter('all');
                }}
              >
                Xem tất cả
              </Button>
            </div>
          )}

          {filteredSchedules.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">
                  {selectedDate
                    ? `Chưa có lịch học nào vào ngày ${format(selectedDate, 'dd/MM/yyyy', { locale: vi })}`
                    : 'Chưa có lịch học nào'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map((schedule) => {
                const availability = schedule.availability;
                const slot = availability?.slot;
                const tutor = availability?.tutor;
                const booking = schedule.booking;
                const tutorSubject = booking?.tutorSubject;
                const subject = tutorSubject?.subject;
                const level = tutorSubject?.level;

                const scheduleDate = availability?.startDate
                  ? new Date(availability.startDate)
                  : null;

                const isOnline = !!(schedule.meetingSession || schedule.hasMeetingSession);

                // Tính endDate từ startDate + slot.endTime
                let endDate: Date | null = null;
                if (availability?.endDate) {
                  endDate = new Date(availability.endDate);
                } else if (scheduleDate && slot) {
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
                                {EnumHelpers.parseScheduleStatus(schedule.status) === ScheduleStatus.Absent && (
                                  <XCircle className="h-5 w-5 text-gray-500" />
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
                                  Gia sư: {user?.email || 'Chưa có thông tin'}
                                </p>
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

                                {!isOnline && tutor?.addressLine && (
                                  <div className="flex items-center gap-3">
                                    <div className="bg-white rounded-lg p-2 shadow-sm">
                                      <MapPin className="h-5 w-5 text-[#257180]" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-gray-500">Địa điểm</div>
                                      <div className="text-gray-900 font-medium line-clamp-1">
                                        {tutor.province?.name}
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
        </>
      )}
    </div>
  );
}
