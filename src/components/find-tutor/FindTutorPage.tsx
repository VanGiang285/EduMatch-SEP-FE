'use client';

import React, { useState } from 'react';
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
  Send
} from 'lucide-react';
import { SelectWithSearch, SelectWithSearchItem } from '../ui/form/select-with-search';
import { Slider } from '../ui/form/slider';
import { Separator } from '../ui/layout/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/navigation/pagination';

// ========== TYPE DEFINITIONS ==========

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

interface Subject {
  id: number;
  subjectName: string;
}

interface Province {
  id: number;
  name: string;
}

export function FindTutorPage() {
  const router = useRouter();
  const [priceRange, setPriceRange] = useState([50000, 500000]);
  const [hoveredTutor, setHoveredTutor] = useState<number | null>(1);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteTutors, setFavoriteTutors] = useState<Set<number>>(new Set([1, 3])); // Mock: tutors 1 and 3 are favorited
  const tutorsPerPage = 6;

  // ========== MOCK DATA ==========
  
  const subjects: Subject[] = [
    { id: 1, subjectName: 'Toán học' },
    { id: 2, subjectName: 'Tiếng Anh' },
    { id: 3, subjectName: 'Vật lý' },
    { id: 4, subjectName: 'Hóa học' },
    { id: 5, subjectName: 'Sinh học' },
    { id: 6, subjectName: 'Ngữ văn' },
  ];

  const provinces: Province[] = [
    { id: 1, name: 'Hà Nội' },
    { id: 2, name: 'TP. Hồ Chí Minh' },
    { id: 3, name: 'Đà Nẵng' },
    { id: 4, name: 'Hải Phòng' },
    { id: 5, name: 'Cần Thơ' },
  ];

  const tutors: TutorCardData[] = [
    {
      tutorId: 1,
      userEmail: 'nguyenthimaianh@gmail.com',
      userName: 'Nguyễn Thị Mai Anh',
      avatarUrl: '/placeholder-avatar-1.jpg',
      gender: 'Nữ',
      teachingExp: '5 năm',
      bio: 'Chuyên gia giảng dạy Toán học với phương pháp độc đáo, giúp học sinh yêu thích môn học và đạt kết quả cao trong các kỳ thi.',
      videoIntroUrl: '/placeholder-video-1.mp4',
      teachingModes: 'Trực tuyến, Tại nhà',
      subjects: ['Toán học', 'Vật lý'],
      hourlyRate: 200000,
      provinceName: 'Hà Nội',
      subDistrictName: 'Cầu Giấy',
      rating: 4.9,
      reviewCount: 234,
      completedLessons: 892,
      totalStudents: 156,
      isFavorite: true,
      isVerified: true,
      education: 'Thạc sĩ Toán học - ĐH Sư phạm Hà Nội',
      specializations: ['THPT', 'Luyện thi Đại học'],
    },
    {
      tutorId: 2,
      userEmail: 'tranvanhung@gmail.com',
      userName: 'Trần Văn Hùng',
      avatarUrl: '/placeholder-avatar-2.jpg',
      gender: 'Nam',
      teachingExp: '7 năm',
      bio: 'Giảng viên Tiếng Anh với nhiều năm kinh nghiệm. Chuyên luyện thi IELTS, TOEIC và giao tiếp thực tế cho mọi lứa tuổi.',
      videoIntroUrl: '/placeholder-video-2.mp4',
      teachingModes: 'Trực tuyến',
      subjects: ['Tiếng Anh'],
      hourlyRate: 250000,
      provinceName: 'TP. Hồ Chí Minh',
      subDistrictName: 'Quận 1',
      rating: 4.8,
      reviewCount: 189,
      completedLessons: 756,
      totalStudents: 123,
      isFavorite: false,
      isVerified: true,
      education: 'Cử nhân Ngôn ngữ Anh - ĐH Ngoại ngữ',
      specializations: ['IELTS', 'TOEIC', 'Giao tiếp'],
    },
    {
      tutorId: 3,
      userEmail: 'lethihuong@gmail.com',
      userName: 'Lê Thị Hương',
      avatarUrl: '/placeholder-avatar-3.jpg',
      gender: 'Nữ',
      teachingExp: '4 năm',
      bio: 'Gia sư Vật lý tận tâm, giúp học sinh hiểu bản chất vấn đề thay vì học vẹt. Phương pháp giảng dạy sinh động, dễ hiểu.',
      videoIntroUrl: null,
      teachingModes: 'Trực tuyến, Tại nhà',
      subjects: ['Vật lý', 'Toán học'],
      hourlyRate: 180000,
      provinceName: 'Đà Nẵng',
      subDistrictName: 'Hải Châu',
      rating: 4.7,
      reviewCount: 167,
      completedLessons: 623,
      totalStudents: 98,
      isFavorite: true,
      isVerified: true,
      education: 'Cử nhân Vật lý - ĐH Khoa học Tự nhiên',
      specializations: ['THCS', 'THPT'],
    },
    {
      tutorId: 4,
      userEmail: 'phamminhtuan@gmail.com',
      userName: 'Phạm Minh Tuấn',
      avatarUrl: '/placeholder-avatar-4.jpg',
      gender: 'Nam',
      teachingExp: '6 năm',
      bio: 'Chuyên gia Hóa học với kinh nghiệm dạy học sinh chuyên và luyện thi quốc gia. Phương pháp giảng dạy logic, dễ nhớ lâu.',
      videoIntroUrl: '/placeholder-video-4.mp4',
      teachingModes: 'Trực tuyến, Tại trung tâm',
      subjects: ['Hóa học'],
      hourlyRate: 220000,
      provinceName: 'Hà Nội',
      subDistrictName: 'Đống Đa',
      rating: 4.9,
      reviewCount: 201,
      completedLessons: 734,
      totalStudents: 134,
      isFavorite: false,
      isVerified: true,
      education: 'Thạc sĩ Hóa học - ĐH Bách khoa',
      specializations: ['Luyện thi Olympic', 'THPT chuyên'],
    },
    {
      tutorId: 5,
      userEmail: 'hoangthutrang@gmail.com',
      userName: 'Hoàng Thu Trang',
      avatarUrl: '/placeholder-avatar-5.jpg',
      gender: 'Nữ',
      teachingExp: '3 năm',
      bio: 'Giảng viên trẻ, năng động với phong cách giảng dạy hiện đại. Chuyên môn Ngữ văn và kỹ năng viết luận, làm văn.',
      videoIntroUrl: '/placeholder-video-5.mp4',
      teachingModes: 'Trực tuyến',
      subjects: ['Ngữ văn'],
      hourlyRate: 150000,
      provinceName: 'Hải Phòng',
      subDistrictName: 'Lê Chân',
      rating: 4.6,
      reviewCount: 142,
      completedLessons: 521,
      totalStudents: 87,
      isFavorite: false,
      isVerified: false,
      education: 'Cử nhân Ngữ văn - ĐH Sư phạm',
      specializations: ['Làm văn', 'Nghị luận xã hội'],
    },
    {
      tutorId: 6,
      userEmail: 'ngovantung@gmail.com',
      userName: 'Ngô Văn Tùng',
      avatarUrl: '/placeholder-avatar-6.jpg',
      gender: 'Nam',
      teachingExp: '8 năm',
      bio: 'Chuyên gia sinh học với kinh nghiệm giảng dạy lâu năm. Giúp học sinh nắm vững kiến thức và phát triển tư duy khoa học một cách toàn diện.',
      videoIntroUrl: '/placeholder-video-6.mp4',
      teachingModes: 'Trực tuyến',
      subjects: ['Sinh học', 'Hóa học'],
      hourlyRate: 170000,
      provinceName: 'Cần Thơ',
      subDistrictName: 'Ninh Kiều',
      rating: 4.8,
      reviewCount: 145,
      completedLessons: 480,
      totalStudents: 71,
      isFavorite: false,
      isVerified: true,
      education: 'Tiến sĩ Sinh học - ĐH Quốc gia',
      specializations: ['Di truyền học', 'Sinh thái học'],
    },
  ];

  // Filter tutors based on search query
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = searchQuery.trim() === '' || 
      tutor.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = filteredTutors.slice(indexOfFirstTutor, indexOfLastTutor);

  const currentTutor = currentTutors.find(t => t.tutorId === hoveredTutor) || currentTutors[0];

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
      {/* Top Section with Search and Filters */}
      <div className="bg-white border-b border-[#257180]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight tracking-tight">
              TÌM GIA SƯ TRỰC TUYẾN
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Kết nối với hơn 1,000+ gia sư chuyên nghiệp
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#257180]" />
              <Input
                placeholder="Tìm theo tên gia sư..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
              />
            </div>
          </div>

          {/* Horizontal Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SelectWithSearch 
              value={selectedSubject} 
              onValueChange={setSelectedSubject}
              placeholder="Môn học"
              className="w-full min-w-[140px]"
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
              className="w-full min-w-[140px]"
            >
              <SelectWithSearchItem value="all">Tất cả thành phố</SelectWithSearchItem>
              {provinces.map((province) => (
                <SelectWithSearchItem key={province.id} value={province.id.toString()}>
                  {province.name}
                </SelectWithSearchItem>
              ))}
            </SelectWithSearch>

            <SelectWithSearch 
              value="all"
              placeholder="Đánh giá"
              className="w-full min-w-[140px]"
            >
              <SelectWithSearchItem value="all">Tất cả đánh giá</SelectWithSearchItem>
              <SelectWithSearchItem value="4.5">4.5⭐ trở lên</SelectWithSearchItem>
              <SelectWithSearchItem value="4.0">4.0⭐ trở lên</SelectWithSearchItem>
              <SelectWithSearchItem value="3.5">3.5⭐ trở lên</SelectWithSearchItem>
            </SelectWithSearch>

            <SelectWithSearch 
              value="all"
              placeholder="Hình thức"
              className="w-full min-w-[140px]"
            >
              <SelectWithSearchItem value="all">Tất cả hình thức</SelectWithSearchItem>
              <SelectWithSearchItem value="online">Trực tuyến</SelectWithSearchItem>
              <SelectWithSearchItem value="offline">Tại nhà</SelectWithSearchItem>
            </SelectWithSearch>

            <SelectWithSearch 
              value="all"
              placeholder="Giới tính"
              className="w-full min-w-[140px]"
            >
              <SelectWithSearchItem value="all">Tất cả giới tính</SelectWithSearchItem>
              <SelectWithSearchItem value="male">Nam</SelectWithSearchItem>
              <SelectWithSearchItem value="female">Nữ</SelectWithSearchItem>
            </SelectWithSearch>

            <SelectWithSearch 
              value="recommended"
              placeholder="Sắp xếp"
              className="w-full min-w-[140px]"
            >
              <SelectWithSearchItem value="recommended">Đề xuất</SelectWithSearchItem>
              <SelectWithSearchItem value="rating">Đánh giá cao</SelectWithSearchItem>
              <SelectWithSearchItem value="price-low">Giá thấp - cao</SelectWithSearchItem>
              <SelectWithSearchItem value="price-high">Giá cao - thấp</SelectWithSearchItem>
              <SelectWithSearchItem value="experience">Kinh nghiệm</SelectWithSearchItem>
            </SelectWithSearch>
          </div>

          {/* Price Range Filter */}
          <div className="mt-6 pt-6 border-t border-[#257180]/20">
            <div className="flex items-center justify-between mb-3">
              <label className="text-black text-sm sm:text-base">
                Mức giá (₫/giờ)
              </label>
              <div className="text-sm font-semibold text-[#257180] bg-[#F2E5BF] px-3 py-1 rounded-md">
                {priceRange[0].toLocaleString()}₫ - {priceRange[1].toLocaleString()}₫
              </div>
            </div>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={50000}
                max={500000}
                step={10000}
                className="w-full slider-track"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>50,000₫</span>
              <span>500,000₫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Side - Tutor List (Detailed) */}
          <div className="lg:col-span-8">
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
                  <div className="flex gap-5 mb-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="relative w-36 h-36 rounded-lg overflow-hidden bg-gray-100">
                        <Avatar className="w-full h-full rounded-lg">
                          <AvatarImage src={tutor.avatarUrl || undefined} className="object-cover" />
                          <AvatarFallback className="rounded-lg text-2xl">
                            {tutor.userName.split(' ').slice(-2).map(n => n[0]).join('')}
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
                              {tutor.userName}
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
                              <span className="text-sm text-black font-medium">{tutor.rating}</span>
                              <span className="text-sm text-gray-600">({tutor.reviewCount} đánh giá)</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-sm text-gray-600">{tutor.completedLessons} buổi học</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-sm text-gray-600">{tutor.teachingExp}</span>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 -mt-1"
                          onClick={(e) => handleToggleFavorite(tutor.tutorId, e)}
                        >
                          <Heart className={`w-5 h-5 ${favoriteTutors.has(tutor.tutorId) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
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
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5 border-[#FD8B51] text-[#FD8B51]">
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
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{tutor.subDistrictName}, {tutor.provinceName}</span>
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
                  <div className="flex items-center justify-between pt-4 border-t border-[#257180]/20">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-black font-bold">
                          {tutor.hourlyRate.toLocaleString()}₫
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
                          // TODO: Open message modal or redirect to messaging
                          console.log('Open message with tutor:', tutor.tutorId);
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
                          // TODO: Open booking modal or redirect to booking
                          console.log('Book trial lesson with tutor:', tutor.tutorId);
                        }}
                      >
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
                    // Show first page, last page, current page, and pages around current
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
            <div className="sticky-video-preview">
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
                          <p className="text-white/80 text-sm sm:text-base mt-2">{currentTutor.userName}</p>
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
                          // TODO: Open booking calendar modal
                          console.log('Open booking calendar for tutor:', currentTutor?.tutorId);
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
                          // TODO: Open tutor schedule modal
                          console.log('View tutor schedule:', currentTutor?.tutorId);
                        }}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Xem lịch dạy của gia sư
                      </Button>
                      <Button 
                        className="w-full bg-[#FD8B51] hover:bg-[#CB6040] text-white" 
                        size="lg"
                        onClick={() => currentTutor && handleViewTutorProfile(currentTutor.tutorId)}
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
