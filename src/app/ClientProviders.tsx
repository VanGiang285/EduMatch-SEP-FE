"use client";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastManager } from "@/components/common/ToastManager";
import { setupGlobalErrorHandler } from "@/lib/error-handler";
import { useEffect } from "react";
function GlobalErrorHandler() {
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);
  return null;
}
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalErrorHandler />
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            {children}
            <ToastManager />
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </>
  );
}
