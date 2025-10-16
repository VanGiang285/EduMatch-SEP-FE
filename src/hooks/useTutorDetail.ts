import { useState, useEffect, useCallback } from 'react';
import { ManageTutorProfileService, TutorProfile } from '@/services/tutorManagementService';
import { ApiResponse } from '@/types/api';

export interface UseTutorDetailReturn {
  tutor: TutorProfile | null;
  isLoading: boolean;
  error: string | null;
  loadTutorDetail: (id: number) => Promise<void>;
  clearError: () => void;
}

export function useTutorDetail(): UseTutorDetailReturn {
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTutorDetail = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading tutor detail for ID:', id);
      const response = await ManageTutorProfileService.getTutorProfileById(id);
      console.log('📊 Tutor detail response:', response);
      
      if (response.success && response.data) {
        setTutor(response.data);
        console.log('✅ Tutor detail loaded successfully');
      } else {
        setError('Không thể tải thông tin gia sư');
        console.log('❌ Failed to load tutor detail');
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
