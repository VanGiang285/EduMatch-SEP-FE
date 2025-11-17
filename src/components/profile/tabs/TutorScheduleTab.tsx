"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Calendar, Clock, MapPin, Video, MessageCircle, Loader2, Filter } from 'lucide-react';
import { ScheduleService } from '@/services';
import { ScheduleDto } from '@/types/backend';
import { ScheduleStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';
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
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user?.email) {
      loadSchedules();
    }
  }, [user?.email, statusFilter, dateRange]);

  const loadSchedules = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const params: {
        startDate?: string;
        endDate?: string;
        status?: ScheduleStatus;
      } = {};

      // Set date range
      const now = new Date();
      if (dateRange === 'week') {
        params.startDate = now.toISOString();
        const weekLater = new Date(now);
        weekLater.setDate(weekLater.getDate() + 7);
        params.endDate = weekLater.toISOString();
      } else if (dateRange === 'month') {
        params.startDate = now.toISOString();
        const monthLater = new Date(now);
        monthLater.setMonth(monthLater.getMonth() + 1);
        params.endDate = monthLater.toISOString();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await ScheduleService.getAllByTutorEmail(user.email, params);

      if (response.success && response.data) {
        setSchedules(response.data);
      } else {
        showError('Không thể tải lịch dạy', response.error?.message);
      }
    } catch (error: any) {
      showError('Lỗi khi tải lịch dạy', error.message);
    } finally {
      setLoading(false);
    }
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
      case ScheduleStatus.Absent:
        return 'outline';
      default:
        return 'default';
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
          <Select value={dateRange} onValueChange={(value: 'week' | 'month' | 'all') => setDateRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value={ScheduleStatus.Upcoming.toString()}>Sắp diễn ra</SelectItem>
              <SelectItem value={ScheduleStatus.InProgress.toString()}>Đang học</SelectItem>
              <SelectItem value={ScheduleStatus.Completed.toString()}>Hoàn thành</SelectItem>
              <SelectItem value={ScheduleStatus.Cancelled.toString()}>Đã hủy</SelectItem>
              <SelectItem value={ScheduleStatus.Absent.toString()}>Vắng mặt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {schedules.length === 0 ? (
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-600">Chưa có lịch dạy nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const availability = schedule.availability;
            const slot = availability?.slot;
            const booking = schedule.booking;
            const learner = booking?.learner;
            const tutorSubject = booking?.tutorSubject;
            const subject = tutorSubject?.subject;

            // Parse date from availability
            const scheduleDate = availability?.startDate
              ? new Date(availability.startDate)
              : null;

            return (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
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
                              {learner?.userProfile?.avatarUrl ? (
                                <img
                                  src={learner.userProfile.avatarUrl}
                                  alt={learner.userName || 'Học viên'}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full rounded-lg flex items-center justify-center text-lg font-bold text-[#257180] bg-[#F2E5BF]">
                                  {learner?.userName
                                    ? learner.userName.slice(0, 2).toUpperCase()
                                    : 'HV'}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {subject?.subjectName || 'Môn học'}
                            </h3>
                            <p className="text-gray-600">
                              Học viên: {learner?.userName || 'Chưa có thông tin'}
                            </p>
                            {learner?.email && (
                              <p className="text-sm text-gray-500">{learner.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusBadgeVariant(schedule.status)}>
                            {EnumHelpers.getScheduleStatusLabel(schedule.status)}
                          </Badge>
                          {schedule.meetingSession && (
                            <Badge
                              variant="secondary"
                              className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20"
                            >
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {slot && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                        )}
                        {schedule.meetingSession && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Video className="h-4 w-4" />
                            <span>Lớp học online</span>
                          </div>
                        )}
                        {tutor?.addressLine && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{tutor.addressLine}</span>
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

