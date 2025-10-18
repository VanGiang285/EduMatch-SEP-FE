import { useState, useEffect, useCallback } from 'react';
import { FindTutorService, FindTutorProfile, TutorFilter } from '@/services/findTutorService';
import { MasterDataService, SubjectDto, LevelDto, EducationInstitutionDto } from '@/services/masterDataService';
import { ApiResponse } from '@/types/api';

export interface UseFindTutorReturn {
  tutors: FindTutorProfile[];
  subjects: SubjectDto[];
  levels: LevelDto[];
  institutions: EducationInstitutionDto[];
  isLoadingTutors: boolean;
  isLoadingMasterData: boolean;
  error: string | null;
  filters: TutorFilter;
  setFilters: (filters: Partial<TutorFilter>) => void;
  searchTutors: () => Promise<void>;
  loadAllTutors: () => Promise<void>;
  clearError: () => void;
}

export function useFindTutor(): UseFindTutorReturn {
  const [tutors, setTutors] = useState<FindTutorProfile[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [institutions, setInstitutions] = useState<EducationInstitutionDto[]>([]);
  
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFiltersState] = useState<TutorFilter>({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (filters.keyword || filters.gender || filters.city || filters.teachingMode || filters.statusId) {
      searchTutors();
    } else {
      loadAllTutors();
    }
  }, [filters.keyword, filters.gender, filters.city, filters.teachingMode, filters.statusId, filters.page, filters.pageSize]);

  const loadMasterData = useCallback(async () => {
    setIsLoadingMasterData(true);
    setError(null);
    
    try {
      const [subjectsRes, levelsRes, institutionsRes] = await Promise.all([
        MasterDataService.getAllSubjects(),
        MasterDataService.getAllLevels(),
        MasterDataService.getAllEducationInstitutions(),
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
    } catch (err) {
      console.error('Error loading master data:', err);
      setSubjects([
        { id: 1, subjectName: 'Toán học' },
        { id: 2, subjectName: 'Tiếng Anh' },
        { id: 3, subjectName: 'Vật lý' },
        { id: 4, subjectName: 'Hóa học' },
        { id: 5, subjectName: 'Sinh học' },
        { id: 6, subjectName: 'Ngữ văn' },
      ]);
      setLevels([
        { id: 1, levelName: 'Tiểu học' },
        { id: 2, levelName: 'THCS' },
        { id: 3, levelName: 'THPT' },
        { id: 4, levelName: 'Đại học' },
      ]);
      setInstitutions([
        { id: 1, institutionName: 'Đại học Sư phạm Hà Nội' },
        { id: 2, institutionName: 'Đại học Bách khoa Hà Nội' },
        { id: 3, institutionName: 'Đại học Khoa học Tự nhiên' },
      ]);
    } finally {
      setIsLoadingMasterData(false);
    }
  }, []);

  const loadAllTutors = useCallback(async () => {
    setIsLoadingTutors(true);
    setError(null);
    
    try {
      const response = await FindTutorService.getAllTutors();
      
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

  const setFilters = useCallback((newFilters: Partial<TutorFilter>) => {
    setFiltersState(prev => {
      const cleanFilters: TutorFilter = {
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
