"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/feedback/dialog';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Separator } from '@/components/ui/layout/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  GraduationCap,
  Award,
  Video,
  Camera,
  Play,
  X,
  CheckCircle,
  Clock,
  DollarSign,
  BookOpen,
  Star,
  MessageCircle,
  Heart,
  Download,
  Eye
} from 'lucide-react';

interface TutorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: number;
    userName: string;
    userEmail: string;
    phoneNumber?: string;
    bio?: string;
    avatar?: string;
    birthDate?: string;
    address?: string;
    city?: string;
    district?: string;
    
    // Education
    educationLevel?: string;
    educationInstitution?: string;
    graduationYear?: string;
    gpa?: string;
    
    // Teaching info
    subjects?: Array<{
      id: number;
      name: string;
      level: string;
    }>;
    hourlyRates?: Array<{
      subject: string;
      rate: number;
    }>;
    teachingModes?: string[];
    experience?: string;
    
    // Certificates
    certificates?: Array<{
      id: number;
      name: string;
      issuingOrganization: string;
      issueDate: string;
      expiryDate?: string;
      certificateImage?: string;
    }>;
    
    // Media
    profileImages?: string[];
    introductionVideo?: string;
    
    // Availability
    availability?: Array<{
      day: string;
      timeSlots: string[];
    }>;
    
    // Status
    status?: 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    reviewedAt?: string;
  };
}

export function TutorProfileModal({ isOpen, onClose, tutor }: TutorProfileModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Từ chối</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Chờ duyệt</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <User className="h-6 w-6 text-[#257180]" />
              Hồ sơ gia sư - {tutor.userName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-[#257180]/5 to-[#FD8B51]/5 rounded-lg p-6 border border-[#257180]/10">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={tutor.avatar} alt={tutor.userName} />
                <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-xl font-semibold">
                  {tutor.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{tutor.userName}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    {getStatusBadge(tutor.status)}
                    <span className="text-sm text-gray-500">
                      Đăng ký: {formatDate(tutor.submittedAt)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-[#257180]" />
                    <span className="text-sm">{tutor.userEmail}</span>
                  </div>
                  {tutor.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-[#257180]" />
                      <span className="text-sm">{tutor.phoneNumber}</span>
                    </div>
                  )}
                  {tutor.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-[#257180]" />
                      <span className="text-sm">{tutor.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#F2E5BF]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white">
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="education" className="data-[state=active]:bg-white">
                Học vấn
              </TabsTrigger>
              <TabsTrigger value="teaching" className="data-[state=active]:bg-white">
                Giảng dạy
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-white">
                Hình ảnh & Video
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-[#257180]" />
                      Thông tin cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                      <p className="text-sm text-gray-900">{formatDate(tutor.birthDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                      <p className="text-sm text-gray-900">
                        {tutor.address || 'Chưa cập nhật'}
                        {tutor.city && `, ${tutor.city}`}
                        {tutor.district && `, ${tutor.district}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Giới thiệu</label>
                      <p className="text-sm text-gray-900">
                        {tutor.bio || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Teaching Subjects */}
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-[#257180]" />
                      Môn học
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects?.map((subject) => (
                        <Badge key={subject.id} className="bg-[#F2E5BF] text-[#257180]">
                          {subject.name} - {subject.level}
                        </Badge>
                      )) || <span className="text-sm text-gray-500">Chưa cập nhật</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Teaching Modes */}
              {tutor.teachingModes && tutor.teachingModes.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Video className="h-5 w-5 text-[#257180]" />
                      Hình thức dạy học
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutor.teachingModes.map((mode, index) => (
                        <Badge key={index} className="bg-[#F2E5BF] text-[#257180]">
                          {mode}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-6">
              <Card className="border border-[#FD8B51]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5 text-[#257180]" />
                    Thông tin học vấn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trình độ học vấn</label>
                      <p className="text-sm text-gray-900">{tutor.educationLevel || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trường/Đại học</label>
                      <p className="text-sm text-gray-900">{tutor.educationInstitution || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Năm tốt nghiệp</label>
                      <p className="text-sm text-gray-900">{tutor.graduationYear || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Điểm GPA</label>
                      <p className="text-sm text-gray-900">{tutor.gpa || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certificates */}
              {tutor.certificates && tutor.certificates.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-[#257180]" />
                      Chứng chỉ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tutor.certificates.map((cert) => (
                        <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{cert.name}</h4>
                              <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>Cấp: {formatDate(cert.issueDate)}</span>
                                {cert.expiryDate && <span>Hết hạn: {formatDate(cert.expiryDate)}</span>}
                              </div>
                            </div>
                            {cert.certificateImage && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedImage(cert.certificateImage!)}
                                className="ml-4"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Teaching Tab */}
            <TabsContent value="teaching" className="space-y-6">
              {/* Hourly Rates */}
              {tutor.hourlyRates && tutor.hourlyRates.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-[#257180]" />
                      Mức phí
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tutor.hourlyRates.map((rate, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-sm text-gray-900">{rate.subject}</span>
                          <span className="font-medium text-[#257180]">{formatCurrency(rate.rate)}/giờ</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {tutor.experience && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5 text-[#257180]" />
                      Kinh nghiệm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-900">{tutor.experience}</p>
                  </CardContent>
                </Card>
              )}

              {/* Availability */}
              {tutor.availability && tutor.availability.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-[#257180]" />
                      Lịch rảnh
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tutor.availability.map((slot, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <span className="w-20 text-sm font-medium text-gray-900">{slot.day}</span>
                          <div className="flex flex-wrap gap-1">
                            {slot.timeSlots.map((time, timeIndex) => (
                              <Badge key={timeIndex} variant="outline" className="text-xs">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              {/* Profile Images */}
              {tutor.profileImages && tutor.profileImages.length > 0 && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Camera className="h-5 w-5 text-[#257180]" />
                      Hình ảnh ({tutor.profileImages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {tutor.profileImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                          onClick={() => setSelectedImage(image)}
                        >
                          <Image
                            src={image}
                            alt={`Profile image ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Introduction Video */}
              {tutor.introductionVideo && (
                <Card className="border border-[#FD8B51]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Video className="h-5 w-5 text-[#257180]" />
                      Video giới thiệu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <video
                        src={tutor.introductionVideo}
                        controls
                        className="w-full h-full object-cover"
                        poster={tutor.avatar}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <Image
                  src={selectedImage}
                  alt="Full size image"
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[90vh] object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

