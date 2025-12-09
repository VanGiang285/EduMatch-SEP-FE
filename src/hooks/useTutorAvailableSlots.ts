import { useCallback, useState } from 'react';
import { TutorAvailabilityDto } from '@/types/backend';
import { AvailabilityService } from '@/services/availabilityService';

export function useTutorAvailableSlots() {
  const [slots, setSlots] = useState<TutorAvailabilityDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(
    async (tutorId: number): Promise<TutorAvailabilityDto[]> => {
      if (!tutorId) {
        setSlots([]);
        return [];
      }
      try {
        setLoading(true);
        setError(null);
        const res = await AvailabilityService.getAvailableSlots(tutorId);
        if (res.success && res.data) {
          setSlots(res.data);
          return res.data;
        } else {
          const msg =
            res.error?.message ||
            res.message ||
            'Không thể tải lịch rảnh của gia sư';
          setError(msg);
          setSlots([]);
          return [];
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải lịch rảnh của gia sư');
        setSlots([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    slots,
    loading,
    error,
    loadSlots,
  };
}
