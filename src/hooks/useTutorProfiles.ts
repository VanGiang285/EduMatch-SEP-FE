import { useState, useCallback } from 'react';
import { TutorService } from '@/services';
import { TutorProfileDto } from '@/types/backend';

/**
 * Custom hook để quản lý việc load và cache tutor profiles
 * Tự động cache để tránh load lại các profile đã có
 */
export function useTutorProfiles() {
  const [tutorProfiles, setTutorProfiles] = useState<
    Map<string, TutorProfileDto>
  >(new Map());
  const [loading, setLoading] = useState(false);

  /**
   * Load tutor profiles từ danh sách emails
   * Chỉ load những email chưa có trong cache
   */
  const loadTutorProfiles = useCallback(async (emails: string[]) => {
    if (emails.length === 0) return;

    setTutorProfiles(prev => {
      const newMap = new Map(prev);
      const emailsToLoad = emails.filter(email => !newMap.has(email));

      if (emailsToLoad.length === 0) {
        return newMap; // Đã có tất cả, không cần load
      }

      setLoading(true);

      // Load tất cả tutor profiles song song
      Promise.all(
        emailsToLoad.map(async email => {
          try {
            const response = await TutorService.getTutorByEmail(email);
            if (response.success && response.data) {
              return { email, profile: response.data };
            }
            return null;
          } catch (error) {
            return null;
          }
        })
      ).then(results => {
        // Update state một lần sau khi load xong tất cả
        setTutorProfiles(current => {
          const updated = new Map(current);
          results.forEach(result => {
            if (result) {
              updated.set(result.email, result.profile);
            }
          });
          return updated;
        });
        setLoading(false);
      });

      return newMap;
    });
  }, []);

  /**
   * Lấy tutor profile từ email
   * Trả về undefined nếu chưa có trong cache
   */
  const getTutorProfile = useCallback(
    (email: string | undefined): TutorProfileDto | undefined => {
      if (!email) return undefined;
      return tutorProfiles.get(email);
    },
    [tutorProfiles]
  );

  /**
   * Load một tutor profile đơn lẻ
   */
  const loadTutorProfile = useCallback(
    async (email: string) => {
      if (!email) return;
      if (tutorProfiles.has(email)) return; // Đã có, không cần load

      await loadTutorProfiles([email]);
    },
    [tutorProfiles, loadTutorProfiles]
  );

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setTutorProfiles(new Map());
  }, []);

  return {
    tutorProfiles,
    loading,
    loadTutorProfiles,
    getTutorProfile,
    loadTutorProfile,
    clearCache,
  };
}
