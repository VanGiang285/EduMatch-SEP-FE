"use client";

import { LoginPage } from "@/components/LoginPage";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Login() {
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
      <LoginPage 
        onSwitchToRegister={() => router.push('/register')} 
        onForgotPassword={() => router.push('/forgot-password')}
      />
    </>
  );
}
