import { useState, useCallback } from 'react';
import { TutorService } from '@/services/tutorService';
import { TutorProfileDto } from '@/types/backend';

export interface UseTutorDetailReturn {
  tutor: TutorProfileDto | null;
  isLoading: boolean;
  error: string | null;
  loadTutorDetail: (id: number) => Promise<void>;
  clearError: () => void;
}

export function useTutorDetail(): UseTutorDetailReturn {
  const [tutor, setTutor] = useState<TutorProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTutorDetail = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await TutorService.getTutorById(id);
      
      if (response.success && response.data) {
        setTutor(response.data);
      } else {
        setError('Không thể tải thông tin gia sư');
      }
    } catch (err) {
      console.error('Error loading tutor detail:', err);
      setError('Lỗi khi tải thông tin gia sư');
      setTutor(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  return {
    tutor,
    isLoading,
    error,
    loadTutorDetail,
    clearError,
  };
}
