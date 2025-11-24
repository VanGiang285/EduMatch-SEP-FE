"use client";
import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { useRouter } from "next/navigation";
import { useWalletContext } from "@/contexts/WalletContext";

interface PageWrapperProps {
  children: ReactNode;
  currentPage: string;
}

export function PageWrapper({ children, currentPage }: PageWrapperProps) {
  const router = useRouter();
  const { balance } = useWalletContext();

  return (
    <>
      <Navbar
        onNavigateToLogin={() => router.push('/login')}
        onNavigateToRegister={() => router.push('/register')}
        onNavigateToHome={() => router.push('/')}
        onNavigateToBecomeTutor={() => router.push('/become-tutor')}
        onNavigateToFindTutor={() => router.push('/find-tutor')}
        onNavigateToAIChat={() => router.push('/ai-chat')}
        onNavigateToMessages={() => router.push('/profile?tab=messages')}
        onNavigateToNotifications={() => router.push('/profile?tab=notifications')}
        onNavigateToFavorites={() => router.push('/saved-tutors')}
        onNavigateToClassRequests={() => router.push('/class-requests')}
        currentPage={currentPage}
        walletBalance={balance}
      />
      {children}
    </>
  );
}
