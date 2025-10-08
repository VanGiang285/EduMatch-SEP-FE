"use client";

import { RegisterPage } from "@/components/auth/RegisterPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  return (
    <PageWrapper currentPage="register">
      <RegisterPage onSwitchToLogin={() => router.push('/login')} />
    </PageWrapper>
  );
}
