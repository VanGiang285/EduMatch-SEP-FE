import { useState, useEffect, useCallback } from 'react';
import { MasterDataService, SubjectDto, LevelDto, EducationInstitutionDto, TimeSlotDto } from '@/services/masterDataService';

export interface UseBecomeTutorMasterDataReturn {
  subjects: SubjectDto[];
  levels: LevelDto[];
  educationInstitutions: EducationInstitutionDto[];
  timeSlots: TimeSlotDto[];
  isLoading: boolean;
  error: string | null;
  loadMasterData: () => Promise<void>;
  clearError: () => void;
}

export function useBecomeTutorMasterData(): UseBecomeTutorMasterDataReturn {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [educationInstitutions, setEducationInstitutions] = useState<EducationInstitutionDto[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMasterData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadSubjects = async () => {
        try {
          const response = await MasterDataService.getAllSubjects();
          if (response.success && response.data) {
            setSubjects(response.data);
          }
        } catch (err) {
          console.error('Failed to load subjects:', err);
        }
      };

      const loadLevels = async () => {
        try {
          const response = await MasterDataService.getAllLevels();
          if (response.success && response.data) {
            setLevels(response.data);
          }
        } catch (err) {
          console.error('Failed to load levels:', err);
        }
      };

      const loadEducationInstitutions = async () => {
        try {
          const response = await MasterDataService.getAllEducationInstitutions();
          if (response.success && response.data) {
            setEducationInstitutions(response.data);
          }
        } catch (err) {
          console.error('Failed to load education institutions:', err);
          setEducationInstitutions([]);
        }
      };

      const loadTimeSlots = async () => {
        try {
          const response = await MasterDataService.getAllTimeSlots();
          if (response.success && response.data) {
            setTimeSlots(response.data);
          }
        } catch (err) {
          console.error('Failed to load time slots:', err);
        }
      };

      await Promise.allSettled([
        loadSubjects(),
        loadLevels(),
        loadEducationInstitutions(),
        loadTimeSlots()
      ]);
    } catch (err) {
      console.error('Error loading master data:', err);
      setError('Không thể tải dữ liệu cần thiết');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  return {
    subjects,
    levels,
    educationInstitutions,
    timeSlots,
    isLoading,
    error,
    loadMasterData,
    clearError,
  };
}