'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Input } from '../ui/form/input';
import { Badge } from '../ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
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
  Loader2
} from 'lucide-react';
import { SelectWithSearch, SelectWithSearchItem } from '../ui/form/select-with-search';
import { Separator } from '../ui/layout/separator';
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
import { FindTutorProfile } from '@/services/findTutorService';
export function FindTutorPage() {
  const router = useRouter();
  const {
    tutors,
    subjects,
    levels,
    institutions,
    isLoadingTutors,
    isLoadingMasterData,
    error,
    filters,
    setFilters,
    clearError,
  } = useFindTutor();

  const [priceRange, setPriceRange] = useState([50000, 500000]);
  const [hoveredTutor, setHoveredTutor] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteTutors, setFavoriteTutors] = useState<Set<number>>(new Set());
  const tutorsPerPage = 6;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedCity, selectedRating, selectedPrice, selectedSort]);

  useEffect(() => {
    if (tutors.length > 0 && !hoveredTutor) {
      setHoveredTutor(tutors[0].id);
    }
  }, [tutors, hoveredTutor]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilters: any = {};
      
      if (searchQuery.trim()) {
        newFilters.keyword = searchQuery.trim();
      } else {
        if (selectedSubject !== 'all') {
          newFilters.keyword = selectedSubject;
        }
        
        if (selectedRating !== 'all') {
          newFilters.keyword = `rating:${selectedRating}`;
        }
        
        if (selectedPrice !== 'all') {
          newFilters.keyword = `price:${selectedPrice}`;
        }
        
        if (selectedSort !== 'recommended') {
          newFilters.keyword = `sort:${selectedSort}`;
        }
      }
      
      if (selectedCity !== 'all') {
        newFilters.city = selectedCity;
      }
      
      newFilters.page = 1;
      newFilters.pageSize = 10;
      
      setFilters(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedSubject, selectedCity, selectedRating, selectedPrice, selectedSort, setFilters]);

  const totalPages = Math.ceil(tutors.length / tutorsPerPage);
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = tutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const currentTutor = currentTutors.find(t => t.id === hoveredTutor) || currentTutors[0];
  const handleViewTutorProfile = (tutorId: number) => {
    router.push(`/tutor/${tutorId}`);
  };
  const handleToggleFavorite = (tutorId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setFavoriteTutors(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tutorId)) {
        newFavorites.delete(tutorId);
      } else {
        newFavorites.add(tutorId);
      }
      return newFavorites;
    });
  };
  return (
    <div className="min-h-screen bg-[#F2E5BF] pt-16">
      {/* Title Section */}
      <div className="bg-white border-b border-[#257180]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight tracking-tight">
              TÌM GIA SƯ TRỰC TUYẾN
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Kết nối với hơn 1,000+ gia sư chuyên nghiệp
            </p>
          </div>
        </div>
      </div>
      {/* Sticky Search and Filters Section */}
      <div className="bg-white border-b border-[#257180]/20 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search, Filters and Price Range in One Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end w-full">
            {/* Search Bar - Compact */}
            <div className="relative w-full lg:w-[280px] flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#257180]" />
              <Input
                placeholder="Tìm gia sư..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
              />
            </div>
            {/* Filters - Match main content area width */}
            <div className="flex flex-wrap lg:flex-nowrap gap-3 flex-1">
              <SelectWithSearch 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
                placeholder="Môn học"
                className="w-full lg:w-[160px] flex-shrink-0"
                disabled={isLoadingMasterData}
              >
                <SelectWithSearchItem value="all">Tất cả môn học</SelectWithSearchItem>
                {subjects.map((subject) => (
                  <SelectWithSearchItem key={subject.id} value={subject.id.toString()}>
                    {subject.subjectName}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
              <SelectWithSearch 
                value={selectedCity} 
                onValueChange={setSelectedCity}
                placeholder="Thành phố"
                className="w-full lg:w-[160px] flex-shrink-0"
                disabled={isLoadingMasterData}
              >
                <SelectWithSearchItem value="all">Tất cả thành phố</SelectWithSearchItem>
                <SelectWithSearchItem value="hanoi">Hà Nội</SelectWithSearchItem>
                <SelectWithSearchItem value="hcm">TP. Hồ Chí Minh</SelectWithSearchItem>
                <SelectWithSearchItem value="danang">Đà Nẵng</SelectWithSearchItem>
                <SelectWithSearchItem value="haiphong">Hải Phòng</SelectWithSearchItem>
                <SelectWithSearchItem value="cantho">Cần Thơ</SelectWithSearchItem>
              </SelectWithSearch>
              <SelectWithSearch 
                value={selectedRating}
                onValueChange={setSelectedRating}
                placeholder="Đánh giá"
                className="w-full lg:w-[160px] flex-shrink-0"
              >
                <SelectWithSearchItem value="all">Tất cả đánh giá</SelectWithSearchItem>
                <SelectWithSearchItem value="4.5">4.5⭐ trở lên</SelectWithSearchItem>
                <SelectWithSearchItem value="4.0">4.0⭐ trở lên</SelectWithSearchItem>
                <SelectWithSearchItem value="3.5">3.5⭐ trở lên</SelectWithSearchItem>
              </SelectWithSearch>
              <SelectWithSearch 
                value={selectedPrice}
                onValueChange={(value) => {
                  setSelectedPrice(value);
                  if (value === 'all') {
                    setPriceRange([50000, 500000]);
                  } else if (value === 'custom') {
                    return;
                  } else {
                    const [min, max] = value.split('-').map(Number);
                    setPriceRange([min, max]);
                  }
                }}
                placeholder="Mức giá"
                className="w-full lg:w-[160px] flex-shrink-0"
              >
                <SelectWithSearchItem value="all">Tất cả mức giá</SelectWithSearchItem>
                <SelectWithSearchItem value="50000-100000">Dưới 100k/giờ</SelectWithSearchItem>
                <SelectWithSearchItem value="100000-150000">100k - 150k/giờ</SelectWithSearchItem>
                <SelectWithSearchItem value="150000-200000">150k - 200k/giờ</SelectWithSearchItem>
                <SelectWithSearchItem value="200000-250000">200k - 250k/giờ</SelectWithSearchItem>
                <SelectWithSearchItem value="250000-300000">250k - 300k/giờ</SelectWithSearchItem>
                <SelectWithSearchItem value="300000-500000">Trên 300k/giờ</SelectWithSearchItem>
                {(() => {
                  const [min, max] = priceRange;
                  const isCustom = !(
                    (min === 50000 && max === 500000) ||
                    (min === 50000 && max === 100000) ||
                    (min === 100000 && max === 150000) ||
                    (min === 150000 && max === 200000) ||
                    (min === 200000 && max === 250000) ||
                    (min === 250000 && max === 300000) ||
                    (min === 300000 && max === 500000)
                  );
                  if (isCustom) {
                    return (
                      <SelectWithSearchItem value="custom">
                        {FormatService.formatVND(min)} - {FormatService.formatVND(max)}
                      </SelectWithSearchItem>
                    );
                  }
                  return null;
                })()}
              </SelectWithSearch>
              <SelectWithSearch 
                value={selectedSort}
                onValueChange={setSelectedSort}
                placeholder="Sắp xếp"
                className="w-full lg:w-[160px] flex-shrink-0"
              >
                <SelectWithSearchItem value="recommended">Đề xuất</SelectWithSearchItem>
                <SelectWithSearchItem value="rating">Đánh giá cao</SelectWithSearchItem>
                <SelectWithSearchItem value="price-low">Giá thấp - cao</SelectWithSearchItem>
                <SelectWithSearchItem value="price-high">Giá cao - thấp</SelectWithSearchItem>
                <SelectWithSearchItem value="experience">Kinh nghiệm</SelectWithSearchItem>
              </SelectWithSearch>
            </div>
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
                className={`cursor-pointer transition-all duration-200 ${
                        hoveredTutor === tutor.id 
                    ? 'border-[#FD8B51] shadow-lg bg-white' 
                    : 'hover:border-[#257180]/40 hover:shadow-md bg-white'
                }`}
                      onMouseEnter={() => setHoveredTutor(tutor.id)}
                      onClick={() => handleViewTutorProfile(tutor.id)}
              >
                <CardContent className="p-6">
                  {/* Row 1: Avatar + Name + Info + Subjects */}
                  <div className="flex gap-5 mb-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="relative w-36 h-36 rounded-lg overflow-hidden bg-gray-100">
                        <Avatar className="w-full h-full rounded-lg">
                          <AvatarImage src={tutor.user?.avatarUrl || undefined} className="object-cover" />
                          <AvatarFallback className="rounded-lg text-2xl">
                            {tutor.user?.firstName && tutor.user?.lastName 
                              ? `${tutor.user.firstName[0]}${tutor.user.lastName[0]}`
                              : tutor.userEmail.split('@')[0].slice(0, 2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    {/* Name, Info & Subjects */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h2 className="text-black text-2xl font-bold">
                              {tutor.user?.firstName && tutor.user?.lastName 
                                ? `${tutor.user.firstName} ${tutor.user.lastName}`
                                : tutor.userEmail.split('@')[0]
                              }
                            </h2>
                            {tutor.videoIntroUrl && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5 border-[#FD8B51] text-[#FD8B51]">
                                <Video className="w-3 h-3 mr-1" />
                                Video
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 fill-[#FD8B51] text-[#FD8B51]" />
                              <span className="text-sm text-black font-medium">4.5</span>
                              <span className="text-sm text-gray-600">(0 đánh giá)</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-sm text-gray-600">0 buổi học</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-sm text-gray-600">{tutor.experience || 0} năm kinh nghiệm</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 -mt-1"
                          onClick={(e) => handleToggleFavorite(tutor.id, e)}
                        >
                          <Heart className={`w-5 h-5 ${favoriteTutors.has(tutor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                      {/* Subjects */}
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects?.map((subject, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-black border-[#257180]/20">
                            {subject.subject?.subjectName || `Subject ${subject.subjectId}`}
                          </Badge>
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
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>Việt Nam</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{tutor.teachingMode || 'Chưa xác định'}</span>
                    {tutor.educations && tutor.educations.length > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          <span className="line-clamp-1">{tutor.educations[0].degree}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Row 4: Price & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#257180]/20">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-black font-bold">
                          {FormatService.formatVND(tutor.hourlyRate)}
                        </span>
                        <span className="text-base text-gray-600">/giờ</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-black text-black hover:bg-black hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Open message with tutor:', tutor.id);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Nhắn tin
                      </Button>
                      <Button 
                        size="lg"
                        className="bg-[#FD8B51] hover:bg-[#CB6040] text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Book trial lesson with tutor:', tutor.id);
                        }}
                      >
                        Đặt buổi học thử
                      </Button>
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
            <div className="sticky top-[calc(4rem+4rem+1rem)] z-30">
              {/* Video Card */}
              <Card className="overflow-hidden bg-white border-[#257180]/20 shadow-lg">
                <CardContent className="p-0">
                  {/* Video Section */}
                  <div className="relative bg-gradient-to-br from-[#257180] to-[#1e5a66] aspect-[4/3]">
                    {currentTutor ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-[#FD8B51]/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto hover:bg-[#FD8B51]/30 hover:scale-110 transition-all cursor-pointer">
                            <Play className="w-10 h-10 text-white ml-1" />
                          </div>
                          <p className="text-white font-bold">Xem video giới thiệu</p>
                          <p className="text-white/80 text-sm sm:text-base mt-2">
                            {currentTutor.user?.firstName && currentTutor.user?.lastName 
                              ? `${currentTutor.user.firstName} ${currentTutor.user.lastName}`
                              : currentTutor.userEmail.split('@')[0]
                            }
                          </p>
                        </div>
                      </div>
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
                        className="w-full border-black text-black hover:bg-black hover:text-white" 
                        size="lg"
                        onClick={() => {
                          console.log('Open booking calendar for tutor:', currentTutor?.id);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Đặt lịch học
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-[#FD8B51] text-[#FD8B51] hover:bg-[#FD8B51] hover:text-white" 
                        size="lg"
                        onClick={() => {
                          console.log('View tutor schedule:', currentTutor?.id);
                        }}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Xem lịch dạy của gia sư
                      </Button>
                      <Button 
                        className="w-full bg-[#FD8B51] hover:bg-[#CB6040] text-white" 
                        size="lg"
                        onClick={() => currentTutor && handleViewTutorProfile(currentTutor.id)}
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
    </div>
  );
}