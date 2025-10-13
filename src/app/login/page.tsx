"use client";
import { LoginPage } from "@/components/auth/LoginPage";
import { EmailVerificationPage } from "@/components/auth/EmailVerificationPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const token = searchParams.get('token');
  // If there's a token, show email verification page
  if (token || showEmailVerification) {
    return (
      <PageWrapper currentPage="login">
        <EmailVerificationPage 
          onBackToLogin={() => {
            setShowEmailVerification(false);
            router.push('/login');
          }}
        />
      </PageWrapper>
    );
  }
  return (
    <PageWrapper currentPage="login">
      <LoginPage 
        onSwitchToRegister={() => router.push('/register')} 
        onForgotPassword={() => router.push('/forgot-password')}
      />
    </PageWrapper>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}