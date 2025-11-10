"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/business-admin/Dashboard';

export default function BusinessAdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/business-admin/dashboard');
  }, [router]);

  return null;
}

