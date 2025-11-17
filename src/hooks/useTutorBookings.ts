import { useState, useCallback, useRef, useEffect } from 'react';
import { BookingService } from '@/services';
import { TutorService } from '@/services';
import { BookingDto } from '@/types/backend';
import { BookingStatus } from '@/types/enums';
import { useCustomToast } from './useCustomToast';

interface LoadBookingsParams {
  status?: BookingStatus;
}

/**
 * Custom hook để quản lý việc load bookings của tutor
 */
export function useTutorBookings() {
  const { showError } = useCustomToast();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [tutorId, setTutorId] = useState<number | null>(null);
  const [loadingTutorId, setLoadingTutorId] = useState(false); // Bắt đầu với false, sẽ set true khi bắt đầu load
  const lastLoadedEmailRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const tutorIdRef = useRef<number | null>(null);
  const showErrorRef = useRef(showError);

  // Cập nhật refs khi values thay đổi
  useEffect(() => {
    tutorIdRef.current = tutorId;
  }, [tutorId]);

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  /**
   * Load tutor profile để lấy tutorId
   */
  const loadTutorProfile = useCallback(
    async (userEmail: string) => {
      if (!userEmail) {
        setTutorId(null);
        setLoadingTutorId(false);
        lastLoadedEmailRef.current = null;
        tutorIdRef.current = null;
        return;
      }

      // Tránh load lại nếu đang loading cùng email
      if (isLoadingRef.current && lastLoadedEmailRef.current === userEmail) {
        return;
      }

      // Nếu đã load cùng email và có tutorId, không load lại
      if (lastLoadedEmailRef.current === userEmail && tutorIdRef.current) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setLoadingTutorId(true);
        const response = await TutorService.getTutorByEmail(userEmail);
        if (response.success && response.data && response.data.id) {
          setTutorId(response.data.id);
          tutorIdRef.current = response.data.id;
          lastLoadedEmailRef.current = userEmail;
        } else {
          setTutorId(null);
          tutorIdRef.current = null;
          lastLoadedEmailRef.current = userEmail; // Vẫn set để tránh load lại
          showErrorRef.current(
            'Không thể tải thông tin gia sư',
            response.error?.message
          );
        }
      } catch (error: any) {
        setTutorId(null);
        tutorIdRef.current = null;
        lastLoadedEmailRef.current = userEmail; // Vẫn set để tránh load lại
        showErrorRef.current('Không thể tải thông tin gia sư', error.message);
      } finally {
        isLoadingRef.current = false;
        setLoadingTutorId(false);
      }
    },
    [] // Loại bỏ tất cả dependencies, dùng ref thay thế
  );

  /**
   * Load bookings theo tutorId
   * Sử dụng useRef để tránh tạo lại function mỗi khi tutorId thay đổi
   */
  const isLoadingBookingsRef = useRef(false);
  const lastLoadParamsRef = useRef<string>('');

  const loadBookings = useCallback(
    async (params?: LoadBookingsParams) => {
      const currentTutorId = tutorIdRef.current;

      if (!currentTutorId || currentTutorId <= 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Tạo key để so sánh params
      const paramsKey = JSON.stringify({
        tutorId: currentTutorId,
        status: params?.status,
      });

      // Tránh gọi lại nếu đang loading hoặc params giống nhau
      if (isLoadingBookingsRef.current) {
        return;
      }

      if (lastLoadParamsRef.current === paramsKey) {
        return;
      }

      try {
        isLoadingBookingsRef.current = true;
        lastLoadParamsRef.current = paramsKey;
        setLoading(true);

        const response = await BookingService.getAllByTutorIdNoPaging(
          currentTutorId,
          {
            status: params?.status,
          }
        );

        if (response.success && response.data) {
          setBookings(response.data || []);
        } else {
          showErrorRef.current(
            'Không thể tải danh sách đặt lịch',
            response.error?.message
          );
          setBookings([]);
        }
      } catch (error: any) {
        showErrorRef.current('Lỗi khi tải danh sách đặt lịch', error.message);
        setBookings([]);
        lastLoadParamsRef.current = ''; // Reset để có thể retry
      } finally {
        isLoadingBookingsRef.current = false;
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
  }, []);

  return {
    bookings,
    loading,
    tutorId,
    loadingTutorId,
    loadTutorProfile,
    loadBookings,
    clearBookings,
  };
}
