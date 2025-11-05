'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Badge } from '../ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/navigation/tabs';
// import { Calendar } from '../ui/form/calendar';
import { Separator } from '../ui/layout/separator';
import { Star, Heart, MapPin, Clock, Calendar as CalendarIcon, MessageCircle, Video, Shield, Users, Globe, CheckCircle2, Play, ArrowLeft, Loader2, GraduationCap, Medal, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormatService } from '@/lib/format';
import { useTutorDetail } from '@/hooks/useTutorDetail';
import { EnumHelpers, TeachingMode } from '@/types/enums';
import { FavoriteTutorService } from '@/services/favoriteTutorService';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomToast } from '@/hooks/useCustomToast';

// Helper function để convert string enum từ API sang TeachingMode enum
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
interface Review {
  id: number;
  studentName: string;
  studentAvatar: string | null;
  rating: number;
  comment: string;
  createdAt: Date;
  subjectName: string;
  lessonsCompleted: number;
}

interface TutorDetailProfilePageProps {
  tutorId: number;
}

export function TutorDetailProfilePage({ tutorId }: TutorDetailProfilePageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showWarning } = useCustomToast();
  const { tutor, isLoading, error, loadTutorDetail, clearError } = useTutorDetail();
  
  // const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  // const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  // Availability calendar states
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    return startOfWeek;
  });
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  // Helper functions for availability calendar
  const weekDays = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' }
  ];

  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    startTime: `${i.toString().padStart(2, '0')}:00`,
    endTime: `${(i + 1).toString().padStart(2, '0')}:00`
  }));

  // Generate dates for current week
  const generateCurrentWeekDates = () => {
    const datesByDay: { [key: string]: string } = {};
    weekDays.forEach((day, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + index);
      datesByDay[day.key] = date.getDate().toString().padStart(2, '0') + '/' + 
                           (date.getMonth() + 1).toString().padStart(2, '0');
    });
    return datesByDay;
  };

  // Create availability map from tutor data
  const createAvailabilityMap = () => {
    const availabilityMap: { [key: string]: boolean } = {};
    
    if (tutor?.tutorAvailabilities) {
      tutor.tutorAvailabilities.forEach(availability => {
        const startDate = new Date(availability.startDate);
        const dateKey = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
         const timeKey = availability.startDate.split('T')[1]?.split(':')[0] || '00'; // HH
        const slotKey = `${dateKey}-${timeKey}`;
        availabilityMap[slotKey] = true;
      });
    }
    
    return availabilityMap;
  };

  const availabilityMap = createAvailabilityMap();
  const datesByDay = generateCurrentWeekDates();

  // Check if slot is available
  const isSlotAvailable = (dayKey: string, timeSlot: any) => {
    const date = new Date(currentWeekStart);
    const dayIndex = weekDays.findIndex(day => day.key === dayKey);
    date.setDate(currentWeekStart.getDate() + dayIndex);
    const dateKey = date.toISOString().split('T')[0];
    const slotKey = `${dateKey}-${timeSlot.startTime.split(':')[0]}`;
    return availabilityMap[slotKey] || false;
  };

  // Check if slot is selected
  const isSlotSelected = (dayKey: string, timeSlot: any) => {
    const date = new Date(currentWeekStart);
    const dayIndex = weekDays.findIndex(day => day.key === dayKey);
    date.setDate(currentWeekStart.getDate() + dayIndex);
    const dateKey = date.toISOString().split('T')[0];
    const slotKey = `${dateKey}-${timeSlot.startTime.split(':')[0]}`;
    return selectedSlots.has(slotKey);
  };

  // Filter to only show time slots that have at least one available slot in the current week
  const availableTimeSlots = timeSlots.filter(timeSlot => {
    return weekDays.some(day => isSlotAvailable(day.key, timeSlot));
  });

  // Navigation functions
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    setCurrentWeekStart(startOfWeek);
  };

  // Format week display
  const formatWeekDisplay = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 6);
    
    const startDay = currentWeekStart.getDate();
    const startMonth = currentWeekStart.getMonth() + 1;
    const endDay = endOfWeek.getDate();
    const endMonth = endOfWeek.getMonth() + 1;
    const year = currentWeekStart.getFullYear();
    
    if (startMonth === endMonth) {
      return `Ngày ${startDay} - ${endDay}/${startMonth}/${year}`;
    } else {
      return `Ngày ${startDay}/${startMonth} - ${endDay}/${endMonth}/${year}`;
    }
  };

  // Handle slot selection
  const handleSlotClick = (dayKey: string, timeSlot: any) => {
    const date = new Date(currentWeekStart);
    const dayIndex = weekDays.findIndex(day => day.key === dayKey);
    date.setDate(currentWeekStart.getDate() + dayIndex);
    const dateKey = date.toISOString().split('T')[0];
    const slotKey = `${dateKey}-${timeSlot.startTime.split(':')[0]}`;
    
    // Only allow selection of available slots
    if (availabilityMap[slotKey]) {
      setSelectedSlots(prev => {
        const newSet = new Set(prev);
        if (newSet.has(slotKey)) {
          newSet.delete(slotKey);
        } else {
          newSet.add(slotKey);
        }
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (tutorId) {
      loadTutorDetail(tutorId);
    }
  }, [tutorId, loadTutorDetail]);

  // Check favorite status when tutor loads (only if authenticated)
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      // Reset favorite when not authenticated or no tutorId
      if (!tutorId || !isAuthenticated) {
        setIsFavorite(false);
        return;
      }
      
      try {
        const response = await FavoriteTutorService.isFavorite(tutorId);
        // Ensure response.data is a boolean - check for explicit true
        const isFavorite = response.data === true;
        if (process.env.NODE_ENV === 'development') {
          console.log(`Tutor ${tutorId} favorite status:`, response.data, '→ isFavorite:', isFavorite);
        }
        setIsFavorite(isFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [tutorId, isAuthenticated]);
  
  const reviews: Review[] = [];
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#FD8B51]" />
            <span className="ml-2 text-gray-600">Đang tải thông tin gia sư...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={clearError} variant="outline">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin gia sư.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 -ml-2 hover:bg-[#FD8B51] hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại kết quả tìm kiếm
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[#FD8B51]">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={tutor.avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="text-3xl bg-[#F2E5BF] text-[#257180]">
                        {tutor.userName.split(' ').slice(-2).map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {(tutor.status === 1 || tutor.status === 3 || tutor.status === 4) && (
                      <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${
                        tutor.status === 1 ? 'bg-blue-600' : 
                        tutor.status === 3 ? 'bg-orange-600' : 
                        'bg-red-600'
                      }`}>
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-gray-900 text-2xl font-semibold mb-2">
                          {tutor.userName}
                        </h1>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg text-gray-900">5.0</span>
                            <span className="text-sm text-gray-500">(0 đánh giá)</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">0 buổi học</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">0 học viên</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tutor.status === 1 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Đã xác thực
                            </Badge>
                          )}
                          {tutor.status === 3 && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                              <Shield className="w-3 h-3 mr-1" />
                              Tạm khóa
                            </Badge>
                          )}
                          {tutor.status === 4 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                              <Shield className="w-3 h-3 mr-1" />
                              Ngừng hoạt động
                            </Badge>
                          )}
                          <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                            Chuyên nghiệp
                          </Badge>
                          {tutor.status === 1 && (
                            <Badge variant="secondary" className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20">
                              Gia sư được phê duyệt
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          // Check if user is authenticated
                          if (!isAuthenticated) {
                            showWarning(
                              'Vui lòng đăng nhập',
                              'Bạn cần đăng nhập để thêm gia sư vào danh sách yêu thích.'
                            );
                            router.push('/login');
                            return;
                          }

                          const newFavoriteState = !isFavorite;
                          // Optimistic update
                          setIsFavorite(newFavoriteState);
                          setLoadingFavorite(true);

                          try {
                            if (newFavoriteState) {
                              await FavoriteTutorService.addToFavorite(tutorId);
                            } else {
                              await FavoriteTutorService.removeFromFavorite(tutorId);
                            }
                          } catch (error) {
                            console.error('Error toggling favorite:', error);
                            // Revert optimistic update on error
                            setIsFavorite(!newFavoriteState);
                          } finally {
                            setLoadingFavorite(false);
                          }
                        }}
                        className="p-2 hover:bg-[#FD8B51] hover:text-white"
                        disabled={loadingFavorite}
                      >
                        {loadingFavorite ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        ) : (
                          <Heart className={`w-6 h-6 transition-colors duration-200 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {tutor.subDistrict?.name && tutor.province?.name 
                            ? `${tutor.subDistrict.name}, ${tutor.province.name}`
                            : tutor.province?.name || 'Việt Nam'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>{tutor.tutorCertificates?.length || 0} chứng chỉ</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>{EnumHelpers.getTeachingModeLabel(getTeachingModeValue(tutor.teachingModes))}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Tham gia từ {new Date(tutor.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {tutor.videoIntroUrl && (
                <Card className="border-[#FD8B51]">
                <CardContent className="p-6">
                    <div className="relative bg-gradient-to-br from-[#257180] to-[#1e5a66] rounded-lg overflow-hidden aspect-video">
                      <video 
                        className="w-full h-full object-cover"
                        controls
                        poster={tutor.avatarUrl}
                        preload="metadata"
                      >
                        <source src={tutor.videoIntroUrl} type="video/mp4" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center text-white">
                            <div className="w-20 h-20 rounded-full bg-[#FD8B51]/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                        <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                            <p className="font-bold">Video không hỗ trợ</p>
                            <p className="text-sm mt-2">{tutor.userName}</p>
                      </div>
                    </div>
                      </video>
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="default" className="bg-black bg-opacity-70 text-white">
                        <Video className="w-3 h-3 mr-1" />
                        Video giới thiệu
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-[#F2E5BF]">
                <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">Giới thiệu</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">Đánh giá ({reviews.length})</TabsTrigger>
                <TabsTrigger value="availability" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">Lịch trống</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="space-y-6">
                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="font-bold">Về tôi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {tutor.bio || 'Chưa có thông tin giới thiệu.'}
                      </p>
                    </div>

                    <Separator className="bg-gray-900" />

                    <div>
                      <h3 className="text-gray-900 mb-3 font-bold">Kinh nghiệm giảng dạy</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {tutor.teachingExp || 'Chưa có thông tin kinh nghiệm giảng dạy.'}
                      </p>
                      {tutor.tutorSubjects && tutor.tutorSubjects.length > 0 && (
                        <>
                          <p className="text-gray-700 mt-3">
                            Tôi chuyên dạy các môn học sau:
                          </p>
                          <ul className="mt-3 space-y-2 text-gray-700">
                            {tutor.tutorSubjects.map((tutorSubject, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                 <span>{tutorSubject.subject?.subjectName} - {tutorSubject.level?.name}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <Separator className="bg-gray-900" />

                    <div>
                      <h3 className="text-gray-900 mb-3 font-bold">Hình thức dạy học</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teachingModes !== undefined && (() => {
                          const modeValue = getTeachingModeValue(tutor.teachingModes);
                          if (modeValue === TeachingMode.Hybrid) {
                            return (
                              <>
                                <Badge variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                                  Dạy Online
                                </Badge>
                                <Badge variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                                  Dạy trực tiếp
                                </Badge>
                              </>
                            );
                          }
                          return (
                            <Badge variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                              {EnumHelpers.getTeachingModeLabel(modeValue)}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="font-bold">Học vấn & Chứng chỉ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tutor.tutorEducations && tutor.tutorEducations.length > 0 && (
                      <>
                        <div>
                          <h4 className="font-bold mb-3">Học vấn</h4>
                          <div className="space-y-3">
                            {tutor.tutorEducations.map((edu) => (
                              <div key={edu.id} className="flex items-start gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-gray-700">{edu.institution?.name || 'Education'}</p>
                                  <p className="text-sm text-gray-500">
                                    {edu.issueDate ? new Date(edu.issueDate).getFullYear() : 'N/A'}
                                  </p>
                                  {edu.verified === 1 && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Đã xác thực
                                  </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator className="bg-gray-900" />
                      </>
                    )}
                    {tutor.tutorCertificates && tutor.tutorCertificates.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-3">Chứng chỉ</h4>
                        <div className="space-y-2">
                          {tutor.tutorCertificates.map((cert) => (
                            <div key={cert.id} className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <Medal className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                                <div>
                                  <span className="text-gray-700">{cert.certificateType?.name || 'Certificate'}</span>
                                  {cert.certificateType?.code && (
                                    <p className="text-xs text-gray-500">{cert.certificateType.code}</p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    {cert.issueDate ? new Date(cert.issueDate).getFullYear() : 'N/A'}
                                    {cert.expiryDate && (
                                      <span> - {new Date(cert.expiryDate).getFullYear()}</span>
                                    )}
                                  </p>
                                  {cert.expiryDate && new Date(cert.expiryDate) < new Date() && (
                                    <Badge variant="outline" className="text-xs mt-1 text-orange-600 border-orange-300">
                                      Đã hết hạn
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {cert.verified === 1 && (
                                <Badge variant="outline" className="text-xs">
                                Đã xác thực
                              </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Subjects */}
                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="font-bold">Môn học giảng dạy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutor.tutorSubjects?.map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                          {subject.subject?.subjectName || `Subject ${subject.subjectId}`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>
              <TabsContent value="reviews" className="space-y-6">
                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-bold">Đánh giá từ học viên</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg">Chưa có</span>
                        <span className="text-sm text-gray-600">(0 đánh giá)</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={review.studentAvatar || undefined} />
                              <AvatarFallback className="bg-[#F2E5BF] text-[#257180]">{review.studentName.split(' ').slice(0,2).map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.studentName}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-4 h-4 ${ i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300' }`} 
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500">• {formatDate(review.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">{review.subjectName}</Badge>
                                <span className="text-xs text-gray-500">{review.lessonsCompleted} buổi học</span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {reviews.length === 0 && (
                      <div className="text-center mt-6">
                        <p className="text-gray-600">Chưa có đánh giá nào.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="availability" className="space-y-6">
                <Card className="border-[#FD8B51]">
                  <CardHeader>
                    <div className="space-y-4">
                      <div>
                        <CardTitle className="font-bold">Lịch trống của gia sư</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatWeekDisplay()}
                        </p>
                      </div>
                      
                      {/* Navigation Controls */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousWeek}
                          className="flex items-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Tuần trước</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToCurrentWeek}
                          className="bg-[#FD8B51] text-white hover:bg-[#CB6040] border-[#FD8B51]"
                        >
                          Về tuần hiện tại
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextWeek}
                          className="flex items-center gap-2"
                        >
                          <span>Tuần sau</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {availableTimeSlots.length > 0 ? (
                      <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                          {/* Header with days */}
                          <div className="grid grid-cols-8 gap-1 mb-2">
                            <div className="p-2 text-sm font-medium text-gray-600">Giờ</div>
                            {weekDays.map((day) => (
                              <div key={day.key} className="p-2 text-center">
                                <div className="text-sm font-medium text-gray-900">{day.label}</div>
                                <div className="text-xs text-gray-500">{datesByDay[day.key]}</div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Time slots grid */}
                          <div className="space-y-1">
                            {availableTimeSlots.map((timeSlot) => (
                            <div key={timeSlot.id} className="grid grid-cols-8 gap-1">
                              <div className="p-2 text-sm text-gray-600 bg-gray-50 rounded">
                                {timeSlot.startTime}
                              </div>
                              {weekDays.map((day) => {
                                const isAvailable = isSlotAvailable(day.key, timeSlot);
                                const isSelected = isSlotSelected(day.key, timeSlot);
                                
                                return (
                                  <button
                                    key={`${day.key}-${timeSlot.id}`}
                                    onClick={() => handleSlotClick(day.key, timeSlot)}
                                    disabled={!isAvailable}
                                    className={`
                                      p-2 text-xs rounded transition-all duration-200
                                      ${isAvailable 
                                        ? isSelected
                                          ? 'bg-[#FD8B51] text-white hover:bg-[#CB6040]'
                                          : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }
                                    `}
                                  >
                                    {isAvailable ? (isSelected ? '✓' : '') : '✗'}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                            </div>
                          </div>
                      ) : (
                        <div className="text-center py-8">
                          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Không có lịch trống trong tuần này</p>
                        <p className="text-sm text-gray-500 mt-2">Gia sư chưa cập nhật lịch trống cho tuần này</p>
                        </div>
                    )}
                    
                    {/* Selected slots summary */}
                    {selectedSlots.size > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700 mb-3">
                          Bạn đã chọn <span className="font-medium">{selectedSlots.size}</span> khung giờ
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            className="bg-[#FD8B51] hover:bg-[#CB6040] text-white"
                            onClick={() => {
                              console.log('Book lesson with slots:', Array.from(selectedSlots));
                            }}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Đặt lịch học
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedSlots(new Set())}
                          >
                            Xóa lựa chọn
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Legend - only show when there are available slots */}
                    {availableTimeSlots.length > 0 && (
                      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-100 rounded"></div>
                          <span>Có thể đặt</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-[#FD8B51] rounded"></div>
                          <span>Đã chọn</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-100 rounded"></div>
                          <span>Không có lịch</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <Card className="border-[#257180]/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div>
                      <span className="text-gray-600 text-sm">Học phí</span>
                      <div className="mt-2">
                        {tutor.tutorSubjects && tutor.tutorSubjects.length > 0 ? (
                          (() => {
                            const prices = tutor.tutorSubjects.map(ts => ts.hourlyRate || 0);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            
                            return (
                              <div className="flex items-baseline justify-center gap-2">
                                <span className="text-3xl">
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
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="text-3xl">
                              {FormatService.formatVND(0)}
                            </span>
                            <span className="text-base text-gray-600">/giờ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button className="w-full bg-[#257180] hover:bg-[#257180]/90 text-white" size="lg">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Đặt buổi học thử
                    </Button>
                    <Button variant="outline" className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]" size="lg">
                      <Clock className="w-4 h-4 mr-2" />
                      Đặt lịch học
                    </Button>
                    <Button variant="outline" className="w-full hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]" size="lg">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Gửi tin nhắn
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Quick Stats */}
              <Card className="border-[#FD8B51]">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Thông tin nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Môn học:</span>
                      <span className="font-medium">{tutor.tutorSubjects?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chứng chỉ:</span>
                      <span className="font-medium">{tutor.tutorCertificates?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hình thức:</span>
                      <span className="font-medium">{EnumHelpers.getTeachingModeLabel(getTeachingModeValue(tutor.teachingModes))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tham gia:</span>
                      <span className="font-medium">{new Date(tutor.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Report */}
              <Button variant="ghost" className="w-full hover:bg-[#FD8B51] hover:text-white">
                Báo cáo gia sư này
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}