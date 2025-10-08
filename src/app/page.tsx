"use client";

import { LandingPage } from "@/components/landing/LandingPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const navigateToLogin = () => router.push('/login');
  const navigateToRegister = () => router.push('/register');

  return (
    <PageWrapper currentPage="landing">
      <LandingPage
        onNavigateToLogin={navigateToLogin}
        onNavigateToRegister={navigateToRegister}
      />
    </PageWrapper>
  );
}
