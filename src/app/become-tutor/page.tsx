"use client";
import { BecomeTutorPage } from "@/components/become-tutor/BecomeTutorPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useSearchParams } from "next/navigation";

export default function BecomeTutor() {
  const searchParams = useSearchParams();
  const fromRegister = searchParams.get("from-register") === "1";

  if (fromRegister) {
    return <BecomeTutorPage />;
  }

  return (
    <PageWrapper currentPage="become-tutor">
      <BecomeTutorPage />
    </PageWrapper>
  );
}
