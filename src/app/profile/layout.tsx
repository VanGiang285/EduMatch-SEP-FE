"use client";
import { ReactNode } from "react";
import { PageWrapper } from "@/components/common/PageWrapper";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <PageWrapper currentPage="profile">
      {children}
    </PageWrapper>
  );
}
