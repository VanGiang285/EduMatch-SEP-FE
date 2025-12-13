import { useCallback, useState } from 'react';
import { ScheduleChangeRequestDto } from '@/types/backend';
import { ScheduleChangeRequestStatus } from '@/types/enums';
import {
  ScheduleChangeRequestCreateRequest,
  ScheduleChangeRequestService,
} from '@/services/scheduleChangeRequestService';

export function useScheduleChangeRequests() {
  const [items, setItems] = useState<ScheduleChangeRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadByRequesterEmail = useCallback(
    async (email: string, status?: ScheduleChangeRequestStatus) => {
      if (!email) return;
      try {
        setLoading(true);
        setError(null);
        const res = await ScheduleChangeRequestService.getAllByRequesterEmail(
          email,
          status
        );
        if (res.success && res.data) {
          setItems(res.data);
        } else {
          setError(
            res.error?.message ||
              res.message ||
              'Không thể tải yêu cầu đổi lịch'
          );
          setItems([]);
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải yêu cầu đổi lịch');
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadByRequestedToEmail = useCallback(
    async (email: string, status?: ScheduleChangeRequestStatus) => {
      if (!email) return;
      try {
        setLoading(true);
        setError(null);
        const res = await ScheduleChangeRequestService.getAllByRequestedToEmail(
          email,
          status
        );
        if (res.success && res.data) {
          setItems(res.data);
        } else {
          setError(
            res.error?.message ||
              res.message ||
              'Không thể tải yêu cầu đổi lịch'
          );
          setItems([]);
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải yêu cầu đổi lịch');
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const create = useCallback(
    async (
      payload: ScheduleChangeRequestCreateRequest
    ): Promise<ScheduleChangeRequestDto | null> => {
      try {
        setLoading(true);
        setError(null);
        const res = await ScheduleChangeRequestService.create(payload);
        if (res.success && res.data) {
          setItems(prev => [res.data!, ...prev]);
          return res.data;
        } else {
          setError(
            res.error?.message ||
              res.message ||
              'Không thể tạo yêu cầu đổi lịch'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tạo yêu cầu đổi lịch');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (
      id: number,
      status: ScheduleChangeRequestStatus
    ): Promise<ScheduleChangeRequestDto | null> => {
      try {
        setLoading(true);
        setError(null);
        const res = await ScheduleChangeRequestService.updateStatus(id, status);
        if (res.success && res.data) {
          setItems(prev =>
            prev.map(item =>
              item.id === id ? { ...item, ...res.data! } : item
            )
          );
          return res.data;
        } else {
          setError(
            res.error?.message || res.message || 'Không thể cập nhật trạng thái'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật trạng thái');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Helpers: fetch nhưng không đụng tới items state
  const fetchByRequesterEmail = useCallback(
    async (
      email: string,
      status?: ScheduleChangeRequestStatus
    ): Promise<ScheduleChangeRequestDto[]> => {
      if (!email) return [];
      try {
        const res = await ScheduleChangeRequestService.getAllByRequesterEmail(
          email,
          status
        );
        if (res.success && res.data) return res.data;
        setError(
          res.error?.message || res.message || 'Không thể tải yêu cầu đổi lịch'
        );
        return [];
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải yêu cầu đổi lịch');
        return [];
      }
    },
    []
  );

  const fetchByRequestedToEmail = useCallback(
    async (
      email: string,
      status?: ScheduleChangeRequestStatus
    ): Promise<ScheduleChangeRequestDto[]> => {
      if (!email) return [];
      try {
        const res = await ScheduleChangeRequestService.getAllByRequestedToEmail(
          email,
          status
        );
        if (res.success && res.data) return res.data;
        setError(
          res.error?.message || res.message || 'Không thể tải yêu cầu đổi lịch'
        );
        return [];
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải yêu cầu đổi lịch');
        return [];
      }
    },
    []
  );

  const fetchByScheduleId = useCallback(
    async (
      scheduleId: number,
      status?: ScheduleChangeRequestStatus
    ): Promise<ScheduleChangeRequestDto[]> => {
      if (!scheduleId) return [];
      try {
        const res = await ScheduleChangeRequestService.getAllByScheduleId(
          scheduleId,
          status
        );
        if (res.success && res.data) return res.data;
        setError(
          res.error?.message || res.message || 'Không thể tải yêu cầu đổi lịch'
        );
        return [];
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải yêu cầu đổi lịch');
        return [];
      }
    },
    []
  );

  const fetchById = useCallback(
    async (id: number): Promise<ScheduleChangeRequestDto | null> => {
      if (!id) return null;
      try {
        const res = await ScheduleChangeRequestService.getById(id);
        if (res.success && res.data) return res.data;
        setError(
          res.error?.message || res.message || 'Không thể tải yêu cầu đổi lịch'
        );
        return null;
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải yêu cầu đổi lịch');
        return null;
      }
    },
    []
  );

  return {
    items,
    loading,
    error,
    create,
    updateStatus,
    loadByRequesterEmail,
    loadByRequestedToEmail,
    fetchByRequesterEmail,
    fetchByRequestedToEmail,
    fetchByScheduleId,
    fetchById,
  };
}
