"use client";
import { useToast } from '@/contexts/ToastContext';
import { ToastContainer } from './Toast';

export function ToastManager() {
  const { toasts, removeToast } = useToast();

  return (
    <ToastContainer
      toasts={toasts.map(toast => ({
        ...toast,
        onClose: removeToast
      }))}
      onClose={removeToast}
    />
  );
}
