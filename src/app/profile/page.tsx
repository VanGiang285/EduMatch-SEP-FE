"use client";

import { LearnerAccount } from '@/components/profile/LearnerAccount';
import { PageWrapper } from '@/components/common/PageWrapper';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function ProfileContent() {
  const searchParams = useSearchParams();
  const [initialTab, setInitialTab] = useState('profile');

  useEffect(() => {
    // Map URL params to tab names
    const tab = searchParams?.get('tab');
    if (tab) {
      // Map legacy tab names to new tab names
      const tabMap: Record<string, string> = {
        'profile': 'profile',
        'tutorProfile': 'tutorProfile',
        'schedule': 'schedule',
        'classes': 'classes',
        'classRequests': 'classRequests',
        'tutorApplications': 'tutorApplications',
        'wallet': 'wallet',
        'notifications': 'notifications',
        'messages': 'messages',
        'settings': 'settings',
      };
      setInitialTab(tabMap[tab] || 'profile');
    } else {
      // Reset to default if no tab param
      setInitialTab('profile');
    }
  }, [searchParams]);

  return (
    <PageWrapper currentPage="profile">
      <LearnerAccount initialTab={initialTab} />
    </PageWrapper>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <PageWrapper currentPage="profile">
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-gray-600">Đang tải...</div>
        </div>
      </PageWrapper>
    }>
      <ProfileContent />
    </Suspense>
  );
}

