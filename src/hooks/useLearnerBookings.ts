import { useState, useCallback, useRef, useEffect } from 'react';
import { BookingService } from '@/services';
import { BookingDto } from '@/types/backend';
import { BookingStatus } from '@/types/enums';
import { useCustomToast } from './useCustomToast';

interface LoadBookingsParams {
  status?: BookingStatus;
}

/**
 * Custom hook để quản lý việc load bookings của learner
 */
export function useLearnerBookings() {
  const { showError } = useCustomToast();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const learnerEmailRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const lastLoadParamsRef = useRef<string>('');
  const showErrorRef = useRef(showError);

  // Cập nhật ref khi value thay đổi
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  /**
   * Load bookings theo learnerEmail
   * Sử dụng useRef để tránh tạo lại function mỗi khi email thay đổi
   */
  const loadBookings = useCallback(
    async (learnerEmail: string, params?: LoadBookingsParams) => {
      if (!learnerEmail) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Tạo key để so sánh params
      const paramsKey = JSON.stringify({
        learnerEmail,
        status: params?.status,
      });

      // Tránh gọi lại nếu đang loading hoặc params giống nhau
      if (isLoadingRef.current) {
        return;
      }

      if (lastLoadParamsRef.current === paramsKey) {
        return;
      }

      try {
        isLoadingRef.current = true;
        lastLoadParamsRef.current = paramsKey;
        learnerEmailRef.current = learnerEmail;
        setLoading(true);

        const response = await BookingService.getAllByLearnerEmailNoPaging(
          learnerEmail,
          {
            status: params?.status,
          }
        );

        if (response.success && response.data) {
          setBookings(response.data || []);
        } else {
          showErrorRef.current(
            'Không thể tải danh sách lớp học',
            response.error?.message
          );
          setBookings([]);
        }
      } catch (error: any) {
        showErrorRef.current('Lỗi khi tải danh sách lớp học', error.message);
        setBookings([]);
        lastLoadParamsRef.current = ''; // Reset để có thể retry
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    [] // Loại bỏ tất cả dependencies, dùng ref thay thế
  );

  /**
   * Clear bookings
   */
  const clearBookings = useCallback(() => {
    setBookings([]);
    learnerEmailRef.current = null;
    lastLoadParamsRef.current = '';
  }, []);

  return {
    bookings,
    loading,
    loadBookings,
    clearBookings,
  };
}

