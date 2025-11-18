"use client";
import { AIChatPage } from "@/components/chat/AIChatPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useRouter } from "next/navigation";

export default function AIChat() {
  const router = useRouter();
  const navigateToLogin = () => router.push('/login');
  const navigateToRegister = () => router.push('/register');

  return (
    <PageWrapper currentPage="ai-chat">
      <AIChatPage />
    </PageWrapper>
  );
}

