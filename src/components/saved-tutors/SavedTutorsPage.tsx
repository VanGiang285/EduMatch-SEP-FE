'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Badge } from '../ui/basic/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
import { FormatService } from '@/lib/format';
import { 
  Star, 
  Heart, 
  MapPin, 
  Play,
  MessageCircle,
  Calendar,
  Award,
  Video,
  Send,
  Clock
} from 'lucide-react';
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
  const [hoveredTutor, setHoveredTutor] = useState<number | null>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteTutors, setFavoriteTutors] = useState<Set<number>>(new Set([1, 3, 4, 2, 5])); // All saved tutors are favorited
  const tutorsPerPage = 6;
  const savedTutors: TutorCardData[] = [
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
      isFavorite: true, // All saved tutors have isFavorite = true
      isVerified: true,
      education: 'Thạc sĩ Toán học - ĐH Sư phạm Hà Nội',
      specializations: ['THPT', 'Luyện thi Đại học'],
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
      teachingModes: 'Trực tuyến',
      subjects: ['Hóa học'],
      hourlyRate: 220000,
      provinceName: 'Hà Nội',
      subDistrictName: 'Đống Đa',
      rating: 4.9,
      reviewCount: 201,
      completedLessons: 734,
      totalStudents: 134,
      isFavorite: true,
      isVerified: true,
      education: 'Thạc sĩ Hóa học - ĐH Bách khoa',
      specializations: ['Luyện thi Olympic', 'THPT chuyên'],
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
      isFavorite: true,
      isVerified: true,
      education: 'Cử nhân Ngôn ngữ Anh - ĐH Ngoại ngữ',
      specializations: ['IELTS', 'TOEIC', 'Giao tiếp'],
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
      isFavorite: true,
      isVerified: false,
      education: 'Cử nhân Ngữ văn - ĐH Sư phạm',
      specializations: ['Làm văn', 'Nghị luận xã hội'],
    },
  ];
  const actualSavedTutors = savedTutors.filter(tutor => favoriteTutors.has(tutor.tutorId));
  const totalPages = Math.ceil(actualSavedTutors.length / tutorsPerPage);
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = actualSavedTutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const currentTutor = currentTutors.find(t => t.tutorId === hoveredTutor) || currentTutors[0];
  const handleToggleFavorite = (tutorId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setFavoriteTutors(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tutorId)) {
        newFavorites.delete(tutorId);
        console.log('Remove from favorites:', tutorId);
      } else {
        newFavorites.add(tutorId);
        console.log('Add to favorites:', tutorId);
      }
      return newFavorites;
    });
  };
  const handleViewTutorProfile = (tutorId: number) => {
    router.push(`/tutor/${tutorId}`);
  };
  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-2">
            <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight tracking-tight">
              GIA SƯ ĐÃ LƯU
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Bạn đã lưu {actualSavedTutors.length} gia sư
            </p>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Tutor List (Detailed) */}
          <div className="lg:col-span-8">
            {actualSavedTutors.length === 0 ? (
              <Card className="border-[#FD8B51]">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">Chưa có gia sư nào được lưu</h3>
                  <p className="text-gray-600 mb-6">
                    Bạn chưa lưu gia sư nào. Hãy tìm kiếm và lưu những gia sư yêu thích của bạn.
                  </p>
                  <Button 
                    onClick={() => router.push('/find-tutor')}
                    className="bg-[#257180] hover:bg-[#1e5a66] text-white"
                  >
                    Tìm gia sư
                  </Button>
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
                              >
                                <Heart className={`w-5 h-5 transition-colors duration-200 ${favoriteTutors.has(tutor.tutorId) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#257180]/20 gap-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl text-black font-bold">
                                {FormatService.formatVND(tutor.hourlyRate)}
                              </span>
                              <span className="text-base text-gray-600">VNĐ/giờ</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="lg"
                              className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Open message with tutor:', tutor.tutorId);
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Nhắn tin
                            </Button>
                            <Button 
                              size="lg"
                              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
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
                {totalPages > 1 && (
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
                )}
              </>
            )}
          </div>
          {/* Right Side - Video Preview (Simple & Sticky) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20 z-30">
              {/* Video Card */}
              <Card className="overflow-hidden bg-white border-[#257180]/20 shadow-lg">
                <CardContent className="p-0">
                  {/* Video Section */}
                  <div className="relative bg-gradient-to-br from-[#257180] to-[#1e5a66] aspect-[4/3]">
                    {currentTutor ? (
                      currentTutor.videoIntroUrl ? (
                        <div className="absolute inset-0">
                          <video 
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
                            <Heart className="w-8 h-8" />
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
                        className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]" 
                        size="lg"
                        onClick={() => {
                          console.log('Open booking calendar for tutor:', currentTutor?.tutorId);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Đặt lịch học
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]" 
                        size="lg"
                        onClick={() => {
                          console.log('View tutor schedule:', currentTutor?.tutorId);
                        }}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Xem lịch dạy của gia sư
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]" 
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
