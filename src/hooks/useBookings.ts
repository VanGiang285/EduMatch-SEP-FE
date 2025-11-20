import { useState, useCallback } from 'react';
import {
  BookingService,
  PagedResult,
  BookingWithSchedulesCreateRequest,
  BookingUpdateRequest,
} from '@/services';
import { BookingDto } from '@/types/backend';
import { BookingStatus, PaymentStatus } from '@/types/enums';

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

  return {
    // State
    bookings,
    pagedBookings,
    bookingsCache,
    loading,
    error,
    loadingBookings,

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

    // Helper methods
    loadBookingDetails,
    getBooking,
    clearBookings,
  };
}
