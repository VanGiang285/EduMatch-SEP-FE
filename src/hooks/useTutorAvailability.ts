import { useState, useMemo, useCallback } from 'react';
import { AvailabilityService } from '@/services/availabilityService';
import { TutorAvailabilityDto } from '@/types/backend';
import { TutorAvailabilityStatus, EnumHelpers } from '@/types/enums';

/**
 * Interface định nghĩa các giá trị trả về từ hook useTutorAvailability
 */
export interface UseTutorAvailabilityReturn {
  // ========== DỮ LIỆU ==========
  /** Danh sách tất cả lịch trống của gia sư */
  availabilities: TutorAvailabilityDto[];
  /** Map để kiểm tra nhanh slot có sẵn hay không, key format: "YYYY-MM-DD-HH" */
  availabilityMap: { [key: string]: boolean };
  /** Set chứa các slot đã được người dùng chọn, key format: "YYYY-MM-DD-HH" */
  selectedSlots: Set<string>;

  // ========== ĐIỀU HƯỚNG TUẦN ==========
  /** Ngày bắt đầu của tuần hiện tại (Thứ 2) */
  currentWeekStart: Date;
  /** Danh sách các ngày trong tuần với key và label tiếng Việt */
  weekDays: Array<{ key: string; label: string }>;
  /** Map ngày tháng hiển thị cho từng ngày trong tuần, format: "DD/MM" */
  datesByDay: { [key: string]: string };
  /** Hàm format chuỗi hiển thị tuần, ví dụ: "Ngày 1 - 7/12/2024" */
  formatWeekDisplay: () => string;

  // ========== HÀNH ĐỘNG ==========
  /** Tải danh sách lịch trống của gia sư từ API */
  loadAvailabilities: (tutorId: number) => Promise<void>;
  /** Chuyển sang tuần trước */
  goToPreviousWeek: () => void;
  /** Chuyển sang tuần sau */
  goToNextWeek: () => void;
  /** Quay về tuần hiện tại */
  goToCurrentWeek: () => void;
  /** Xử lý khi click vào một slot (chọn/bỏ chọn) */
  handleSlotClick: (
    dayKey: string,
    timeSlot: { startTime: string; endTime: string; id: number }
  ) => void;
  /** Xóa tất cả các slot đã chọn */
  clearSelectedSlots: () => void;

  // ========== HÀM HỖ TRỢ ==========
  /** Kiểm tra xem slot có sẵn để đặt hay không */
  isSlotAvailable: (
    dayKey: string,
    timeSlot: { startTime: string; endTime: string; id: number }
  ) => boolean;
  /** Kiểm tra xem slot đã được chọn hay chưa */
  isSlotSelected: (
    dayKey: string,
    timeSlot: { startTime: string; endTime: string; id: number }
  ) => boolean;
  /** Lọc các time slot có ít nhất một slot available trong tuần hiện tại */
  getAvailableTimeSlots: (
    allTimeSlots: Array<{ startTime: string; endTime: string; id: number }>
  ) => Array<{ startTime: string; endTime: string; id: number }>;
  /** Danh sách time slots từ availabilities (unique, sorted) */
  timeSlots: Array<{ startTime: string; endTime: string; id: number }>;

  // ========== TRẠNG THÁI ==========
  /** Trạng thái đang tải dữ liệu */
  isLoading: boolean;
  /** Thông báo lỗi nếu có */
  error: string | null;
  /** Xóa thông báo lỗi */
  clearError: () => void;
}

/** Danh sách các ngày trong tuần (bắt đầu từ Thứ 2) */
const WEEK_DAYS = [
  { key: 'monday', label: 'Thứ 2' },
  { key: 'tuesday', label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday', label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' },
  { key: 'sunday', label: 'Chủ nhật' },
];

export const normalizeAvailabilityStatus = (
  status: string | number | TutorAvailabilityStatus
): TutorAvailabilityStatus => EnumHelpers.parseTutorAvailabilityStatus(status);

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateKeyFromStartDate = (startDate: string): string => {
  if (startDate.includes('T')) {
    return startDate.split('T')[0];
  }
  return formatDateKey(new Date(startDate));
};

const getTimeKeyFromAvailability = (
  availability: TutorAvailabilityDto
): string => {
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
};

const getHourFromTimeSlot = (timeSlot: { startTime: string }): string =>
  timeSlot.startTime.split(':')[0].padStart(2, '0');

const getWeekDateKey = (currentWeekStart: Date, dayKey: string): string => {
  const date = new Date(currentWeekStart);
  const dayIndex = WEEK_DAYS.findIndex(day => day.key === dayKey);
  if (dayIndex >= 0) {
    date.setDate(currentWeekStart.getDate() + dayIndex);
  }
  return formatDateKey(date);
};

const buildSlotKey = (dateKey: string, hour: string): string =>
  `${dateKey}-${hour}`;

/**
 * Hook quản lý lịch trống của gia sư

 */
export function useTutorAvailability(): UseTutorAvailabilityReturn {
  // Danh sách lịch trống của gia sư - sẽ được load từ API
  const [availabilities, setAvailabilities] = useState<TutorAvailabilityDto[]>(
    []
  );
  // Set chứa các slot đã được người dùng chọn (key: "YYYY-MM-DD-HH")
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  // Trạng thái đang tải dữ liệu
  const [isLoading, setIsLoading] = useState(false);
  // Thông báo lỗi
  const [error, setError] = useState<string | null>(null);

  // Ngày bắt đầu của tuần hiện tại (Thứ 2, 00:00:00)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Tính ngày Thứ 2
    startOfWeek.setHours(0, 0, 0, 0); // Reset về 00:00:00
    return startOfWeek;
  });

  /**
   * Tạo map để kiểm tra nhanh slot có sẵn hay không
   * Key format: "YYYY-MM-DD-HH" (ví dụ: "2024-12-01-14" = 14h ngày 1/12/2024)
   * Chỉ lấy các availability có status = Available
   */
  const availabilityMap = useMemo(() => {
    const map: { [key: string]: boolean } = {};

    availabilities.forEach(availability => {
      if (
        normalizeAvailabilityStatus(availability.status) !==
        TutorAvailabilityStatus.Available
      ) {
        return;
      }

      const dateKey = getDateKeyFromStartDate(availability.startDate);
      const timeKey = getTimeKeyFromAvailability(availability);
      map[buildSlotKey(dateKey, timeKey)] = true;
    });

    return map;
  }, [availabilities]);

  /**
   * Lấy danh sách time slots từ availabilities (unique, sorted)
   * Extract từ slot.startTime và slot.endTime của mỗi availability
   */
  const timeSlots = useMemo(() => {
    const slotMap = new Map<
      number,
      { startTime: string; endTime: string; id: number }
    >();

    availabilities.forEach(availability => {
      if (availability.slot) {
        const slotId = availability.slot.id;
        // Chỉ lấy startTime và endTime, bỏ phần seconds nếu có
        const startTime = availability.slot.startTime
          .split(':')
          .slice(0, 2)
          .join(':');
        const endTime = availability.slot.endTime
          .split(':')
          .slice(0, 2)
          .join(':');

        if (!slotMap.has(slotId)) {
          slotMap.set(slotId, {
            id: slotId,
            startTime,
            endTime,
          });
        }
      }
    });

    // Convert map to array và sort theo startTime
    const slotsArray = Array.from(slotMap.values());
    slotsArray.sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      const minutesA = timeA[0] * 60 + timeA[1];
      const minutesB = timeB[0] * 60 + timeB[1];
      return minutesA - minutesB;
    });

    return slotsArray;
  }, [availabilities]);

  /**
   * Tạo map ngày tháng hiển thị cho từng ngày trong tuần
   * Format: "DD/MM" (ví dụ: "01/12" cho ngày 1 tháng 12)
   */
  const datesByDay = useMemo(() => {
    const dates: { [key: string]: string } = {};
    WEEK_DAYS.forEach((day, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + index); // Tính ngày tương ứng
      dates[day.key] =
        date.getDate().toString().padStart(2, '0') + // Ngày, thêm số 0 phía trước nếu < 10
        '/' +
        (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng (getMonth() trả về 0-11 nên +1)
    });
    return dates;
  }, [currentWeekStart]);

  /**
   * Format chuỗi hiển thị tuần
   * Ví dụ: "Ngày 1 - 7/12/2024" (nếu cùng tháng) hoặc "Ngày 30/11 - 6/12/2024" (nếu khác tháng)
   */
  const formatWeekDisplay = useCallback(() => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 6); // Thứ 2 + 6 ngày = Chủ nhật

    const startDay = currentWeekStart.getDate();
    const startMonth = currentWeekStart.getMonth() + 1;
    const endDay = endOfWeek.getDate();
    const endMonth = endOfWeek.getMonth() + 1;
    const year = currentWeekStart.getFullYear();

    // Nếu cùng tháng: "Ngày 1 - 7/12/2024"
    if (startMonth === endMonth) {
      return `Ngày ${startDay} - ${endDay}/${startMonth}/${year}`;
    } else {
      // Nếu khác tháng: "Ngày 30/11 - 6/12/2024"
      return `Ngày ${startDay}/${startMonth} - ${endDay}/${endMonth}/${year}`;
    }
  }, [currentWeekStart]);

  /**
   * Tải danh sách lịch trống của gia sư từ API
   * Lấy tất cả availabilities (cả Available và Booked) để hiển thị đầy đủ
   *
   * @param tutorId - ID của gia sư
   */
  const loadAvailabilities = useCallback(async (tutorId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Load tất cả availabilities (không chỉ Available) để hiển thị cả booked slots
      const response = await AvailabilityService.getTutorAvailabilities(
        tutorId
      );

      if (response.success && response.data) {
        setAvailabilities(response.data);
      } else {
        setError('Không thể tải lịch trống của gia sư');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading tutor availabilities:', err);
      }
      setError('Lỗi khi tải lịch trống của gia sư');
      setAvailabilities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========== CÁC HÀM ĐIỀU HƯỚNG TUẦN ==========

  /** Chuyển sang tuần trước (trừ 7 ngày) */
  const goToPreviousWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  /** Chuyển sang tuần sau (cộng 7 ngày) */
  const goToNextWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  /** Quay về tuần hiện tại (tuần chứa ngày hôm nay) */
  const goToCurrentWeek = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Tính ngày Thứ 2
    startOfWeek.setHours(0, 0, 0, 0); // Reset về 00:00:00
    setCurrentWeekStart(startOfWeek);
  }, []);

  // ========== CÁC HÀM KIỂM TRA ==========

  /**
   * Kiểm tra xem slot có sẵn để đặt hay không
   */
  const isSlotAvailable = useCallback(
    (
      dayKey: string,
      timeSlot: { startTime: string; endTime: string; id: number }
    ) => {
      const dateKey = getWeekDateKey(currentWeekStart, dayKey);
      const hour = getHourFromTimeSlot(timeSlot);
      return Boolean(availabilityMap[buildSlotKey(dateKey, hour)]);
    },
    [currentWeekStart, availabilityMap]
  );

  /**
   * Kiểm tra xem slot đã được người dùng chọn hay chưa
   */
  const isSlotSelected = useCallback(
    (
      dayKey: string,
      timeSlot: { startTime: string; endTime: string; id: number }
    ) => {
      const dateKey = getWeekDateKey(currentWeekStart, dayKey);
      const slotKey = buildSlotKey(dateKey, getHourFromTimeSlot(timeSlot));

      // Kiểm tra trong selectedSlots Set
      return selectedSlots.has(slotKey);
    },
    [currentWeekStart, selectedSlots]
  );

  // ========== CÁC HÀM XỬ LÝ SLOT ==========

  /**
   * Xử lý khi người dùng click vào một slot
   * - Nếu slot đã chọn: bỏ chọn
   * - Nếu slot chưa chọn: chọn slot
   * - Chỉ cho phép chọn các slot có sẵn (available)
   */
  const handleSlotClick = useCallback(
    (
      dayKey: string,
      timeSlot: { startTime: string; endTime: string; id: number }
    ) => {
      if (!isSlotAvailable(dayKey, timeSlot)) {
        return;
      }

      const dateKey = getWeekDateKey(currentWeekStart, dayKey);
      const slotKey = buildSlotKey(dateKey, getHourFromTimeSlot(timeSlot));

      setSelectedSlots(prev => {
        const newSet = new Set(prev);
        if (newSet.has(slotKey)) {
          newSet.delete(slotKey);
        } else {
          newSet.add(slotKey);
        }
        return newSet;
      });
    },
    [currentWeekStart, isSlotAvailable]
  );

  /** Xóa tất cả các slot đã chọn */
  const clearSelectedSlots = useCallback(() => {
    setSelectedSlots(new Set());
  }, []);

  /**
   * Lọc các time slot có ít nhất một slot available trong tuần hiện tại
   * Dùng để chỉ hiển thị các giờ có lịch trống, ẩn các giờ không có lịch
   */
  const getAvailableTimeSlots = useCallback(
    (
      allTimeSlots: Array<{ startTime: string; endTime: string; id: number }>
    ) => {
      return allTimeSlots.filter(timeSlot => {
        // Kiểm tra xem có ít nhất một ngày trong tuần có slot này available không
        return WEEK_DAYS.some(day => isSlotAvailable(day.key, timeSlot));
      });
    },
    [isSlotAvailable]
  );

  /** Xóa thông báo lỗi */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    availabilities,
    availabilityMap,
    selectedSlots,
    currentWeekStart,
    weekDays: WEEK_DAYS,
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
    timeSlots,
    isLoading,
    error,
    clearError,
  };
}
