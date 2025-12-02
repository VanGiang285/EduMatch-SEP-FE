import { useState, useCallback } from 'react';
import {
  LearnerTrialLessonService,
  type TrialLessonCreateRequest,
  type TrialLessonSubjectStatusDto,
} from '@/services';

/**
 * Hook quản lý trạng thái học thử (trial lesson) của learner với từng môn của gia sư
 * Bọc quanh LearnerTrialLessonService
 */
export function useLearnerTrialLessons() {
  const [subjectStatuses, setSubjectStatuses] = useState<
    TrialLessonSubjectStatusDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ghi nhận buổi học thử mới
   */
  const recordTrialLesson = useCallback(
    async (request: TrialLessonCreateRequest): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await LearnerTrialLessonService.recordTrialLesson(request);

        if (!response.success) {
          setError(
            response.error?.message ||
              'Không thể ghi nhận buổi học thử. Vui lòng thử lại.'
          );
          return false;
        }

        // Nếu đang có danh sách statuses trong state thì update luôn
        setSubjectStatuses(prev =>
          prev.map(s =>
            s.subjectId === request.subjectId ? { ...s, hasTrialed: true } : s
          )
        );

        return true;
      } catch (err: any) {
        setError(
          err?.message || 'Không thể ghi nhận buổi học thử. Vui lòng thử lại.'
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Kiểm tra learner hiện tại đã học thử môn này với gia sư chưa
   */
  const checkHasTrialLesson = useCallback(
    async (tutorId: number, subjectId: number): Promise<boolean | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await LearnerTrialLessonService.hasTrialLesson(
          tutorId,
          subjectId
        );

        if (response.success && typeof response.data === 'boolean') {
          return response.data;
        }

        setError(
          response.error?.message ||
            'Không thể kiểm tra trạng thái học thử. Vui lòng thử lại.'
        );
        return null;
      } catch (err: any) {
        setError(
          err?.message ||
            'Không thể kiểm tra trạng thái học thử. Vui lòng thử lại.'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load danh sách môn của gia sư + trạng thái đã/chưa học thử của learner
   */
  const loadSubjectTrialStatuses = useCallback(
    async (tutorId: number) => {
      if (!tutorId || tutorId <= 0) {
        setSubjectStatuses([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response =
          await LearnerTrialLessonService.getSubjectTrialStatuses(tutorId);

        if (response.success && response.data) {
          setSubjectStatuses(response.data);
        } else {
          setError(
            response.error?.message ||
              'Không thể tải danh sách trạng thái học thử.'
          );
          setSubjectStatuses([]);
        }
      } catch (err: any) {
        setError(
          err?.message || 'Không thể tải danh sách trạng thái học thử.'
        );
        setSubjectStatuses([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearSubjectStatuses = useCallback(() => {
    setSubjectStatuses([]);
    setError(null);
  }, []);

  return {
    subjectStatuses,
    loading,
    error,
    recordTrialLesson,
    checkHasTrialLesson,
    loadSubjectTrialStatuses,
    clearSubjectStatuses,
  };
}


