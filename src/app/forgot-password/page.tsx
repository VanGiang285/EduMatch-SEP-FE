"use client";

import { ForgotPasswordPage } from "@/components/ForgotPasswordPage";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();

  return (
    <>
      <Navbar
        onNavigateToLogin={() => router.push('/login')}
        onNavigateToRegister={() => router.push('/register')}
        onNavigateToHome={() => router.push('/')}
        onNavigateToBecomeTutor={() => router.push('/become-tutor')}
        currentPage="login"
      />
      <ForgotPasswordPage onBackToLogin={() => router.push('/login')} />
    </>
  );
}
