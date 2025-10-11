import { TutorDetailProfilePage } from '@/components/tutor-detail/TutorDetailProfilePage';
import { PageWrapper } from '@/components/common/PageWrapper';

interface TutorDetailPageProps {
  params: {
    id: string;
  };
}

export default function TutorDetailPage({ params }: TutorDetailPageProps) {
  return (
    <PageWrapper currentPage="tutor-detail">
      <TutorDetailProfilePage />
    </PageWrapper>
  );
}
