"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}
