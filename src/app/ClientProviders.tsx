"use client";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/feedback/sonner";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { setupGlobalErrorHandler } from "@/lib/error-handler";
import { useEffect } from "react";

function GlobalErrorHandler() {
  useEffect(() => {
    setupGlobalErrorHandler();
    
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error;
      if (error && (
        error.message?.includes('Loading chunk') ||
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Cannot find module') ||
        error.name === 'ChunkLoadError'
      )) {
        event.preventDefault();
        if (typeof window !== 'undefined' && 'caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }
        window.location.reload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason && (
        reason.message?.includes('Loading chunk') ||
        reason.message?.includes('Failed to fetch dynamically imported module') ||
        reason.message?.includes('Cannot find module') ||
        reason.name === 'ChunkLoadError'
      )) {
        event.preventDefault();
        if (typeof window !== 'undefined' && 'caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  return null;
}
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalErrorHandler />
      <ErrorBoundary>
        <AuthProvider>
          <WalletProvider>
            <ChatProvider>
              {children}
              <FloatingChat />
              <Toaster />
            </ChatProvider>
          </WalletProvider>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}
