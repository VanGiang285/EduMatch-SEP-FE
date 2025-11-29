import { useState, useCallback } from 'react';
import { ScheduleService } from '@/services';
import type {
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
} from '@/services/scheduleService';
import { ScheduleDto } from '@/types/backend';
import { ScheduleStatus } from '@/types/enums';

/**
 * Custom hook để quản lý việc load và cache schedules
 * Cung cấp các API methods của ScheduleService như BE định nghĩa
 */
export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy schedule theo Id (tương ứng ScheduleService.getById)
   */
  const getScheduleById = useCallback(
    async (scheduleId: number): Promise<ScheduleDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.getById(scheduleId);

        if (response.success && response.data) {
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể tải thông tin buổi học'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin buổi học');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Lấy schedule theo AvailabilityId (tương ứng ScheduleService.getByAvailabilityId)
   */
  const getScheduleByAvailabilityId = useCallback(
    async (availabilityId: number): Promise<ScheduleDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.getByAvailabilityId(
          availabilityId
        );

        if (response.success && response.data) {
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể tải thông tin buổi học'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin buổi học');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load schedules theo bookingId (không phân trang) - tương ứng ScheduleService.getAllNoPaging
   */
  const loadSchedulesByBookingId = useCallback(
    async (bookingId: number, status?: ScheduleStatus) => {
      if (!bookingId) {
        setSchedules([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.getAllNoPaging(
          bookingId,
          status
        );

        if (response.success && response.data) {
          setSchedules(response.data);
        } else {
          setError(
            response.error?.message || 'Không thể tải danh sách buổi học'
          );
          setSchedules([]);
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách buổi học');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load schedules theo learner email - tương ứng ScheduleService.getAllByLearnerEmail
   */
  const loadSchedulesByLearnerEmail = useCallback(
    async (
      learnerEmail: string,
      params?: {
        startDate?: Date | string;
        endDate?: Date | string;
        status?: ScheduleStatus;
      }
    ) => {
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
          setError(
            response.error?.message || 'Không thể tải danh sách buổi học'
          );
          setSchedules([]);
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách buổi học');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load schedules theo tutor email - tương ứng ScheduleService.getAllByTutorEmail
   */
  const loadSchedulesByTutorEmail = useCallback(
    async (
      tutorEmail: string,
      params?: {
        startDate?: Date | string;
        endDate?: Date | string;
        status?: ScheduleStatus;
      }
    ) => {
      if (!tutorEmail) {
        setSchedules([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.getAllByTutorEmail(
          tutorEmail,
          params
        );

        if (response.success && response.data) {
          setSchedules(response.data);
        } else {
          setError(
            response.error?.message || 'Không thể tải danh sách buổi học'
          );
          setSchedules([]);
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách buổi học');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Tạo schedule mới (tương ứng ScheduleService.createSchedule)
   */
  const createSchedule = useCallback(
    async (request: ScheduleCreateRequest): Promise<ScheduleDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.createSchedule(request);

        if (response.success && response.data) {
          // Thêm vào danh sách nếu cùng bookingId
          setSchedules(prev => [...prev, response.data!]);
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể tạo buổi học');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tạo buổi học');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật schedule (tương ứng ScheduleService.updateSchedule)
   */
  const updateSchedule = useCallback(
    async (request: ScheduleUpdateRequest): Promise<ScheduleDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.updateSchedule(request);

        if (response.success && response.data) {
          // Cập nhật trong danh sách
          setSchedules(prev =>
            prev.map(s => (s.id === request.id ? response.data! : s))
          );
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể cập nhật buổi học');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật buổi học');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật Status của Schedule (tương ứng ScheduleService.updateStatus)
   */
  const updateScheduleStatus = useCallback(
    async (id: number, status: ScheduleStatus): Promise<ScheduleDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.updateStatus(id, status);

        if (response.success && response.data) {
          // Cập nhật trong danh sách
          setSchedules(prev =>
            prev.map(s => (s.id === id ? response.data! : s))
          );
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể cập nhật trạng thái buổi học');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật trạng thái buổi học');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Hủy toàn bộ schedules theo bookingId (tương ứng ScheduleService.cancelAllByBooking)
   */
  const cancelAllSchedulesByBooking = useCallback(
    async (bookingId: number): Promise<ScheduleDto[] | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await ScheduleService.cancelAllByBooking(bookingId);

        if (response.success && response.data) {
          // Cập nhật danh sách
          setSchedules(prev =>
            prev.map(s => {
              const updated = response.data!.find(rs => rs.id === s.id);
              return updated || s;
            })
          );
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể hủy các buổi học');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi hủy các buổi học');
        return null;
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

  // ========== HELPER METHODS CHO LEARNER SCHEDULES ==========

  /**
   * Helper: Load schedules của learner (alias cho loadSchedulesByLearnerEmail)
   * Tương tự useLearnerSchedules nhưng tích hợp vào useSchedules
   */
  const loadLearnerSchedules = useCallback(
    async (
      learnerEmail: string,
      params?: {
        startDate?: Date | string;
        endDate?: Date | string;
        status?: ScheduleStatus;
      }
    ) => {
      await loadSchedulesByLearnerEmail(learnerEmail, params);
    },
    [loadSchedulesByLearnerEmail]
  );

  return {
    schedules,
    loading,
    error,
    getScheduleById,
    getScheduleByAvailabilityId,
    loadSchedulesByBookingId,
    loadSchedulesByLearnerEmail,
    loadSchedulesByTutorEmail,
    createSchedule,
    updateSchedule,
    updateScheduleStatus,
    cancelAllSchedulesByBooking,
    clearSchedules,

    // Helper methods cho learner schedules
    loadLearnerSchedules,
  };
}
