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

  return {
    items,
    loading,
    error,
    create,
    updateStatus,
    loadByRequesterEmail,
    loadByRequestedToEmail,
  };
}
