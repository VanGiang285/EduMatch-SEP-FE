'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Badge } from '../ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/navigation/tabs';
import { Separator } from '../ui/layout/separator';
import { Star, Heart, MapPin, Clock, Calendar as CalendarIcon, MessageCircle, Video, Shield, Users, Globe, CheckCircle2, Play, ArrowLeft, Loader2, GraduationCap, Medal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FormatService } from '@/lib/format';
import { useTutorDetail } from '@/hooks/useTutorDetail';
import { useTutorAvailability } from '@/hooks/useTutorAvailability';
import {
  EnumHelpers,
  TeachingMode,
  TutorAvailabilityStatus,
  MediaType,
  BookingStatus,
} from '@/types/enums';
import { FavoriteTutorService } from '@/services/favoriteTutorService';
import { ReportService, MediaService, FeedbackService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletContext } from '@/contexts/WalletContext';
import { useCustomToast } from '@/hooks/useCustomToast';
import { ROUTES, USER_ROLES } from '@/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/form/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/feedback/dialog';
import { BookingWithSchedulesCreateRequest } from '@/services/bookingService';
import { TutorRatingSummary, TutorFeedbackDto, FeedbackCriterion } from '@/types/backend';
import { Label } from '../ui/form/label';
import { Textarea } from '../ui/form/textarea';
import { Input } from '../ui/form/input';
import { ReportCreateRequest, BasicEvidenceRequest } from '@/types/requests';
import { useBookings } from '@/hooks/useBookings';

function getTeachingModeValue(mode: string | number | TeachingMode): TeachingMode {
  if (typeof mode === 'number') {
    return mode as TeachingMode;
  }
  if (typeof mode === 'string') {
    switch (mode) {
      case 'Offline': return TeachingMode.Offline;
      case 'Online': return TeachingMode.Online;
      case 'Hybrid': return TeachingMode.Hybrid;
      default: return TeachingMode.Offline;
    }
  }
  return mode as TeachingMode;
}

interface TutorDetailProfilePageProps {
  tutorId: number;
}

type SelectedSlotDetail = {
  slotKey: string;
  availabilityId: number;
  date: Date;
  dateLabel: string;
  timeRange: string;
  isAvailable: boolean;
};

export function TutorDetailProfilePage({ tutorId }: TutorDetailProfilePageProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { balance, loading: walletLoading } = useWalletContext();
  const { showWarning, showInfo, showSuccess, showError } = useCustomToast();
  const { tutor, isLoading, error, loadTutorDetail, clearError } = useTutorDetail();
  const availabilitySectionRef = React.useRef<HTMLDivElement>(null);
  const { createBooking, payBooking, updateStatus: updateBookingStatus, error: bookingError } =
    useBookings();

  // Sử dụng hook useTutorAvailability - hook sẽ tự load từ API bằng tutorId
  const {
    availabilities,
    availabilityMap,
    selectedSlots,
    currentWeekStart,
    weekDays,
    datesByDay,
    formatWeekDisplay,
    loadAvailabilities,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    handleSlotClick,
    clearSelectedSlots,
    isSlotAvailable,
    isSlotSelected,
    getAvailableTimeSlots,
    timeSlots: timeSlotsFromHook,
    isLoading: isLoadingAvailability,
  } = useTutorAvailability();

  // Tạo map cho booked slots (status = Booked) từ availabilities đã load từ API
  const bookedMap = React.useMemo(() => {
    const map: { [key: string]: boolean } = {};

    availabilities
      .filter(
        av =>
          EnumHelpers.parseTutorAvailabilityStatus(av.status) ===
          TutorAvailabilityStatus.Booked
      )
      .forEach(availability => {
        // Parse startDate - nếu không có timezone thì coi như local date
        // Format: "2025-11-24T00:00:00" -> lấy phần date trực tiếp
        let dateKey: string;
        if (availability.startDate.includes('T')) {
          // Lấy phần date trực tiếp từ string để tránh timezone issues
          dateKey = availability.startDate.split('T')[0]; // "2025-11-24"
        } else {
          // Fallback: parse bằng Date
          const startDate = new Date(availability.startDate);
          const year = startDate.getFullYear();
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const day = String(startDate.getDate()).padStart(2, '0');
          dateKey = `${year}-${month}-${day}`;
        }

        // Dùng slot.startTime nếu có, nếu không thì lấy từ startDate
        let timeKey = '00';
        if (availability.slot?.startTime) {
          // Lấy giờ từ slot.startTime (format: "HH:mm:ss" hoặc "HH:mm")
          timeKey = availability.slot.startTime.split(':')[0].padStart(2, '0');
        } else {
          // Fallback: lấy từ startDate string
          if (availability.startDate.includes('T')) {
            const timePart = availability.startDate.split('T')[1];
            if (timePart) {
              timeKey = timePart.split(':')[0].padStart(2, '0');
            }
          }
        }

        const slotKey = `${dateKey}-${timeKey}`;
        map[slotKey] = true;
      });

    return map;
  }, [availabilities]);

  // Helper function để kiểm tra slot có booked không
  const isSlotBooked = React.useCallback((dayKey: string, timeSlot: { startTime: string; endTime: string; id: number }) => {
    const date = new Date(currentWeekStart);
    const dayIndex = weekDays.findIndex(day => day.key === dayKey);
    date.setDate(currentWeekStart.getDate() + dayIndex);

    // Dùng local date để tránh timezone issues (giống với bookedMap)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`; // YYYY-MM-DD (local)

    const hour = timeSlot.startTime.split(':')[0].padStart(2, '0');
    const slotKey = `${dateKey}-${hour}`;
    return bookedMap[slotKey] || false;
  }, [currentWeekStart, weekDays, bookedMap]);

  const [activeTab, setActiveTab] = useState('about');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [selectedSubjectKey, setSelectedSubjectKey] = useState('');
  const [selectedLevelKey, setSelectedLevelKey] = useState('');
  const [isBookingSelectionDialogOpen, setIsBookingSelectionDialogOpen] =
    useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [isTrialBooking, setIsTrialBooking] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const bookingStepsMeta = React.useMemo(
    () => [
      {
        id: 1,
        title: 'Chọn lịch học',
        description: 'Chọn môn, cấp độ và khung giờ phù hợp',
      },
      {
        id: 2,
        title: 'Xác nhận & thanh toán',
        description: 'Kiểm tra thông tin và số dư ví trước khi gửi',
      },
    ],
    []
  );

  const renderBookingSteps = React.useCallback(
    (currentStep: number) => (
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold text-[#257180] uppercase tracking-[0.2em]">
          {`Bước ${currentStep}/${bookingStepsMeta.length} - ${bookingStepsMeta[currentStep - 1]?.title || ''
            }`.toUpperCase()}
        </p>
        <div className="flex flex-wrap items-start justify-center gap-6">
          {bookingStepsMeta.map(step => {
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const barColor = isCurrent
              ? 'bg-[#FD8B51]'
              : isCompleted
                ? 'bg-[#257180]'
                : 'bg-gray-200';
            const titleColor = isCurrent
              ? 'text-[#FD8B51]'
              : isCompleted
                ? 'text-[#257180]'
                : 'text-gray-400';
            return (
              <div key={step.id} className="min-w-[220px] flex flex-col gap-1 text-xs">
                <div className={`h-1.5 rounded-full ${barColor}`} />
                <div>
                  <p className={`text-sm font-semibold ${titleColor}`}>{step.title}</p>
                  <p className="text-[11px] text-gray-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    [bookingStepsMeta]
  );

  // Report states
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportEvidences, setReportEvidences] = useState<BasicEvidenceRequest[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<TutorRatingSummary | null>(null);
  const [feedbacks, setFeedbacks] = useState<TutorFeedbackDto[]>([]);
  const [criteria, setCriteria] = useState<FeedbackCriterion[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Hiển thị tất cả time slots từ hook (từ API) - chỉ hiển thị các slot mà gia sư đã đăng ký
  // Mỗi slot sẽ hiển thị màu sắc tương ứng: xanh (available), đỏ (booked), xám (không có lịch)
  const timeSlotsToShow = React.useMemo(() => {
    if (!timeSlotsFromHook || timeSlotsFromHook.length === 0) {
      return [];
    }

    // Chỉ hiển thị những slot có ít nhất một ngày trong tuần có availability (available hoặc booked)
    return timeSlotsFromHook.filter(timeSlot =>
      weekDays.some(day => {
        const available = isSlotAvailable(day.key, timeSlot);
        const booked = isSlotBooked(day.key, timeSlot);
        return available || booked;
      })
    );
  }, [timeSlotsFromHook, weekDays, isSlotAvailable, isSlotBooked]);

  const subjectLevelOptions = React.useMemo(() => {
    if (!tutor?.tutorSubjects || tutor.tutorSubjects.length === 0) {
      return [];
    }

    const subjectMap = new Map<string, {
      key: string;
      subjectName: string;
      levels: {
        key: string;
        levelName: string;
        subjectId?: number;
        levelId?: number;
        tutorSubjectId?: number;
        hourlyRate?: number;
      }[];
    }>();

    tutor.tutorSubjects.forEach((tutorSubject, index) => {
      const subjectKey = tutorSubject.subjectId ? String(tutorSubject.subjectId) : `subject-${index}`;
      const levelKey = tutorSubject.levelId ? `${subjectKey}-${tutorSubject.levelId}` : `${subjectKey}-level-${index}`;
      const subjectName = tutorSubject.subject?.subjectName || 'Môn học';
      const levelName = tutorSubject.level?.name || 'Trình độ';

      if (!subjectMap.has(subjectKey)) {
        subjectMap.set(subjectKey, {
          key: subjectKey,
          subjectName,
          levels: [],
        });
      }

      subjectMap.get(subjectKey)?.levels.push({
        key: levelKey,
        levelName,
        subjectId: tutorSubject.subjectId,
        levelId: tutorSubject.levelId,
        tutorSubjectId: tutorSubject.id,
        hourlyRate: tutorSubject.hourlyRate || 0,
      });
    });

    return Array.from(subjectMap.values());
  }, [tutor?.tutorSubjects]);

  React.useEffect(() => {
    if (subjectLevelOptions.length === 0) {
      setSelectedSubjectKey('');
      return;
    }

    const currentSubjectExists = subjectLevelOptions.some(subject => subject.key === selectedSubjectKey);
    if (!selectedSubjectKey || !currentSubjectExists) {
      setSelectedSubjectKey(subjectLevelOptions[0].key);
    }
  }, [subjectLevelOptions, selectedSubjectKey]);

  const selectedSubjectInfo = React.useMemo(() => {
    if (!selectedSubjectKey) {
      return null;
    }
    return subjectLevelOptions.find(option => option.key === selectedSubjectKey) || null;
  }, [selectedSubjectKey, subjectLevelOptions]);

  React.useEffect(() => {
    if (!selectedSubjectInfo || selectedSubjectInfo.levels.length === 0) {
      setSelectedLevelKey('');
      return;
    }

    const currentLevelExists = selectedSubjectInfo.levels.some(level => level.key === selectedLevelKey);
    if (!selectedLevelKey || !currentLevelExists) {
      setSelectedLevelKey(selectedSubjectInfo.levels[0].key);
    }
  }, [selectedSubjectInfo, selectedLevelKey]);

  const selectedLevelInfo = React.useMemo(() => {
    if (!selectedSubjectInfo || !selectedLevelKey) {
      return null;
    }
    return selectedSubjectInfo.levels.find(level => level.key === selectedLevelKey) || null;
  }, [selectedSubjectInfo, selectedLevelKey]);

  const getDateKeyFromAvailability = React.useCallback((startDate: string) => {
    if (startDate.includes('T')) {
      return startDate.split('T')[0];
    }
    const date = new Date(startDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getHourKeyFromAvailability = React.useCallback((availability: { slot?: { startTime?: string }; startDate: string }) => {
    if (availability.slot?.startTime) {
      return availability.slot.startTime.split(':')[0].padStart(2, '0');
    }
    if (availability.startDate.includes('T')) {
      const timePart = availability.startDate.split('T')[1];
      if (timePart) {
        return timePart.split(':')[0].padStart(2, '0');
      }
    }
    return '00';
  }, []);

  const availabilityBySlotKey = React.useMemo(() => {
    const map = new Map<string, typeof availabilities[number]>();
    availabilities.forEach(availability => {
      const dateKey = getDateKeyFromAvailability(availability.startDate);
      const hourKey = getHourKeyFromAvailability(availability);
      map.set(`${dateKey}-${hourKey}`, availability);
    });
    return map;
  }, [availabilities, getDateKeyFromAvailability, getHourKeyFromAvailability]);

  const selectedSlotDetails = React.useMemo<SelectedSlotDetail[]>(() => {
    return Array.from(selectedSlots)
      .map(slotKey => {
        const availability = availabilityBySlotKey.get(slotKey);
        if (!availability) {
          return null;
        }
        const date = new Date(availability.startDate);
        const dateLabel = date.toLocaleDateString('vi-VN', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        const startTimeLabel = availability.slot?.startTime
          ? availability.slot.startTime.slice(0, 5)
          : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const endTimeLabel = availability.slot?.endTime
          ? availability.slot.endTime.slice(0, 5)
          : availability.endDate
            ? new Date(availability.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : '';
        const timeRange = endTimeLabel ? `${startTimeLabel} - ${endTimeLabel}` : startTimeLabel;
        const status = EnumHelpers.parseTutorAvailabilityStatus(availability.status);
        return {
          slotKey,
          availabilityId: availability.id,
          date,
          dateLabel,
          timeRange,
          isAvailable: status === TutorAvailabilityStatus.Available,
        };
      })
      .filter((detail): detail is SelectedSlotDetail => detail !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [availabilityBySlotKey, selectedSlots]);

  const canSelectSlots = !!selectedSubjectInfo && !!selectedLevelInfo;
  const selectedLevelPrice = selectedLevelInfo?.hourlyRate ?? 0;
  const estimatedTotal = selectedSlotDetails.length > 0 ? selectedLevelPrice * selectedSlotDetails.length : 0;

  useEffect(() => {
    if (tutorId) {
      loadTutorDetail(tutorId);
    }
  }, [tutorId, loadTutorDetail]);

  // Load availabilities từ API khi tutorId thay đổi hoặc khi tutor được load
  useEffect(() => {
    if (tutorId) {
      loadAvailabilities(tutorId);
    }
  }, [tutorId, loadAvailabilities]);

  // Check favorite status when tutor loads (only if authenticated)
  useEffect(() => {
    const loadRatingSummary = async () => {
      if (!tutorId) {
        setRatingSummary(null);
        return;
      }

      try {
        const response = await FeedbackService.getTutorRatingSummary(tutorId);
        if (response.success && response.data) {
          setRatingSummary(response.data);
        } else {
          setRatingSummary(null);
        }
      } catch (error) {
        setRatingSummary(null);
      }
    };

    loadRatingSummary();
  }, [tutorId]);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!tutorId) {
        setFeedbacks([]);
        return;
      }

      setLoadingFeedbacks(true);
      try {
        const response = await FeedbackService.getFeedbackByTutor(tutorId);
        if (response.success && response.data) {
          setFeedbacks(response.data);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        setFeedbacks([]);
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    loadFeedbacks();
  }, [tutorId]);

  useEffect(() => {
    const loadCriteria = async () => {
      try {
        const response = await FeedbackService.getAllCriteria();
        if (response.success && response.data) {
          setCriteria(response.data);
        } else {
          setCriteria([]);
        }
      } catch (error) {
        setCriteria([]);
      }
    };

    loadCriteria();
  }, []);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!tutorId || !isAuthenticated) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await FavoriteTutorService.isFavorite(tutorId);
        const isFavorite = response.data === true;
        setIsFavorite(isFavorite);
      } catch (error) {
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [tutorId, isAuthenticated]);

  const handleGoToAvailability = React.useCallback(() => {
    setActiveTab('availability');
    requestAnimationFrame(() => {
      availabilitySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [availabilitySectionRef, setActiveTab]);

  const handleOpenBookingSelection = React.useCallback(
    (isTrial: boolean) => {
      if (!isAuthenticated) {
        showWarning('Vui lòng đăng nhập', 'Bạn cần đăng nhập để đặt lịch học.');
        if (typeof window !== 'undefined') {
          const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
          router.push(`${ROUTES.LOGIN}?redirect=${redirectUrl}`);
        } else {
          router.push(ROUTES.LOGIN);
        }
        return;
      }

      if (user?.role !== USER_ROLES.LEARNER) {
        showWarning('Chưa hỗ trợ vai trò hiện tại', 'Tính năng đặt lịch chỉ áp dụng cho học viên.');
        return;
      }

      if (subjectLevelOptions.length === 0) {
        showWarning('Chưa có môn học', 'Gia sư chưa cập nhật môn học hoặc cấp độ để đặt lịch.');
        return;
      }

      // Mở modal chọn lịch
      setIsTrialBooking(isTrial);
      setBookingStep(1);
      clearSelectedSlots();
      setIsBookingSelectionDialogOpen(true);
    },
    [
      clearSelectedSlots,
      isAuthenticated,
      router,
      showWarning,
      subjectLevelOptions,
      user?.role,
    ]
  );

  const handleConfirmBooking = React.useCallback(async () => {
    if (!user?.email) {
      showWarning('Thiếu thông tin học viên', 'Không tìm thấy email của bạn. Vui lòng đăng nhập lại.');
      return;
    }
    if (!selectedSubjectInfo || !selectedLevelInfo || !selectedLevelInfo.tutorSubjectId) {
      showWarning('Thông tin môn học không hợp lệ', 'Vui lòng chọn lại môn học và cấp độ.');
      return;
    }
    if (selectedSlotDetails.length === 0) {
      showWarning('Chưa chọn khung giờ', 'Bạn cần chọn ít nhất một khung giờ học.');
      return;
    }
    if (isTrialBooking && selectedSlotDetails.length !== 1) {
      showWarning('Học thử chỉ được đặt 1 buổi', 'Vui lòng chọn đúng 1 khung giờ cho buổi học thử.');
      return;
    }

    // Với booking thường: kiểm tra số dư ví có đủ không
    if (!isTrialBooking) {
      if (walletLoading) {
        showWarning('Đang kiểm tra số dư ví', 'Vui lòng đợi hệ thống cập nhật số dư ví của bạn.');
        return;
      }

      if (estimatedTotal > balance) {
        const formatter = new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        });

        showWarning(
          'Số dư không đủ',
          `Số dư ví của bạn hiện là ${formatter.format(balance)}, không đủ để đặt lịch với học phí dự kiến ${formatter.format(estimatedTotal)}. Vui lòng nạp thêm tiền.`
        );
        return;
      }
    }
    if (selectedSlotDetails.some(detail => !detail.isAvailable)) {
      showWarning('Khung giờ không còn trống', 'Vui lòng bỏ chọn các khung giờ đã được đặt.');
      return;
    }

    const payload: BookingWithSchedulesCreateRequest = {
      booking: {
        learnerEmail: user.email,
        tutorSubjectId: selectedLevelInfo.tutorSubjectId,
        totalSessions: selectedSlotDetails.length,
        isTrial: isTrialBooking || undefined,
      },
      schedules: selectedSlotDetails.map(detail => ({
        availabilitiId: detail.availabilityId,
      })),
    };

    try {
      setIsCreatingBooking(true);
      const createdBooking = await createBooking(payload);

      if (!createdBooking) {
        showError('Không thể đặt lịch', bookingError || 'Vui lòng thử lại sau.');
        return;
      }

      // Tiếp tục thanh toán booking vừa tạo
      const paidBooking = await payBooking(createdBooking.id);
      if (!paidBooking) {
        // Rollback booking vừa tạo (đổi về Cancelled)
        await updateBookingStatus(createdBooking.id, BookingStatus.Cancelled);
        showError(
          'Thanh toán không thành công',
          'Không thể trừ tiền cho đơn đặt lịch này. Đơn hàng đã được hủy, vui lòng thử lại.'
        );
        return;
      }

      showSuccess('Đặt lịch thành công', 'Bạn có thể xem chi tiết trong tab Lớp học.');
      setIsBookingWizardOpen(false);
      setBookingStep(1);
      clearSelectedSlots();
      router.push('/profile?tab=classes');
    } catch (error: any) {
      showError('Không thể đặt lịch', error?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.');
    } finally {
      setIsCreatingBooking(false);
    }
  }, [
    balance,
    bookingError,
    clearSelectedSlots,
    createBooking,
    router,
    selectedLevelInfo,
    selectedSlotDetails,
    selectedSubjectInfo,
    showError,
    showSuccess,
    showWarning,
    user?.email,
    walletLoading,
  ]);

  // Giữ cho dialog cũ hoạt động: validate trước khi mở dialog xác nhận
  const handleBookingRequest = React.useCallback((): boolean => {
    if (!selectedSubjectInfo) {
      showWarning('Vui lòng chọn môn học', 'Hãy chọn môn học trước khi chọn khung giờ.');
      return false;
    }
    if (!selectedLevelInfo) {
      showWarning('Vui lòng chọn cấp độ', 'Hãy chọn cấp độ trước khi chọn khung giờ.');
      return false;
    }
    if (selectedSlots.size === 0) {
      showWarning('Chưa chọn khung giờ', 'Bạn cần chọn ít nhất một khung giờ học.');
      return false;
    }
    if (selectedSlotDetails.length !== selectedSlots.size) {
      showWarning(
        'Khung giờ không khả dụng',
        'Một số khung giờ đã không còn trống. Vui lòng chọn lại.'
      );
      return false;
    }
    if (selectedSlotDetails.some(detail => !detail.isAvailable)) {
      showWarning('Khung giờ không còn trống', 'Vui lòng bỏ chọn các khung giờ đã được đặt.');
      return false;
    }

    setIsBookingDialogOpen(true);
    return true;
  }, [selectedLevelInfo, selectedSlotDetails, selectedSlots, selectedSubjectInfo, showWarning]);

  // Report handlers
  const handleReportFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) return;

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        showError('Lỗi', 'Chỉ chấp nhận file ảnh hoặc video');
        return false;
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('Lỗi', `File ${file.name} vượt quá 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const mediaType = file.type.startsWith('image/') ? 'Image' : 'Video';
        const response = await MediaService.uploadFile({
          file,
          ownerEmail: user.email!,
          mediaType: mediaType as 'Image' | 'Video',
        });

        // ApiClient unwraps response.data, so response.data is UploadToCloudResponse
        // UploadToCloudResponse has structure: { success, message, data?: { secureUrl, publicId, ... } }
        const uploadData = response.data as any;
        let secureUrl = '';
        let publicId = '';

        if (uploadData?.data?.secureUrl) {
          secureUrl = uploadData.data.secureUrl;
          publicId = uploadData.data.publicId || '';
        } else if (uploadData?.secureUrl) {
          secureUrl = uploadData.secureUrl;
          publicId = uploadData.publicId || '';
        }

        if (response.success && secureUrl) {
          return {
            url: secureUrl,
            publicId: publicId,
            mediaType: file.type.startsWith('image/') ? MediaType.Image : MediaType.Video,
            file,
          };
        } else {
          throw new Error(`Không thể upload file ${file.name}`);
        }
      });

      const results = await Promise.all(uploadPromises);
      setUploadedUrls(prev => [...prev, ...results.map(r => r.url)]);
      setUploadingFiles(prev => [...prev, ...results.map(r => r.file)]);
      setReportEvidences(prev => [
        ...prev,
        ...results.map(r => ({
          mediaType: r.mediaType,
          fileUrl: r.url,
          filePublicId: r.publicId,
          caption: '',
        })),
      ]);
      showSuccess('Thành công', `Đã upload ${results.length} file thành công`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      showError('Lỗi', error.message || 'Không thể upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveReportFile = (index: number) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
    setReportEvidences(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async () => {
    if (!user?.email || !tutor?.userEmail) {
      showError('Lỗi', 'Vui lòng đăng nhập');
      return;
    }
    if (!reportReason.trim()) {
      showError('Lỗi', 'Vui lòng điền lý do báo cáo');
      return;
    }

    try {
      setIsSubmittingReport(true);
      const request: ReportCreateRequest = {
        reportedUserEmail: tutor.userEmail,
        reason: reportReason.trim(),
        evidences: reportEvidences.length > 0 ? reportEvidences : undefined,
      };
      const response = await ReportService.createReport(request);
      if (response.success) {
        showSuccess('Thành công', 'Đã tạo báo cáo');
        setShowReportDialog(false);
        setReportReason('');
        setReportEvidences([]);
        setUploadingFiles([]);
        setUploadedUrls([]);
      } else {
        showError('Lỗi', response.message || 'Không thể tạo báo cáo');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      showError('Lỗi', 'Không thể tạo báo cáo');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#FD8B51]" />
            <span className="ml-2 text-gray-600">Đang tải thông tin gia sư...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={clearError} variant="outline">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin gia sư.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2 hover:bg-[#FD8B51] hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại kết quả tìm kiếm
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[#FD8B51]">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={tutor.avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="text-3xl bg-[#F2E5BF] text-[#257180]">
                        {tutor.userName?.split(' ').slice(-2).map(n => n[0]).join('') || 'GS'}
                      </AvatarFallback>
                    </Avatar>
                    {(tutor.status === 1 || tutor.status === 3 || tutor.status === 4) && (
                      <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${tutor.status === 1 ? 'bg-blue-600' :
                        tutor.status === 3 ? 'bg-orange-600' :
                          'bg-red-600'
                        }`}>
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-gray-900 text-2xl font-semibold mb-2">
                          {tutor.userName}
                        </h1>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg text-gray-900">
                              {ratingSummary?.averageRating.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({ratingSummary?.totalFeedbackCount || 0} đánh giá)
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">0 buổi học</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">0 học viên</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tutor.status === 1 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Đã xác thực
                            </Badge>
                          )}
                          {tutor.status === 3 && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                              <Shield className="w-3 h-3 mr-1" />
                              Tạm khóa
                            </Badge>
                          )}
                          {tutor.status === 4 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                              <Shield className="w-3 h-3 mr-1" />
                              Ngừng hoạt động
                            </Badge>
                          )}
                          <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                            Chuyên nghiệp
                          </Badge>
                          {tutor.status === 1 && (
                            <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                              Gia sư được phê duyệt
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!isAuthenticated) {
                            showWarning(
                              'Vui lòng đăng nhập',
                              'Bạn cần đăng nhập để thêm gia sư vào danh sách yêu thích.'
                            );
                            router.push('/login');
                            return;
                          }

                          const newFavoriteState = !isFavorite;
                          setIsFavorite(newFavoriteState);
                          setLoadingFavorite(true);

                          try {
                            if (newFavoriteState) {
                              await FavoriteTutorService.addToFavorite(tutorId);
                            } else {
                              await FavoriteTutorService.removeFromFavorite(tutorId);
                            }
                          } catch (error) {
                            console.error('Error toggling favorite:', error);
                            setIsFavorite(!newFavoriteState);
                          } finally {
                            setLoadingFavorite(false);
                          }
                        }}
                        className="p-2 hover:bg-[#FD8B51] hover:text-white"
                        disabled={loadingFavorite}
                      >
                        {loadingFavorite ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                          <Heart className={`w-6 h-6 transition-colors duration-200 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {tutor.subDistrict?.name && tutor.province?.name
                            ? `${tutor.subDistrict.name}, ${tutor.province.name}`
                            : tutor.province?.name || 'Việt Nam'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>{tutor.tutorCertificates?.length || 0} chứng chỉ</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>{EnumHelpers.getTeachingModeLabel(getTeachingModeValue(tutor.teachingModes))}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Tham gia từ {new Date(tutor.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {tutor.videoIntroUrl && (
              <Card className="border-[#FD8B51]">
                <CardContent className="p-6">
                  <div className="relative bg-gradient-to-br from-[#257180] to-[#1e5a66] rounded-lg overflow-hidden aspect-video">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      poster={tutor.avatarUrl}
                      preload="metadata"
                    >
                      <source src={tutor.videoIntroUrl} type="video/mp4" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center text-white">
                          <div className="w-20 h-20 rounded-full bg-[#FD8B51]/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                          <p className="font-bold">Video không hỗ trợ</p>
                          <p className="text-sm mt-2">{tutor.userName}</p>
                        </div>
                      </div>
                    </video>
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="default" className="bg-black bg-opacity-70 text-white">
                        <Video className="w-3 h-3 mr-1" />
                        Video giới thiệu
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-[#F2E5BF]">
                <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">Giới thiệu</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">Đánh giá ({ratingSummary?.totalFeedbackCount || 0})</TabsTrigger>
                <TabsTrigger value="availability" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">Lịch trống</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="space-y-6">
                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="font-bold">Về tôi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {tutor.bio || 'Chưa có thông tin giới thiệu.'}
                      </p>
                    </div>

                    <Separator className="bg-gray-900" />

                    <div>
                      <h3 className="text-gray-900 mb-3 font-bold">Kinh nghiệm giảng dạy</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {tutor.teachingExp || 'Chưa có thông tin kinh nghiệm giảng dạy.'}
                      </p>
                      {tutor.tutorSubjects && tutor.tutorSubjects.length > 0 && (
                        <>
                          <p className="text-gray-700 mt-3">
                            Tôi chuyên dạy các môn học sau:
                          </p>
                          <ul className="mt-3 space-y-2 text-gray-700">
                            {tutor.tutorSubjects.map((tutorSubject, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{tutorSubject.subject?.subjectName} - {tutorSubject.level?.name}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <Separator className="bg-gray-900" />

                    <div>
                      <h3 className="text-gray-900 mb-3 font-bold">Hình thức dạy học</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teachingModes !== undefined && (() => {
                          const modeValue = getTeachingModeValue(tutor.teachingModes);
                          if (modeValue === TeachingMode.Hybrid) {
                            return (
                              <>
                                <Badge variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                                  Dạy Online
                                </Badge>
                                <Badge variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                                  Dạy trực tiếp
                                </Badge>
                              </>
                            );
                          }
                          return (
                            <Badge variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                              {EnumHelpers.getTeachingModeLabel(modeValue)}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="font-bold">Học vấn & Chứng chỉ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tutor.tutorEducations && tutor.tutorEducations.length > 0 && (
                      <>
                        <div>
                          <h4 className="font-bold mb-3">Học vấn</h4>
                          <div className="space-y-3">
                            {tutor.tutorEducations.map((edu) => (
                              <div key={edu.id} className="flex items-start gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-gray-700">{edu.institution?.name || 'Education'}</p>
                                  <p className="text-sm text-gray-500">
                                    {edu.issueDate ? new Date(edu.issueDate).getFullYear() : 'N/A'}
                                  </p>
                                  {edu.verified === 1 && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Đã xác thực
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator className="bg-gray-900" />
                      </>
                    )}
                    {tutor.tutorCertificates && tutor.tutorCertificates.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-3">Chứng chỉ</h4>
                        <div className="space-y-2">
                          {tutor.tutorCertificates.map((cert) => (
                            <div key={cert.id} className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <Medal className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                                <div>
                                  <span className="text-gray-700">{cert.certificateType?.name || 'Certificate'}</span>
                                  {cert.certificateType?.code && (
                                    <p className="text-xs text-gray-500">{cert.certificateType.code}</p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    {cert.issueDate ? new Date(cert.issueDate).getFullYear() : 'N/A'}
                                    {cert.expiryDate && (
                                      <span> - {new Date(cert.expiryDate).getFullYear()}</span>
                                    )}
                                  </p>
                                  {cert.expiryDate && new Date(cert.expiryDate) < new Date() && (
                                    <Badge variant="outline" className="text-xs mt-1 text-orange-600 border-orange-300">
                                      Đã hết hạn
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {cert.verified === 1 && (
                                <Badge variant="outline" className="text-xs">
                                  Đã xác thực
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="font-bold">Môn học giảng dạy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutor.tutorSubjects?.map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                          {subject.subject?.subjectName || `Subject ${subject.subjectId}`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>
              <TabsContent value="reviews" className="space-y-6">
                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-bold">Đánh giá từ học viên</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg">
                          {ratingSummary?.averageRating.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({ratingSummary?.totalFeedbackCount || 0} đánh giá)
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingFeedbacks ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#257180]" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {feedbacks.map((feedback) => {
                          const getCriterionName = (criterionId: number) => {
                            const criterion = criteria.find(c => c.id === criterionId);
                            if (!criterion) return `Tiêu chí ${criterionId}`;

                            const criterionCode = criterion.code?.toLowerCase() || '';
                            const criterionName = criterion.name?.toLowerCase() || '';

                            const vietnameseMap: { [key: string]: string } = {
                              'teaching_quality': 'Chất lượng giảng dạy',
                              'teachingquality': 'Chất lượng giảng dạy',
                              'communication': 'Giao tiếp',
                              'punctuality': 'Đúng giờ',
                              'professionalism': 'Chuyên nghiệp',
                              'knowledge': 'Kiến thức',
                              'patience': 'Kiên nhẫn',
                              'preparation': 'Chuẩn bị bài học',
                              'engagement': 'Tương tác',
                              'feedback': 'Phản hồi',
                              'flexibility': 'Linh hoạt',
                              'clarity': 'Rõ ràng',
                              'enthusiasm': 'Nhiệt tình',
                              'lesson_quality': 'Chất lượng bài học',
                              'lessonquality': 'Chất lượng bài học',
                              'lesson quality': 'Chất lượng bài học',
                              'support': 'Hỗ trợ',
                              'teaching_skill': 'Kỹ năng giảng dạy',
                              'teachingskill': 'Kỹ năng giảng dạy',
                              'teaching skill': 'Kỹ năng giảng dạy',
                              'satisfaction': 'Sự hài lòng',
                            };

                            const normalizedCode = criterionCode.trim();
                            const normalizedName = criterionName.trim();

                            const mappedName = vietnameseMap[normalizedCode] ||
                              vietnameseMap[normalizedName] ||
                              (criterion.name && vietnameseMap[criterion.name.toLowerCase().trim()]) ||
                              criterion.name;

                            return mappedName;
                          };

                          const learnerInitials = feedback.learnerEmail
                            .split('@')[0]
                            .split('.')
                            .map(part => part[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) || 'NA';

                          return (
                            <div key={feedback.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                              <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] font-semibold">
                                  <AvatarFallback>{learnerInitials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {feedback.learnerEmail.split('@')[0]}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`w-4 h-4 ${i < Math.round(feedback.overallRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                          {feedback.overallRating.toFixed(1)}
                                        </span>
                                        <span className="text-sm text-gray-500">•</span>
                                        <span className="text-sm text-gray-500">
                                          {new Date(feedback.createdAt).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {feedback.comment && (
                                    <p className="text-base font-bold text-gray-900 leading-relaxed mt-3 mb-3">
                                      {feedback.comment}
                                    </p>
                                  )}

                                  {feedback.feedbackDetails && feedback.feedbackDetails.length > 0 && (
                                    <div className="mb-3 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                        Đánh giá chi tiết
                                      </h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {feedback.feedbackDetails.map((detail) => (
                                          <div key={detail.criterionId} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                                            <span className="text-sm font-medium text-gray-800 flex-1">
                                              {getCriterionName(detail.criterionId)}
                                            </span>
                                            <div className="flex items-center gap-1.5 ml-3">
                                              <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={`w-3.5 h-3.5 ${i < detail.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                  />
                                                ))}
                                              </div>
                                              <span className="text-xs font-semibold text-gray-700 min-w-[30px] text-right">
                                                {detail.rating}/5
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!loadingFeedbacks && feedbacks.length === 0 && (
                      <div className="text-center mt-6">
                        <p className="text-gray-600">Chưa có đánh giá nào.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="availability" className="space-y-6">
                <div ref={availabilitySectionRef} className="space-y-6">
                  <Card className="border-[#FD8B51]">
                    <CardHeader>
                      <div className="space-y-4">
                        <div>
                          <CardTitle className="font-bold">Lịch trống của gia sư</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatWeekDisplay()}
                          </p>
                        </div>

                        {/* Ẩn phần chọn môn học/cấp độ & giá mỗi buổi ở tab lịch trống,
                            chỉ hiển thị lịch trống đơn giản để xem */}

                        {/* Navigation Controls */}
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousWeek}
                            className="flex items-center gap-2"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Tuần trước</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToCurrentWeek}
                            className="bg-[#FD8B51] text-white hover:bg-[#CB6040] border-[#FD8B51]"
                          >
                            Về tuần hiện tại
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextWeek}
                            className="flex items-center gap-2"
                          >
                            <span>Tuần sau</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingAvailability ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-[#FD8B51] mx-auto mb-4" />
                          <p className="text-gray-600">Đang tải lịch trống của gia sư...</p>
                        </div>
                      ) : timeSlotsToShow.length > 0 ? (
                        <div className="overflow-x-auto">
                          <div className="min-w-[600px]">
                            {/* Header with days */}
                            <div className="grid grid-cols-8 gap-1 mb-2">
                              <div className="p-2 text-sm font-medium text-gray-600">Giờ</div>
                              {weekDays.map((day) => (
                                <div key={day.key} className="p-2 text-center">
                                  <div className="text-sm font-medium text-gray-900">{day.label}</div>
                                  <div className="text-xs text-gray-500">{datesByDay[day.key]}</div>
                                </div>
                              ))}
                            </div>

                            {/* Time slots grid */}
                            <div className="space-y-1 max-h-[600px] overflow-y-auto">
                              {timeSlotsToShow.map((timeSlot) => (
                                <div key={timeSlot.id} className="grid grid-cols-8 gap-1">
                                  <div className="p-2 text-sm text-gray-600 bg-gray-50 rounded">
                                    {timeSlot.startTime}
                                  </div>
                                  {weekDays.map((day) => {
                                    const isAvailable = isSlotAvailable(day.key, timeSlot);
                                    const isBooked = isSlotBooked(day.key, timeSlot);

                                    let buttonClass = '';
                                    let buttonContent = '';

                                    if (isBooked) {
                                      // Màu đỏ: Đã booked (không thể chọn)
                                      buttonClass = 'bg-red-100 text-red-800 cursor-not-allowed';
                                      buttonContent = '✗';
                                    } else if (isAvailable) {
                                      // Màu xanh: Lịch rảnh (chỉ để xem)
                                      buttonClass = 'bg-green-100 text-green-800 cursor-not-allowed';
                                      buttonContent = '';
                                    } else {
                                      // Màu xám + X: Không có lịch đăng ký
                                      buttonClass = 'bg-gray-100 text-gray-400 cursor-not-allowed';
                                      buttonContent = '✗';
                                    }

                                    return (
                                      <button
                                        key={`${day.key}-${timeSlot.id}`}
                                        type="button"
                                        disabled
                                        className={`p-2 text-xs rounded ${buttonClass}`}
                                      >
                                        {buttonContent}
                                      </button>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Không có lịch trống trong tuần này</p>
                          <p className="text-sm text-gray-500 mt-2">Gia sư chưa cập nhật lịch trống cho tuần này</p>
                        </div>
                      )}

                      {/* Legend - only show when there are slots to display */}
                      {timeSlotsToShow.length > 0 && (
                        <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div>
                            <span>Lịch rảnh (có thể đặt)</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-100 rounded border border-red-300"></div>
                            <span>Đã booked</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300"></div>
                            <span>Không có lịch</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <Card className="border-[#257180]/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div>
                      <span className="text-gray-600 text-sm">Học phí</span>
                      <div className="mt-2">
                        {tutor.tutorSubjects && tutor.tutorSubjects.length > 0 ? (
                          (() => {
                            const prices = tutor.tutorSubjects.map(ts => ts.hourlyRate || 0);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);

                            return (
                              <div className="flex items-baseline justify-center gap-2">
                                <span className="text-3xl">
                                  {minPrice === maxPrice
                                    ? FormatService.formatVND(minPrice)
                                    : `${FormatService.formatVND(minPrice)} - ${FormatService.formatVND(maxPrice)}`
                                  }
                                </span>
                                <span className="text-base text-gray-600">/giờ</span>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="text-3xl">
                              {FormatService.formatVND(0)}
                            </span>
                            <span className="text-base text-gray-600">/giờ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                      size="lg"
                      onClick={() => handleOpenBookingSelection(false)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Đặt lịch học
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                      size="lg"
                      onClick={() => handleOpenBookingSelection(true)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Đặt lịch học thử
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                      size="lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Gửi tin nhắn
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-[#FD8B51]">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Thông tin nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Môn học:</span>
                      <span className="font-medium">{tutor.tutorSubjects?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chứng chỉ:</span>
                      <span className="font-medium">{tutor.tutorCertificates?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hình thức:</span>
                      <span className="font-medium">{EnumHelpers.getTeachingModeLabel(getTeachingModeValue(tutor.teachingModes))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tham gia:</span>
                      <span className="font-medium">{new Date(tutor.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button
                variant="ghost"
                className="w-full hover:bg-[#FD8B51] hover:text-white"
                onClick={() => {
                  if (!isAuthenticated) {
                    showWarning('Cần đăng nhập', 'Bạn cần đăng nhập để báo cáo gia sư');
                    return;
                  }
                  setShowReportDialog(true);
                }}
              >
                Báo cáo gia sư này
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Selection Dialog (chọn môn/cấp độ + slot) */}
      <Dialog
        open={isBookingSelectionDialogOpen}
        onOpenChange={(open) => {
          if (!isCreatingBooking) {
            setIsBookingSelectionDialogOpen(open);
            if (!open) {
              clearSelectedSlots();
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {isTrialBooking ? 'Chọn lịch học thử' : 'Chọn lịch học với gia sư'}
            </DialogTitle>
            <DialogDescription>
              Chọn môn học, cấp độ và khung giờ phù hợp. Sau đó bấm Tiếp tục để xác nhận.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step indicator */}
            {renderBookingSteps(1)}
            {/* Môn học & cấp độ */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Môn học</Label>
                <Select
                  value={selectedSubjectKey}
                  onValueChange={value => setSelectedSubjectKey(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectLevelOptions.map(subject => (
                      <SelectItem key={subject.key} value={subject.key}>
                        {subject.subjectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cấp độ</Label>
                <Select
                  value={selectedLevelKey}
                  onValueChange={value => setSelectedLevelKey(value)}
                  disabled={!selectedSubjectInfo}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSubjectInfo?.levels.map(level => (
                      <SelectItem key={level.key} value={level.key}>
                        {level.levelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tổng quan giá & số buổi */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#FD8B51]/30 bg-[#FFF6EF] p-3 text-sm">
                <p className="text-gray-600">Giá mỗi buổi</p>
                <p className="mt-1 font-semibold text-[#FD8B51]">
                  {FormatService.formatVND(selectedLevelPrice)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="text-gray-600">
                  {isTrialBooking ? 'Số buổi học thử' : 'Số buổi đã chọn'}
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {selectedSlotDetails.length}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="text-gray-600">Tổng học phí dự kiến</p>
                <p className="mt-1 font-semibold text-[#257180]">
                  {isTrialBooking
                    ? 'Miễn phí (học thử)'
                    : FormatService.formatVND(estimatedTotal)}
                </p>
              </div>
            </div>

            {/* Lịch tuần + grid chọn slot */}
            <Card className="border-[#FD8B51]">
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <CardTitle className="font-bold">Chọn khung giờ học</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatWeekDisplay()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousWeek}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Tuần trước</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToCurrentWeek}
                      className="bg-[#FD8B51] text-white hover:bg-[#CB6040] border-[#FD8B51]"
                    >
                      Về tuần hiện tại
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextWeek}
                      className="flex items-center gap-2"
                    >
                      <span>Tuần sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAvailability ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FD8B51] mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải lịch trống của gia sư...</p>
                  </div>
                ) : timeSlotsToShow.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="grid grid-cols-8 gap-1 mb-2">
                        <div className="p-2 text-sm font-medium text-gray-600">Giờ</div>
                        {weekDays.map((day) => (
                          <div key={day.key} className="p-2 text-center">
                            <div className="text-sm font-medium text-gray-900">{day.label}</div>
                            <div className="text-xs text-gray-500">{datesByDay[day.key]}</div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 max-h-[500px] overflow-y-auto">
                        {timeSlotsToShow.map((timeSlot) => (
                          <div key={timeSlot.id} className="grid grid-cols-8 gap-1">
                            <div className="p-2 text-sm text-gray-600 bg-gray-50 rounded">
                              {timeSlot.startTime}
                            </div>
                            {weekDays.map((day) => {
                              const slotAvailable = isSlotAvailable(day.key, timeSlot);
                              const slotBooked = isSlotBooked(day.key, timeSlot);
                              const slotSelected = isSlotSelected(day.key, timeSlot);

                              let buttonClass = '';
                              let buttonContent = '';
                              let disabled = false;

                              if (slotBooked) {
                                buttonClass =
                                  'bg-red-100 text-red-800 cursor-not-allowed border border-red-200';
                                buttonContent = '✗';
                                disabled = true;
                              } else if (slotAvailable) {
                                if (slotSelected) {
                                  buttonClass =
                                    'bg-orange-100 text-orange-800 border border-orange-300';
                                  buttonContent = '✓';
                                } else {
                                  buttonClass =
                                    'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300';
                                }
                              } else {
                                buttonClass =
                                  'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
                                buttonContent = '✗';
                                disabled = true;
                              }

                              const onClick = () => {
                                if (!slotAvailable || slotBooked) return;

                                if (isTrialBooking && !slotSelected && selectedSlotDetails.length >= 1) {
                                  showWarning(
                                    'Chỉ chọn 1 buổi học thử',
                                    'Mỗi môn học với gia sư này chỉ được đặt 1 buổi học thử.'
                                  );
                                  return;
                                }

                                handleSlotClick(day.key, timeSlot);
                              };

                              return (
                                <button
                                  key={`${day.key}-${timeSlot.id}`}
                                  type="button"
                                  disabled={disabled}
                                  onClick={onClick}
                                  className={`p-2 text-xs rounded transition-colors duration-150 ${buttonClass}`}
                                >
                                  {buttonContent}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không có lịch trống trong tuần này</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Gia sư chưa cập nhật lịch trống cho tuần này
                    </p>
                  </div>
                )}

                {timeSlotsToShow.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div>
                      <span>Lịch rảnh</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-100 rounded border border-orange-300"></div>
                      <span>Đã chọn</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-100 rounded border border-red-300"></div>
                      <span>Đã booked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300"></div>
                      <span>Không có lịch</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBookingSelectionDialogOpen(false);
                clearSelectedSlots();
              }}
              disabled={isCreatingBooking}
            >
              Hủy
            </Button>
            <Button
              className="bg-[#FD8B51] hover:bg-[#CB6040] text-white"
              onClick={() => {
                const ok = handleBookingRequest();
                if (ok) {
                  setIsBookingSelectionDialogOpen(false);
                }
              }}
              disabled={isCreatingBooking || selectedSlotDetails.length === 0}
            >
              Tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Confirm Dialog */}
      <Dialog
        open={isBookingDialogOpen}
        onOpenChange={(open) => {
          if (!isCreatingBooking) {
            setIsBookingDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt lịch học</DialogTitle>
            <DialogDescription>
              Kiểm tra lại thông tin trước khi gửi yêu cầu đặt lịch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Step indicator */}
            {renderBookingSteps(2)}
            <div className="rounded-lg border border-[#FD8B51]/30 bg-[#FFF6EF] p-4 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-semibold text-gray-900">Môn học:</span>{' '}
                {selectedSubjectInfo?.subjectName}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Cấp độ:</span>{' '}
                {selectedLevelInfo?.levelName}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Giá mỗi buổi:</span>{' '}
                <span className="text-[#FD8B51] font-semibold">
                  {FormatService.formatVND(selectedLevelPrice)}
                </span>
              </p>
              <p>
                <span className="font-semibold text-gray-900">Số buổi:</span>{' '}
                {selectedSlotDetails.length}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Tổng học phí dự kiến:</span>{' '}
                <span className="text-[#257180] font-semibold">
                  {FormatService.formatVND(estimatedTotal)}
                </span>
              </p>
              {!isTrialBooking && estimatedTotal > balance && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  Số dư ví hiện tại ({FormatService.formatVND(balance)}) không đủ để thanh toán đơn
                  hàng này. Vui lòng nạp thêm tiền trước khi xác nhận.
                </p>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
              {selectedSlotDetails.length > 0 ? (
                <ul className="divide-y divide-gray-100 text-sm">
                  {selectedSlotDetails.map(detail => (
                    <li key={detail.slotKey} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{detail.dateLabel}</p>
                        <p className="text-gray-600">{detail.timeRange}</p>
                      </div>
                      {!detail.isAvailable && (
                        <span className="text-xs font-medium text-red-600">Hết chỗ</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-600">
                  Chưa có khung giờ nào được chọn.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                // Quay lại bước chọn lịch
                setIsBookingDialogOpen(false);
                setIsBookingSelectionDialogOpen(true);
              }}
              disabled={isCreatingBooking}
            >
              Quay lại bước chọn lịch
            </Button>
            <Button
              className="bg-[#FD8B51] hover:bg-[#CB6040] text-white"
              onClick={handleConfirmBooking}
              disabled={
                isCreatingBooking ||
                selectedSlotDetails.length === 0 ||
                (!isTrialBooking && estimatedTotal > balance)
              }
            >
              {isCreatingBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận đặt lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      {showReportDialog && (
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Báo cáo gia sư</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Gia sư báo cáo</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded border">
                  <p className="font-medium text-sm">{tutor?.userName || tutor?.userEmail || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{tutor?.userEmail}</p>
                </div>
              </div>
              <div>
                <Label>Lý do báo cáo *</Label>
                <Textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Nhập lý do báo cáo..."
                  className="mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label>Bằng chứng (tùy chọn)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleReportFileSelect}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />}
                  </div>
                  {reportEvidences.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {reportEvidences.map((evidence, index) => (
                        <div key={index} className="relative group">
                          {evidence.mediaType === MediaType.Image ? (
                            <img
                              src={evidence.fileUrl}
                              alt="Evidence"
                              className="w-full h-24 object-cover rounded border"
                            />
                          ) : (
                            <video
                              src={evidence.fileUrl}
                              controls
                              className="w-full h-24 object-cover rounded border"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveReportFile(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                  setReportEvidences([]);
                  setUploadingFiles([]);
                  setUploadedUrls([]);
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={isSubmittingReport || !reportReason.trim()}
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              >
                {isSubmittingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Gửi báo cáo'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
