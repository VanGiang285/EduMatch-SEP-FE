import { useState, useCallback } from 'react';
import { UserProfileService } from '@/services';
import { UserProfileDto, UserDto } from '@/types/backend';

/**
 * Custom hook để quản lý việc load và cache learner profiles
 * Wrapper của useUserProfiles cho learner-specific use cases
 */
export function useLearnerProfiles() {
  const [learnerProfiles, setLearnerProfiles] = useState<
    Map<string, { profile: UserProfileDto; user: UserDto | null }>
  >(new Map());
  const [loading, setLoading] = useState(false);

  /**
   * Load learner profile từ email
   */
  const loadLearnerProfile = useCallback(
    async (email: string): Promise<void> => {
      if (!email || learnerProfiles.has(email)) {
        return;
      }

      try {
        setLoading(true);
        const response = await UserProfileService.getUserProfile(email);
        if (response.success && response.data) {
          const profileData = response.data;
          setLearnerProfiles(prev => {
            const newMap = new Map(prev);
            newMap.set(email, {
              profile: profileData,
              user: (profileData.userEmailNavigation as any) || null,
            });
            return newMap;
          });
        }
      } catch (error) {
        console.error(`Failed to fetch learner profile for ${email}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [learnerProfiles]
  );

  /**
   * Load nhiều learner profiles từ danh sách emails
   */
  const loadLearnerProfiles = useCallback(
    async (emails: string[]): Promise<void> => {
      if (emails.length === 0) return;

      const emailsToLoad = emails.filter(email => !learnerProfiles.has(email));

      if (emailsToLoad.length > 0) {
        setLoading(true);
        try {
          await Promise.all(
            emailsToLoad.map(email => loadLearnerProfile(email))
          );
        } finally {
          setLoading(false);
        }
      }
    },
    [learnerProfiles, loadLearnerProfile]
  );

  /**
   * Lấy learner profile từ cache
   */
  const getLearnerProfile = useCallback(
    (
      email: string | undefined
    ): { profile: UserProfileDto; user: UserDto | null } | undefined => {
      if (!email) return undefined;
      return learnerProfiles.get(email);
    },
    [learnerProfiles]
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
    loadLearnerProfile,
    loadLearnerProfiles,
    getLearnerProfile,
    clearCache,
  };
}
