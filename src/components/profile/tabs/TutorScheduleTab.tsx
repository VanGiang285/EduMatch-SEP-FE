"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Calendar, Clock, MapPin, Video, MessageCircle, Loader2, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { ScheduleDto } from '@/types/backend';
import { ScheduleStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { useLearnerProfiles } from '@/hooks/useLearnerProfiles';
import { useSchedules } from '@/hooks/useSchedules';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCustomToast } from '@/hooks/useCustomToast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';

export function TutorScheduleTab() {
  const { user } = useAuth();
  const { showError } = useCustomToast();
  const { getBooking, loadBookingDetails } = useBookings();
  const { getLearnerProfile, loadLearnerProfiles } = useLearnerProfiles();
  const { schedules, loading, loadSchedulesByTutorEmail } = useSchedules();
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'all'>('all');

  useEffect(() => {
    if (user?.email) {
      loadSchedules();
    }
  }, [user?.email]);

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
                          className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Nhắn tin
                        </Button>
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
    </div>
  );
}

