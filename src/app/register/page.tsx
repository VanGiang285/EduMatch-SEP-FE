"use client";

import { RegisterPage } from "@/components/RegisterPage";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  return (
    <>
      <Navbar
        onNavigateToLogin={() => router.push('/login')}
        onNavigateToRegister={() => router.push('/register')}
        onNavigateToHome={() => router.push('/')}
        onNavigateToBecomeTutor={() => router.push('/become-tutor')}
        currentPage="register"
      />
      <RegisterPage onSwitchToLogin={() => router.push('/login')} />
    </>
  );
}
