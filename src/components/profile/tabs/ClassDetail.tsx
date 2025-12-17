"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Textarea } from '@/components/ui/form/textarea';
import { Label } from '@/components/ui/form/label';
import { Input } from '@/components/ui/form/input';
import { Separator } from '@/components/ui/layout/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/feedback/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Loader2,
  Clock,
  MapPin,
  Video,
  Home,
  MessageCircle,
  Star,
  TrendingUp,
  CheckCircle2,
  FileText,
  Send,
  Wallet,
  CalendarDays,
  Edit,
  X,
  Image as ImageIcon,
  Upload,

} from 'lucide-react';
import { BookingDto, ScheduleDto, TutorRatingSummary } from '@/types/backend';
import { BookingStatus, ScheduleStatus, TeachingMode } from '@/types/enums';
import { EnumHelpers } from '@/types/enums';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useTutorProfiles } from '@/hooks/useTutorProfiles';
import { useLearnerProfiles } from '@/hooks/useLearnerProfiles';
import { FeedbackService, ScheduleService } from '@/services';

interface ClassDetailProps {
  booking: BookingDto;
  userRole: 'learner' | 'tutor';
  onBack: () => void;
}

export function ClassDetail({ booking, userRole, onBack }: ClassDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [noteAttachments, setNoteAttachments] = useState<File[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { openChatWithTutor, openChatWithLearner } = useChatContext();
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const { showError, showWarning } = useCustomToast();
  const { loadTutorProfile: loadTutorProfileByEmail, getTutorProfile } = useTutorProfiles();
  const { loadLearnerProfile, getLearnerProfile } = useLearnerProfiles();
  const [schedules, setSchedules] = useState<ScheduleDto[]>(booking.schedules || []);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const tutorSubject = booking.tutorSubject;
  const subject = tutorSubject?.subject;
  const level = tutorSubject?.level;
  const tutorEmail = tutorSubject?.tutorEmail;
  const learnerEmail = booking.learnerEmail;
  const tutor = (tutorEmail ? getTutorProfile(tutorEmail) : undefined) || tutorSubject?.tutor;
  const learnerProfile = getLearnerProfile(learnerEmail);
  const learnerName = learnerProfile?.user?.userName || learnerEmail || 'Học viên';
  const tutorId = tutorSubject?.tutorId || tutor?.id;
  const [tutorRatingSummary, setTutorRatingSummary] = useState<TutorRatingSummary | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!tutorId) {
        setTutorRatingSummary(null);
        return;
      }
      try {
        const res = await FeedbackService.getTutorRatingSummary(tutorId);
        if (!ignore) {
          setTutorRatingSummary(res.success ? res.data || null : null);
        }
      } catch {
        if (!ignore) setTutorRatingSummary(null);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [tutorId]);

  useEffect(() => {
    if (tutorEmail) {
      loadTutorProfileByEmail(tutorEmail);
    }
  }, [tutorEmail, loadTutorProfileByEmail]);

  useEffect(() => {
    if (learnerEmail) {
      loadLearnerProfile(learnerEmail);
    }
  }, [learnerEmail, loadLearnerProfile]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!booking.id) return;
      setLoadingSchedules(true);
      try {
        const res = await ScheduleService.getAllNoPaging(booking.id);
        if (!ignore) {
          if (res.success && res.data) {
            setSchedules(res.data);
          } else {
            setSchedules(booking.schedules || []);
          }
        }
      } catch (e) {
        if (!ignore) {
          setSchedules(booking.schedules || []);
        }
      } finally {
        if (!ignore) setLoadingSchedules(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [booking.id, booking.schedules]);

  const totalSessions = booking.totalSessions;
  const completedSessions = useMemo(() => {
    return schedules.filter(
      (s) => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Completed
    ).length;
  }, [schedules]);
  const progress = totalSessions ? (completedSessions / totalSessions) * 100 : 0;

  const getProgressPercentage = () => {
    return Math.round(progress);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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

  const getSessionStatusBadge = (status: ScheduleStatus | string) => {
    const parsed = EnumHelpers.parseScheduleStatus(status);
    const label = userRole === 'learner' ? 'Đã học' : 'Đã dạy';
    switch (parsed) {
      case ScheduleStatus.Completed:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-gray-300">{label}</Badge>;
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

  const getScheduleStatusColor = (status: ScheduleStatus | string) => {
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

  const getStatusBadge = (status: BookingStatus | string) => {
    const parsed = EnumHelpers.parseBookingStatus(status);
    switch (parsed) {
      case BookingStatus.Confirmed:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đang học</Badge>;
      case BookingStatus.Pending:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Tạm dừng</Badge>;
      case BookingStatus.Completed:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Hoàn thành</Badge>;
      default:
        return null;
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log('Adding note:', newNote, 'with attachments:', noteAttachments);
      setNewNote('');
      setNoteAttachments([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNoteAttachments([...noteAttachments, ...filesArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setNoteAttachments(noteAttachments.filter((_, i) => i !== index));
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getSessionsForDate = (day: number, month: number, year: number) => {
    return schedules.filter(schedule => {
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

  const handleOpenChat = async () => {
    if (userRole === 'learner') {
      if (!tutorEmail || !tutor) {
        showError('Lỗi', 'Không tìm thấy thông tin gia sư để nhắn tin.');
        return;
      }
      if (!isAuthenticated) {
        showWarning('Vui lòng đăng nhập', 'Bạn cần đăng nhập để nhắn tin với gia sư.');
        router.push('/login');
        return;
      }
      await openChatWithTutor(
        tutor.id,
        tutorEmail,
        tutor.userName,
        tutor.avatarUrl
      );
    } else {
      const bookingTutorId = tutorSubject?.tutorId || tutor?.id;
      if (!bookingTutorId || !learnerEmail) {
        showError('Lỗi', 'Không tìm thấy thông tin học viên để nhắn tin.');
        return;
      }
      if (!isAuthenticated) {
        showWarning('Vui lòng đăng nhập', 'Bạn cần đăng nhập để nhắn tin với học viên.');
        router.push('/login');
        return;
      }
      await openChatWithLearner(bookingTutorId, learnerEmail);
    }
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateA = a.availability?.startDate ? new Date(a.availability.startDate).getTime() : 0;
    const dateB = b.availability?.startDate ? new Date(b.availability.startDate).getTime() : 0;
    return dateA - dateB;
  });

  const firstSchedule = sortedSchedules[0];
  const startDate = firstSchedule?.availability?.startDate
    ? new Date(firstSchedule.availability.startDate)
    : null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const totalMoney = useMemo(() => {
    return userRole === 'learner' ? booking.totalAmount : booking.tutorReceiveAmount;
  }, [booking.totalAmount, booking.tutorReceiveAmount, userRole]);

  const moneySoFar = useMemo(() => {
    if (totalSessions <= 0) return 0;
    if (userRole === 'learner') {
      return Math.min(completedSessions * booking.unitPrice, totalMoney);
    }
    const perSession = booking.tutorReceiveAmount / totalSessions;
    return Math.min(completedSessions * perSession, totalMoney);
  }, [booking.tutorReceiveAmount, booking.unitPrice, completedSessions, totalMoney, totalSessions, userRole]);

  const moneyRemaining = useMemo(() => {
    return Math.max(totalMoney - moneySoFar, 0);
  }, [moneySoFar, totalMoney]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#257180] to-[#1f5a66] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            className="mb-4 text-white hover:bg-[#FD8B51] hover:text-white"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-semibold text-white">
                  {subject?.subjectName || 'Môn học'} - {level?.name || 'Cấp độ'}
                </h1>
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-white/90 mb-6 text-lg">
                Lớp học {subject?.subjectName || 'Môn học'} - {level?.name || 'Cấp độ'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Hình thức</p>
                  <p className="font-medium">
                    {tutor?.teachingModes !== undefined
                      ? EnumHelpers.getTeachingModeLabel(tutor.teachingModes)
                      : 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Học phí</p>
                  <p className="font-medium">{formatCurrency(booking.unitPrice)}/buổi</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Tổng buổi</p>
                  <p className="font-medium">{totalSessions} buổi</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Bắt đầu</p>
                  <p className="font-medium">
                    {startDate ? formatDate(startDate.toISOString()) : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] shadow-sm">
                  <AvatarImage
                    src={
                      userRole === 'learner'
                        ? tutor?.avatarUrl || undefined
                        : learnerProfile?.profile.avatarUrl || undefined
                    }
                    className="object-cover rounded-lg"
                  />
                  <AvatarFallback className="rounded-lg font-semibold text-xl">
                    {userRole === 'learner'
                      ? tutor?.userName
                        ? tutor.userName.split(' ').slice(-2).map(n => n[0]).join('')
                        : 'GS'
                      : learnerName
                      ? learnerName.split(' ').slice(-2).map(n => n[0]).join('') || learnerName[0]?.toUpperCase()
                      : 'HV'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white/70 text-xs mb-1">
                  {userRole === 'learner' ? 'Gia sư của bạn' : 'Học viên của bạn'}
                </p>
                <h3 className="text-xl font-semibold mb-3">
                  {userRole === 'learner'
                    ? tutor?.userName || 'Gia sư'
                    : learnerName}
                </h3>

                {userRole === 'learner' && tutor && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    <span className="font-semibold">
                      {tutorRatingSummary ? tutorRatingSummary.averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-white/70 text-sm">
                      ({tutorRatingSummary?.totalFeedbackCount ?? 0} đánh giá)
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-white text-[#257180] hover:bg-white/90 border-gray-300"
                    onClick={handleOpenChat}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Nhắn tin
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-[#257180]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{getProgressPercentage()}%</p>
              <p className="text-gray-600">Tiến độ</p>
              <p className="text-xs text-gray-500 mt-1">
                {completedSessions}/{totalSessions} buổi
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{completedSessions}</p>
              <p className="text-gray-600">{userRole === 'learner' ? 'Đã học' : 'Đã dạy'}</p>
              <p className="text-xs text-gray-500 mt-1">{completedSessions} buổi</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {totalSessions - completedSessions}
              </p>
              <p className="text-gray-600">Còn lại</p>
              <p className="text-xs text-gray-500 mt-1">{totalSessions - completedSessions} buổi</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {(moneySoFar / 1000000).toFixed(1)}tr
              </p>
              <p className="text-gray-600">{userRole === 'learner' ? 'Đã chi' : 'Đã thu'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(moneySoFar)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Tiến độ tổng thể</span>
              <span className="font-semibold text-[#257180]">{getProgressPercentage()}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-[#257180] transition-all"
                style={{ width: `${Math.min(Math.max(getProgressPercentage(), 0), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
            >
              Lịch học
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
            >
              Ghi chú
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
            >
              Báo cáo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="border border-gray-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#257180]" />
                      Thông tin chi tiết
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between pb-3 border-b border-[#257180]/20">
                      <div className="flex items-start gap-3">
                        {tutor?.teachingModes !== undefined && EnumHelpers.parseTeachingMode(tutor.teachingModes) === TeachingMode.Online ? (
                          <Video className="w-5 h-5 text-[#257180] mt-0.5" />
                        ) : (
                          <Home className="w-5 h-5 text-[#257180] mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Hình thức giảng dạy</p>
                          <p className="font-medium text-gray-900">
                            {tutor?.teachingModes !== undefined
                              ? EnumHelpers.getTeachingModeLabel(tutor.teachingModes)
                              : 'Chưa cập nhật'}
                          </p>
                          {(tutor?.subDistrict || tutor?.province) && (
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {tutor.subDistrict?.name && tutor.province?.name
                                ? `${tutor.subDistrict.name}, ${tutor.province.name}`
                                : tutor.province?.name || 'Việt Nam'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between pb-3 border-b border-[#257180]/20">
                      <div className="flex items-start gap-3">
                        <Wallet className="w-5 h-5 text-[#257180] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Học phí mỗi buổi</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {formatCurrency(booking.unitPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between pb-3 border-b border-[#257180]/20">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#257180] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Thời gian học</p>
                          <p className="font-medium text-gray-900">
                            Bắt đầu: {startDate ? formatDate(startDate.toISOString()) : 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-[#257180] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tổng số buổi học</p>
                          <p className="font-medium text-gray-900">{totalSessions} buổi</p>
                          <p className="text-xs text-gray-600 mt-1">Tổng cộng {totalSessions} buổi</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-[#257180]" />
                      {userRole === 'learner' ? 'Tổng kết chi phí' : 'Tổng kết thu nhập'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-gray-300">
                      <p className="text-xs text-green-700 mb-1">{userRole === 'learner' ? 'Đã chi' : 'Đã thu'}</p>
                      <p className="text-3xl font-bold text-green-900 mb-2">
                        {formatCurrency(moneySoFar)}
                      </p>
                      <p className="text-xs text-green-700">
                        {completedSessions} buổi ×{' '}
                        {userRole === 'learner'
                          ? formatCurrency(booking.unitPrice)
                          : formatCurrency(totalSessions > 0 ? booking.tutorReceiveAmount / totalSessions : 0)}
                        /buổi
                      </p>
                    </div>

                    <Separator className="border-[#257180]/20" />

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-gray-300">
                      <p className="text-xs text-blue-700 mb-1">Dự kiến còn lại</p>
                      <p className="text-3xl font-bold text-blue-900 mb-2">
                        {formatCurrency(moneyRemaining)}
                      </p>
                      <p className="text-xs text-blue-700">
                        {totalSessions - completedSessions} buổi ×{' '}
                        {userRole === 'learner'
                          ? formatCurrency(booking.unitPrice)
                          : formatCurrency(totalSessions > 0 ? booking.tutorReceiveAmount / totalSessions : 0)}
                        /buổi
                      </p>
                    </div>

                    <Separator className="border-[#257180]/20" />

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Tổng cộng (dự kiến)</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(totalMoney)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border border-gray-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-[#257180]" />
                        Lịch sử buổi học
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                        onClick={() => setActiveTab('schedule')}
                      >
                        Xem tất cả
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loadingSchedules ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-[#257180]" />
                        </div>
                      ) : sortedSchedules.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                          Chưa có buổi học nào
                        </div>
                      ) : (
                        sortedSchedules.slice(0, 8).map((schedule) => {
                          const status = EnumHelpers.parseScheduleStatus(schedule.status);
                          const { start, end, durationMinutes } = getScheduleTimeRange(schedule);
                          const durationLabel =
                            durationMinutes === null
                              ? ''
                              : durationMinutes >= 60
                              ? ` (${Math.round(durationMinutes / 60)}h)`
                              : ` (${durationMinutes}m)`;
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
                            <div
                              key={schedule.id}
                              className={`p-3 rounded-lg border-l-4 ${statusBgColor}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-gray-900">
                                  {start ? format(start, "EEE, dd/MM/yyyy", { locale: vi }) : 'Chưa cập nhật'}
                                </p>
                                {getSessionStatusBadge(schedule.status)}
                              </div>
                              {start && (
                                <p className="text-xs text-gray-600 flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {end
                                    ? `${format(start, 'HH:mm', { locale: vi })} - ${format(end, 'HH:mm', { locale: vi })}${durationLabel}`
                                    : `${format(start, 'HH:mm', { locale: vi })} - ...`}
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="border border-gray-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-[#257180]" />
                      Lịch học tháng {selectedMonth + 1}/{selectedYear}
                    </CardTitle>
                    <p className="text-gray-600">
                      {loadingSchedules
                        ? 'Đang tải danh sách buổi học...'
                        : `Tổng ${schedules.length} buổi (${completedSessions} đã học, ${
                            schedules.filter(s => EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming).length
                          } sắp tới)`}
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
                              return (
                                <div
                                  key={session.id}
                                  className={`text-[10px] px-1 py-0.5 rounded text-center ${getScheduleStatusColor(session.status)}`}
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

                <div className="flex items-center gap-4 flex-wrap mb-6 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span>{userRole === 'learner' ? 'Đã học' : 'Đã dạy'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-500 rounded" />
                    <span>Đang diễn ra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-500 rounded" />
                    <span>Đang xử lý</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded" />
                    <span>Chờ xác nhận</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span>Sắp tới</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span>Đã hủy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#257180] rounded" />
                    <span>Hôm nay</span>
                  </div>
                </div>

                <Separator className="my-6 border-[#257180]/20" />

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Danh sách buổi học
                  </h3>
                  <div className="space-y-3">
                    {sortedSchedules.map((schedule) => {
                      const status = EnumHelpers.parseScheduleStatus(schedule.status);
                      const { start, end, durationMinutes } = getScheduleTimeRange(schedule);
                      const durationLabel =
                        durationMinutes === null
                          ? 'Chưa cập nhật'
                          : durationMinutes >= 60
                          ? `${Math.round(durationMinutes / 60)} giờ`
                          : `${durationMinutes} phút`;
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
                        <Card
                          key={schedule.id}
                          className={`border-l-4 border border-gray-300 ${statusBgColor}`}
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {start ? format(start, "EEE, dd/MM/yyyy", { locale: vi }) : 'Chưa cập nhật'}
                              </h4>
                              {getSessionStatusBadge(schedule.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {start
                                ? `${format(start, 'HH:mm', { locale: vi })} - ${end ? format(end, 'HH:mm', { locale: vi }) : '...'}`
                                : 'Chưa cập nhật'}
                            </p>
                            <p className="text-sm text-gray-600">{durationLabel}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle>Thêm ghi chú mới</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    placeholder={
                      userRole === 'tutor'
                        ? 'Nhập ghi chú về tiến độ học tập của học viên...'
                        : 'Nhập ghi chú về bài học, thắc mắc cần hỏi gia sư...'
                    }
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                  />

                  <div>
                    <Label htmlFor="note-file" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#257180] transition-colors">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Đính kèm ảnh hoặc video</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 tối đa 10MB</p>
                      </div>
                    </Label>
                    <Input
                      id="note-file"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {noteAttachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Tệp đính kèm ({noteAttachments.length})</Label>
                      <div className="space-y-2">
                        {noteAttachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 hover:bg-[#FD8B51] hover:text-white"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAddNote}
                    className="bg-[#257180] hover:bg-[#1f5a66]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Thêm ghi chú
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle>Lịch sử ghi chú (0)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Chưa có ghi chú nào</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle>Danh sách báo cáo (0)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Chưa có báo cáo nào</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border border-gray-300 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              Buổi học vào ngày {selectedDate ? `${selectedDate.day}/${selectedDate.month + 1}/${selectedDate.year}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            {selectedDaySessions.map((session) => {
              const status = EnumHelpers.parseScheduleStatus(session.status);
              const { start, end, durationMinutes } = getScheduleTimeRange(session);
              const durationLabel =
                durationMinutes === null
                  ? 'Chưa cập nhật'
                  : durationMinutes >= 60
                  ? `${Math.round(durationMinutes / 60)} giờ`
                  : `${durationMinutes} phút`;
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
                <Card
                  key={session.id}
                  className={`border-l-4 border border-gray-300 ${statusBgColor}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-900">
                            {start ? format(start, "EEE, dd/MM/yyyy", { locale: vi }) : 'Chưa cập nhật'}
                          </p>
                          {getSessionStatusBadge(session.status)}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {start && end
                                ? `${format(start, 'HH:mm', { locale: vi })} - ${format(end, 'HH:mm', { locale: vi })}`
                                : start
                                ? `${format(start, 'HH:mm', { locale: vi })} - ...`
                                : 'Chưa cập nhật'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>{durationLabel}</span>
                          </div>
                        </div>
                      </div>

                      {status === ScheduleStatus.Upcoming && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 hover:bg-[#FD8B51] hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-gray-300 bg-white hover:bg-red-50"
                          >
                            Hủy
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

