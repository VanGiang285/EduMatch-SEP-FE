import { useState, useCallback } from 'react';
import { BookingNoteDto } from '@/types/backend';
import { BookingNoteService } from '@/services';
import {
  BookingNoteCreateRequest,
  BookingNoteUpdateRequest,
} from '@/types/requests';

/**
 * Hook quản lý ghi chú (booking notes) cho từng booking
 * Bọc quanh BookingNoteService
 */
export function useBookingNotes(bookingId?: number) {
  const [notes, setNotes] = useState<BookingNoteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load tất cả notes của một booking
   */
  const loadNotes = useCallback(
    async (id?: number) => {
      const targetId = id ?? bookingId;
      if (!targetId || targetId <= 0) {
        setNotes([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await BookingNoteService.getByBookingId(targetId);

        if (response.success && response.data) {
          setNotes(response.data);
        } else {
          setError(
            response.error?.message ||
              'Không thể tải danh sách ghi chú. Vui lòng thử lại.'
          );
          setNotes([]);
        }
      } catch (err: any) {
        setError(
          err?.message || 'Không thể tải danh sách ghi chú. Vui lòng thử lại.'
        );
        setNotes([]);
      } finally {
        setLoading(false);
      }
    },
    [bookingId]
  );

  /**
   * Lấy 1 note theo id (ưu tiên từ state, nếu không có thì gọi API)
   */
  const getNoteById = useCallback(
    async (id: number): Promise<BookingNoteDto | null> => {
      if (!id || id <= 0) return null;

      const existing = notes.find(n => n.id === id);
      if (existing) return existing;

      try {
        setLoading(true);
        setError(null);

        const response = await BookingNoteService.getById(id);

        if (response.success && response.data) {
          // Thêm vào list nếu chưa có
          setNotes(prev => {
            const existsInState = prev.some(n => n.id === response.data!.id);
            return existsInState ? prev : [...prev, response.data!];
          });
          return response.data;
        }

        setError(
          response.error?.message ||
            'Không thể tải ghi chú. Vui lòng thử lại.'
        );
        return null;
      } catch (err: any) {
        setError(
          err?.message || 'Không thể tải ghi chú. Vui lòng thử lại.'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [notes]
  );

  /**
   * Tạo note mới cho booking hiện tại
   */
  const createNote = useCallback(
    async (request: BookingNoteCreateRequest): Promise<BookingNoteDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await BookingNoteService.create(request);

        if (response.success && response.data) {
          setNotes(prev => [...prev, response.data!]);
          return response.data;
        }

        setError(
          response.error?.message ||
            'Không thể tạo ghi chú. Vui lòng thử lại.'
        );
        return null;
      } catch (err: any) {
        setError(err?.message || 'Không thể tạo ghi chú. Vui lòng thử lại.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật note
   */
  const updateNote = useCallback(
    async (request: BookingNoteUpdateRequest): Promise<BookingNoteDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await BookingNoteService.update(request);

        if (response.success && response.data) {
          setNotes(prev =>
            prev.map(n => (n.id === request.id ? response.data! : n))
          );
          return response.data;
        }

        setError(
          response.error?.message ||
            'Không thể cập nhật ghi chú. Vui lòng thử lại.'
        );
        return null;
      } catch (err: any) {
        setError(
          err?.message || 'Không thể cập nhật ghi chú. Vui lòng thử lại.'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Xóa note
   */
  const deleteNote = useCallback(
    async (id: number): Promise<boolean> => {
      if (!id || id <= 0) return false;

      try {
        setLoading(true);
        setError(null);

        const response = await BookingNoteService.delete(id);

        if (response.success) {
          setNotes(prev => prev.filter(n => n.id !== id));
          return true;
        }

        setError(
          response.error?.message ||
            'Không thể xóa ghi chú. Vui lòng thử lại.'
        );
        return false;
      } catch (err: any) {
        setError(err?.message || 'Không thể xóa ghi chú. Vui lòng thử lại.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearNotes = useCallback(() => {
    setNotes([]);
    setError(null);
  }, []);

  return {
    notes,
    loading,
    error,
    loadNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    clearNotes,
  };
}
