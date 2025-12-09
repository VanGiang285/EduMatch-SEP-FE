import { useState, useCallback } from 'react';
import { BookingNoteDto } from '@/types/backend';
import { BookingNoteService } from '@/services';
import {
  BookingNoteCreateRequest,
  BookingNoteUpdateRequest,
} from '@/types/requests';

export function useBookingNotes(bookingId?: number) {
  const [notes, setNotes] = useState<BookingNoteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setError(response.error?.message || 'Không thể tải ghi chú');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải ghi chú');
      } finally {
        setLoading(false);
      }
    },
    [bookingId]
  );

  const createNote = useCallback(
    async (request: BookingNoteCreateRequest) => {
      const response = await BookingNoteService.create(request);
      if (response.success && response.data) {
        setNotes(prev => [response.data!, ...prev]);
        return response.data;
      }
      return null;
    },
    []
  );

  const updateNote = useCallback(
    async (request: BookingNoteUpdateRequest) => {
      const response = await BookingNoteService.update(request);
      if (response.success && response.data) {
        setNotes(prev =>
          prev.map(n => (n.id === request.id ? response.data! : n))
        );
        return response.data;
      }
      return null;
    },
    []
  );

  const deleteNote = useCallback(async (id: number) => {
    const response = await BookingNoteService.delete(id);
    if (response.success) {
      setNotes(prev => prev.filter(n => n.id !== id));
      return true;
    }
    return false;
  }, []);

  return {
    notes,
    loading,
    error,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}


