"use client";

import { BecomeTutorPage } from "@/components/BecomeTutorPage";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function BecomeTutor() {
  const router = useRouter();

  return (
    <>
      <Navbar
        onNavigateToLogin={() => router.push('/login')}
        onNavigateToRegister={() => router.push('/register')}
        onNavigateToHome={() => router.push('/')}
        onNavigateToBecomeTutor={() => router.push('/become-tutor')}
        currentPage="become-tutor"
      />
      <BecomeTutorPage />
    </>
  );
}
