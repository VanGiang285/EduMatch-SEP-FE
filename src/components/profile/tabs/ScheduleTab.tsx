"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Calendar, Clock, MapPin, Video, MessageCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ScheduleStatus, ScheduleChangeRequestStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
import { useSchedules } from '@/hooks/useSchedules';
import { useBookings } from '@/hooks/useBookings';
import { useTutorProfiles } from '@/hooks/useTutorProfiles';
import { useScheduleChangeRequests } from '@/hooks/useScheduleChangeRequests';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ScheduleDto, ScheduleChangeRequestDto } from '@/types/backend';
import { useRouter } from 'next/navigation';

export function ScheduleTab() {
  const { user } = useAuth();
  const router = useRouter();
  const { schedules, loading, loadLearnerSchedules: loadSchedules } = useSchedules();
  const { loadBookingDetails, getBooking } = useBookings();
  const { getTutorProfile, loadTutorProfiles } = useTutorProfiles();
  const { fetchByRequesterEmail, fetchByRequestedToEmail } = useScheduleChangeRequests();
  const [changeRequests, setChangeRequests] = useState<ScheduleChangeRequestDto[]>([]);

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

  // Load các yêu cầu đổi lịch Pending liên quan tới user (để chặn nút tạo mới)
  useEffect(() => {
    const loadChangeReqs = async () => {
      if (!user?.email) {
        setChangeRequests([]);
        return;
      }
      try {
        const [fromMe, toMe] = await Promise.all([
          fetchByRequesterEmail(user.email, ScheduleChangeRequestStatus.Pending),
          fetchByRequestedToEmail(user.email, ScheduleChangeRequestStatus.Pending),
        ]);
        setChangeRequests([...(fromMe || []), ...(toMe || [])]);
      } catch (err) {
        // lỗi đã được hook setError, bỏ qua để không chặn UI
      }
    };
    loadChangeReqs();
  }, [user?.email, fetchByRequesterEmail, fetchByRequestedToEmail]);

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

  // Danh sách lịch sắp học (đã lọc Upcoming ở hook)
  const filteredSchedules = schedules;

  // Chỉ hiển thị nút yêu cầu đổi lịch khi cách hiện tại >= 24h và chưa có request Pending cho schedule đó
  const canRequestChange = useCallback(
    (schedule: ScheduleDto): boolean => {
      const avStart = schedule.availability?.startDate
        ? new Date(schedule.availability.startDate)
        : null;
      if (!avStart) return false;
      const diffMs = avStart.getTime() - Date.now();
      if (diffMs < 24 * 60 * 60 * 1000) return false; // dưới 24h

      const status = EnumHelpers.parseScheduleStatus(schedule.status);
      if (status !== ScheduleStatus.Upcoming) return false;

      const hasPending = changeRequests.some(
        (req) =>
          req.scheduleId === schedule.id &&
          EnumHelpers.parseScheduleChangeRequestStatus(req.status) ===
          ScheduleChangeRequestStatus.Pending
      );

      return !hasPending;
    },
    [changeRequests]
  );

  const handleGoToChangeTab = useCallback(() => {
    router.push('/profile?tab=schedule-change');
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
      </div>
    );
  }

  // (Đã bỏ calendar view, chỉ hiển thị danh sách)

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
                              Gia sư: {tutorProfile?.userName || tutorEmail || 'Chưa có thông tin'}
                            </p>
                            {tutorEmail && (
                              <p className="text-xs text-gray-500 mt-1">
                                Email{tutorEmail}
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
                                onClick={handleGoToChangeTab}
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
    </div>
  );
}
