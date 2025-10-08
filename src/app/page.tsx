"use client";

import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const navigateToLogin = () => router.push('/login');
  const navigateToRegister = () => router.push('/register');

  return (
    <>
      <Navbar
        onNavigateToLogin={navigateToLogin}
        onNavigateToRegister={navigateToRegister}
        onNavigateToHome={() => router.push('/')}
        onNavigateToBecomeTutor={() => router.push('/become-tutor')}
        currentPage="landing"
      />
      <LandingPage
        onNavigateToLogin={navigateToLogin}
        onNavigateToRegister={navigateToRegister}
      />
    </>
  );
}
