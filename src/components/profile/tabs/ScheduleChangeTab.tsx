"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/basic/badge";
import { Button } from "@/components/ui/basic/button";
import { Loader2 } from "lucide-react";
import { ScheduleStatus, ScheduleChangeRequestStatus } from "@/types/enums";
import { EnumHelpers } from "@/types/enums";
import { useAuth } from "@/hooks/useAuth";
import { useCustomToast } from "@/hooks/useCustomToast";
import { useSchedules } from "@/hooks/useSchedules";
import { useBookings } from "@/hooks/useBookings";
import { useTutorProfiles } from "@/hooks/useTutorProfiles";
import { useScheduleChangeRequests } from "@/hooks/useScheduleChangeRequests";
import { useTutorAvailableSlots } from "@/hooks/useTutorAvailableSlots";
import { ScheduleDto, TutorAvailabilityDto } from "@/types/backend";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { USER_ROLES } from "@/constants";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/form/select";

export function ScheduleChangeTab() {
    const { user } = useAuth();
    const { showError, showWarning, showSuccess } = useCustomToast();
    const {
        schedules,
        loading,
        loadLearnerSchedules,
        loadSchedulesByTutorEmail,
        clearSchedules,
    } = useSchedules();
    const { loadBookingDetails, getBooking } = useBookings();
    const { getTutorProfile, loadTutorProfiles } = useTutorProfiles();
    const {
        create: createScheduleChangeRequest,
        loading: loadingChangeRequest,
        fetchByRequesterEmail,
        fetchByRequestedToEmail,
    } = useScheduleChangeRequests();

    const isTutor = user?.role === USER_ROLES.TUTOR;

    const {
        slots: availableSlotsRaw,
        loadSlots: loadTutorAvailableSlots,
    } = useTutorAvailableSlots();

    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [requestsFromMe, setRequestsFromMe] = useState<any[]>([]);
    const [requestsToMe, setRequestsToMe] = useState<any[]>([]);
    const [view, setView] = useState<'from' | 'to'>('from');
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'
    >('all');
    const [changeDialog, setChangeDialog] = useState<{
        schedule?: ScheduleDto;
        availableSlots: TutorAvailabilityDto[];
        selectedNewAvailabilityId: number | null;
        loading: boolean;
    }>({
        schedule: undefined,
        availableSlots: [],
        selectedNewAvailabilityId: null,
        loading: false,
    });

    // Load upcoming schedules: cho learner (lịch học) hoặc tutor (lịch dạy)
    useEffect(() => {
        if (user?.email) {
            if (isTutor) {
                loadSchedulesByTutorEmail(user.email, { status: ScheduleStatus.Upcoming });
            } else {
                loadLearnerSchedules(user.email, { status: ScheduleStatus.Upcoming });
            }
        } else {
            clearSchedules();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.email, isTutor]);

    // Load danh sách các yêu cầu đổi lịch (tôi gửi / gửi cho tôi)
    useEffect(() => {
        const loadRequests = async () => {
            if (!user?.email) {
                setRequestsFromMe([]);
                setRequestsToMe([]);
                return;
            }
            setLoadingRequests(true);
            try {
                const [fromMe, toMe] = await Promise.all([
                    fetchByRequesterEmail(user.email),
                    fetchByRequestedToEmail(user.email),
                ]);
                setRequestsFromMe(fromMe);
                setRequestsToMe(toMe);
            } catch (err) {
                // errors already handled inside hooks
            } finally {
                setLoadingRequests(false);
            }
        };
        loadRequests();
    }, [user?.email, fetchByRequesterEmail, fetchByRequestedToEmail]);

    // Load booking details cho các schedules (để lấy tutorSubject, tutorEmail, ...)
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

    // Load tutor profiles để hiển thị thông tin gia sư
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

    const buildKeyFromAvailability = (av?: TutorAvailabilityDto | null) => {
        if (!av?.startDate) return "";
        const date = av.startDate.includes("T") ? av.startDate.split("T")[0] : av.startDate;
        const hour =
            av.slot?.startTime?.split(":")[0]?.padStart(2, "0") ||
            (av.startDate.includes("T")
                ? av.startDate.split("T")[1]?.split(":")[0]?.padStart(2, "0")
                : "");
        return `${date}-${hour}`;
    };

    const buildKeyFromSchedule = (sch?: ScheduleDto) => {
        const av = sch?.availability;
        if (!av?.startDate) return "";
        const date = av.startDate.includes("T") ? av.startDate.split("T")[0] : av.startDate;
        const hour =
            av.slot?.startTime?.split(":")[0]?.padStart(2, "0") ||
            (av.startDate.includes("T")
                ? av.startDate.split("T")[1]?.split(":")[0]?.padStart(2, "0")
                : "");
        return `${date}-${hour}`;
    };

    const loadChangeDialogData = useCallback(
        async (schedule: ScheduleDto) => {
            if (!user?.email) {
                showWarning("Vui lòng đăng nhập", "Bạn cần đăng nhập để yêu cầu đổi lịch.");
                return;
            }

            const booking = getBooking(schedule.bookingId, schedule.booking);
            const tutorSubject = booking?.tutorSubject;
            const tutor = tutorSubject?.tutor;
            const tutorId = tutor?.id;
            const tutorEmail = tutorSubject?.tutorEmail;

            if (!tutorId || !tutorEmail) {
                showError("Không tìm thấy thông tin gia sư cho buổi học này.");
                return;
            }

            setSelectedScheduleId(schedule.id);
            setChangeDialog({
                schedule,
                availableSlots: [],
                selectedNewAvailabilityId: null,
                loading: true,
            });

            try {
                const slotRes = await loadTutorAvailableSlots(tutorId);
                // Tính các khung giờ learner đã bận (từ tất cả schedules Upcoming, trừ chính schedule đang đổi)
                const busyKeys = new Set<string>();
                schedules
                    .filter(
                        (s) =>
                            EnumHelpers.parseScheduleStatus(s.status) === ScheduleStatus.Upcoming &&
                            s.id !== schedule.id
                    )
                    .forEach((s) => {
                        const key = buildKeyFromSchedule(s);
                        if (key) busyKeys.add(key);
                    });

                const now = new Date();
                const cutoff = now.getTime() + 24 * 60 * 60 * 1000; // 24h

                const availableSlots = slotRes.filter((av) => {
                    if (!av.startDate) return false;
                    const start = new Date(av.startDate);
                    if (start.getTime() < cutoff) return false; // chỉ cho chuyển cách 24h
                    const key = buildKeyFromAvailability(av);
                    if (busyKeys.has(key)) return false; // không trùng lịch học khác của learner
                    return true;
                });

                if (availableSlots.length === 0) {
                    showWarning(
                        "Không còn slot phù hợp",
                        "Không tìm thấy lịch rảnh thỏa điều kiện (>=24h, không trùng lịch bạn)."
                    );
                }

                setChangeDialog({
                    schedule,
                    availableSlots,
                    selectedNewAvailabilityId: availableSlots[0]?.id ?? null,
                    loading: false,
                });
            } catch (err: any) {
                showError("Lỗi khi tải lịch rảnh", err.message || "Vui lòng thử lại sau.");
                setChangeDialog((prev) => ({ ...prev, loading: false }));
            }
        },
        [getBooking, schedules, showError, showWarning, user?.email]
    );

    const handleSubmitChangeRequest = useCallback(async () => {
        const dialog = changeDialog;
        if (!dialog.schedule || !dialog.selectedNewAvailabilityId || !user?.email) {
            showWarning("Thiếu thông tin", "Vui lòng chọn một lịch mới trước khi gửi yêu cầu.");
            return;
        }

        const booking = getBooking(dialog.schedule.bookingId, dialog.schedule.booking);
        const tutorEmail = booking?.tutorSubject?.tutorEmail;
        const learnerEmail = booking?.learnerEmail;

        // Learner gửi -> gửi cho gia sư | Tutor gửi -> gửi cho học viên
        const requestedToEmail = !isTutor ? tutorEmail : learnerEmail;

        if (!requestedToEmail) {
            showError(
                "Không tìm thấy người nhận yêu cầu",
                !isTutor ? "Không tìm thấy email gia sư cho buổi học này."
                    : "Không tìm thấy email học viên cho buổi học này."
            );
            return;
        }

        const payload = {
            scheduleId: dialog.schedule.id,
            requesterEmail: user.email,
            requestedToEmail,
            oldAvailabilitiId: dialog.schedule.availabilitiId,
            newAvailabilitiId: dialog.selectedNewAvailabilityId,
            reason: undefined,
        };

        const res = await createScheduleChangeRequest(payload);
        if (res) {
            showSuccess("Đã gửi yêu cầu chuyển lịch thành công");
            // Sau khi tạo yêu cầu, có thể reload danh sách lịch để cập nhật
            if (user.email) {
                loadLearnerSchedules(user.email, { status: ScheduleStatus.Upcoming });
            }
            setSelectedScheduleId(null);
            setChangeDialog({
                schedule: undefined,
                availableSlots: [],
                selectedNewAvailabilityId: null,
                loading: false,
            });
        }
    }, [
        changeDialog,
        createScheduleChangeRequest,
        getBooking,
        loadLearnerSchedules,
        showError,
        showSuccess,
        showWarning,
        user?.email,
    ]);

    const getScheduleStatusColor = (status: ScheduleStatus | string) => {
        const parsedStatus = EnumHelpers.parseScheduleStatus(status);
        switch (parsedStatus) {
            case ScheduleStatus.Upcoming:
                return "bg-blue-100 text-blue-800 border-blue-200";
            case ScheduleStatus.InProgress:
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case ScheduleStatus.Completed:
                return "bg-green-100 text-green-800 border-green-200";
            case ScheduleStatus.Cancelled:
                return "bg-red-100 text-red-800 border-red-200";
            case ScheduleStatus.Absent:
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const filterByStatus = useCallback(
        (items: any[]): any[] => {
            if (statusFilter === 'all') return items;
            let target: ScheduleChangeRequestStatus | null = null;
            switch (statusFilter) {
                case 'pending':
                    target = ScheduleChangeRequestStatus.Pending;
                    break;
                case 'approved':
                    target = ScheduleChangeRequestStatus.Approved;
                    break;
                case 'rejected':
                    target = ScheduleChangeRequestStatus.Rejected;
                    break;
                case 'cancelled':
                    target = ScheduleChangeRequestStatus.Cancelled;
                    break;
            }
            if (target === null) return items;
            return items.filter((item) => {
                const parsed = EnumHelpers.parseScheduleChangeRequestStatus(
                    item.status
                );
                return parsed === target;
            });
        },
        [statusFilter]
    );

    const filteredFromMe = useMemo(
        () => filterByStatus(requestsFromMe),
        [requestsFromMe, filterByStatus]
    );

    const filteredToMe = useMemo(
        () => filterByStatus(requestsToMe),
        [requestsToMe, filterByStatus]
    );

    const renderRequestRows = (items: any[]) => {
        if (!items || items.length === 0) {
            return (
                <tr className="border-b border-gray-100">
                    <td colSpan={7} className="py-4 text-center text-gray-600 text-sm">
                        Không có yêu cầu
                    </td>
                </tr>
            );
        }
        return items.map((item) => {
            const schedule = item.schedule as ScheduleDto | undefined;
            const av = schedule?.availability;
            const startDate = av?.startDate ? new Date(av.startDate) : null;
            const slot = av?.slot;
            const booking = schedule?.booking;
            const tutorSubject = booking?.tutorSubject;
            const subject = tutorSubject?.subject;
            const level = tutorSubject?.level;
            const statusLabel = EnumHelpers.getScheduleChangeRequestStatusLabel?.(item.status) ?? item.status;

            return (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm text-gray-700">#{item.id}</td>
                    <td className="py-2 px-3 text-sm text-gray-900 font-medium">
                        {subject?.subjectName || 'Môn học'}
                        {level?.name ? ` - ${level.name}` : ''}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700">
                        {tutorSubject?.tutorEmail || booking?.learnerEmail || 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700">
                        {startDate
                            ? `${format(startDate, "dd/MM/yyyy", { locale: vi })} ${slot?.startTime?.slice(0, 5) || ''} - ${slot?.endTime?.slice(0, 5) || ''}`
                            : 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700">
                        {item.createdAt ? format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-sm">
                        <Badge className="bg-slate-100 text-gray-800 border-slate-200">{statusLabel}</Badge>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                            Gửi: {item.requesterEmail}
                        </div>
                        <div className="text-xs text-gray-500">
                            Nhận: {item.requestedToEmail}
                        </div>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900">Yêu cầu chuyển lịch</h2>
                <p className="text-gray-600 mt-1">
                    Quản lý các đơn chuyển lịch bạn đã gửi và nhận.
                </p>
            </div>

            {/* Chọn loại đơn + lọc trạng thái + tạo mới */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                    <Button
                        variant={view === 'from' ? 'default' : 'outline'}
                        className={
                            view === 'from'
                                ? 'bg-[#257180] text-white hover:bg-[#1f616f]'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                        onClick={() => setView('from')}
                    >
                        Đơn của bạn
                    </Button>
                    <Button
                        variant={view === 'to' ? 'default' : 'outline'}
                        className={
                            view === 'to'
                                ? 'bg-[#257180] text-white hover:bg-[#1f616f]'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                        onClick={() => setView('to')}
                    >
                        Đơn đến bạn
                    </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <Select
                        value={statusFilter}
                        onValueChange={(val) =>
                            setStatusFilter(val as typeof statusFilter)
                        }
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="approved">Đã chấp nhận</SelectItem>
                            <SelectItem value="rejected">Đã từ chối</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Danh sách yêu cầu theo lựa chọn */}
            <Card className="border border-[#257180]/20 bg-white">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">
                            {view === 'from' ? 'Đơn của bạn' : 'Đơn đến bạn'}
                        </div>
                        {loadingRequests && <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />}
                    </div>
                    <div className="overflow-x-auto border border-gray-100 rounded-md">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="py-2 px-3 text-left">ID</th>
                                    <th className="py-2 px-3 text-left">Môn học</th>
                                    <th className="py-2 px-3 text-left">Đối tác</th>
                                    <th className="py-2 px-3 text-left">Lịch cũ</th>
                                    <th className="py-2 px-3 text-left">Ngày tạo</th>
                                    <th className="py-2 px-3 text-left">Trạng thái</th>
                                    <th className="py-2 px-3 text-left">Gửi / Nhận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {view === 'from'
                                    ? renderRequestRows(filteredFromMe)
                                    : renderRequestRows(filteredToMe)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}


