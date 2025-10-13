import { SavedTutorsPage } from '@/components/saved-tutors/SavedTutorsPage';
import { PageWrapper } from '@/components/common/PageWrapper';
export default function SavedTutors() {
  return (
    <PageWrapper currentPage="saved-tutors">
      <SavedTutorsPage />
    </PageWrapper>
  );
}