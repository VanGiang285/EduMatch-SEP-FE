import { useToast } from '@/contexts/ToastContext';

export function useToastNotification() {
  const { addToast } = useToast();

  const showSuccess = (title: string, description?: string, duration?: number) => {
    addToast({
      type: 'success',
      title,
      description,
      duration: duration || 3000,
    });
  };

  const showError = (title: string, description?: string, duration?: number) => {
    addToast({
      type: 'error',
      title,
      description,
      duration: duration || 5000,
    });
  };

  const showWarning = (title: string, description?: string, duration?: number) => {
    addToast({
      type: 'warning',
      title,
      description,
      duration: duration || 4000,
    });
  };

  const showInfo = (title: string, description?: string, duration?: number) => {
    addToast({
      type: 'info',
      title,
      description,
      duration: duration || 3000,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
