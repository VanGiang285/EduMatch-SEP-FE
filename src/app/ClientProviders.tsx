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
