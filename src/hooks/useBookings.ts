import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BookingService,
  TutorService,
  PagedResult,
  BookingWithSchedulesCreateRequest,
  BookingUpdateRequest,
} from '@/services';
import { BookingDto } from '@/types/backend';
import { BookingStatus, PaymentStatus } from '@/types/enums';
import { useCustomToast } from './useCustomToast';

/**
 * Custom hook để quản lý việc load và cache bookings
 * Cung cấp TẤT CẢ các API methods của BookingService như BE định nghĩa
 */
export function useBookings() {
  // Cache bookings theo ID để tránh load lại
  const [bookingsCache, setBookingsCache] = useState<Map<number, BookingDto>>(
    new Map()
  );
  const [loadingBookings, setLoadingBookings] = useState<Set<number>>(
    new Set()
  );

  // State cho danh sách bookings (dùng cho các query)
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [pagedBookings, setPagedBookings] =
    useState<PagedResult<BookingDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho tutor bookings helper
  const [tutorId, setTutorId] = useState<number | null>(null);
  const [loadingTutorId, setLoadingTutorId] = useState(false);
  const tutorIdRef = useRef<number | null>(null);
  const lastLoadedEmailRef = useRef<string | null>(null);
  const isLoadingTutorProfileRef = useRef(false);
  const { showError } = useCustomToast();
  const showErrorRef = useRef(showError);

  // Cập nhật refs
  useEffect(() => {
    tutorIdRef.current = tutorId;
  }, [tutorId]);

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  // Refs cho learner bookings helper
  const learnerEmailRef = useRef<string | null>(null);
  const isLoadingLearnerBookingsRef = useRef(false);
  const lastLoadLearnerParamsRef = useRef<string>('');

  // Refs cho tutor bookings helper
  const isLoadingTutorBookingsRef = useRef(false);
  const lastLoadTutorParamsRef = useRef<string>('');

  /**
   * Lấy Booking theo Id (tương ứng BookingService.getById)
   */
  const getBookingById = useCallback(
    async (id: number): Promise<BookingDto | null> => {
      // Nếu đã có trong cache, trả về luôn
      if (bookingsCache.has(id)) {
        return bookingsCache.get(id) || null;
      }

      // Nếu đang load, không load lại
      if (loadingBookings.has(id)) {
        return null;
      }

      try {
        setLoadingBookings(prev => new Set(prev).add(id));
        const response = await BookingService.getById(id);
        if (response.success && response.data) {
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            newMap.set(id, response.data!);
            return newMap;
          });
          return response.data;
        }
        return null;
      } catch (error: any) {
        console.error('Error loading booking by id:', error);
        return null;
      } finally {
        setLoadingBookings(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    [bookingsCache, loadingBookings]
  );

  /**
   * Lấy danh sách Booking theo LearnerEmail có phân trang (tương ứng BookingService.getAllByLearnerEmailPaging)
   */
  const getAllByLearnerEmailPaging = useCallback(
    async (
      email: string,
      params?: {
        status?: BookingStatus;
        tutorSubjectId?: number;
        page?: number;
        pageSize?: number;
      }
    ): Promise<PagedResult<BookingDto> | null> => {
      if (!email) {
        setPagedBookings(null);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.getAllByLearnerEmailPaging(
          email,
          params
        );

        if (response.success && response.data) {
          setPagedBookings(response.data);
          // Cập nhật cache
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            response.data!.items.forEach(booking => {
              newMap.set(booking.id, booking);
            });
            return newMap;
          });
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể tải danh sách booking'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách booking');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Lấy danh sách Booking theo LearnerEmail không phân trang (tương ứng BookingService.getAllByLearnerEmailNoPaging)
   */
  const getAllByLearnerEmailNoPaging = useCallback(
    async (
      email: string,
      params?: {
        status?: BookingStatus;
        tutorSubjectId?: number;
      }
    ): Promise<BookingDto[] | null> => {
      if (!email) {
        setBookings([]);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.getAllByLearnerEmailNoPaging(
          email,
          params
        );

        if (response.success && response.data) {
          setBookings(response.data);
          // Cập nhật cache
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            response.data!.forEach(booking => {
              newMap.set(booking.id, booking);
            });
            return newMap;
          });
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể tải danh sách booking'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách booking');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Lấy danh sách Booking theo TutorId có phân trang (tương ứng BookingService.getAllByTutorIdPaging)
   */
  const getAllByTutorIdPaging = useCallback(
    async (
      tutorId: number,
      params?: {
        status?: BookingStatus;
        tutorSubjectId?: number;
        page?: number;
        pageSize?: number;
      }
    ): Promise<PagedResult<BookingDto> | null> => {
      if (!tutorId || tutorId <= 0) {
        setPagedBookings(null);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.getAllByTutorIdPaging(
          tutorId,
          params
        );

        if (response.success && response.data) {
          setPagedBookings(response.data);
          // Cập nhật cache
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            response.data!.items.forEach(booking => {
              newMap.set(booking.id, booking);
            });
            return newMap;
          });
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể tải danh sách booking'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách booking');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Lấy danh sách Booking theo TutorId không phân trang (tương ứng BookingService.getAllByTutorIdNoPaging)
   */
  const getAllByTutorIdNoPaging = useCallback(
    async (
      tutorId: number,
      params?: {
        status?: BookingStatus;
        tutorSubjectId?: number;
      }
    ): Promise<BookingDto[] | null> => {
      if (!tutorId || tutorId <= 0) {
        setBookings([]);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.getAllByTutorIdNoPaging(
          tutorId,
          params
        );

        if (response.success && response.data) {
          setBookings(response.data);
          // Cập nhật cache
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            response.data!.forEach(booking => {
              newMap.set(booking.id, booking);
            });
            return newMap;
          });
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể tải danh sách booking'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách booking');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Tạo Booking mới với Schedules (tương ứng BookingService.createBooking)
   */
  const createBooking = useCallback(
    async (
      request: BookingWithSchedulesCreateRequest
    ): Promise<BookingDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.createBooking(request);

        if (response.success && response.data) {
          // Thêm vào cache
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            newMap.set(response.data!.id, response.data!);
            return newMap;
          });
          // Thêm vào danh sách nếu đang hiển thị
          setBookings(prev => [...prev, response.data!]);
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể tạo booking');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tạo booking');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật Booking (tương ứng BookingService.updateBooking)
   */
  const updateBooking = useCallback(
    async (request: BookingUpdateRequest): Promise<BookingDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.updateBooking(request);

        if (response.success && response.data) {
          // Cập nhật cache
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            newMap.set(request.id, response.data!);
            return newMap;
          });
          // Cập nhật trong danh sách
          setBookings(prev =>
            prev.map(b => (b.id === request.id ? response.data! : b))
          );
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể cập nhật booking');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật booking');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật PaymentStatus của Booking (tương ứng BookingService.updatePaymentStatus)
   */
  const updatePaymentStatus = useCallback(
    async (
      id: number,
      paymentStatus: PaymentStatus
    ): Promise<BookingDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.updatePaymentStatus(
          id,
          paymentStatus
        );

        if (response.success && response.data) {
          // Cập nhật cache
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            newMap.set(id, response.data!);
            return newMap;
          });
          // Cập nhật trong danh sách
          setBookings(prev =>
            prev.map(b => (b.id === id ? response.data! : b))
          );
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể cập nhật payment status'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật payment status');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật Status của Booking (tương ứng BookingService.updateStatus)
   */
  const updateStatus = useCallback(
    async (id: number, status: BookingStatus): Promise<BookingDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.updateStatus(id, status);

        if (response.success && response.data) {
          // Cập nhật cache
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            newMap.set(id, response.data!);
            return newMap;
          });
          // Cập nhật trong danh sách
          setBookings(prev =>
            prev.map(b => (b.id === id ? response.data! : b))
          );
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể cập nhật status');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật status');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Thanh toán Booking (tương ứng BookingService.payBooking)
   */
  const payBooking = useCallback(
    async (id: number): Promise<BookingDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await BookingService.payBooking(id);

        if (response.success && response.data) {
          setBookingsCache(prev => {
            const newMap = new Map(prev);
            newMap.set(id, response.data!);
            return newMap;
          });
          setBookings(prev =>
            prev.map(b => (b.id === id ? response.data! : b))
          );
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể thanh toán booking');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi thanh toán booking');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load nhiều booking details cùng lúc (helper method)
   */
  const loadBookingDetails = useCallback(
    async (bookingIds: number[]): Promise<void> => {
      const idsToLoad = bookingIds.filter(
        id => !bookingsCache.has(id) && !loadingBookings.has(id)
      );

      if (idsToLoad.length > 0) {
        await Promise.all(idsToLoad.map(id => getBookingById(id)));
      }
    },
    [bookingsCache, loadingBookings, getBookingById]
  );

  /**
   * Lấy booking từ cache hoặc từ schedule (helper method)
   */
  const getBooking = useCallback(
    (
      bookingId: number | undefined,
      bookingFromSchedule?: BookingDto
    ): BookingDto | undefined => {
      if (bookingFromSchedule) {
        return bookingFromSchedule;
      }
      if (bookingId) {
        return bookingsCache.get(bookingId);
      }
      return undefined;
    },
    [bookingsCache]
  );

  /**
   * Clear tất cả bookings
   */
  const clearBookings = useCallback(() => {
    setBookingsCache(new Map());
    setLoadingBookings(new Set());
    setBookings([]);
    setPagedBookings(null);
    setError(null);
  }, []);

  // ========== HELPER METHODS CHO LEARNER BOOKINGS ==========

  /**
   * Helper: Load bookings của learner (wrapper cho getAllByLearnerEmailNoPaging với state management)
   * Tương tự useLearnerBookings nhưng tích hợp vào useBookings
   */
  const loadLearnerBookings = useCallback(
    async (
      learnerEmail: string,
      params?: {
        status?: BookingStatus;
      }
    ) => {
      if (!learnerEmail) {
        setBookings([]);
        return;
      }

      // Tạo key để so sánh params
      const paramsKey = JSON.stringify({
        learnerEmail,
        status: params?.status,
      });

      // Tránh gọi lại nếu đang loading hoặc params giống nhau
      if (isLoadingLearnerBookingsRef.current) {
        return;
      }

      if (lastLoadLearnerParamsRef.current === paramsKey) {
        return;
      }

      try {
        isLoadingLearnerBookingsRef.current = true;
        lastLoadLearnerParamsRef.current = paramsKey;
        learnerEmailRef.current = learnerEmail;

        await getAllByLearnerEmailNoPaging(learnerEmail, params);
      } catch (error: any) {
        showErrorRef.current('Lỗi khi tải danh sách lớp học', error.message);
        setBookings([]);
        lastLoadLearnerParamsRef.current = ''; // Reset để có thể retry
      } finally {
        isLoadingLearnerBookingsRef.current = false;
      }
    },
    [getAllByLearnerEmailNoPaging]
  );

  // ========== HELPER METHODS CHO TUTOR BOOKINGS ==========

  /**
   * Helper: Load tutor profile để lấy tutorId từ email
   * Tương tự useTutorBookings nhưng tích hợp vào useBookings
   */
  const loadTutorProfile = useCallback(async (userEmail: string) => {
    if (!userEmail) {
      setTutorId(null);
      setLoadingTutorId(false);
      lastLoadedEmailRef.current = null;
      tutorIdRef.current = null;
      return;
    }

    // Tránh load lại nếu đang loading cùng email
    if (
      isLoadingTutorProfileRef.current &&
      lastLoadedEmailRef.current === userEmail
    ) {
      return;
    }

    // Nếu đã load cùng email và có tutorId, không load lại
    if (lastLoadedEmailRef.current === userEmail && tutorIdRef.current) {
      return;
    }

    try {
      isLoadingTutorProfileRef.current = true;
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
      isLoadingTutorProfileRef.current = false;
      setLoadingTutorId(false);
    }
  }, []);

  /**
   * Helper: Load bookings của tutor (wrapper cho getAllByTutorIdNoPaging với state management)
   * Tương tự useTutorBookings nhưng tích hợp vào useBookings
   */
  const loadTutorBookings = useCallback(
    async (params?: { status?: BookingStatus }) => {
      const currentTutorId = tutorIdRef.current;

      if (!currentTutorId || currentTutorId <= 0) {
        setBookings([]);
        return;
      }

      // Tạo key để so sánh params
      const paramsKey = JSON.stringify({
        tutorId: currentTutorId,
        status: params?.status,
      });

      // Tránh gọi lại nếu đang loading hoặc params giống nhau
      if (isLoadingTutorBookingsRef.current) {
        return;
      }

      if (lastLoadTutorParamsRef.current === paramsKey) {
        return;
      }

      try {
        isLoadingTutorBookingsRef.current = true;
        lastLoadTutorParamsRef.current = paramsKey;

        await getAllByTutorIdNoPaging(currentTutorId, params);
      } catch (error: any) {
        showErrorRef.current('Lỗi khi tải danh sách đặt lịch', error.message);
        setBookings([]);
        lastLoadTutorParamsRef.current = ''; // Reset để có thể retry
      } finally {
        isLoadingTutorBookingsRef.current = false;
      }
    },
    [getAllByTutorIdNoPaging]
  );

  return {
    // State
    bookings,
    pagedBookings,
    bookingsCache,
    loading,
    error,
    loadingBookings,
    tutorId,
    loadingTutorId,

    // API Methods (tương ứng BookingService)
    getBookingById,
    getAllByLearnerEmailPaging,
    getAllByLearnerEmailNoPaging,
    getAllByTutorIdPaging,
    getAllByTutorIdNoPaging,
    createBooking,
    updateBooking,
    updatePaymentStatus,
    updateStatus,
    payBooking,

    // Helper methods
    loadBookingDetails,
    getBooking,
    clearBookings,

    // Helper methods cho learner bookings
    loadLearnerBookings,

    // Helper methods cho tutor bookings
    loadTutorProfile,
    loadTutorBookings,
  };
}
