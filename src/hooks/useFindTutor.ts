import { useState, useEffect, useCallback } from 'react';
import { TutorService } from '@/services/tutorService';
import { FindTutorService } from '@/services/findTutorService';
import { SubjectService } from '@/services/subjectService';
import { CertificateService } from '@/services/certificateService';
import {
  TutorProfileDto,
  TutorFilterDto,
  SubjectDto,
  LevelDto,
  EducationInstitutionDto,
  CertificateTypeDto,
} from '@/types/backend';
import { TutorStatus } from '@/types/enums';

export interface UseFindTutorReturn {
  tutors: TutorProfileDto[];
  subjects: SubjectDto[];
  levels: LevelDto[];
  institutions: EducationInstitutionDto[];
  certificateTypes: CertificateTypeDto[];
  isLoadingTutors: boolean;
  isLoadingMasterData: boolean;
  error: string | null;
  filters: TutorFilterDto;
  setFilters: (filters: Partial<TutorFilterDto>) => void;
  searchTutors: () => Promise<void>;
  loadAllTutors: () => Promise<void>;
  clearError: () => void;
}

export function useFindTutor(): UseFindTutorReturn {
  const [tutors, setTutors] = useState<TutorProfileDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [institutions, setInstitutions] = useState<EducationInstitutionDto[]>(
    []
  );
  const [certificateTypes, setCertificateTypes] = useState<
    CertificateTypeDto[]
  >([]);

  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<TutorFilterDto>({
    page: 1,
    pageSize: 10,
  });

  const loadMasterData = useCallback(async () => {
    setIsLoadingMasterData(true);
    setError(null);

    try {
      const [subjectsRes, levelsRes, institutionsRes, certificateTypesRes] =
        await Promise.all([
          SubjectService.getAllSubjects(),
          CertificateService.getAllLevels(),
          CertificateService.getAllInstitutions(),
          CertificateService.getAllCertificateTypes(),
        ]);

      if (subjectsRes.success && subjectsRes.data) {
        setSubjects(subjectsRes.data);
      }

      if (levelsRes.success && levelsRes.data) {
        setLevels(levelsRes.data);
      }

      if (institutionsRes.success && institutionsRes.data) {
        setInstitutions(institutionsRes.data);
      }

      if (certificateTypesRes.success && certificateTypesRes.data) {
        setCertificateTypes(certificateTypesRes.data);
      }
    } catch (err) {
      console.error('Error loading master data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingMasterData(false);
    }
  }, []);

  const loadAllTutors = useCallback(async () => {
    setIsLoadingTutors(true);
    setError(null);

    try {
      const response = await TutorService.getTutorsByStatus(TutorStatus.Approved);

      if (response.success && response.data) {
        setTutors(response.data);
      } else {
        setError('Không thể tải danh sách gia sư');
        setTutors([]);
      }
    } catch (err) {
      console.error('Error loading tutors:', err);
      setError('Lỗi khi tải danh sách gia sư');
      setTutors([]);
    } finally {
      setIsLoadingTutors(false);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
    loadAllTutors();
  }, [loadMasterData, loadAllTutors]);

  const searchTutors = useCallback(async () => {
    setIsLoadingTutors(true);
    setError(null);

    try {
      const response = await FindTutorService.searchTutors(filters);

      if (response.success && response.data) {
        setTutors(response.data);
      } else {
        setError('Không thể tìm kiếm gia sư');
        setTutors([]);
      }
    } catch (err) {
      console.error('Error searching tutors:', err);
      setError('Lỗi khi tìm kiếm gia sư');
      setTutors([]);
    } finally {
      setIsLoadingTutors(false);
    }
  }, [filters]);

  const setFilters = useCallback((newFilters: Partial<TutorFilterDto>) => {
    setFiltersState(() => {
      const cleanFilters: TutorFilterDto = {
        page: 1,
        pageSize: 10,
        ...newFilters,
      };
      return cleanFilters;
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tutors,
    subjects,
    levels,
    institutions,
    certificateTypes,
    isLoadingTutors,
    isLoadingMasterData,
    error,
    filters,
    setFilters,
    searchTutors,
    loadAllTutors,
    clearError,
  };
}
