"use client";
import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useRouter } from "next/navigation";
export default function ForgotPassword() {
  const router = useRouter();
  return (
    <PageWrapper currentPage="login">
      <ForgotPasswordPage onBackToLogin={() => router.push('/login')} />
    </PageWrapper>
  );
}