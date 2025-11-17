"use client";
import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

interface PageWrapperProps {
  children: ReactNode;
  currentPage: string;
}

export function PageWrapper({ children, currentPage }: PageWrapperProps) {
  const router = useRouter();
  const { balance } = useWallet();

  return (
    <>
      <Navbar
        onNavigateToLogin={() => router.push('/login')}
        onNavigateToRegister={() => router.push('/register')}
        onNavigateToHome={() => router.push('/')}
        onNavigateToBecomeTutor={() => router.push('/become-tutor')}
        onNavigateToFindTutor={() => router.push('/find-tutor')}
        onNavigateToMessages={() => router.push('/messages')}
        onNavigateToNotifications={() => router.push('/notifications')}
        onNavigateToFavorites={() => router.push('/saved-tutors')}
        onNavigateToClassRequests={() => router.push('/class-requests')}
        currentPage={currentPage}
        walletBalance={balance}
      />
      {children}
    </>
  );
}
