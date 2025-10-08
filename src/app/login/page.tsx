"use client";

import { LoginPage } from "@/components/auth/LoginPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  return (
    <PageWrapper currentPage="login">
      <LoginPage 
        onSwitchToRegister={() => router.push('/register')} 
        onForgotPassword={() => router.push('/forgot-password')}
      />
    </PageWrapper>
  );
}
