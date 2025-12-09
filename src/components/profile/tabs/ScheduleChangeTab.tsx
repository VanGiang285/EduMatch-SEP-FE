"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/basic/badge";
import { Button } from "@/components/ui/basic/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/feedback/dialog";
import { Loader2 } from "lucide-react";
import { ScheduleStatus, ScheduleChangeRequestStatus } from "@/types/enums";
import { EnumHelpers } from "@/types/enums";
import { useAuth } from "@/hooks/useAuth";
import { useCustomToast } from "@/hooks/useCustomToast";
import { useSchedules } from "@/hooks/useSchedules";
import { useBookings } from "@/hooks/useBookings";
import { useTutorProfiles } from "@/hooks/useTutorProfiles";
import { useScheduleChangeRequests } from "@/hooks/useScheduleChangeRequests";
import { ScheduleDto } from "@/types/backend";
import { format, addHours } from "date-fns";
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
        loading: loadingChangeRequest,
        fetchByRequesterEmail,
        fetchByRequestedToEmail,
        updateStatus,
        fetchById,
    } = useScheduleChangeRequests();

    const isTutor = user?.role === USER_ROLES.TUTOR;

    const [loadingRequests, setLoadingRequests] = useState(false);
    const [requestsFromMe, setRequestsFromMe] = useState<any[]>([]);
    const [requestsToMe, setRequestsToMe] = useState<any[]>([]);
    const [view, setView] = useState<'from' | 'to'>('from');
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'
    >('all');
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        requestId?: number;
        action?: 'approve' | 'reject';
    }>({ open: false });

    const loadMissingSchedules = useCallback(
        async (list: any[]) => {
            const results = await Promise.all(
                list.map(async (item) => {
                    if (item.schedule) return item;
                    const full = await fetchById(item.id);
                    if (full && full.schedule) {
                        return { ...item, schedule: full.schedule };
                    }
                    return item;
                })
            );
            return results;
        },
        [fetchById]
    );
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
                const [fromMeRaw, toMeRaw] = await Promise.all([
                    fetchByRequesterEmail(user.email),
                    fetchByRequestedToEmail(user.email),
                ]);
                const [fromMe, toMe] = await Promise.all([
                    loadMissingSchedules(fromMeRaw),
                    loadMissingSchedules(toMeRaw),
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
    }, [user?.email, fetchByRequesterEmail, fetchByRequestedToEmail, loadMissingSchedules]);

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


    // Màu cho trạng thái ScheduleChangeRequest
    const getChangeRequestStatusColor = (status: ScheduleChangeRequestStatus | string) => {
        const parsed = EnumHelpers.parseScheduleChangeRequestStatus(status);
        switch (parsed) {
            case ScheduleChangeRequestStatus.Pending:
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case ScheduleChangeRequestStatus.Approved:
                return "bg-green-100 text-green-800 border-green-200";
            case ScheduleChangeRequestStatus.Rejected:
                return "bg-red-100 text-red-800 border-red-200";
            case ScheduleChangeRequestStatus.Cancelled:
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

    const renderRequestRows = (items: any[], isIncoming: boolean) => {
        if (!items || items.length === 0) {
            return (
                <tr className="border-b border-gray-100">
                    <td colSpan={7} className="py-4 text-center text-gray-600 text-sm">
                        Không có yêu cầu
                    </td>
                </tr>
            );
        }
        const sortedItems = [...items].sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime; // tăng dần theo thời gian tạo
        });

        return sortedItems.map((item) => {
            const schedule = item.schedule as ScheduleDto | undefined;
            const oldAv = item.oldAvailability;
            const newAv = item.newAvailability;
            const slot = oldAv?.slot;
            const booking = getBooking(schedule?.bookingId, schedule?.booking);
            const tutorSubject = booking?.tutorSubject;
            const subject = tutorSubject?.subject;
            const level = tutorSubject?.level;
            const statusLabel = EnumHelpers.getScheduleChangeRequestStatusLabel?.(item.status) ?? item.status;
            return (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm text-gray-700">{item.id}</td>
                    <td className="py-2 px-3 text-sm text-gray-900 font-medium">
                        <div className="flex flex-col gap-1">
                            <div>
                                {subject?.subjectName || 'Môn học'}

                            </div>
                        </div>
                    </td>

                    <td className="py-2 px-3 text-sm text-gray-700">
                        <div className="flex flex-col gap-1">
                            <div>
                                <span className="font-semibold">Cũ:</span>{" "}
                                {oldAv?.startDate
                                    ? `${format(new Date(oldAv.startDate), "dd/MM/yyyy", { locale: vi })}\n${oldAv?.slot?.startTime?.slice(0, 5) || ''} - ${oldAv?.slot?.endTime?.slice(0, 5) || ''}`
                                    : "N/A"}
                            </div>
                            <div>
                                <span className="font-semibold text-[#257180]">Mới:</span>{" "}
                                {newAv?.startDate
                                    ? `${format(new Date(newAv.startDate), "dd/MM/yyyy", { locale: vi })}\n${newAv?.slot?.startTime?.slice(0, 5) || ''} - ${newAv?.slot?.endTime?.slice(0, 5) || ''}`
                                    : "N/A"}
                            </div>
                        </div>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700">
                        {item.createdAt
                            ? format(addHours(new Date(item.createdAt), 7), "dd/MM/yyyy HH:mm", { locale: vi })
                            : 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-sm">
                        <Badge className={`${getChangeRequestStatusColor(item.status)} border`}>
                            {statusLabel}
                        </Badge>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                            Gửi: {item.requesterEmail}
                        </div>
                        <div className="text-xs text-gray-500">
                            Nhận: {item.requestedToEmail}
                        </div>
                    </td>
                    {isIncoming && (
                        <td className="py-2 px-3 text-sm text-gray-700">
                            {EnumHelpers.parseScheduleChangeRequestStatus(item.status) === ScheduleChangeRequestStatus.Pending ? (
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-[#257180] text-white hover:bg-[#1f616f]"
                                        disabled={loadingChangeRequest}
                                        onClick={() =>
                                            setConfirmDialog({ open: true, requestId: item.id, action: 'approve' })
                                        }
                                    >
                                        Chấp nhận
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                        disabled={loadingChangeRequest}
                                        onClick={() =>
                                            setConfirmDialog({ open: true, requestId: item.id, action: 'reject' })
                                        }
                                    >
                                        Từ chối
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-500">Đã xử lý</span>
                            )}
                        </td>
                    )}
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
                                    <th className="py-2 px-3 text-left">Lịch cũ</th>
                                    <th className="py-2 px-3 text-left">Ngày tạo</th>
                                    <th className="py-2 px-3 text-left">Trạng thái</th>
                                    <th className="py-2 px-3 text-left">Gửi / Nhận</th>
                                    {view === 'to' && <th className="py-2 px-3 text-left">Thao tác</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {view === 'from'
                                    ? renderRequestRows(filteredFromMe, false)
                                    : renderRequestRows(filteredToMe, true)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xử lý</DialogTitle>
                        <DialogDescription>
                            {confirmDialog.action === 'approve'
                                ? 'Bạn chắc chắn chấp nhận yêu cầu đổi lịch này?'
                                : 'Bạn chắc chắn từ chối yêu cầu đổi lịch này?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDialog({ open: false })}
                            disabled={loadingChangeRequest}
                        >
                            Hủy
                        </Button>
                        <Button
                            className={confirmDialog.action === 'approve' ? 'bg-[#257180] text-white hover:bg-[#1f616f]' : 'bg-red-500 text-white hover:bg-red-600'}
                            disabled={!confirmDialog.requestId || loadingChangeRequest}
                            onClick={async () => {
                                if (!confirmDialog.requestId || !confirmDialog.action) return;
                                const targetStatus =
                                    confirmDialog.action === 'approve'
                                        ? ScheduleChangeRequestStatus.Approved
                                        : ScheduleChangeRequestStatus.Rejected;
                                const res = await updateStatus(confirmDialog.requestId, targetStatus);
                                if (res) {
                                    setRequestsToMe(prev =>
                                        prev.map(r =>
                                            r.id === confirmDialog.requestId ? { ...r, status: targetStatus } : r
                                        )
                                    );
                                    showSuccess('Đã cập nhật trạng thái yêu cầu.');
                                } else {
                                    showError('Cập nhật trạng thái thất bại.');
                                }
                                setConfirmDialog({ open: false });
                            }}
                        >
                            {confirmDialog.action === 'approve' ? 'Chấp nhận' : 'Từ chối'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}


