import { useState, useCallback } from 'react';
import { SubjectService } from '@/services/subjectService';
import { SubjectDto, TutorSubjectDto } from '@/types/backend';
import {
  TutorSubjectCreateRequest,
  TutorSubjectUpdateRequest,
} from '@/types/requests';

export interface UseSubjectReturn {
  subjects: SubjectDto[];
  tutorSubjects: TutorSubjectDto[];
  loading: boolean;
  error: string | null;

  // Subject master data
  loadAllSubjects: () => Promise<SubjectDto[] | null>;
  getSubjectById: (id: number) => Promise<SubjectDto | null>;

  // Tutor subjects
  loadTutorSubjects: (tutorId: number) => Promise<TutorSubjectDto[] | null>;
  createTutorSubject: (
    tutorId: number,
    request: Omit<TutorSubjectCreateRequest, 'tutorId'>
  ) => Promise<TutorSubjectDto | null>;
  updateTutorSubject: (
    tutorId: number,
    request: TutorSubjectUpdateRequest
  ) => Promise<TutorSubjectDto | null>;
  deleteTutorSubject: (tutorId: number, subjectId?: number) => Promise<boolean>;

  clearError: () => void;
}

export function useSubject(): UseSubjectReturn {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [tutorSubjects, setTutorSubjects] = useState<TutorSubjectDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SubjectService.getAllSubjects();

      if (response.success && response.data) {
        setSubjects(response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Không thể tải danh sách môn học');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách môn học');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubjectById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await SubjectService.getSubjectById(id);

      if (response.success && response.data) {
        setSubjects(prev => {
          const exists = prev.some(s => s.id === response.data!.id);
          if (exists) {
            return prev.map(s =>
              s.id === response.data!.id ? response.data! : s
            );
          }
          return [...prev, response.data!];
        });
        return response.data;
      } else {
        setError(response.error?.message || 'Không thể tải thông tin môn học');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải thông tin môn học');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTutorSubjects = useCallback(async (tutorId: number) => {
    if (!tutorId || tutorId <= 0) {
      setTutorSubjects([]);
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await SubjectService.getTutorSubjects(tutorId);

      if (response.success && response.data) {
        setTutorSubjects(response.data);
        return response.data;
      } else {
        setError(
          response.error?.message ||
            'Không thể tải danh sách môn học mà gia sư đang dạy'
        );
        return null;
      }
    } catch (err: any) {
      setError(
        err.message || 'Lỗi khi tải danh sách môn học mà gia sư đang dạy'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTutorSubject = useCallback<
    UseSubjectReturn['createTutorSubject']
  >(async (tutorId, request) => {
    try {
      setLoading(true);
      setError(null);

      const response = await SubjectService.createTutorSubject(tutorId, request);

      if (response.success && response.data) {
        setTutorSubjects(prev => [...prev, response.data!]);
        return response.data;
      } else {
        setError(
          response.error?.message || 'Không thể thêm môn học cho gia sư'
        );
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thêm môn học cho gia sư');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTutorSubject = useCallback<
    UseSubjectReturn['updateTutorSubject']
  >(async (tutorId, request) => {
    try {
      setLoading(true);
      setError(null);

      const response = await SubjectService.updateTutorSubject(tutorId, request);

      if (response.success && response.data) {
        setTutorSubjects(prev =>
          prev.map(ts => (ts.id === response.data!.id ? response.data! : ts))
        );
        return response.data;
      } else {
        setError(
          response.error?.message || 'Không thể cập nhật môn học của gia sư'
        );
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật môn học của gia sư');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTutorSubject = useCallback<
    UseSubjectReturn['deleteTutorSubject']
  >(async (tutorId, subjectId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await SubjectService.deleteTutorSubject(
        tutorId,
        subjectId
      );

      if (response.success) {
        if (subjectId) {
          setTutorSubjects(prev =>
            prev.filter(ts => ts.subjectId !== subjectId)
          );
        } else {
          setTutorSubjects([]);
        }
        return true;
      } else {
        setError(response.error?.message || 'Không thể xóa môn học của gia sư');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa môn học của gia sư');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    subjects,
    tutorSubjects,
    loading,
    error,
    loadAllSubjects,
    getSubjectById,
    loadTutorSubjects,
    createTutorSubject,
    updateTutorSubject,
    deleteTutorSubject,
    clearError,
  };
}


