"use client";
import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { useRouter } from "next/navigation";
interface PageWrapperProps {
  children: ReactNode;
  currentPage: string;
}
export function PageWrapper({ children, currentPage }: PageWrapperProps) {
  const router = useRouter();
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
      />
      {children}
    </>
  );
}
