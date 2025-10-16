'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Badge } from '../ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/navigation/tabs';
import { Calendar } from '../ui/form/calendar';
import { Separator } from '../ui/layout/separator';
import { Star, Heart, MapPin, Clock, BookOpen, Calendar as CalendarIcon, MessageCircle, Video, Shield, Award, Users, TrendingUp, Globe, CheckCircle2, Play, ArrowLeft, Loader2 } from 'lucide-react';
import { FormatService } from '@/lib/format';
import { useTutorDetail } from '@/hooks/useTutorDetail';
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
  const { tutor, isLoading, error, loadTutorDetail, clearError } = useTutorDetail();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  useEffect(() => {
    if (tutorId) {
      loadTutorDetail(tutorId);
    }
  }, [tutorId]);
  
  const reviews: Review[] = [];
  const timeSlots: any[] = [];
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
      <div className="min-h-screen bg-[#F2E5BF] pt-16">
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
      <div className="min-h-screen bg-[#F2E5BF] pt-16">
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
      <div className="min-h-screen bg-[#F2E5BF] pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin gia sư.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E5BF] pt-16">
      <div className="bg-white border-b border-[#257180]/20 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 -ml-2 text-black hover:bg-[#F2E5BF]"
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
            <Card className="bg-white border-[#257180]/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-32 h-32 border-2 border-[#F2E5BF]">
                      <AvatarImage src={tutor.avatarUrl || undefined} />
                      <AvatarFallback className="bg-[#F2E5BF] text-[#257180]">
                        {tutor.firstName && tutor.lastName 
                          ? `${tutor.firstName[0]}${tutor.lastName[0]}`
                          : tutor.userEmail.split('@')[0].slice(0, 2).toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>
                    {tutor.status === 1 && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#257180] rounded-full flex items-center justify-center border-4 border-white">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-black text-2xl font-bold mb-2">
                          {tutor.firstName && tutor.lastName 
                            ? `${tutor.firstName} ${tutor.lastName}`
                            : tutor.userName || tutor.userEmail.split('@')[0]
                          }
                        </h1>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-5 h-5 fill-[#FD8B51] text-[#FD8B51]" />
                            <span className="text-lg text-black">Chưa có</span>
                            <span className="text-sm text-gray-600">(0 đánh giá)</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">0 buổi học</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">0 học viên</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tutor.status === 'Approved' && (
                            <Badge variant="default" className="bg-[#F2E5BF] text-black border-[#257180]/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Đã xác thực
                            </Badge>
                          )}
                          <Badge variant="default" className="bg-[#F2E5BF] text-black border-[#257180]/20">
                            Chuyên nghiệp
                          </Badge>
                          {tutor.status === 1 && (
                            <Badge variant="secondary" className="bg-[#FD8B51] text-white border-[#FD8B51]">
                              Gia sư được phê duyệt
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="p-2"
                      >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Việt Nam</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{tutor.teachingExp || 'Chưa có thông tin'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>{tutor.teachingModes === 0 ? 'Offline' : tutor.teachingModes === 1 ? 'Online' : tutor.teachingModes === 2 ? 'Hybrid' : 'Chưa xác định'}</span>
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
              <Card className="bg-white border-[#257180]/20">
                <CardContent className="p-6">
                  <div className="relative bg-gradient-to-br from-[#257180] to-[#1e5a66] rounded-lg overflow-hidden aspect-video group cursor-pointer">
                    <div 
                      className="w-full h-full bg-cover bg-center opacity-50"
                      style={{ backgroundImage: `url(${tutor.avatarUrl || 'https://via.placeholder.com/150x150/cccccc/666666?text=Avatar'})` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-[#FD8B51] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
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
              <TabsList className="grid w-full grid-cols-3 bg-[#F2E5BF] border-[#257180]/20">
                <TabsTrigger value="about" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Giới thiệu</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Đánh giá ({reviews.length})</TabsTrigger>
                <TabsTrigger value="availability" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Lịch trống</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="space-y-6">
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Về tôi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {tutor.bio || 'Chưa có thông tin giới thiệu.'}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-black mb-3 font-bold">Kinh nghiệm giảng dạy</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {tutor.teachingExp || 'Chưa có thông tin kinh nghiệm giảng dạy.'}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-black mb-3 font-bold">Hình thức dạy học</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teachingModes !== undefined && (
                          <Badge variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-black border-[#257180]/20">
                            {tutor.teachingModes === 0 ? 'Offline' : 
                             tutor.teachingModes === 1 ? 'Online' : 
                             tutor.teachingModes === 2 ? 'Hybrid' : 
                             'Chưa xác định'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Học vấn & Chứng chỉ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tutor.educations && tutor.educations.length > 0 && (
                      <>
                        <div>
                          <h4 className="text-black mb-3 font-bold">Học vấn</h4>
                          <div className="space-y-3">
                            {tutor.educations.map((edu) => (
                              <div key={edu.id} className="flex items-start gap-2">
                                <Award className="w-4 h-4 text-black mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-gray-700">{edu.degree} - {edu.institutionName}</p>
                                  <p className="text-sm text-gray-500">
                                    {edu.startDate ? new Date(edu.startDate).getFullYear() : 'N/A'}
                                    {edu.endDate && ` - ${new Date(edu.endDate).getFullYear()}`}
                                  </p>
                                  <Badge variant="outline" className="text-xs mt-1 border-[#257180]/20 text-black">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Đã xác thực
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}
                    {tutor.certificates && tutor.certificates.length > 0 && (
                      <div>
                        <h4 className="text-black mb-3 font-bold">Chứng chỉ</h4>
                        <div className="space-y-2">
                          {tutor.certificates.map((cert) => (
                            <div key={cert.id} className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                                <div>
                                  <span className="text-gray-700">{cert.certificateName}</span>
                                  {cert.issuingOrganization && (
                                    <p className="text-xs text-gray-500">{cert.issuingOrganization}</p>
                                  )}
                                  {cert.expiryDate && new Date(cert.expiryDate) < new Date() && (
                                    <Badge variant="outline" className="text-xs mt-1 text-[#FD8B51] border-[#FD8B51]">
                                      Đã hết hạn
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs border-[#257180]/20 text-black">
                                Đã xác thực
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Subjects */}
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Môn học giảng dạy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects?.map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-black border-[#257180]/20">
                          {subject.subject?.subjectName || `Subject ${subject.subjectId}`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="space-y-6">
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-bold text-black">Đánh giá từ học viên</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-[#FD8B51] text-[#FD8B51]" />
                        <span className="text-lg text-black">Chưa có</span>
                        <span className="text-sm text-gray-600">(0 đánh giá)</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-[#257180]/20 pb-6 last:border-0 last:pb-0">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={review.studentAvatar || undefined} />
                              <AvatarFallback className="bg-[#F2E5BF] text-[#257180]">{review.studentName.split(' ').slice(0,2).map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-black">{review.studentName}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-4 h-4 ${ i < review.rating ? 'fill-[#FD8B51] text-[#FD8B51]' : 'text-gray-300' }`} 
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500">• {formatDate(review.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs bg-[#F2E5BF] text-black border-[#257180]/20">{review.subjectName}</Badge>
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
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Lịch trống trong tuần</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {timeSlots.length > 0 ? (
                        timeSlots.map((day, idx) => (
                          <div key={idx}>
                            <h4 className="text-black mb-3">{day.day}</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                              {day.slots.map((slot, slotIdx) => (
                                <Button 
                                  key={slotIdx} 
                                  variant={selectedTimeSlot === `${day.day}-${slot.time}` ? "default" : "outline"}
                                  size="sm" 
                                  className={`justify-center ${selectedTimeSlot === `${day.day}-${slot.time}` ? 'bg-black hover:bg-gray-800' : 'border-black text-black hover:bg-black hover:text-white'}`}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTimeSlot(`${day.day}-${slot.time}`)}
                                >
                                  {slot.time}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Chưa có lịch trống</p>
                          <p className="text-sm text-gray-500 mt-2">Gia sư chưa cập nhật lịch trống</p>
                        </div>
                      )}
                    </div>
                    {selectedTimeSlot && (
                      <div className="mt-6 p-4 bg-[#F2E5BF] rounded-lg border border-[#257180]/20">
                        <p className="text-sm text-gray-700 mb-3">
                          Bạn đã chọn: <span className="text-black font-medium">{selectedTimeSlot}</span>
                        </p>
                        <Button className="w-full bg-[#FD8B51] hover:bg-[#CB6040] text-white">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Đặt buổi học
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Chọn ngày khác</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border border-[#257180]/20"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <Card className="border-2 border-[#257180]/20 bg-white">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div>
                      <span className="text-gray-600 text-sm">Học phí</span>
                      <div className="mt-2">
                        <span className="text-3xl text-black">{FormatService.formatVND(tutor.hourlyRate)}</span>
                        <span className="text-base text-gray-600">/giờ</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button className="w-full bg-[#FD8B51] hover:bg-[#CB6040] text-white" size="lg">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Đặt buổi học thử
                    </Button>
                    <Button variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white" size="lg">
                      <Clock className="w-4 h-4 mr-2" />
                      Đặt lịch học
                    </Button>
                    <Button variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white" size="lg">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Gửi tin nhắn
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Quick Stats */}
              <Card className="bg-white border-[#257180]/20">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-black">Thông tin nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bài học đã dạy:</span>
                      <span className="text-black font-medium">0+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Học viên:</span>
                      <span className="text-black font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hình thức:</span>
                      <span className="text-black font-medium">{tutor.teachingMode || 'Chưa xác định'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tham gia:</span>
                      <span className="text-black font-medium">{new Date(tutor.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Report */}
              <Button variant="ghost" className="w-full text-gray-600 hover:text-black hover:bg-[#F2E5BF]">
                Báo cáo gia sư này
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}