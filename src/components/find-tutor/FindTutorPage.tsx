'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Input } from '../ui/form/input';
import {
  Search,
  Star,
  Heart,
  MapPin,
  Play,
  MessageCircle,
  Calendar,
  Award,
  Clock,
  Video,
  Send,
  Loader2,
  BookOpen
} from 'lucide-react';
import { SelectWithSearch, SelectWithSearchItem } from '../ui/form/select-with-search';
import { Separator } from '../ui/layout/separator';
import { Slider } from '../ui/form/slider';
import { FormatService } from '@/lib/format';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/navigation/pagination';
import { useFindTutor } from '@/hooks/useFindTutor';
import { TeachingMode } from '@/types/enums';
import { FavoriteTutorService } from '@/services/favoriteTutorService';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useChatContext } from '@/contexts/ChatContext';
import { LocationService, ProvinceDto } from '@/services/locationService';
import { FeedbackService } from '@/services/feedbackService';
import { TutorRatingSummary } from '@/types/backend';
import { USER_ROLES } from '@/constants';
import type { TrialLessonSubjectStatusDto } from '@/services/learnerTrialLessonService';

function getTeachingModeValue(mode: string | number | TeachingMode): TeachingMode {
  if (typeof mode === 'number') {
    return mode as TeachingMode;
  }
  if (typeof mode === 'string') {
    switch (mode) {
      case 'Offline': return TeachingMode.Offline;
      case 'Online': return TeachingMode.Online;
      case 'Hybrid': return TeachingMode.Hybrid;
      default: return TeachingMode.Offline;
    }
  }
  return mode as TeachingMode;
}

function getTeachingModeDisplayLabel(mode: string | number | TeachingMode): string {
  const modeValue = getTeachingModeValue(mode);
  switch (modeValue) {
    case TeachingMode.Offline:
      return 'Dạy trực tiếp';
    case TeachingMode.Online:
      return 'Dạy online';
    case TeachingMode.Hybrid:
      return 'Online và Offline';
    default:
      return 'Không xác định';
  }
}

function formatLevels(levels: string[]): string {
  if (levels.length === 0) return '';
  
  if (levels.some(level => level.toLowerCase().includes('tất cả') || level.toLowerCase().includes('all'))) {
    return 'Tất cả cấp';
  }
  
  const hasTHPT = levels.some(level => level.toUpperCase().includes('THPT'));
  if (hasTHPT && levels.length === 1) {
    return 'THPT';
  }
  
  const numbers = levels
    .map(level => {
      const num = parseInt(level.replace(/\D/g, ''));
      return isNaN(num) ? null : num;
    })
    .filter((num): num is number => num !== null)
    .sort((a, b) => a - b);
  
  if (numbers.length === 0) {
    return levels.join(', ');
  }
  
  if (numbers.length > 1) {
    let isConsecutive = true;
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] !== numbers[i - 1] + 1) {
        isConsecutive = false;
        break;
      }
    }
    
    if (isConsecutive) {
      return `Lớp ${numbers[0]}-${numbers[numbers.length - 1]}`;
    }
  }
  
  return `Lớp ${numbers.join(', ')}`;
}

function groupSubjectsBySubjectName(tutorSubjects: any[]): Array<{ subjectName: string; levelText: string }> {
  if (!tutorSubjects || tutorSubjects.length === 0) return [];
  
  const grouped = new Map<string, Set<string>>();
  
  tutorSubjects.forEach((ts) => {
    const subjectName = ts.subject?.subjectName || `Subject ${ts.id}`;
    const levelName = ts.level?.name || '';
    
    if (!grouped.has(subjectName)) {
      grouped.set(subjectName, new Set());
    }
    
    if (levelName) {
      grouped.get(subjectName)!.add(levelName);
    }
  });
  
  return Array.from(grouped.entries()).map(([subjectName, levelsSet]) => {
    const levels = Array.from(levelsSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    
    const levelText = formatLevels(levels);
    
    return {
      subjectName,
      levelText
    };
  });
}

export function FindTutorPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { showWarning } = useCustomToast();
  const {
    tutors,
    subjects,
    levels,
    certificateTypes,
    isLoadingTutors,
    isLoadingMasterData,
    error,
    setFilters,
    clearError,
  } = useFindTutor();

  const [hoveredTutor, setHoveredTutor] = useState<number | null>(null);
  const [videoKey, setVideoKey] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedTeachingMode, setSelectedTeachingMode] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteTutors, setFavoriteTutors] = useState<Set<number>>(new Set());
  const [loadingFavorite, setLoadingFavorite] = useState<Set<number>>(new Set());
  const { openChatWithTutor } = useChatContext();
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [tutorRatings, setTutorRatings] = useState<Map<number, TutorRatingSummary>>(new Map());
  const [tutorTrialStatuses, setTutorTrialStatuses] = useState<Map<number, TrialLessonSubjectStatusDto[]>>(new Map());
  const tutorsPerPage = 6;
  const sortedProvinces = useMemo(
    () => [...provinces].sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    [provinces]
  );

  const filteredAndSortedTutors = React.useMemo(() => {
    let filtered = [...tutors];
    if (searchQuery.trim()) {
      const keyword = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(tutor => {
        const userName = (tutor.userName || '').toLowerCase();
        const bio = (tutor.bio || '').toLowerCase();
        const email = (tutor.userEmail || '').toLowerCase();

        return userName.includes(keyword) ||
          bio.includes(keyword) ||
          email.includes(keyword);
      });
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(tutor =>
        tutor.tutorSubjects?.some(tutorSubject =>
          tutorSubject.subject?.id?.toString() === selectedSubject
        )
      );
    }

    if (selectedCertificate !== 'all') {
      filtered = filtered.filter(tutor =>
        tutor.tutorCertificates?.some(cert => cert.certificateType?.id?.toString() === selectedCertificate)
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(tutor =>
        tutor.tutorSubjects?.some(ts => ts.level?.id?.toString() === selectedLevel)
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(tutor => tutor.province?.id?.toString() === selectedCity);
    }

    if (selectedTeachingMode !== 'all') {
      filtered = filtered.filter(tutor => {
        const modeValue = getTeachingModeValue(tutor.teachingModes);
        const selectedMode = parseInt(selectedTeachingMode);
        if (selectedMode === TeachingMode.Online) {
          return modeValue === TeachingMode.Online || modeValue === TeachingMode.Hybrid;
        } else if (selectedMode === TeachingMode.Offline) {
          return modeValue === TeachingMode.Offline || modeValue === TeachingMode.Hybrid;
        }
        return modeValue.toString() === selectedTeachingMode;
      });
    }

    if (priceRange[0] > 0 || priceRange[1] < 1000000) {
      const [minRange, maxRange] = priceRange;
      filtered = filtered.filter(tutor => {
        if (!tutor.tutorSubjects || tutor.tutorSubjects.length === 0) return false;

        const prices = tutor.tutorSubjects.map(ts => ts.hourlyRate || 0);
        const tutorMinPrice = Math.min(...prices);
        const tutorMaxPrice = Math.max(...prices);

        return tutorMinPrice <= maxRange && tutorMaxPrice >= minRange;
      });
    }
    if (selectedSort !== 'recommended') {
      filtered.sort((a, b) => {
        switch (selectedSort) {
          case 'price-low':
            return (a.tutorSubjects?.[0]?.hourlyRate || 0) - (b.tutorSubjects?.[0]?.hourlyRate || 0);
          case 'price-high':
            return (b.tutorSubjects?.[0]?.hourlyRate || 0) - (a.tutorSubjects?.[0]?.hourlyRate || 0);
          case 'experience':
            return 0;
          case 'rating':
            return 0;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [tutors, searchQuery, selectedSubject, selectedCertificate, selectedLevel, selectedCity, selectedTeachingMode, priceRange, selectedSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedCertificate, selectedLevel, selectedCity, selectedTeachingMode, priceRange, selectedSort]);

  // Reset certificate filter when subject changes
  useEffect(() => {
    setSelectedCertificate('all');
  }, [selectedSubject]);

  useEffect(() => {
    if (tutors.length > 0 && !hoveredTutor) {
      setHoveredTutor(tutors[0].id);
    }
  }, [tutors, hoveredTutor]);

  // Update hoveredTutor when filtered results change
  useEffect(() => {
    if (filteredAndSortedTutors.length > 0) {
      const currentHoveredExists = filteredAndSortedTutors.some(t => t.id === hoveredTutor);
      if (!currentHoveredExists) {
        setHoveredTutor(filteredAndSortedTutors[0].id);
      }
    }
  }, [filteredAndSortedTutors, hoveredTutor]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilters: any = {};

      if (searchQuery.trim()) {
        newFilters.keyword = searchQuery.trim();
      }

      if (selectedCity !== 'all') {
        newFilters.city = selectedCity;
      }


      if (selectedTeachingMode !== 'all') {
        newFilters.teachingMode = selectedTeachingMode;
      }

      newFilters.page = 1;
      newFilters.pageSize = 10;

      setFilters(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCity, selectedTeachingMode, setFilters]);

  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await LocationService.getAllProvinces();
        if (response.success && response.data) {
          setProvinces(response.data);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, []);

  const totalPages = Math.ceil(filteredAndSortedTutors.length / tutorsPerPage);
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = filteredAndSortedTutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const currentTutor = filteredAndSortedTutors.find(t => t.id === hoveredTutor) || filteredAndSortedTutors[0];

  useEffect(() => {
    const checkFavoriteStatuses = async () => {
      if (tutors.length === 0 || !isAuthenticated) {
        setFavoriteTutors(new Set());
        return;
      }

      const favoriteChecks = tutors.map(async (tutor) => {
        try {
          const response = await FavoriteTutorService.isFavorite(tutor.id);
          const isFavorite = response.data === true;
          if (process.env.NODE_ENV === 'development') {
            console.log(`Tutor ${tutor.id} favorite status:`, response.data, '→ isFavorite:', isFavorite);
          }
          return { tutorId: tutor.id, isFavorite };
        } catch (error) {
          console.error(`Error checking favorite status for tutor ${tutor.id}:`, error);
          return { tutorId: tutor.id, isFavorite: false };
        }
      });

      const results = await Promise.all(favoriteChecks);
      const favoriteSet = new Set<number>();
      results.forEach(({ tutorId, isFavorite }) => {
        if (isFavorite === true) {
          favoriteSet.add(tutorId);
        }
      });
      setFavoriteTutors(favoriteSet);
    };

    checkFavoriteStatuses();
  }, [tutors, isAuthenticated]);
  useEffect(() => {
    const loadRatings = async () => {
      if (tutors.length === 0) {
        setTutorRatings(new Map());
        return;
      }

      const ratingPromises = tutors.map(async (tutor) => {
        try {
          const response = await FeedbackService.getTutorRatingSummary(tutor.id);
          if (response.success && response.data) {
            return { tutorId: tutor.id, rating: response.data };
          }
          return null;
        } catch (error) {
          console.error(`Error loading rating for tutor ${tutor.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(ratingPromises);
      const ratingMap = new Map<number, TutorRatingSummary>();
      results.forEach((result) => {
        if (result) {
          ratingMap.set(result.tutorId, result.rating);
        }
      });
      setTutorRatings(ratingMap);
    };

    loadRatings();
  }, [tutors]);

  useEffect(() => {
    const loadTrialStatuses = async () => {
      if (tutors.length === 0 || !isAuthenticated || user?.role !== USER_ROLES.LEARNER) {
        setTutorTrialStatuses(new Map());
        return;
      }

      const trialStatusPromises = tutors.map(async (tutor) => {
        try {
          const { LearnerTrialLessonService } = await import('@/services');
          const response = await LearnerTrialLessonService.getSubjectTrialStatuses(tutor.id);

          if (response.success && response.data) {
            return { tutorId: tutor.id, statuses: response.data };
          }
          return { tutorId: tutor.id, statuses: [] };
        } catch (error) {
          console.error(`Error loading trial status for tutor ${tutor.id}:`, error);
          return { tutorId: tutor.id, statuses: [] };
        }
      });

      const results = await Promise.all(trialStatusPromises);
      const trialStatusMap = new Map<number, TrialLessonSubjectStatusDto[]>();
      results.forEach((result) => {
        trialStatusMap.set(result.tutorId, result.statuses);
      });
      setTutorTrialStatuses(trialStatusMap);
    };

    loadTrialStatuses();
  }, [tutors, isAuthenticated, user?.role]);

  const hasAnyTrialLeft = useCallback((tutorId: number): boolean => {
    const statuses = tutorTrialStatuses.get(tutorId);
    if (!statuses || statuses.length === 0) {
      return true;
    }
    return statuses.some(s => !s.hasTrialed);
  }, [tutorTrialStatuses]);
  useEffect(() => {
    setVideoKey(prev => prev + 1);
  }, [currentTutor?.id]);

  const handleViewTutorProfile = (tutorId: number) => {
    router.push(`/tutor/${tutorId}`);
  };

  const handleToggleFavorite = async (tutorId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      showWarning(
        'Vui lòng đăng nhập',
        'Bạn cần đăng nhập để thêm gia sư vào danh sách yêu thích.'
      );
      router.push('/login');
      return;
    }

    const isCurrentlyFavorite = favoriteTutors.has(tutorId);
    setFavoriteTutors(prev => {
      const newFavorites = new Set(prev);
      if (isCurrentlyFavorite) {
        newFavorites.delete(tutorId);
      } else {
        newFavorites.add(tutorId);
      }
      return newFavorites;
    });

    setLoadingFavorite(prev => new Set(prev).add(tutorId));

    try {
      if (isCurrentlyFavorite) {            
        await FavoriteTutorService.removeFromFavorite(tutorId);
      } else {
        await FavoriteTutorService.addToFavorite(tutorId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setFavoriteTutors(prev => {
        const newFavorites = new Set(prev);
        if (isCurrentlyFavorite) {
          newFavorites.add(tutorId);
        } else {
          newFavorites.delete(tutorId);
        }
        return newFavorites;
      });
    } finally {
      setLoadingFavorite(prev => {
        const newSet = new Set(prev);
        newSet.delete(tutorId);
        return newSet;
      });
    }
  };

  const handleOpenChat = async (tutor: typeof currentTutors[0], e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      showWarning(
        'Vui lòng đăng nhập',
        'Bạn cần đăng nhập để nhắn tin với gia sư.'
      );
      router.push('/login');
      return;
    }
    await openChatWithTutor(
      tutor.id,
      tutor.userEmail || "",
      tutor.userName,
      tutor.avatarUrl
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Search and Filters Section - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Search Bar and Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[150px] max-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm gia sư..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-gray-300"
              />
            </div>

            {/* Filters */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                placeholder="Môn học"
                disabled={isLoadingMasterData}
              >
                <SelectWithSearchItem value="all">Tất cả môn học</SelectWithSearchItem>
                {subjects.map((subject) => (
                  <SelectWithSearchItem key={subject.id} value={subject.id.toString()}>
                    {subject.subjectName}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch
                value={selectedCertificate}
                onValueChange={setSelectedCertificate}
                placeholder="Chứng chỉ"
                disabled={isLoadingMasterData}
              >
                <SelectWithSearchItem value="all">Tất cả chứng chỉ</SelectWithSearchItem>
                {certificateTypes.map((cert) => (
                  <SelectWithSearchItem key={cert.id} value={cert.id.toString()}>
                    {cert.code ? `${cert.code} - ${cert.name}` : cert.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch
                value={selectedLevel}
                onValueChange={setSelectedLevel}
                placeholder="Lớp"
                disabled={isLoadingMasterData}
              >
                <SelectWithSearchItem value="all">Tất cả lớp</SelectWithSearchItem>
                {levels.map((level) => (
                  <SelectWithSearchItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch
                value={selectedCity}
                onValueChange={setSelectedCity}
                placeholder={isLoadingProvinces ? 'Đang tải...' : 'Thành phố'}
                disabled={isLoadingMasterData || isLoadingProvinces}
              >
                <SelectWithSearchItem value="all">Tất cả thành phố</SelectWithSearchItem>
                {sortedProvinces.map((province) => (
                  <SelectWithSearchItem key={province.id} value={province.id.toString()}>
                    {province.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch
                value={selectedTeachingMode}
                onValueChange={setSelectedTeachingMode}
                placeholder="Hình thức"
              >
                <SelectWithSearchItem value="all">Tất cả hình thức</SelectWithSearchItem>
                <SelectWithSearchItem value="1">Dạy Online</SelectWithSearchItem>
                <SelectWithSearchItem value="0">Dạy Offline</SelectWithSearchItem>
              </SelectWithSearch>
            </div>

            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch
                value={selectedSort}
                onValueChange={setSelectedSort}
                placeholder="Sắp xếp"
              >
                <SelectWithSearchItem value="recommended">Đề xuất</SelectWithSearchItem>
                <SelectWithSearchItem value="rating">Đánh giá cao</SelectWithSearchItem>
                <SelectWithSearchItem value="price-low">Giá thấp - cao</SelectWithSearchItem>
                <SelectWithSearchItem value="price-high">Giá cao - thấp</SelectWithSearchItem>
                <SelectWithSearchItem value="experience">Kinh nghiệm</SelectWithSearchItem>
              </SelectWithSearch>
            </div>

          </div>

          {/* Price Range Slider */}
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">
                Khoảng giá (₫/giờ)
              </label>
              <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-md border border-gray-300 shadow-sm">
                <span className="font-medium text-[#257180]">
                  {FormatService.formatVND(priceRange[0])}
                </span>
                <span className="text-gray-400">-</span>
                <span className="font-medium text-[#257180]">
                  {FormatService.formatVND(priceRange[1])}
                </span>
              </div>
            </div>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              min={0}
              max={1000000}
              step={10000}
              className="w-full [&_.bg-primary]:bg-[#257180]"
            />
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Tutor List (Detailed) */}
          <div className="lg:col-span-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={clearError}
                >
                  Thử lại
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoadingTutors && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FD8B51]" />
                <span className="ml-2 text-gray-600">Đang tải danh sách gia sư...</span>
              </div>
            )}

            {/* Tutor List */}
            {!isLoadingTutors && (
              <div className="space-y-6">
                {currentTutors.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Không tìm thấy gia sư nào phù hợp với tiêu chí của bạn.</p>
                  </div>
                ) : (
                  currentTutors.map((tutor) => (
                    <Card
                      key={tutor.id}
                      className={`cursor-pointer transition-all duration-200 ${hoveredTutor === tutor.id
                        ? 'border-[#FD8B51] shadow-lg bg-white'
                        : 'hover:border-[#257180]/40 hover:shadow-md bg-white'
                        }`}
                      onMouseEnter={() => setHoveredTutor(tutor.id)}
                      onClick={() => handleViewTutorProfile(tutor.id)}
                    >
                      <CardContent className="p-6">
                        {/* Row 1: Avatar + Name + Info + Subjects */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-4">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0 self-center sm:self-start">
                            <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-lg overflow-hidden bg-[#F2E5BF]">
                              {tutor.avatarUrl ? (
                                <img
                                  src={tutor.avatarUrl}
                                  alt={tutor.userName || tutor.userEmail || 'Gia sư'}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold text-[#257180] bg-[#F2E5BF] ${tutor.avatarUrl ? 'hidden' : 'flex'}`}
                                style={{ display: tutor.avatarUrl ? 'none' : 'flex' }}
                              >
                                {(tutor.userName || tutor.userEmail || 'U').slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                          </div>
                          {/* Name, Info & Subjects */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h2 className="text-black text-xl sm:text-2xl font-bold">
                                    {tutor.userName || tutor.userEmail || 'Gia sư'}
                                  </h2>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm text-black font-medium">
                                      {tutorRatings.get(tutor.id)?.averageRating.toFixed(1) || '0.0'}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      ({tutorRatings.get(tutor.id)?.totalFeedbackCount || 0} đánh giá)
                                    </span>
                                  </div>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className="text-sm text-gray-600">0 buổi học</span>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className="text-sm text-gray-600">0 học sinh</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 -mt-1 hover:bg-[#FD8B51] hover:text-white"
                                onClick={(e) => handleToggleFavorite(tutor.id, e)}
                                disabled={loadingFavorite.has(tutor.id)}
                              >
                                {loadingFavorite.has(tutor.id) ? (
                                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                ) : (
                                  <Heart className={`w-5 h-5 transition-colors duration-200 ${favoriteTutors.has(tutor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                )}
                              </Button>
                            </div>
                            {/* Subjects */}
                            <div className="space-y-1.5">
                              {groupSubjectsBySubjectName(tutor.tutorSubjects || []).map((grouped, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <BookOpen className="w-4 h-4 text-[#257180] flex-shrink-0" />
                                  <span className="font-medium text-black">{grouped.subjectName}:</span>
                                  <span className="text-gray-600">{grouped.levelText || 'Chưa có thông tin'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Row 2: Bio */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {tutor.bio || 'Chưa có thông tin giới thiệu.'}
                          </p>
                        </div>
                        {/* Row 3: Location + Teaching Mode + Education */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {tutor.subDistrict?.name && tutor.province?.name
                                ? `${tutor.subDistrict.name}, ${tutor.province.name}`
                                : tutor.province?.name || 'Việt Nam'
                              }
                            </span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <span>
                            {getTeachingModeDisplayLabel(tutor.teachingModes)}
                          </span>
                          {tutor.tutorEducations && tutor.tutorEducations.length > 0 && (
                            <>
                              <Separator orientation="vertical" className="h-4" />
                              <div className="flex items-center gap-1.5">
                                <Award className="w-4 h-4" />
                                <span className="line-clamp-1">{tutor.tutorEducations[0].institution?.name || 'Education'}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {/* Row 4: Price & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#257180]/20 gap-4">
                          <div>
                            {tutor.tutorSubjects && tutor.tutorSubjects.length > 0 ? (
                              (() => {
                                const prices = tutor.tutorSubjects.map(ts => ts.hourlyRate || 0);
                                const minPrice = Math.min(...prices);
                                const maxPrice = Math.max(...prices);

                                return (
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-3xl text-black font-bold">
                                      {minPrice === maxPrice
                                        ? FormatService.formatVND(minPrice)
                                        : `${FormatService.formatVND(minPrice)} - ${FormatService.formatVND(maxPrice)}`
                                      }
                                    </span>
                                    <span className="text-base text-gray-600">/giờ</span>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl text-black font-bold">
                                  {FormatService.formatVND(0)}
                                </span>
                                <span className="text-base text-gray-600">/giờ</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="lg"
                              className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                              onClick={(e) => handleOpenChat(tutor, e)}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Nhắn tin
                            </Button>
                            {(!isAuthenticated || (isAuthenticated && user?.role === USER_ROLES.LEARNER && hasAnyTrialLeft(tutor.id))) && (
                              <Button
                                size="lg"
                                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isAuthenticated) {
                                    showWarning('Vui lòng đăng nhập', 'Bạn cần đăng nhập để đặt buổi học thử.');
                                    router.push('/login');
                                    return;
                                  }
                                  router.push(`/tutor/${tutor.id}?booking=trial`);
                                }}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Đặt lịch học thử
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
            {/* Pagination */}
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
          {/* Right Side - Video Preview (Simple & Sticky) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-72 z-30">
              {/* Video Card */}
              <Card key={`preview-${currentTutor?.id}-${videoKey}`} className="overflow-hidden bg-white border-[#257180]/20 shadow-lg">
                <CardContent className="p-0">
                  {/* Video Section */}
                  <div className="relative bg-gradient-to-br from-[#257180] to-[#1e5a66] aspect-[4/3]">
                    {currentTutor ? (
                      currentTutor.videoIntroUrl ? (
                        <div className="absolute inset-0">
                          <video
                            key={`video-${currentTutor.id}-${videoKey}`}
                            className="w-full h-full object-cover"
                            controls
                            poster={currentTutor.avatarUrl}
                            preload="metadata"
                          >
                            <source src={currentTutor.videoIntroUrl} type="video/mp4" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="text-center text-white">
                                <div className="w-20 h-20 rounded-full bg-[#FD8B51]/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                                  <Play className="w-10 h-10 text-white ml-1" />
                                </div>
                                <p className="font-bold">Video không hỗ trợ</p>
                                <p className="text-sm mt-2">{currentTutor.userName}</p>
                              </div>
                            </div>
                          </video>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white/80">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                              <Video className="w-8 h-8" />
                            </div>
                            <p className="font-bold">Không có video</p>
                            <p className="text-sm mt-2">{currentTutor.userName}</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white/80">
                          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8" />
                          </div>
                          <p className="text-sm sm:text-base">Chọn gia sư để xem thông tin</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Action Buttons Only - Không trùng với tutor card */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                        size="lg"
                        onClick={() => {
                          const targetId = currentTutor?.id ?? currentTutors[0]?.id;
                          if (!targetId) return;
                          router.push(`/tutor/${targetId}?booking=book`);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Đặt lịch học
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                        size="lg"
                        onClick={() => {
                          if (!currentTutor) return;
                          handleViewTutorProfile(currentTutor.id);
                          router.push(`/tutor/${currentTutor.id}?tab=availability`);
                        }}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Xem lịch dạy của gia sư
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                        size="lg"
                        onClick={() => handleViewTutorProfile(currentTutor?.id ?? currentTutors[0]?.id)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Xem hồ sơ đầy đủ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
    </div>
  );
}