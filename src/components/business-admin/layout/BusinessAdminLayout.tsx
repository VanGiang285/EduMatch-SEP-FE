"use client";

import React, { useState } from 'react';
import { BusinessAdminSidebar } from './BusinessAdminSidebar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BusinessAdminLayoutProps {
  children: React.ReactNode;
}

export function BusinessAdminLayout({ children }: BusinessAdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Map pathname to view ID
  const getCurrentView = () => {
    if (pathname?.includes('/dashboard')) return 'dashboard';
    if (pathname?.includes('/learners')) return 'learners';
    if (pathname?.includes('/tutors')) return 'tutors';
    if (pathname?.includes('/applications')) return 'tutor-applications';
    if (pathname?.includes('/class-requests')) return 'class-requests';
    if (pathname?.includes('/reports')) return 'reports';
    if (pathname?.includes('/refund-requests')) return 'refund-requests';
    if (pathname?.includes('/refund-policies')) return 'refund-policies';
    if (pathname?.includes('/wallet')) return 'wallet';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BusinessAdminSidebar 
        currentView={getCurrentView()} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        "lg:ml-64", // Desktop: default margin for sidebar (256px = 64 * 4)
        isSidebarCollapsed && "lg:ml-16" // Desktop: collapsed margin (64px = 16 * 4)
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

