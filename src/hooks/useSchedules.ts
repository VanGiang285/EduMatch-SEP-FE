import { useState, useCallback } from 'react';
import { ScheduleService } from '@/services';
import { ScheduleDto } from '@/types/backend';

/**
 * Custom hook để quản lý việc load và cache schedules theo bookingId
 */
export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load schedules theo bookingId
   */
  const loadSchedules = useCallback(async (bookingId: number) => {
    if (!bookingId) {
      setSchedules([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await ScheduleService.getAllNoPaging(bookingId);

      if (response.success && response.data) {
        setSchedules(response.data);
      } else {
        setError(response.error?.message || 'Không thể tải danh sách buổi học');
        setSchedules([]);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách buổi học');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear schedules
   */
  const clearSchedules = useCallback(() => {
    setSchedules([]);
    setError(null);
  }, []);

  return {
    schedules,
    loading,
    error,
    loadSchedules,
    clearSchedules,
  };
}
