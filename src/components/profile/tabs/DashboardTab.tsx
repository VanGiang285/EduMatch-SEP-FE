"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Progress } from '@/components/ui/feedback/progress';
import { Separator } from '@/components/ui/layout/separator';
import {
  Calendar,
  Clock,
  Video,
  Home,
  TrendingUp,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  BookOpen,
  MessageCircle,
  ArrowRight,
  DollarSign,
  Bell,
  Award,
  BarChart3,
  Shield,
  Eye,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useRouter } from 'next/navigation';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { BookingDto } from '@/types/backend';
import { BookingStatus, ScheduleStatus } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function DashboardTab() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    bookings,
    loading,
    tutorId,
    loadTutorProfile,
    loadTutorBookings,
  } = useBookings();

  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [pendingConfirmations, setPendingConfirmations] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);

  useEffect(() => {
    if (user?.email) {
      loadTutorProfile(user.email);
    }
  }, [user?.email, loadTutorProfile]);

  useEffect(() => {
    if (tutorId && tutorId > 0) {
      loadTutorBookings();
    }
  }, [tutorId, loadTutorBookings]);

  useEffect(() => {
    if (bookings.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayScheds: any[] = [];
      const upcoming: any[] = [];
      const pending: BookingDto[] = [];

      bookings.forEach((booking) => {
        if (EnumHelpers.parseBookingStatus(booking.status) === BookingStatus.Pending) {
          pending.push(booking);
        }

        booking.schedules?.forEach((schedule) => {
          const scheduleDate = schedule.availability?.startDate
            ? new Date(schedule.availability.startDate)
            : null;

          if (!scheduleDate) return;

          const scheduleDay = new Date(scheduleDate);
          scheduleDay.setHours(0, 0, 0, 0);

          if (scheduleDay.getTime() === today.getTime()) {
            const status = EnumHelpers.parseScheduleStatus(schedule.status);
            todayScheds.push({
              id: schedule.id,
              classId: booking.id,
              className: `${booking.tutorSubject?.subject?.subjectName || 'Môn học'} - ${booking.tutorSubject?.level?.name || 'Cấp độ'}`,
              subjectName: booking.tutorSubject?.subject?.subjectName || 'Môn học',
              learnerName: booking.learnerEmail || 'Học viên',
              learnerAvatar: null,
              startTime: format(scheduleDate, 'HH:mm', { locale: vi }),
              endTime: format(new Date(scheduleDate.getTime() + 2 * 60 * 60 * 1000), 'HH:mm', { locale: vi }),
              teachingMode: booking.tutorSubject?.tutor?.teachingModes !== undefined
                ? EnumHelpers.getTeachingModeLabel(booking.tutorSubject.tutor.teachingModes)
                : 'Trực tuyến',
              status: status === ScheduleStatus.Completed ? 'completed' :
                status === ScheduleStatus.InProgress ? 'in-progress' : 'upcoming',
            });
          } else if (scheduleDate > today && scheduleDate < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            const status = EnumHelpers.parseScheduleStatus(schedule.status);
            if (status === ScheduleStatus.Upcoming) {
              upcoming.push({
                id: schedule.id,
                classId: booking.id,
                className: `${booking.tutorSubject?.subject?.subjectName || 'Môn học'} - ${booking.tutorSubject?.level?.name || 'Cấp độ'}`,
                subjectName: booking.tutorSubject?.subject?.subjectName || 'Môn học',
                learnerName: booking.learnerEmail || 'Học viên',
                learnerAvatar: null,
                date: scheduleDate.toISOString(),
                startTime: format(scheduleDate, 'HH:mm', { locale: vi }),
                endTime: format(new Date(scheduleDate.getTime() + 2 * 60 * 60 * 1000), 'HH:mm', { locale: vi }),
                teachingMode: booking.tutorSubject?.tutor?.teachingModes !== undefined
                  ? EnumHelpers.getTeachingModeLabel(booking.tutorSubject.tutor.teachingModes)
                  : 'Trực tuyến',
                duration: 2,
              });
            }
          }
        });
      });

      setTodaySchedules(todayScheds.sort((a, b) => a.startTime.localeCompare(b.startTime)));
      setUpcomingLessons(upcoming.slice(0, 4));
      setPendingConfirmations(pending.slice(0, 2).map((b, idx) => ({
        id: idx + 1,
        classId: b.id,
        className: `${b.tutorSubject?.subject?.subjectName || 'Môn học'} - ${b.tutorSubject?.level?.name || 'Cấp độ'}`,
        subjectName: b.tutorSubject?.subject?.subjectName || 'Môn học',
        learnerName: b.learnerEmail || 'Học viên',
        learnerAvatar: null,
        requestType: 'new-class' as const,
        requestDate: new Date().toISOString(),
        proposedDate: b.schedules?.[0]?.availability?.startDate,
        proposedTime: b.schedules?.[0]?.availability?.startDate
          ? format(new Date(b.schedules[0].availability.startDate), 'HH:mm', { locale: vi })
          : undefined,
        message: 'Yêu cầu đặt lớp học mới',
      })));
      setPendingReports([]);
    }
  }, [bookings]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case 'new-class':
        return <Badge className="bg-blue-100 text-blue-800">Buổi học mới</Badge>;
      case 'reschedule':
        return <Badge className="bg-yellow-100 text-yellow-800">Đổi lịch</Badge>;
      case 'cancel':
        return <Badge className="bg-red-100 text-red-800">Hủy buổi</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Đã dạy</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">Đang dạy</Badge>;
      case 'upcoming':
        return <Badge className="bg-gray-100 text-gray-800">Sắp tới</Badge>;
      default:
        return null;
    }
  };

  const totalEarnings = bookings
    .filter(b => {
      const status = EnumHelpers.parseBookingStatus(b.status);
      return status === BookingStatus.Confirmed || status === BookingStatus.Completed;
    })
    .reduce((sum, b) => sum + (b.tutorReceiveAmount || 0), 0);

  const completedSessions = bookings.reduce((sum, b) => {
    return sum + (b.schedules?.filter(s =>
      EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Completed
    ).length || 0);
  }, 0);

  const upcomingSessions = bookings.reduce((sum, b) => {
    return sum + (b.schedules?.filter(s =>
      EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming
    ).length || 0);
  }, 0);

  const monthlyEarning = {
    totalEarnings,
    completedSessions,
    upcomingSessions,
    hoursTaught: completedSessions * 2,
    averageRating: 4.8,
  };

  const earningsChartData = [
    { month: 'T8/24', earnings: totalEarnings * 0.5, sessions: Math.floor(completedSessions * 0.5) },
    { month: 'T9/24', earnings: totalEarnings * 0.65, sessions: Math.floor(completedSessions * 0.65) },
    { month: 'T10/24', earnings: totalEarnings * 0.8, sessions: Math.floor(completedSessions * 0.8) },
    { month: 'T11/24', earnings: totalEarnings * 0.85, sessions: Math.floor(completedSessions * 0.85) },
    { month: 'T12/24', earnings: totalEarnings * 0.92, sessions: Math.floor(completedSessions * 0.92) },
    { month: 'T1/25', earnings: totalEarnings, sessions: completedSessions },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#257180] to-[#1f5a66] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Chào mừng trở lại! 👋</h1>
              <p className="text-white/90 text-lg">
                Bảng điều khiển giảng dạy của bạn - {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 border-gray-300"
                onClick={() => router.push('/profile?tab=classes')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Xem tất cả lớp
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Buổi hôm nay</p>
                  <p className="text-2xl font-bold text-white">{todaySchedules.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Chờ xác nhận</p>
                  <p className="text-2xl font-bold text-white">{pendingConfirmations.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Báo cáo</p>
                  <p className="text-2xl font-bold text-white">{pendingReports.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Thu nhập tháng</p>
                  <p className="text-2xl font-bold text-white">
                    {(monthlyEarning.totalEarnings / 1000000).toFixed(1)}tr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#257180]" />
                    Lịch dạy hôm nay
                  </CardTitle>
                  <Badge variant="outline" className="text-[#257180] border-gray-300">
                    {todaySchedules.length} buổi
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {todaySchedules.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`p-4 rounded-lg border-l-4 border border-gray-300 ${
                          schedule.status === 'completed'
                            ? 'bg-green-50 border-l-green-500'
                            : schedule.status === 'in-progress'
                            ? 'bg-blue-50 border-l-blue-500'
                            : 'bg-gray-50 border-l-gray-400'
                        } cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => router.push(`/profile?tab=classes&bookingId=${schedule.classId}`)}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-[#257180] text-white">
                              {schedule.learnerName[0]?.toUpperCase() || 'HV'}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{schedule.className}</h4>
                              {getStatusBadge(schedule.status)}
                            </div>
                            <p className="text-gray-600 mb-2">Học viên: {schedule.learnerName}</p>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{schedule.startTime} - {schedule.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {schedule.teachingMode === 'Trực tuyến' ? (
                                  <Video className="w-4 h-4" />
                                ) : (
                                  <Home className="w-4 h-4" />
                                )}
                                <span>{schedule.teachingMode}</span>
                              </div>
                            </div>
                          </div>

                          {schedule.status === 'upcoming' && (
                            <Button size="sm" className="bg-[#257180] hover:bg-[#1f5a66]">
                              Bắt đầu
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Không có buổi dạy nào hôm nay</p>
                    <p className="text-sm text-gray-500 mt-1">Hãy nghỉ ngơi và chuẩn bị cho các buổi học sắp tới!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#257180]" />
                    Buổi học sắp tới
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                    onClick={() => router.push('/profile?tab=classes')}
                  >
                    Xem tất cả
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingLessons.slice(0, 4).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-300"
                      onClick={() => router.push(`/profile?tab=classes&bookingId=${lesson.classId}`)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#257180] text-white text-sm">
                            {lesson.learnerName[0]?.toUpperCase() || 'HV'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">{lesson.className}</h4>
                            <span className="text-xs text-gray-500">{formatDate(lesson.date)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{lesson.learnerName}</p>

                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{lesson.startTime} - {lesson.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {lesson.teachingMode === 'Trực tuyến' ? (
                                <Video className="w-3.5 h-3.5" />
                              ) : (
                                <Home className="w-3.5 h-3.5" />
                              )}
                              <span>{lesson.teachingMode}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#257180]" />
                    Tổng kết thu nhập - 6 tháng gần đây
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                    onClick={() => router.push('/profile?tab=wallet')}
                  >
                    Chi tiết
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-green-700 mb-1">Tổng thu nhập tháng này</p>
                        <p className="text-4xl font-bold text-green-900">
                          {formatCurrency(monthlyEarning.totalEarnings)}
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-green-700" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <TrendingUp className="w-4 h-4" />
                      <span>Từ {monthlyEarning.completedSessions} buổi học đã hoàn thành</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Biểu đồ thu nhập 6 tháng</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={earningsChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            stroke="#6b7280"
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}tr`}
                          />
                          <Tooltip
                            formatter={(value: number) => [`${formatCurrency(value)}`, 'Thu nhập']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '8px'
                            }}
                          />
                          <Bar
                            dataKey="earnings"
                            fill="#257180"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <Separator className="border-[#257180]/20" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Buổi đã dạy</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{monthlyEarning.completedSessions}</p>
                      <p className="text-xs text-blue-700 mt-1">{monthlyEarning.hoursTaught} giờ</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-700 font-medium">Buổi sắp tới</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{monthlyEarning.upcomingSessions}</p>
                      <p className="text-xs text-purple-700 mt-1">
                        Dự kiến {formatCurrency(monthlyEarning.upcomingSessions * 2 * 200000)}
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs text-yellow-700 font-medium">Đánh giá TB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-yellow-900">{monthlyEarning.averageRating}</p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(monthlyEarning.averageRating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-orange-700 font-medium">Học viên</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">{bookings.length}</p>
                      <p className="text-xs text-orange-700 mt-1">Lớp đang dạy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#257180]" />
                  Chờ xác nhận
                  {pendingConfirmations.length > 0 && (
                    <Badge className="bg-red-500 text-white ml-auto">
                      {pendingConfirmations.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingConfirmations.length > 0 ? (
                  <div className="space-y-3">
                    {pendingConfirmations.map((confirmation) => (
                      <div
                        key={confirmation.id}
                        className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#257180] text-white text-sm">
                              {confirmation.learnerName[0]?.toUpperCase() || 'HV'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {confirmation.learnerName}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">{confirmation.className}</p>
                            {getRequestTypeBadge(confirmation.requestType)}
                          </div>
                        </div>

                        {confirmation.proposedDate && (
                          <div className="bg-white p-3 rounded border border-yellow-300 mb-3">
                            <p className="text-xs text-gray-500 mb-1">Đề xuất:</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatFullDate(confirmation.proposedDate)}
                            </p>
                            {confirmation.proposedTime && (
                              <p className="text-sm text-gray-600">{confirmation.proposedTime}</p>
                            )}
                          </div>
                        )}

                        {confirmation.message && (
                          <p className="text-sm text-gray-700 mb-3 italic">
                            "{confirmation.message}"
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 border-red-300 hover:bg-red-50 border-gray-300 bg-white hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Không có yêu cầu nào</p>
                    <p className="text-sm text-gray-500 mt-1">Tất cả đã được xử lý</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#257180]" />
                  Báo cáo chờ phản hồi
                  {pendingReports.length > 0 && (
                    <Badge className="bg-red-500 text-white ml-auto">
                      {pendingReports.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingReports.length > 0 ? (
                  <div className="space-y-3">
                    {pendingReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-red-600 text-white text-sm">
                              {report.reportBy[0]?.toUpperCase() || 'HV'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {report.reportBy}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">{report.className}</p>
                            <p className="text-xs text-gray-500">
                              {formatFullDate(report.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border border-red-300 mb-3">
                          <p className="text-xs font-medium text-red-700 mb-1">Lý do:</p>
                          <p className="text-sm font-medium text-gray-900 mb-2">{report.reason}</p>
                          <p className="text-sm text-gray-700">{report.description}</p>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-[#257180] hover:bg-[#1f5a66]"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Gửi kháng cáo
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">Không có báo cáo nào</p>
                    <p className="text-sm text-gray-500 mt-1">Giữ vững phong độ!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

