import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BecomeTutorService } from '@/services/becomeTutorService';
import { BecomeTutorRequest } from '@/types/requests';

export interface UseBecomeTutorReturn {
  isSubmitting: boolean;
  error: string | null;
  submitApplication: (data: BecomeTutorRequest) => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  redirectToLogin: () => void;
}

export function useBecomeTutor(): UseBecomeTutorReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const submitApplication = useCallback(async (data: BecomeTutorRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🚀 Submitting tutor application:', data);
      const response = await BecomeTutorService.becomeTutor(data);
      console.log('📊 Application response:', response);

      if (response.success && response.data) {
        console.log('✅ Application submitted successfully');
        router.push('/become-tutor/success');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi gửi đơn đăng ký');
        console.log('❌ Application failed:', response.message);
      }
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Lỗi khi gửi đơn đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const redirectToLogin = useCallback(() => {
    router.push('/login?redirect=/become-tutor');
  }, [router]);

  return {
    isSubmitting,
    error,
    submitApplication,
    clearError,
    isAuthenticated,
    redirectToLogin,
  };
}
