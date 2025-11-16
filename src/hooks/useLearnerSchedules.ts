import { useState, useCallback } from 'react';
import { ScheduleService } from '@/services';
import { ScheduleDto } from '@/types/backend';
import { ScheduleStatus } from '@/types/enums';

interface LoadSchedulesParams {
  startDate?: string;
  endDate?: string;
  status?: ScheduleStatus;
}

/**
 * Custom hook để quản lý việc load schedules của learner
 */
export function useLearnerSchedules() {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load schedules theo learner email
   */
  const loadSchedules = useCallback(
    async (learnerEmail: string, params?: LoadSchedulesParams) => {
      if (!learnerEmail) {
        setSchedules([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.getAllByLearnerEmail(
          learnerEmail,
          params
        );

        if (response.success && response.data) {
          setSchedules(response.data);
        } else {
          setError(response.error?.message || 'Không thể tải lịch học');
          setSchedules([]);
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải lịch học');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
