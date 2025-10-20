"use client";
import { BecomeTutorPage } from "@/components/become-tutor/BecomeTutorPage";
import { PageWrapper } from "@/components/common/PageWrapper";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/feedback/loading-spinner";

export default function BecomeTutor() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        console.log('🔍 BecomeTutor - Not authenticated, redirecting to unauthorized');
        router.push('/unauthorized');
        return;
      }
      
      if (user.role !== 'learner' && user.role !== 'tutor') {
        console.log('🔍 BecomeTutor - Wrong role, redirecting to unauthorized');
        router.push('/unauthorized');
        return;
      }
      
      setIsChecking(false);
    }
  }, [user, loading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or wrong role, show nothing (will redirect)
  if (!isAuthenticated || !user || (user.role !== 'learner' && user.role !== 'tutor')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper currentPage="become-tutor">
      <BecomeTutorPage />
    </PageWrapper>
  );
}
