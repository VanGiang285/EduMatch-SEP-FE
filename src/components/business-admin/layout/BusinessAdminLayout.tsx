"use client";

import React from 'react';
import { BusinessAdminNavbar } from './BusinessAdminNavbar';
import { usePathname } from 'next/navigation';

interface BusinessAdminLayoutProps {
  children: React.ReactNode;
}

export function BusinessAdminLayout({ children }: BusinessAdminLayoutProps) {
  const pathname = usePathname();
  
  // Map pathname to view ID
  const getCurrentView = () => {
    if (pathname?.includes('/dashboard')) return 'dashboard';
    if (pathname?.includes('/learners')) return 'learners';
    if (pathname?.includes('/tutors')) return 'tutors';
    if (pathname?.includes('/applications')) return 'tutor-applications';
    if (pathname?.includes('/class-requests')) return 'class-requests';
    if (pathname?.includes('/reports')) return 'reports';
    if (pathname?.includes('/wallet')) return 'wallet';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessAdminNavbar currentView={getCurrentView()} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

