import { useState, useCallback, useEffect } from 'react';
import { UserProfileService } from '@/services';
import { UserProfileDto } from '@/types/backend';

/**
 * Custom hook để quản lý việc load và cache learner profiles
 * Tự động cache để tránh load lại các profile đã có
 */
export function useLearnerProfiles() {
  const [learnerProfiles, setLearnerProfiles] = useState<
    Map<string, UserProfileDto>
  >(new Map());
  const [loading, setLoading] = useState(false);

  /**
   * Load learner profiles từ danh sách emails
   * Chỉ load những email chưa có trong cache
   */
  const loadLearnerProfiles = useCallback(
    async (emails: string[]) => {
      if (emails.length === 0) return;

      const emailsToLoad = emails.filter(email => !learnerProfiles.has(email));
      if (emailsToLoad.length === 0) {
        return; // Đã có tất cả, không cần load
      }

      setLoading(true);

      try {
        // Load tất cả learner profiles song song
        const results = await Promise.all(
          emailsToLoad.map(async email => {
            try {
              const response = await UserProfileService.getUserProfile(email);
              if (response.success && response.data) {
                return { email, profile: response.data };
              }
              return null;
            } catch (error) {
              console.error(
                `Error loading learner profile for ${email}:`,
                error
              );
              return null;
            }
          })
        );

        // Update state một lần sau khi load xong tất cả
        setLearnerProfiles(current => {
          const updated = new Map(current);
          results.forEach(result => {
            if (result) {
              updated.set(result.email, result.profile);
            }
          });
          return updated;
        });
      } catch (error) {
        console.error('Error loading learner profiles:', error);
      } finally {
        setLoading(false);
      }
    },
    [learnerProfiles]
  );

  /**
   * Lấy learner profile từ email
   * Trả về undefined nếu chưa có trong cache
   */
  const getLearnerProfile = useCallback(
    (email: string | undefined): UserProfileDto | undefined => {
      if (!email) return undefined;
      return learnerProfiles.get(email);
    },
    [learnerProfiles]
  );

  /**
   * Load một learner profile đơn lẻ
   */
  const loadLearnerProfile = useCallback(
    async (email: string) => {
      if (!email) return;
      if (learnerProfiles.has(email)) return; // Đã có, không cần load

      await loadLearnerProfiles([email]);
    },
    [learnerProfiles, loadLearnerProfiles]
  );

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setLearnerProfiles(new Map());
  }, []);

  return {
    learnerProfiles,
    loading,
    loadLearnerProfiles,
    getLearnerProfile,
    loadLearnerProfile,
    clearCache,
  };
}
