'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Input } from '../ui/form/input';
import { Badge } from '../ui/basic/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
import { FormatService } from '@/lib/format';
import { 
  Search,
  Star, 
  Heart, 
  MapPin, 
  Play,
  MessageCircle,
  Calendar,
  Award,
  Video,
  Send,
  Clock,
  Loader2
} from 'lucide-react';
import { SelectWithSearch, SelectWithSearchItem } from '../ui/form/select-with-search';
import { Separator } from '../ui/layout/separator';
import { Slider } from '../ui/form/slider';
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
import { FavoriteTutorService } from '@/services/favoriteTutorService';
import { TutorProfileDto } from '@/types/backend';
import { EnumHelpers, TeachingMode } from '@/types/enums';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomToast } from '@/hooks/useCustomToast';

// Helper function to convert string enum from API to TeachingMode enum
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

interface TutorCardData {
  tutorId: number;
  userEmail: string;
  userName: string;
  avatarUrl: string | null;
  gender: string | null;
  bio: string | null;
  teachingExp: string | null;
  videoIntroUrl: string | null;
  teachingModes: string | null;
  subjects: string[];
  hourlyRate: number;
  provinceName: string;
  subDistrictName: string;
  rating: number;
  reviewCount: number;
  completedLessons: number;
  totalStudents: number;
  isFavorite: boolean;
  education: string;
  isVerified: boolean;
  specializations: string[];
}
export function SavedTutorsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showWarning } = useCustomToast();
  const {
    subjects,
    levels,
    certificateTypes,
    isLoadingMasterData,
  } = useFindTutor();

  const [hoveredTutor, setHoveredTutor] = useState<number | null>(1);
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
  const [savedTutors, setSavedTutors] = useState<TutorCardData[]>([]);
  const [isLoadingTutors, setIsLoadingTutors] = useState(true);
  const [favoriteTutors, setFavoriteTutors] = useState<Set<number>>(new Set());
  const [loadingFavorite, setLoadingFavorite] = useState<Set<number>>(new Set());
  const tutorsPerPage = 6;

  // Helper function to convert TutorProfileDto to TutorCardData
  const convertTutorToCardData = (tutor: TutorProfileDto): TutorCardData => {
    const prices = tutor.tutorSubjects?.map(ts => ts.hourlyRate || 0).filter(p => p > 0) || [];
    const hourlyRate = prices.length > 0 ? Math.min(...prices) : 0;
    
    const subjects = tutor.tutorSubjects?.map(ts => ts.subject?.subjectName || '').filter(s => s) || [];
    const specializations = tutor.tutorSubjects?.map(ts => ts.level?.name || '').filter(s => s) || [];
    
    // Get teaching modes as string
    let teachingModesStr = '';
    if (tutor.teachingModes !== undefined) {
      const mode = getTeachingModeValue(tutor.teachingModes);
      const modes: string[] = [];
      if (mode === TeachingMode.Online || mode === TeachingMode.Hybrid) {
        modes.push('Trực tuyến');
      }
      if (mode === TeachingMode.Offline || mode === TeachingMode.Hybrid) {
        modes.push('Tại nhà');
      }
      teachingModesStr = modes.join(', ');
    }
    
    // Get education (first education if available)
    const education = tutor.tutorEducations?.[0] 
      ? `${tutor.tutorEducations[0].degree || ''} ${tutor.tutorEducations[0].major || ''} - ${tutor.tutorEducations[0].schoolName || ''}`.trim()
      : '';

    return {
      tutorId: tutor.id,
      userEmail: tutor.userEmail,
      userName: tutor.userName || tutor.userEmail,
      avatarUrl: tutor.avatarUrl || null,
      gender: tutor.gender || null,
      teachingExp: tutor.teachingExp || null,
      bio: tutor.bio || null,
      videoIntroUrl: tutor.videoIntroUrl || null,
      teachingModes: teachingModesStr || null,
      subjects,
      hourlyRate,
      provinceName: tutor.province?.name || '',
      subDistrictName: tutor.subDistrict?.name || '',
      rating: 5.0, // Default rating, can be updated if API provides it
      reviewCount: 0, // Default, can be updated if API provides it
      completedLessons: 0, // Default, can be updated if API provides it
      totalStudents: 0, // Default, can be updated if API provides it
      isFavorite: true, // All tutors in this page are favorites
      isVerified: !!tutor.verifiedAt,
      education,
      specializations,
    };
  };

  // Load favorite tutors from API (only if authenticated)
  useEffect(() => {
    const loadFavoriteTutors = async () => {
      if (!isAuthenticated) {
        setIsLoadingTutors(false);
        setSavedTutors([]);
        return;
      }

      setIsLoadingTutors(true);
      try {
        const response = await FavoriteTutorService.getFavoriteTutors();
        const tutors = response.data || [];
        const cardData = tutors.map(convertTutorToCardData);
        setSavedTutors(cardData);
        setFavoriteTutors(new Set(cardData.map(t => t.tutorId)));
      } catch (error) {
        console.error('Error loading favorite tutors:', error);
        setSavedTutors([]);
      } finally {
        setIsLoadingTutors(false);
      }
    };

    loadFavoriteTutors();
  }, [isAuthenticated]);

  // Client-side filtering and sorting
  const filteredAndSortedTutors = React.useMemo(() => {
    let filtered = savedTutors.filter(tutor => favoriteTutors.has(tutor.tutorId));

    // Filter by keyword (search)
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

    // Filter by subject
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(tutor => 
        tutor.subjects.some(subject => {
          const subjectObj = subjects.find(s => s.id.toString() === selectedSubject);
          return subjectObj && subject.toLowerCase().includes(subjectObj.subjectName.toLowerCase());
        })
      );
    }

    // Filter by certificate type
    if (selectedCertificate !== 'all') {
      // Note: Mock data doesn't have certificate info, so we'll skip this filter for now
      // or you can add certificate field to TutorCardData if needed
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(tutor => 
        tutor.specializations.some(spec => {
          const levelObj = levels.find(l => l.id.toString() === selectedLevel);
          return levelObj && spec.toLowerCase().includes(levelObj.name.toLowerCase());
        })
      );
    }

    // Filter by city
    if (selectedCity !== 'all') {
      const cityMap: { [key: string]: string } = {
        'hanoi': 'Hà Nội',
        'hcm': 'TP. Hồ Chí Minh',
        'danang': 'Đà Nẵng',
        'haiphong': 'Hải Phòng',
        'cantho': 'Cần Thơ'
      };
      const cityName = cityMap[selectedCity];
      filtered = filtered.filter(tutor => 
        tutor.provinceName === cityName
      );
    }

    // Filter by teaching mode
    if (selectedTeachingMode !== 'all') {
      const modeMap: { [key: string]: string } = {
        '1': 'Trực tuyến',
        '0': 'Tại nhà'
      };
      const modeText = modeMap[selectedTeachingMode];
      if (modeText) {
        filtered = filtered.filter(tutor => 
          tutor.teachingModes?.includes(modeText)
        );
      }
    }

    // Filter by price range
    if (priceRange[0] > 0 || priceRange[1] < 1000000) {
      const [minRange, maxRange] = priceRange;
      filtered = filtered.filter(tutor => {
        return tutor.hourlyRate >= minRange && tutor.hourlyRate <= maxRange;
      });
    }

    // Sort tutors
    if (selectedSort !== 'recommended') {
      filtered.sort((a, b) => {
        switch (selectedSort) {
          case 'price-low':
            return a.hourlyRate - b.hourlyRate;
          case 'price-high':
            return b.hourlyRate - a.hourlyRate;
          case 'experience':
            // Sort by teaching experience (years)
            const aExp = parseInt(a.teachingExp?.replace(/\D/g, '') || '0');
            const bExp = parseInt(b.teachingExp?.replace(/\D/g, '') || '0');
            return bExp - aExp;
          case 'rating':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [savedTutors, favoriteTutors, searchQuery, selectedSubject, selectedCertificate, selectedLevel, selectedCity, selectedTeachingMode, priceRange, selectedSort, subjects, levels]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedCertificate, selectedLevel, selectedCity, selectedTeachingMode, priceRange, selectedSort]);

  // Reset certificate filter when subject changes
  useEffect(() => {
    setSelectedCertificate('all');
  }, [selectedSubject]);

  useEffect(() => {
    if (filteredAndSortedTutors.length > 0 && !hoveredTutor) {
      setHoveredTutor(filteredAndSortedTutors[0].tutorId);
    }
  }, [filteredAndSortedTutors, hoveredTutor]);

  // Update hoveredTutor when filtered results change
  useEffect(() => {
    if (filteredAndSortedTutors.length > 0) {
      const currentHoveredExists = filteredAndSortedTutors.some(t => t.tutorId === hoveredTutor);
      if (!currentHoveredExists) {
        setHoveredTutor(filteredAndSortedTutors[0].tutorId);
      }
    }
  }, [filteredAndSortedTutors, hoveredTutor]);

  // Reset video when currentTutor changes
  useEffect(() => {
    setVideoKey(prev => prev + 1);
  }, [hoveredTutor]);

  const totalPages = Math.ceil(filteredAndSortedTutors.length / tutorsPerPage);
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = filteredAndSortedTutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const currentTutor = filteredAndSortedTutors.find(t => t.tutorId === hoveredTutor) || filteredAndSortedTutors[0];
  const handleToggleFavorite = async (tutorId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      showWarning(
        'Vui lòng đăng nhập',
        'Bạn cần đăng nhập để thêm gia sư vào danh sách yêu thích.'
      );
      router.push('/login');
      return;
    }
    
    const isCurrentlyFavorite = favoriteTutors.has(tutorId);
    
    // Optimistic update - remove from UI immediately
    if (isCurrentlyFavorite) {
      setSavedTutors(prev => prev.filter(t => t.tutorId !== tutorId));
      setFavoriteTutors(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(tutorId);
        return newFavorites;
      });
    }

    // Set loading state
    setLoadingFavorite(prev => new Set(prev).add(tutorId));

    try {
      if (isCurrentlyFavorite) {
        await FavoriteTutorService.removeFromFavorite(tutorId);
      } else {
        await FavoriteTutorService.addToFavorite(tutorId);
        // Reload the list if adding (shouldn't happen in saved tutors page, but just in case)
        const response = await FavoriteTutorService.getFavoriteTutors();
        const tutors = response.data || [];
        const cardData = tutors.map(convertTutorToCardData);
        setSavedTutors(cardData);
        setFavoriteTutors(new Set(cardData.map(t => t.tutorId)));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Reload on error to revert
      const response = await FavoriteTutorService.getFavoriteTutors();
      const tutors = response.data || [];
      const cardData = tutors.map(convertTutorToCardData);
      setSavedTutors(cardData);
      setFavoriteTutors(new Set(cardData.map(t => t.tutorId)));
    } finally {
      setLoadingFavorite(prev => {
        const newSet = new Set(prev);
        newSet.delete(tutorId);
        return newSet;
      });
    }
  };
  const handleViewTutorProfile = (tutorId: number) => {
    router.push(`/tutor/${tutorId}`);
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
              placeholder="Thành phố"
              disabled={isLoadingMasterData}
            >
              <SelectWithSearchItem value="all">Tất cả thành phố</SelectWithSearchItem>
              <SelectWithSearchItem value="hanoi">Hà Nội</SelectWithSearchItem>
              <SelectWithSearchItem value="hcm">TP. Hồ Chí Minh</SelectWithSearchItem>
              <SelectWithSearchItem value="danang">Đà Nẵng</SelectWithSearchItem>
              <SelectWithSearchItem value="haiphong">Hải Phòng</SelectWithSearchItem>
              <SelectWithSearchItem value="cantho">Cần Thơ</SelectWithSearchItem>
            </SelectWithSearch>
            </div>

            <div className="flex-1 min-w-[140px]">
            <SelectWithSearch 
              value={selectedTeachingMode}
              onValueChange={setSelectedTeachingMode}
              placeholder="Hình thức"
            >
              <SelectWithSearchItem value="all">Tất cả hình thức</SelectWithSearchItem>
              <SelectWithSearchItem value="1">Trực tuyến</SelectWithSearchItem>
              <SelectWithSearchItem value="0">Tại nhà</SelectWithSearchItem>
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
            {/* Loading State */}
            {isLoadingMasterData && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FD8B51]" />
                <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            )}

            {/* Tutor List */}
            {!isAuthenticated ? (
              <Card className="border-[#FD8B51]">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">Vui lòng đăng nhập</h3>
                  <p className="text-gray-600 mb-6">
                    Bạn cần đăng nhập để xem danh sách gia sư yêu thích.
                  </p>
                  <Button onClick={() => router.push('/login')} className="bg-[#FD8B51] hover:bg-[#e67a40]">
                    Đăng nhập
                  </Button>
                </CardContent>
              </Card>
            ) : isLoadingTutors ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FD8B51]" />
                <span className="ml-2 text-gray-600">Đang tải danh sách gia sư yêu thích...</span>
              </div>
            ) : !isLoadingMasterData && (
            <>
            {filteredAndSortedTutors.length === 0 ? (
              <Card className="border-[#FD8B51]">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">
                    {favoriteTutors.size === 0 
                      ? 'Chưa có gia sư nào được lưu'
                      : 'Không tìm thấy gia sư nào phù hợp với tiêu chí của bạn'
                    }
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {favoriteTutors.size === 0
                      ? 'Bạn chưa lưu gia sư nào. Hãy tìm kiếm và lưu những gia sư yêu thích của bạn.'
                      : 'Thử điều chỉnh bộ lọc để tìm thêm gia sư phù hợp.'
                    }
                  </p>
                  {favoriteTutors.size === 0 && (
                    <Button 
                      onClick={() => router.push('/find-tutor')}
                      className="bg-[#257180] hover:bg-[#1e5a66] text-white"
                    >
                      Tìm gia sư
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-6">
                  {currentTutors.map((tutor) => (
                    <Card 
                      key={tutor.tutorId}
                      className={`cursor-pointer transition-all duration-200 ${
                        hoveredTutor === tutor.tutorId 
                          ? 'border-[#FD8B51] shadow-lg bg-white' 
                          : 'hover:border-[#257180]/40 hover:shadow-md bg-white'
                      }`}
                      onMouseEnter={() => setHoveredTutor(tutor.tutorId)}
                      onClick={() => handleViewTutorProfile(tutor.tutorId)}
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
                                  alt={tutor.userName}
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
                                {tutor.userName.slice(0, 2).toUpperCase()}
                              </div>
                              {/* Video Play Indicator */}
                              {tutor.videoIntroUrl && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-gray-900 ml-0.5" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Name, Info & Subjects */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h2 className="text-black text-xl sm:text-2xl font-bold">
                                    {tutor.userName}
                                  </h2>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 fill-[#FD8B51] text-[#FD8B51]" />
                                    <span className="text-sm text-black font-medium">{tutor.rating}</span>
                                    <span className="text-sm text-gray-600">({tutor.reviewCount} đánh giá)</span>
                                  </div>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className="text-sm text-gray-600">{tutor.completedLessons} buổi học</span>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className="text-sm text-gray-600">{tutor.totalStudents} học sinh</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2 -mt-1 hover:bg-[#FD8B51] hover:text-white"
                                onClick={(e) => handleToggleFavorite(tutor.tutorId, e)}
                                disabled={loadingFavorite.has(tutor.tutorId)}
                              >
                                {loadingFavorite.has(tutor.tutorId) ? (
                                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                ) : (
                                  <Heart className={`w-5 h-5 transition-colors duration-200 ${favoriteTutors.has(tutor.tutorId) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                )}
                              </Button>
                            </div>
                            {/* Subjects */}
                            <div className="flex flex-wrap gap-2">
                              {tutor.subjects.map((subject, idx) => (
                                <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-black border-[#257180]/20">
                                  {subject}
                                </Badge>
                              ))}
                              {tutor.specializations.slice(0, 2).map((spec, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5 border-gray-300 text-[#FD8B51]">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Row 2: Bio */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {tutor.bio}
                          </p>
                        </div>
                        {/* Row 3: Location + Teaching Mode + Education */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {tutor.subDistrictName && tutor.provinceName
                                ? `${tutor.subDistrictName}, ${tutor.provinceName}`
                                : tutor.provinceName || 'Việt Nam'
                              }
                            </span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <span>{tutor.teachingModes}</span>
                          {tutor.education && (
                            <>
                              <Separator orientation="vertical" className="h-4" />
                              <div className="flex items-center gap-1.5">
                                <Award className="w-4 h-4" />
                                <span className="line-clamp-1">{tutor.education}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {/* Row 4: Price & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#257180]/20 gap-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl text-black font-bold">
                                {FormatService.formatVND(tutor.hourlyRate)}
                              </span>
                              <span className="text-base text-gray-600">/giờ</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="lg" className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Nhắn tin
                            </Button>
                            <Button size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
                              Đặt buổi học thử
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
              </>
            )}
            </>
            )}
          </div>
          {/* Right Side - Video Preview (Simple & Sticky) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-72 z-30">
              {/* Video Card */}
              <Card key={`preview-${currentTutor?.tutorId}-${videoKey}`} className="overflow-hidden bg-white border-[#257180]/20 shadow-lg">
                <CardContent className="p-0">
                  {/* Video Section */}
                  <div className="relative bg-gradient-to-br from-[#257180] to-[#1e5a66] aspect-[4/3]">
                    {currentTutor ? (
                      currentTutor.videoIntroUrl ? (
                        <div className="absolute inset-0">
                          <video 
                            key={`video-${currentTutor.tutorId}-${videoKey}`}
                            className="w-full h-full object-cover"
                            controls
                            poster={currentTutor.avatarUrl || undefined}
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
                      <Button variant="outline" className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]" size="lg">
                        <Calendar className="w-4 h-4 mr-2" />
                        Đặt lịch học
                      </Button>
                      <Button variant="outline" className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]" size="lg">
                        <Clock className="w-4 h-4 mr-2" />
                        Xem lịch dạy của gia sư
                      </Button>
                      <Button variant="outline" className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]" size="lg">
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
    </div>
  );
}
