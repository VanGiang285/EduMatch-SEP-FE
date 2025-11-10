import { ClassRequestsPage } from '@/components/class-requests/ClassRequestsPage';
import { PageWrapper } from '@/components/common/PageWrapper';

export default function ClassRequests() {
  return (
    <PageWrapper currentPage="class-requests">
      <ClassRequestsPage />
    </PageWrapper>
  );
}

