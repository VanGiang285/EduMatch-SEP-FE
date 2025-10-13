"use client";
import { RegisterPage } from "@/components/auth/RegisterPage";
import { EmailVerificationPage } from "@/components/auth/EmailVerificationPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const token = searchParams.get('token');
  // If there's a token, show email verification page
  if (token || showEmailVerification) {
    return (
      <PageWrapper currentPage="register">
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
    <PageWrapper currentPage="register">
      <RegisterPage onSwitchToLogin={() => router.push('/login')} />
    </PageWrapper>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}