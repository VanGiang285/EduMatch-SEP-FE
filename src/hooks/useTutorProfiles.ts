import { useState, useCallback } from 'react';
import { TutorService } from '@/services';
import {
  TutorProfileDto,
  TutorCertificateDto,
  TutorEducationDto,
} from '@/types/backend';
import { TutorStatus } from '@/types/enums';
import {
  TutorProfileUpdateRequest,
  UpdateTutorStatusRequest,
  VerifyUpdateRequest,
} from '@/types/requests';

/**
 * Custom hook để quản lý việc load và cache tutor profiles
 * Cung cấp TẤT CẢ các API methods của TutorService như BE định nghĩa
 */
export function useTutorProfiles() {
  // Cache tutor profiles theo email và ID
  const [tutorProfilesByEmail, setTutorProfilesByEmail] = useState<
    Map<string, TutorProfileDto>
  >(new Map());
  const [tutorProfilesById, setTutorProfilesById] = useState<
    Map<number, TutorProfileDto>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy danh sách gia sư theo trạng thái (tương ứng TutorService.getTutorsByStatus)
   */
  const getTutorsByStatus = useCallback(
    async (status: TutorStatus): Promise<TutorProfileDto[] | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.getTutorsByStatus(status);

        if (response.success && response.data) {
          // Cập nhật cache
          setTutorProfilesByEmail(prev => {
            const newMap = new Map(prev);
            response.data!.forEach(tutor => {
              if (tutor.userEmail) {
                newMap.set(tutor.userEmail, tutor);
              }
              if (tutor.id) {
                setTutorProfilesById(current => {
                  const newMapById = new Map(current);
                  newMapById.set(tutor.id!, tutor);
                  return newMapById;
                });
              }
            });
            return newMap;
          });
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể tải danh sách gia sư');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách gia sư');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Lấy tất cả gia sư trong hệ thống (tương ứng TutorService.getAllTutors)
   */
  const getAllTutors = useCallback(async (): Promise<
    TutorProfileDto[] | null
  > => {
    try {
      setLoading(true);
      setError(null);

      const response = await TutorService.getAllTutors();

      if (response.success && response.data) {
        // Cập nhật cache
        setTutorProfilesByEmail(prev => {
          const newMap = new Map(prev);
          response.data!.forEach(tutor => {
            if (tutor.userEmail) {
              newMap.set(tutor.userEmail, tutor);
            }
            if (tutor.id) {
              setTutorProfilesById(current => {
                const newMapById = new Map(current);
                newMapById.set(tutor.id!, tutor);
                return newMapById;
              });
            }
          });
          return newMap;
        });
        return response.data;
      } else {
        setError(response.error?.message || 'Không thể tải danh sách gia sư');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách gia sư');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy thông tin chi tiết gia sư theo ID (tương ứng TutorService.getTutorById)
   */
  const getTutorById = useCallback(
    async (tutorId: number): Promise<TutorProfileDto | null> => {
      // Nếu đã có trong cache, trả về luôn
      if (tutorProfilesById.has(tutorId)) {
        return tutorProfilesById.get(tutorId) || null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.getTutorById(tutorId);

        if (response.success && response.data) {
          // Cập nhật cache
          setTutorProfilesById(prev => {
            const newMap = new Map(prev);
            newMap.set(tutorId, response.data!);
            return newMap;
          });
          if (response.data.userEmail) {
            setTutorProfilesByEmail(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.userEmail, response.data!);
              return newMap;
            });
          }
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể tải thông tin gia sư');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin gia sư');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tutorProfilesById]
  );

  /**
   * Lấy tất cả chứng chỉ và bằng cấp của gia sư (tương ứng TutorService.getTutorVerifications)
   */
  const getTutorVerifications = useCallback(
    async (
      tutorId: number
    ): Promise<{
      certificates: TutorCertificateDto[];
      educations: TutorEducationDto[];
    } | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.getTutorVerifications(tutorId);

        if (response.success && response.data) {
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể tải thông tin xác thực'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin xác thực');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật thông tin cơ bản của gia sư (tương ứng TutorService.updateTutorProfile)
   */
  const updateTutorProfile = useCallback(
    async (
      request: TutorProfileUpdateRequest
    ): Promise<TutorProfileDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.updateTutorProfile(request);

        if (response.success && response.data) {
          // Cập nhật cache
          if (response.data.id) {
            setTutorProfilesById(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.id!, response.data!);
              return newMap;
            });
          }
          if (response.data.userEmail) {
            setTutorProfilesByEmail(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.userEmail, response.data!);
              return newMap;
            });
          }
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể cập nhật thông tin gia sư'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật thông tin gia sư');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cập nhật trạng thái gia sư (tương ứng TutorService.updateTutorStatus)
   */
  const updateTutorStatus = useCallback(
    async (
      tutorId: number,
      request: UpdateTutorStatusRequest
    ): Promise<TutorProfileDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.updateTutorStatus(tutorId, request);

        if (response.success && response.data) {
          // Cập nhật cache
          if (response.data.id) {
            setTutorProfilesById(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.id!, response.data!);
              return newMap;
            });
          }
          if (response.data.userEmail) {
            setTutorProfilesByEmail(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.userEmail, response.data!);
              return newMap;
            });
          }
          return response.data;
        } else {
          setError(
            response.error?.message || 'Không thể cập nhật trạng thái gia sư'
          );
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật trạng thái gia sư');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Phê duyệt gia sư và xác thực tất cả chứng chỉ, bằng cấp (tương ứng TutorService.approveAndVerifyAll)
   */
  const approveAndVerifyAll = useCallback(
    async (tutorId: number): Promise<TutorProfileDto | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.approveAndVerifyAll(tutorId);

        if (response.success && response.data) {
          // Cập nhật cache
          if (response.data.id) {
            setTutorProfilesById(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.id!, response.data!);
              return newMap;
            });
          }
          if (response.data.userEmail) {
            setTutorProfilesByEmail(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.userEmail, response.data!);
              return newMap;
            });
          }
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể phê duyệt gia sư');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi phê duyệt gia sư');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Xác thực nhiều chứng chỉ cùng lúc (tương ứng TutorService.verifyCertificateBatch)
   */
  const verifyCertificateBatch = useCallback(
    async (
      tutorId: number,
      updates: VerifyUpdateRequest[]
    ): Promise<TutorCertificateDto[] | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.verifyCertificateBatch(
          tutorId,
          updates
        );

        if (response.success && response.data) {
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể xác thực chứng chỉ');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi xác thực chứng chỉ');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Xác thực nhiều bằng cấp học vấn cùng lúc (tương ứng TutorService.verifyEducationBatch)
   */
  const verifyEducationBatch = useCallback(
    async (
      tutorId: number,
      updates: VerifyUpdateRequest[]
    ): Promise<TutorEducationDto[] | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.verifyEducationBatch(
          tutorId,
          updates
        );

        if (response.success && response.data) {
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể xác thực bằng cấp');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi xác thực bằng cấp');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Lấy tutor profile theo email (tương ứng TutorService.getTutorByEmail)
   */
  const getTutorByEmail = useCallback(
    async (email: string): Promise<TutorProfileDto | null> => {
      // Nếu đã có trong cache, trả về luôn
      if (tutorProfilesByEmail.has(email)) {
        return tutorProfilesByEmail.get(email) || null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.getTutorByEmail(email);

        if (response.success && response.data) {
          // Cập nhật cache
          setTutorProfilesByEmail(prev => {
            const newMap = new Map(prev);
            newMap.set(email, response.data!);
            return newMap;
          });
          if (response.data.id) {
            setTutorProfilesById(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.id!, response.data!);
              return newMap;
            });
          }
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể tải thông tin gia sư');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin gia sư');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tutorProfilesByEmail]
  );

  /**
   * Lấy tutor profile theo ID (full với relations) (tương ứng TutorService.getTutorByIdFull)
   */
  const getTutorByIdFull = useCallback(
    async (id: number): Promise<TutorProfileDto | null> => {
      // Nếu đã có trong cache, trả về luôn
      if (tutorProfilesById.has(id)) {
        return tutorProfilesById.get(id) || null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await TutorService.getTutorByIdFull(id);

        if (response.success && response.data) {
          // Cập nhật cache
          setTutorProfilesById(prev => {
            const newMap = new Map(prev);
            newMap.set(id, response.data!);
            return newMap;
          });
          if (response.data.userEmail) {
            setTutorProfilesByEmail(prev => {
              const newMap = new Map(prev);
              newMap.set(response.data!.userEmail, response.data!);
              return newMap;
            });
          }
          return response.data;
        } else {
          setError(response.error?.message || 'Không thể tải thông tin gia sư');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin gia sư');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tutorProfilesById]
  );

  /**
   * Load nhiều tutor profiles từ danh sách emails (helper method)
   */
  const loadTutorProfiles = useCallback(
    async (emails: string[]): Promise<void> => {
      if (emails.length === 0) return;

      const emailsToLoad = emails.filter(
        email => !tutorProfilesByEmail.has(email)
      );

      if (emailsToLoad.length > 0) {
        await Promise.all(emailsToLoad.map(email => getTutorByEmail(email)));
      }
    },
    [tutorProfilesByEmail, getTutorByEmail]
  );

  /**
   * Load một tutor profile đơn lẻ (helper method)
   */
  const loadTutorProfile = useCallback(
    async (email: string): Promise<void> => {
      if (!email) return;
      if (tutorProfilesByEmail.has(email)) return; // Đã có, không cần load
      await getTutorByEmail(email);
    },
    [tutorProfilesByEmail, getTutorByEmail]
  );

  /**
   * Lấy tutor profile từ cache (helper method)
   */
  const getTutorProfile = useCallback(
    (email: string | undefined): TutorProfileDto | undefined => {
      if (!email) return undefined;
      return tutorProfilesByEmail.get(email);
    },
    [tutorProfilesByEmail]
  );

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setTutorProfilesByEmail(new Map());
    setTutorProfilesById(new Map());
    setError(null);
  }, []);

  return {
    // State
    tutorProfilesByEmail,
    tutorProfilesById,
    loading,
    error,

    // API Methods (tương ứng TutorService)
    getTutorsByStatus,
    getAllTutors,
    getTutorById,
    getTutorVerifications,
    updateTutorProfile,
    updateTutorStatus,
    approveAndVerifyAll,
    verifyCertificateBatch,
    verifyEducationBatch,
    getTutorByEmail,
    getTutorByIdFull,

    // Helper methods
    loadTutorProfiles,
    loadTutorProfile,
    getTutorProfile,
    clearCache,
  };
}
