'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Badge } from '../ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/basic/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/navigation/tabs';
import { Calendar } from '../ui/form/calendar';
import { Separator } from '../ui/layout/separator';
import { Star, Heart, MapPin, Clock, BookOpen, Calendar as CalendarIcon, MessageCircle, Video, Shield, Award, Users, TrendingUp, Globe, CheckCircle2, Play, ArrowLeft } from 'lucide-react';
import { FormatService } from '@/lib/format';


interface TutorDetailData {
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
  education: TutorEducation[];
  certificates: TutorCertificate[];
  isVerified: boolean;
  responseTime: string;
  memberSince: string;
  specializations: string[];
}

interface TutorEducation {
  id: number;
  tutorId: number;
  title: string | null;
  issuer: string | null;
  issueDate: Date | null;
  certificateUrl: string | null;
  verified: boolean;
}

interface TutorCertificate {
  id: number;
  tutorId: number;
  title: string | null;
  issuer: string | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  certificateUrl: string | null;
  verified: boolean;
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


export function TutorDetailProfilePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  
  const tutor: TutorDetailData = {
    tutorId: 1,
    userEmail: 'nguyenthimaianh@gmail.com',
    userName: 'Nguyễn Thị Mai Anh',
    avatarUrl: '/placeholder-avatar-1.jpg',
    gender: 'Nữ',
    bio: 'Xin chào! Tôi là Mai Anh, một gia sư toán học đam mê với hơn 5 năm kinh nghiệm giúp học sinh đạt được mục tiêu học tập. Tôi chuyên biến những khái niệm toán học phức tạp thành dễ hiểu thông qua các ví dụ thực tế và phương pháp học tương tác.\n\nPhương pháp của tôi tập trung vào việc xây dựng sự tự tin và phát triển kỹ năng giải quyết vấn đề có thể áp dụng suốt đời. Tôi tin rằng mọi học sinh đều có thể thành thạo toán học với sự hướng dẫn và động lực phù hợp.',
    teachingExp: '5 năm',
    videoIntroUrl: '/placeholder-video-intro.mp4',
    teachingModes: 'Trực tuyến, Tại nhà',
    subjects: ['Toán học', 'Giải tích', 'Đại số', 'Thống kê', 'Lượng giác'],
    hourlyRate: 200000,
    provinceName: 'Hà Nội',
    subDistrictName: 'Cầu Giấy',
    rating: 4.9,
    reviewCount: 234,
    completedLessons: 892,
    totalStudents: 156,
    isFavorite: false,
    education: [
      {
        id: 1,
        tutorId: 1,
        title: 'Thạc sĩ Toán học',
        issuer: 'Đại học Sư phạm Hà Nội',
        issueDate: new Date('2016-06-15'),
        certificateUrl: '/placeholder-cert1.pdf',
        verified: true,
      },
      {
        id: 2,
        tutorId: 1,
        title: 'Cử nhân Toán - Tin',
        issuer: 'Đại học Khoa học Tự nhiên',
        issueDate: new Date('2014-06-15'),
        certificateUrl: null,
        verified: true,
      },
    ],
    certificates: [
      {
        id: 1,
        tutorId: 1,
        title: 'Chứng chỉ Giáo viên Toán được chứng nhận',
        issuer: 'Bộ Giáo dục và Đào tạo',
        issueDate: new Date('2019-03-20'),
        expiryDate: null,
        certificateUrl: '/placeholder-cert2.pdf',
        verified: true,
      },
      {
        id: 2,
        tutorId: 1,
        title: 'Chứng chỉ Giảng dạy trực tuyến',
        issuer: 'Google for Education',
        issueDate: new Date('2020-08-10'),
        expiryDate: new Date('2025-08-10'),
        certificateUrl: '/placeholder-cert3.pdf',
        verified: true,
      },
      {
        id: 3,
        tutorId: 1,
        title: 'IELTS 7.5',
        issuer: 'British Council',
        issueDate: new Date('2018-11-15'),
        expiryDate: new Date('2020-11-15'),
        certificateUrl: null,
        verified: false,
      },
    ],
    isVerified: true,
    responseTime: 'Trong vòng 1 giờ',
    memberSince: 'Tháng 3, 2019',
    specializations: ['THPT', 'Luyện thi Đại học', 'Toán chuyên'],
  };

  const reviews: Review[] = [
    {
      id: 1,
      studentName: 'Trần Văn Minh',
      studentAvatar: '/student-avatar-1.jpg',
      rating: 5,
      comment: 'Cô Mai Anh là một gia sư xuất sắc! Cô đã giúp em hiểu các khái niệm giải tích mà em đã vật lộn trong nhiều tháng. Cách giải thích rất rõ ràng và kiên nhẫn. Sau 2 tháng học với cô, điểm toán của em đã tăng từ 6 lên 9.',
      createdAt: new Date('2024-12-20'),
      subjectName: 'Giải tích',
      lessonsCompleted: 15,
    },
    {
      id: 2,
      studentName: 'Lê Thị Hương',
      studentAvatar: '/student-avatar-2.jpg',
      rating: 5,
      comment: 'Rất kiên nhẫn và giải thích mọi thứ một cách rõ ràng. Phương pháp dạy của cô rất hay và dễ hiểu. Điểm toán của em đã cải thiện rất nhiều. Cô luôn chuẩn bị bài kỹ và có tài liệu phong phú.',
      createdAt: new Date('2024-11-15'),
      subjectName: 'Đại số',
      lessonsCompleted: 20,
    },
    {
      id: 3,
      studentName: 'Phạm Đức Anh',
      studentAvatar: '/student-avatar-3.jpg',
      rating: 4,
      comment: 'Gia sư tuyệt vời, đã giúp em cải thiện điểm số đáng kể. Các bài tập thực hành rất hữu ích. Đôi khi giải thích hơi nhanh nhưng nhìn chung rất tốt.',
      createdAt: new Date('2024-10-05'),
      subjectName: 'Thống kê',
      lessonsCompleted: 10,
    },
    {
      id: 4,
      studentName: 'Nguyễn Thu Trang',
      studentAvatar: '/student-avatar-4.jpg',
      rating: 5,
      comment: 'Cô dạy rất tâm huyết và nhiệt tình. Em đã thi đỗ vào trường mơ ước nhờ sự giúp đỡ của cô trong việc luyện thi THPT. Rất cảm ơn cô!',
      createdAt: new Date('2024-09-12'),
      subjectName: 'Luyện thi THPT',
      lessonsCompleted: 25,
    },
  ];

  const timeSlots = [
    { 
      day: 'Thứ Hai, 13/01',
      slots: [
        { time: '09:00', available: true },
        { time: '10:30', available: true },
        { time: '14:00', available: false },
        { time: '16:00', available: true },
        { time: '19:00', available: true }
      ]
    },
    { 
      day: 'Thứ Ba, 14/01',
      slots: [
        { time: '08:30', available: true },
        { time: '10:00', available: false },
        { time: '13:00', available: true },
        { time: '15:30', available: true },
        { time: '18:00', available: true }
      ]
    },
    { 
      day: 'Thứ Tư, 15/01',
      slots: [
        { time: '09:30', available: true },
        { time: '11:00', available: true },
        { time: '14:30', available: true },
        { time: '16:30', available: false },
        { time: '20:00', available: true }
      ]
    }
  ];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  return (
    <div className="min-h-screen bg-[#F2E5BF] pt-16">
      {/* Header */}
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
          
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Header */}
            <Card className="bg-white border-[#257180]/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-32 h-32 border-2 border-[#F2E5BF]">
                      <AvatarImage src={tutor.avatarUrl || undefined} />
                      <AvatarFallback className="bg-[#F2E5BF] text-[#257180]">{tutor.userName.split(' ').slice(-2).map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {tutor.isVerified && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#257180] rounded-full flex items-center justify-center border-4 border-white">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-black text-2xl font-bold mb-2">{tutor.userName}</h1>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-5 h-5 fill-[#FD8B51] text-[#FD8B51]" />
                            <span className="text-lg text-black">{tutor.rating}</span>
                            <span className="text-sm text-gray-600">({tutor.reviewCount} đánh giá)</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{tutor.completedLessons} buổi học</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{tutor.totalStudents} học viên</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tutor.isVerified && (
                            <Badge variant="default" className="bg-[#F2E5BF] text-black border-[#257180]/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Đã xác thực
                            </Badge>
                          )}
                          <Badge variant="default" className="bg-[#F2E5BF] text-black border-[#257180]/20">
                            Chuyên nghiệp
                          </Badge>
                          {tutor.completedLessons > 500 && (
                            <Badge variant="secondary" className="bg-[#FD8B51] text-white border-[#FD8B51]">
                              Siêu gia sư
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

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{tutor.subDistrictName}, {tutor.provinceName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{tutor.teachingExp} kinh nghiệm</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>{tutor.teachingModes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Tham gia từ {tutor.memberSince}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Introduction */}
            {tutor.videoIntroUrl && (
              <Card className="bg-white border-[#257180]/20">
                <CardContent className="p-6">
                  <div className="relative bg-gradient-to-br from-[#257180] to-[#1e5a66] rounded-lg overflow-hidden aspect-video group cursor-pointer">
                    <div 
                      className="w-full h-full bg-cover bg-center opacity-50"
                      style={{ backgroundImage: `url(${tutor.avatarUrl || '/placeholder-avatar.jpg'})` }}
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

            {/* Main Tabs */}
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-[#F2E5BF] border-[#257180]/20">
                <TabsTrigger value="about" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Giới thiệu</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Đánh giá ({tutor.reviewCount})</TabsTrigger>
                <TabsTrigger value="availability" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">Lịch trống</TabsTrigger>
              </TabsList>
              
              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Về tôi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tutor.bio}</p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-black mb-3 font-bold">Kinh nghiệm giảng dạy</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Tôi có kinh nghiệm dạy học sinh từ cấp 2 đến đại học, đặc biệt chuyên về:
                      </p>
                      <ul className="mt-3 space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                          <span>Giải tích và vi tích phân</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                          <span>Đại số tuyến tính</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                          <span>Thống kê và xác suất</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                          <span>Luyện thi THPT Quốc gia</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                          <span>Toán cao cấp đại học</span>
                        </li>
                      </ul>
                      <p className="text-gray-700 mt-3">
                        Tôi đã giúp hơn {tutor.totalStudents} học sinh cải thiện điểm số và đạt được mục tiêu học tập của họ.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-black mb-3 font-bold">Thành tích nổi bật</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-[#FD8B51] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">95% học sinh cải thiện điểm số sau 3 tháng</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-[#FD8B51] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Hơn {tutor.completedLessons} buổi học hoàn thành thành công</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-[#FD8B51] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Chuyên gia luyện thi đại học</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-[#FD8B51] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Đánh giá trung bình {tutor.rating}/5 sao</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-black mb-3 font-bold">Hình thức dạy học</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.teachingModes?.split(', ').map((mode, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-black border-[#257180]/20">
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resume/CV Section */}
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Học vấn & Chứng chỉ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Education */}
                    {tutor.education.length > 0 && (
                      <>
                        <div>
                          <h4 className="text-black mb-3 font-bold">Học vấn</h4>
                          <div className="space-y-3">
                            {tutor.education.map((edu) => (
                              <div key={edu.id} className="flex items-start gap-2">
                                <Award className="w-4 h-4 text-black mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-gray-700">{edu.title} - {edu.issuer}</p>
                                  <p className="text-sm text-gray-500">
                                    {edu.issueDate ? new Date(edu.issueDate).getFullYear() : 'N/A'}
                                  </p>
                                  {edu.verified && (
                                    <Badge variant="outline" className="text-xs mt-1 border-[#257180]/20 text-black">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Đã xác thực
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />
                      </>
                    )}

                    {/* Certificates */}
                    {tutor.certificates.length > 0 && (
                      <div>
                        <h4 className="text-black mb-3 font-bold">Chứng chỉ</h4>
                        <div className="space-y-2">
                          {tutor.certificates.map((cert) => (
                            <div key={cert.id} className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cert.verified ? 'text-black' : 'text-gray-400'}`} />
                                <div>
                                  <span className="text-gray-700">{cert.title}</span>
                                  {cert.issuer && (
                                    <p className="text-xs text-gray-500">{cert.issuer}</p>
                                  )}
                                  {cert.expiryDate && new Date(cert.expiryDate) < new Date() && (
                                    <Badge variant="outline" className="text-xs mt-1 text-[#FD8B51] border-[#FD8B51]">
                                      Đã hết hạn
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {cert.verified && (
                                <Badge variant="outline" className="text-xs border-[#257180]/20 text-black">
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
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Môn học giảng dạy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-black border-[#257180]/20">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Specializations */}
                {tutor.specializations.length > 0 && (
                  <Card className="bg-white border-[#257180]/20">
                    <CardHeader>
                      <CardTitle className="font-bold text-black">Chuyên môn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tutor.specializations.map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm px-3 py-1 border-[#FD8B51] text-[#FD8B51]">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-bold text-black">Đánh giá từ học viên</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-[#FD8B51] text-[#FD8B51]" />
                        <span className="text-lg text-black">{tutor.rating}</span>
                        <span className="text-sm text-gray-600">({tutor.reviewCount} đánh giá)</span>
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
                    
                    {reviews.length < tutor.reviewCount && (
                      <div className="text-center mt-6">
                        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">Xem tất cả {tutor.reviewCount} đánh giá</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability" className="space-y-6">
                <Card className="bg-white border-[#257180]/20">
                  <CardHeader>
                    <CardTitle className="font-bold text-black">Lịch trống trong tuần</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {timeSlots.map((day, idx) => (
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
                      ))}
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

          {/* Sidebar - Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Pricing Card */}
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
                      <span className="text-black font-medium">{tutor.completedLessons}+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Học viên:</span>
                      <span className="text-black font-medium">{tutor.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hình thức:</span>
                      <span className="text-black font-medium">{tutor.teachingModes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tham gia:</span>
                      <span className="text-black font-medium">{tutor.memberSince}</span>
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
