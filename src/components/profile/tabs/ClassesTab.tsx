"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  GraduationCap,
  Loader2,
  MapPin,
  Medal,
  MessageCircle,
  Star,
  Video,
  CheckCircle,
  XCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/basic/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/basic/avatar";
import { Button } from "@/components/ui/basic/button";
import { Progress } from "@/components/ui/feedback/progress";
import { Separator } from "@/components/ui/layout/separator";
import { Label } from "@/components/ui/form/label";

import { useAuth } from "@/hooks/useAuth";
import { useCustomToast } from "@/hooks/useCustomToast";
import { useTutorProfiles } from "@/hooks/useTutorProfiles";
import { useBookings } from "@/hooks/useBookings";
import { useChatContext } from "@/contexts/ChatContext";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";

import { BookingDto, TutorProfileDto, TutorFeedbackDto, TutorRatingSummary } from "@/types/backend";
import { BookingStatus, PaymentStatus, TeachingMode, ScheduleStatus } from "@/types/enums";
import { EnumHelpers } from "@/types/enums";
import { FeedbackService, ScheduleService } from "@/services";

type FilterValue = "all" | "active" | "pending" | "completed" | "cancelled";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const getBookingStatusBadge = (status: BookingStatus | string) => {
  const parsed = EnumHelpers.parseBookingStatus(status);
  switch (parsed) {
    case BookingStatus.Pending:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case BookingStatus.Confirmed:
      return "bg-green-100 text-green-800 border-green-200";
    case BookingStatus.Completed:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case BookingStatus.Cancelled:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPaymentStatusBadge = (status: PaymentStatus | string) => {
  const parsed = EnumHelpers.parsePaymentStatus(status);
  switch (parsed) {
    case PaymentStatus.Pending:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case PaymentStatus.Paid:
      return "bg-green-100 text-green-800 border-green-200";
    case PaymentStatus.Refunded:
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const NextSessionDisplay = ({ booking }: { booking: BookingDto }) => {
  const [nextSessionDate, setNextSessionDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextSession = async () => {
      const tutorEmail = booking.tutorSubject?.tutorEmail;
      const bookingId = booking.id;

      if (!tutorEmail || !bookingId) {
        setLoading(false);
        return;
      }

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
          }
        }
      } catch (error) {
        console.error("Error fetching next session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextSession();
  }, [booking.id, booking.tutorSubject?.tutorEmail]);

  if (loading) {
    return (
      <p className="text-sm text-gray-600">Đang tải...</p>
    );
  }

  if (!nextSessionDate) {
    return (
      <p className="text-sm text-gray-600">
        Chưa có buổi học sắp tới.
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

export function ClassesTab() {
  const { user } = useAuth();
  const { isAuthenticated } = useAuthContext();
  const { openChatWithTutor } = useChatContext();
  const { showError, showWarning } = useCustomToast();
  const router = useRouter();

  const {
    bookings,
    loading,
    loadLearnerBookings,
  } = useBookings();

  const { loadTutorProfiles, getTutorProfile } = useTutorProfiles();

  const [allBookings, setAllBookings] = useState<BookingDto[]>([]);
  const [filter, setFilter] = useState<FilterValue>("active");
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);
  const [feedback, setFeedback] = useState<TutorFeedbackDto | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [tutorRatings, setTutorRatings] = useState<Map<number, TutorRatingSummary>>(new Map());

  // Load bookings learner
  useEffect(() => {
    if (user?.email) {
      loadLearnerBookings(user.email);
    }
  }, [user?.email, loadLearnerBookings]);

  useEffect(() => {
    setAllBookings(bookings);
  }, [bookings]);

  // Preload tutor profiles cho list
  useEffect(() => {
    const emails = Array.from(
      new Set(
        allBookings
          .map((b) => b.tutorSubject?.tutorEmail)
          .filter((e): e is string => Boolean(e))
      )
    );
    if (emails.length > 0) {
      loadTutorProfiles(emails);
    }
  }, [allBookings, loadTutorProfiles]);

  // Load rating summary cho các tutor trong danh sách lớp
  useEffect(() => {
    const loadRatings = async () => {
      const tutorIds = Array.from(
        new Set(
          allBookings
            .map((b) => b.tutorSubject?.tutorId)
            .filter((id): id is number => typeof id === "number")
        )
      );

      if (tutorIds.length === 0) {
        setTutorRatings(new Map());
        return;
      }

      try {
        const ratingPromises = tutorIds.map(async (id) => {
          try {
            const res = await FeedbackService.getTutorRatingSummary(id);
            if (res.success && res.data) {
              return { tutorId: id, rating: res.data };
            }
          } catch (err) {
            console.error(`Error loading rating for tutor ${id}:`, err);
          }
          return null;
        });

        const results = await Promise.all(ratingPromises);
        const ratingMap = new Map<number, TutorRatingSummary>();
        results.forEach((r) => {
          if (r) {
            ratingMap.set(r.tutorId, r.rating);
          }
        });
        setTutorRatings(ratingMap);
      } catch (err) {
        console.error("Error loading tutor ratings for classes:", err);
        setTutorRatings(new Map());
      }
    };

    loadRatings();
  }, [allBookings]);

  const bookingCounts = useMemo(() => {
    const parse = (b: BookingDto) => EnumHelpers.parseBookingStatus(b.status);
    const completedSessions = (b: BookingDto) =>
      (b.schedules || []).filter(
        (s) => EnumHelpers.parseScheduleStatus(s.status) === 2 // Completed
      ).length;

    const totalCompletedSessions = allBookings.reduce(
      (sum, b) => sum + completedSessions(b),
      0
    );

    const upcomingSessions = allBookings.reduce((sum, b) => {
      const upcoming = (b.schedules || []).filter(
        (s) => EnumHelpers.parseScheduleStatus(s.status) === 0 // Upcoming
      ).length;
      return sum + upcoming;
    }, 0);

    return {
      all: allBookings.length,
      active: allBookings.filter(
        (b) =>
          parse(b) === BookingStatus.Confirmed &&
          completedSessions(b) < b.totalSessions
      ).length,
      pending: allBookings.filter(
        (b) => parse(b) === BookingStatus.Pending
      ).length,
      completed: allBookings.filter(
        (b) =>
          parse(b) === BookingStatus.Confirmed &&
          completedSessions(b) === b.totalSessions
      ).length,
      cancelled: allBookings.filter(
        (b) => parse(b) === BookingStatus.Cancelled
      ).length,
      totalCompletedSessions,
      upcomingSessions,
    };
  }, [allBookings]);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const status = EnumHelpers.parseBookingStatus(b.status);
      if (filter === "all") return true;
      if (filter === "active") return status === BookingStatus.Confirmed;
      if (filter === "pending") return status === BookingStatus.Pending;
      if (filter === "completed") return status === BookingStatus.Completed;
      if (filter === "cancelled") return status === BookingStatus.Cancelled;
      return true;
    });
  }, [allBookings, filter]);

  const handleViewDetail = (booking: BookingDto) => {
    setSelectedBooking(booking);
    setFeedback(null);
  };

  const handleBackToList = () => {
    setSelectedBooking(null);
    setFeedback(null);
  };

  const handleOpenChat = async (
    tutor: TutorProfileDto | undefined,
    booking: BookingDto
  ) => {
    const tutorSubject = booking.tutorSubject;
    const tutorId = tutorSubject?.tutorId;
    const tutorEmail = tutorSubject?.tutorEmail || tutor?.userEmail;

    if (!tutorId || !tutorEmail) {
      showError("Lỗi", "Không tìm thấy thông tin gia sư để nhắn tin.");
      return;
    }

    if (!isAuthenticated) {
      showWarning("Vui lòng đăng nhập", "Bạn cần đăng nhập để nhắn tin với gia sư.");
      router.push("/login");
      return;
    }

    await openChatWithTutor(
      tutorId,
      tutorEmail,
      tutor?.userName,
      tutor?.avatarUrl
    );
  };

  // Load feedback khi vào detail
  useEffect(() => {
    const load = async () => {
      if (!selectedBooking || !user?.email) return;
      setLoadingFeedback(true);
      try {
        const res = await FeedbackService.getFeedbackByLearner(user.email);
        if (res.success && res.data) {
          const fb =
            res.data.find((f) => f.bookingId === selectedBooking.id) || null;
          setFeedback(fb);
        }
      } catch (err) {
        console.error("Error loading feedback:", err);
      } finally {
        setLoadingFeedback(false);
      }
    };
    load();
  }, [selectedBooking, user?.email]);

  // ========= DETAIL VIEW =========
  if (selectedBooking) {
    const tutorSubject = selectedBooking.tutorSubject;
    const subject = tutorSubject?.subject;
    const level = tutorSubject?.level;
    const tutorEmail = tutorSubject?.tutorEmail;
    const tutor = tutorEmail ? getTutorProfile(tutorEmail) : tutorSubject?.tutor;

    const schedules = selectedBooking.schedules || [];
    const totalSessions = selectedBooking.totalSessions;
    const completedSessions = schedules.filter(
      (s) => EnumHelpers.parseScheduleStatus(s.status) === 2
    ).length;
    const progress = totalSessions
      ? (completedSessions / totalSessions) * 100
      : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToList}
            className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
          >
            <Clock className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        {/* Thông tin lớp + gia sư */}
        <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex gap-4 flex-1">
                <Avatar className="h-16 w-16 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] shadow-sm">
                  <AvatarImage
                    src={tutor?.avatarUrl}
                    alt={tutor?.userName || "Gia sư"}
                    className="object-cover rounded-lg"
                  />
                  <AvatarFallback className="rounded-lg font-semibold">
                    {tutor?.userName
                      ? tutor.userName
                          .split(" ")
                          .slice(-2)
                          .map((n) => n[0])
                          .join("")
                      : "GS"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {subject?.subjectName || "Môn học"}
                        </h3>
                        {level && (
                          <Badge variant="outline" className="text-sm border-gray-300">
                            {level.name}
                          </Badge>
                        )}
                        <Badge className={getPaymentStatusBadge(selectedBooking.paymentStatus)}>
                          {EnumHelpers.getPaymentStatusLabel(selectedBooking.paymentStatus)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Gia sư: {tutor?.userName || "Chưa có thông tin"}
                      </p>
                    </div>
                    <Badge className={getBookingStatusBadge(selectedBooking.status)}>
                      {EnumHelpers.getBookingStatusLabel(selectedBooking.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-lg border border-gray-300 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-gray-500">Môn học</p>
                <p className="text-sm font-semibold text-gray-900">
                  {subject?.subjectName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Cấp độ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {level?.name || "Không xác định"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Số buổi</p>
                <p className="text-sm font-semibold text-gray-900">
                  {completedSessions}/{totalSessions} buổi
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Tiến độ</p>
                <Progress value={progress} className="h-2 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danh sách buổi học (rút gọn) */}
        <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>Danh sách buổi học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {schedules.length === 0 ? (
              <p className="text-gray-600 text-sm">Chưa có buổi học nào.</p>
            ) : (
              schedules
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.availability?.startDate || 0).getTime() -
                    new Date(b.availability?.startDate || 0).getTime()
                )
                .map((s) => {
                  const start = s.availability?.startDate
                    ? new Date(s.availability.startDate)
                    : null;
                  const statusLabel = EnumHelpers.getScheduleStatusLabel(s.status);
                  const parsedStatus = EnumHelpers.parseScheduleStatus(s.status);
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 shadow-sm">
                          <Calendar className="h-5 w-5 text-[#257180]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {start
                              ? start.toLocaleDateString("vi-VN", {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "2-digit",
                                })
                              : "Chưa cập nhật"}
                          </p>
                          <p className="text-xs text-gray-600">
                            Trạng thái: {statusLabel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {parsedStatus === 2 && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {parsedStatus === 3 && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        {/* Đánh giá */}
        <Card className="bg-white border border-gray-300 transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>Đánh giá của bạn về lớp học</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFeedback ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-[#257180]" />
              </div>
            ) : feedback ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(feedback.overallRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {feedback.overallRating.toFixed(1)}
                  </span>
                </div>
                {feedback.comment && (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {feedback.comment}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Bạn chưa tạo đánh giá cho lớp học này.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Học vấn & Chứng chỉ */}
        {tutor && (tutor.tutorEducations?.length || 0) > 0 && (
          <Card className="border border-gray-300 bg-white transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Học vấn của gia sư</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tutor.tutorEducations!.map((edu) => (
                <div key={edu.id} className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">{edu.institution?.name || "Education"}</p>
                    <p className="text-sm text-gray-500">
                      {edu.issueDate ? new Date(edu.issueDate).getFullYear() : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {tutor && (tutor.tutorCertificates?.length || 0) > 0 && (
          <Card className="border border-gray-300 bg-white transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Chứng chỉ của gia sư</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tutor.tutorCertificates!.map((cert) => (
                <div key={cert.id} className="flex items-start gap-2 justify-between">
                  <div className="flex items-start gap-2">
                    <Medal className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                    <div>
                      <span className="text-gray-700">
                        {cert.certificateType?.name || "Certificate"}
                      </span>
                      {cert.certificateType?.code && (
                        <p className="text-xs text-gray-500">
                          {cert.certificateType.code}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {cert.issueDate ? new Date(cert.issueDate).getFullYear() : "N/A"}
                        {cert.expiryDate && (
                          <span>
                            {" "}
                            - {new Date(cert.expiryDate).getFullYear()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ========= LIST VIEW =========

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Lớp học của tôi</h2>
        <p className="text-gray-600 mt-1">
          Quản lý và theo dõi tiến độ các lớp học của bạn
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
                <p className="text-sm text-gray-600">Đang học</p>
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
                <CheckCircle className="w-5 h-5 text-green-600" />
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
                <CalendarDays className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Buổi đã học</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingCounts.totalCompletedSessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300 bg-white transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Buổi sắp tới</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingCounts.upcomingSessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter trạng thái giống Mockups (điều chỉnh default = Đang học) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Trạng thái lớp học:</span>
          <span className="text-gray-800">
            {filter === "all"
              ? "Tất cả"
              : filter === "active"
              ? "Đang học"
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
            Đang học ({bookingCounts.active})
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
          {filteredBookings.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Không có lớp học nào</p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const tutorSubject = booking.tutorSubject;
              const tutorEmail = tutorSubject?.tutorEmail;
              const tutor = tutorEmail
                ? getTutorProfile(tutorEmail)
                : tutorSubject?.tutor;
              const subject = tutorSubject?.subject;
              const level = tutorSubject?.level;
              const tutorId = tutorSubject?.tutorId;
              const ratingSummary = tutorId ? tutorRatings.get(tutorId) : undefined;
              const schedules = booking.schedules || [];
              const completedSessionsForHeader = schedules.filter(
                (s) => EnumHelpers.parseScheduleStatus(s.status) === 4 // ScheduleStatus.Completed
              ).length;

              return (
                <Card
                  key={booking.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-gray-300"
                >
                  {/* Header gradient giống mockup */}
                  <div className="bg-gradient-to-r from-[#257180] to-[#1f5a66] px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-2">
                          {subject?.subjectName || "Môn học"}
                          {level ? ` - ${level.name}` : ""}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Trạng thái lớp học theo booking.status */}
                          <Badge className={getBookingStatusBadge(booking.status)}>
                            {EnumHelpers.getBookingStatusLabel(booking.status)}
                          </Badge>
                          {/* Số buổi đã học / tổng số buổi */}
                          <Badge
                            variant="outline"
                            className="bg-white/10 text-white border-white/20"
                          >
                            {completedSessionsForHeader}/{booking.totalSessions} buổi học
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Tutor section */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-4 h-4 text-[#257180]" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Thông tin gia sư
                          </span>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Avatar className="h-16 w-16 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] shadow-sm">
                            <AvatarImage
                              src={tutor?.avatarUrl}
                              alt={tutor?.userName || "Gia sư"}
                              className="object-cover rounded-lg"
                            />
                            <AvatarFallback className="rounded-lg font-semibold">
                              {tutor?.userName
                                ? tutor.userName
                                    .split(" ")
                                    .slice(-2)
                                    .map((n) => n[0])
                                    .join("")
                                : "GS"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xl font-semibold text-gray-900 mb-2">
                                {tutor?.userName || "Gia sư"}
                              </p>
                              <div className="space-y-1.5">
                                {/* Vote / rating giống tutor detail */}
                                <div className="flex items-center gap-2 text-sm">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                  <span className="font-medium text-gray-900">
                                    {ratingSummary
                                      ? ratingSummary.averageRating.toFixed(1)
                                      : "0.0"}
                                  </span>
                                  <span className="text-gray-500">
                                    ({ratingSummary?.totalFeedbackCount ?? 0} đánh giá)
                                  </span>
                                </div>
                                {tutor?.tutorEducations &&
                                  tutor.tutorEducations.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                      <Separator
                                        orientation="vertical"
                                        className="h-4 border-[#257180]/20"
                                      />
                                      <div className="flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 text-[#257180]" />
                                        <span className="line-clamp-1">
                                          {tutor.tutorEducations[0].institution?.name ||
                                            "Chưa cập nhật học vấn"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="flex flex-col justify-center md:items-end">
                              <Label className="text-xs text-gray-500 mb-1">Học phí</Label>
                              <p className="text-2xl font-semibold text-[#257180] mb-2">
                                {formatCurrency(booking.unitPrice)}
                                <span className="text-sm font-normal text-gray-500">
                                  /buổi
                                </span>
                              </p>
                              {tutorSubject?.tutorId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                                  onClick={() =>
                                    router.push(`/tutor/${tutorSubject.tutorId}`)
                                  }
                                >
                                  Xem hồ sơ
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Thông tin lớp học (theo mockup) */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-[#257180]" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Thông tin lớp học
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Hình thức */}
                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              {tutor?.teachingModes === TeachingMode.Online ? (
                                <Video className="w-5 h-5 text-[#257180]" />
                              ) : (
                                <MapPin className="w-5 h-5 text-[#257180]" />
                              )}
                              <span className="text-xs text-gray-500">Hình thức</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {tutor?.teachingModes !== undefined
                                ? EnumHelpers.getTeachingModeLabel(tutor.teachingModes)
                                : "Chưa cập nhật"}
                            </p>
                            {(tutor?.subDistrict || tutor?.province) && (
                              <div className="flex items-start gap-1.5 mt-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {tutor.subDistrict?.name && tutor.province?.name
                                    ? `${tutor.subDistrict.name}, ${tutor.province.name}`
                                    : tutor.province?.name || "Việt Nam"}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Thời gian (bắt đầu / kết thúc) */}
                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-[#257180]" />
                              <span className="text-xs text-gray-500">Thời gian</span>
                            </div>
                            {(() => {
                              const schedules = (booking.schedules || []).filter(
                                (s) => s.availability?.startDate
                              );

                              if (schedules.length === 0) {
                                return (
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">Bắt đầu:</span>{" "}
                                    Chưa cập nhật
                                  </p>
                                );
                              }

                              // Lấy schedule đầu tiên theo thời gian bắt đầu
                              const sorted = [...schedules].sort(
                                (a, b) =>
                                  new Date(a.availability!.startDate).getTime() -
                                  new Date(b.availability!.startDate).getTime()
                              );
                              const first = sorted[0];

                              const start = new Date(first.availability!.startDate);
                              const slot = first.availability?.slot;
                              if (slot?.startTime) {
                                const [h, m] = slot.startTime.split(":").map(Number);
                                start.setHours(h, m, 0, 0);
                              }

                              const startDate = start.toLocaleDateString("vi-VN");
                              const startTime = start.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              });

                              const datesOnly = sorted
                                .map((s) => new Date(s.availability!.startDate))
                                .sort((a, b) => a.getTime() - b.getTime());

                              const endDate =
                                datesOnly.length > 1
                                  ? datesOnly[datesOnly.length - 1].toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : null;

                              return (
                                <>
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">Bắt đầu:</span>{" "}
                                    {startDate} lúc {startTime}
                                  </p>
                                  {endDate && (
                                    <p className="text-sm text-gray-900 mt-1">
                                      <span className="font-medium">Kết thúc:</span>{" "}
                                      {endDate}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          {/* Tổng chi phí */}
                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Wallet className="w-5 h-5 text-[#257180]" />
                              <span className="text-xs text-gray-500">Tổng chi phí</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(booking.totalAmount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {booking.totalSessions} buổi
                            </p>
                          </div>

                          {/* Tiến độ */}
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-blue-600" />
                              <span className="text-xs text-blue-700 font-medium">
                                Tiến độ học tập
                              </span>
                            </div>
                            {(() => {
                              const schedules = booking.schedules || [];
                              const completed = schedules.filter(
                                (s) =>
                                  EnumHelpers.parseScheduleStatus(s.status) ===
                                  2 // Completed
                              ).length;
                              const total = booking.totalSessions;
                              const remaining = Math.max(total - completed, 0);
                              const percent =
                                total > 0
                                  ? Math.round((completed / total) * 100)
                                  : 0;

                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">
                                      {completed}/{total}
                                    </span>
                                    <span className="text-sm font-medium text-blue-700">
                                      {percent}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={percent}
                                    className="h-2.5 bg-white"
                                  />
                                  <p className="text-xs text-gray-600">
                                    Còn {remaining} buổi học
                                  </p>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Buổi học tiếp theo */}
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-green-600" />
                              <span className="text-xs text-green-700 font-medium">
                                Buổi học tiếp theo
                              </span>
                            </div>
                            <NextSessionDisplay booking={booking} />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-[#257180]/20">
                        <Button
                          className="flex-1 bg-[#257180] hover:bg-[#1f5a66] text-white"
                          onClick={() => handleViewDetail(booking)}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Xem chi tiết lớp học
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                          onClick={() => handleOpenChat(tutor, booking)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Nhắn tin với gia sư
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
      </div>
    </div>
  );
}