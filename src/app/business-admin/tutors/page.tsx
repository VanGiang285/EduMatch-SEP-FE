"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/feedback/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  GraduationCap,
  Star,
  MapPin,
  Mail,
  Phone,
  Calendar,
  User,
  BookOpen,
  Award,
  Video,
  Camera,
  Play,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TutorManagementService, TutorProfile } from '@/services/tutorManagementService';
import { TutorStatus, TeachingMode, EnumHelpers } from '@/types';
import { useCustomToast } from '@/hooks/useCustomToast';

interface Tutor {
  id: number;
  userName: string;
  userEmail: string;
  phoneNumber?: string;
  avatar?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  subjects: Array<{
    id: number;
    name: string;
    level: string;
  }>;
  hourlyRates: Array<{
    subject: string;
    rate: number;
  }>;
  educationLevel?: string;
  educationInstitution?: string;
  experience?: string;
  bio?: string;
  address?: string;
  city?: string;
  district?: string;
  birthDate?: string;
  teachingModes?: string[];
  certificates?: Array<{
    id: number;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    certificateImage?: string;
  }>;
  educationImages?: string[];
  profileImages?: string[];
  introductionVideo?: string;
  availability?: Array<{
    id: number;
    status: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt?: string;
    slot: {
      id: number;
      startTime: string;
      endTime: string;
    };
    tutor?: any;
  }>;
}

export default function BusinessAdminTutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { showSuccess, showError } = useCustomToast();

  // Load pending tutors using get-all-tutor-by-status API
  useEffect(() => {
    const loadPendingTutors = async () => {
      try {
        setLoading(true);
        const response = await TutorManagementService.getTutorsByStatus(TutorStatus.Pending);
        
        if (response.success && response.data) {
          console.log('API Response (Pending Tutors):', response.data);
          console.log('Pending tutors count:', response.data.length);
          
          const transformedTutors: Tutor[] = response.data.map((tutor: TutorProfile) => ({
            id: tutor.id,
            userName: tutor.userName,
            userEmail: tutor.userEmail,
            phoneNumber: tutor.phoneNumber,
            avatar: tutor.avatarUrl,
            status: 'pending' as const,
            submittedAt: tutor.createdAt,
            subjects: tutor.tutorSubjects?.map(subject => ({
              id: subject.subject?.id || 0,
              name: subject.subject?.subjectName || '',
              level: subject.level?.name || ''
            })) || [],
            hourlyRates: tutor.tutorSubjects?.map(subject => ({
              subject: `${subject.subject?.subjectName || ''} - ${subject.level?.name || ''}`,
              rate: subject.hourlyRate || 0
            })) || [],
            educationLevel: tutor.tutorEducations?.[0]?.institution?.name || '',
            educationInstitution: tutor.tutorEducations?.[0]?.institution?.name || '',
            experience: tutor.teachingExp || '',
            bio: tutor.bio || '',
            address: tutor.subDistrict?.name || '',
            city: tutor.province?.name || '',
            district: tutor.subDistrict?.name || '',
            birthDate: '',
            teachingModes: [tutor.teachingModes || 0],
            certificates: tutor.tutorCertificates?.map(cert => ({
              id: cert.id,
              name: cert.certificateType?.name || '',
              issuingOrganization: cert.certificateType?.name || '',
              issueDate: cert.issueDate || '',
              expiryDate: cert.expiryDate || '',
              certificateImage: cert.certificateUrl
            })) || [],
            educationImages: tutor.tutorEducations?.map(edu => edu.certificateUrl).filter(Boolean) || [],
            profileImages: [],
            introductionVideo: tutor.videoIntroUrl,
            availability: tutor.tutorAvailabilities || []
          }));
          
          setTutors(transformedTutors);
        } else {
          console.log('API Response failed or no data:', response);
          setTutors([]);
        }
      } catch (error) {
        console.error('Error loading pending tutors:', error);
        showError('Không thể tải danh sách gia sư chờ duyệt');
      } finally {
        setLoading(false);
      }
    };

    loadPendingTutors();
  }, []); // Empty dependency array - only run once on mount

  // Helper function to get day name from day of week number
  const getDayName = (dayOfWeek: number): string => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek] || '';
  };

  // Helper functions for week navigation
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const formatWeekRange = (date: Date) => {
    const weekDates = getWeekDates(date);
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  const navigateWeek = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentWeek(new Date());
    } else {
      const newWeek = new Date(currentWeek);
      newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentWeek(newWeek);
    }
  };


  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = 
      tutor.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Only show pending tutors
    const matchesStatus = tutor.status === 'pending';
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleViewProfile = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowProfileModal(true);
  };

  const handleApprove = async (tutorId: number) => {
    try {
      setLoading(true);
      // TODO: Implement approve API call
      // const response = await TutorManagementService.approveTutor(tutorId);
      
      // For now, just update local state
      setTutors(prev => prev.map(tutor => 
        tutor.id === tutorId 
          ? { ...tutor, status: 'approved' as const, reviewedAt: new Date().toISOString() }
          : tutor
      ));
      
      showSuccess('Duyệt gia sư thành công');
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error approving tutor:', error);
      showError('Không thể duyệt gia sư');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (tutorId: number) => {
    try {
      setLoading(true);
      // TODO: Implement reject API call
      // const response = await TutorManagementService.rejectTutor(tutorId);
      
      // For now, just update local state
      setTutors(prev => prev.map(tutor => 
        tutor.id === tutorId 
          ? { ...tutor, status: 'rejected' as const, reviewedAt: new Date().toISOString() }
          : tutor
      ));
      
      showSuccess('Từ chối gia sư thành công');
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      showError('Không thể từ chối gia sư');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-6 w-6 text-[#257180]" />
          Quản lý gia sư
        </h2>
             <p className="text-gray-600 mt-1">
               Duyệt và quản lý hồ sơ đăng ký trở thành gia sư (chỉ hiển thị hồ sơ chờ duyệt)
             </p>
           </div>
           <div className="text-sm text-gray-600">
             Chờ duyệt: {tutors.length} hồ sơ
           </div>
        </div>
      </div>

       {/* Search */}
       <Card className="border border-[#FD8B51]">
         <CardHeader>
           <CardTitle className="text-lg font-semibold text-gray-900">Tìm kiếm</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                 <Input
                   placeholder="Tìm kiếm theo tên hoặc email..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10"
                 />
               </div>
             </div>
             <Button 
               variant="outline" 
               className="flex items-center gap-2"
               onClick={() => setSearchQuery('')}
             >
               <Filter className="w-4 h-4" />
               Xóa bộ lọc
             </Button>
           </div>
         </CardContent>
       </Card>

      {/* Tutors Table */}
      <Card className="border border-[#FD8B51]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Danh sách hồ sơ gia sư</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Gia sư</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Môn học</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Học vấn</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ngày đăng ký</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTutors.map((tutor) => (
                  <tr key={tutor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={tutor.avatar} alt={tutor.userName} />
                          <AvatarFallback className="bg-[#F2E5BF] text-[#257180] font-semibold">
                            {tutor.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{tutor.userName}</div>
                          <div className="text-sm text-gray-500">{tutor.userEmail}</div>
                          {tutor.phoneNumber && (
                            <div className="text-sm text-gray-500">{tutor.phoneNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.slice(0, 2).map((subject) => (
                          <Badge key={subject.id} className="bg-[#F2E5BF] text-[#257180] text-xs">
                            {subject.name}
                          </Badge>
                        ))}
                        {tutor.subjects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{tutor.subjects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {tutor.educationLevel || 'Chưa cập nhật'}
                      </div>
                      {tutor.educationInstitution && (
                        <div className="text-xs text-gray-500">{tutor.educationInstitution}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(tutor.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(tutor.submittedAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(tutor)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem hồ sơ
                        </Button>
                        {tutor.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(tutor.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(tutor.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

       {!loading && filteredTutors.length === 0 && (
         <Card className="border border-[#FD8B51]">
           <CardContent className="text-center py-12">
             <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <p className="text-gray-500 text-lg">Không có hồ sơ gia sư chờ duyệt</p>
             <p className="text-gray-400 text-sm mt-1">Tất cả hồ sơ đã được xử lý hoặc chưa có đơn đăng ký mới</p>
           </CardContent>
         </Card>
       )}

      {/* Profile Modal */}
      {selectedTutor && (
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent 
            className="w-[95vw] h-[95vh] overflow-y-auto"
            style={{ width: '95vw', height: '95vh', maxWidth: '95vw', maxHeight: '95vh' }}
          >
            <DialogHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <User className="h-6 w-6 text-[#257180]" />
                    Hồ sơ gia sư - {selectedTutor.userName}
                  </DialogTitle>
                  <p className="text-gray-600 mt-2">
                    Xem và duyệt đơn đăng ký trở thành gia sư
        </p>
      </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowProfileModal(false)}
                    className="w-full sm:w-auto"
                  >
                    Đóng
                  </Button>
                  {selectedTutor.status === 'pending' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedTutor.id)}
                        className="flex-1 sm:flex-none"
                      >
                        Từ chối
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedTutor.id)}
                        className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                      >
                        Duyệt
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="flex h-full gap-6">
              {/* Left Sidebar - User Info Card */}
              <div className="w-1/3 flex-shrink-0">
                <div className="bg-gradient-to-r from-[#257180]/5 to-[#FD8B51]/5 rounded-lg p-6 border border-[#257180]/10 h-full">
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Avatar và thông tin cơ bản */}
                    <div className="text-center">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg mx-auto mb-4">
                        <AvatarImage src={selectedTutor.avatar} alt={selectedTutor.userName} />
                        <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-xl font-semibold">
                          {selectedTutor.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedTutor.userName}</h2>
                      <div className="mb-2">
                        {getStatusBadge(selectedTutor.status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Đăng ký: {formatDate(selectedTutor.submittedAt)}
                      </div>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div className="w-full">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Thông tin liên hệ</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-[#257180]" />
                          <span className="text-sm">{selectedTutor.userEmail}</span>
                        </div>
                        {selectedTutor.phoneNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4 text-[#257180]" />
                            <span className="text-sm">{selectedTutor.phoneNumber}</span>
                          </div>
                        )}
                        {selectedTutor.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 text-[#257180]" />
                            <span className="text-sm">{selectedTutor.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chuyên môn */}
                    <div className="w-full">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Chuyên môn</h3>
                      <div className="space-y-3">
                        {/* Môn học */}
                        <div className="flex items-start gap-3">
                          <label className="text-sm font-medium text-gray-500 w-24 flex-shrink-0">Môn học:</label>
                          <div className="flex flex-wrap gap-1 flex-1">
                            {selectedTutor.subjects.map((subject) => (
                              <div 
                                key={subject.id}
                                className="px-2 py-1 bg-[#FD8B51] text-white text-xs font-medium rounded-full"
                              >
                                {subject.name} - Lớp {subject.level}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Phương thức dạy học */}
                        {selectedTutor.teachingModes && selectedTutor.teachingModes.length > 0 && (
                          <div className="flex items-start gap-3">
                            <label className="text-sm font-medium text-gray-500 w-24 flex-shrink-0">Phương thức:</label>
                            <div className="flex flex-wrap gap-1 flex-1">
                              {selectedTutor.teachingModes.map((mode, index) => (
                                <div 
                                  key={index}
                                  className="px-2 py-1 bg-[#F2E5BF] text-[#257180] text-xs font-medium rounded-full"
                                >
                                  {EnumHelpers.getTeachingModeLabel(mode as TeachingMode)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Tabs Content */}
              <div className="flex-1 flex flex-col min-h-0">
                <Tabs defaultValue="credentials" className="flex-1 flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-5 bg-[#F2E5BF] mb-6 flex-shrink-0">
                    <TabsTrigger value="credentials" className="data-[state=active]:bg-white text-xs">
                      Học vấn & Chứng chỉ
                    </TabsTrigger>
                    <TabsTrigger value="description" className="data-[state=active]:bg-white text-xs">
                      Mô tả
                    </TabsTrigger>
                    <TabsTrigger value="video" className="data-[state=active]:bg-white text-xs">
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="availability" className="data-[state=active]:bg-white text-xs">
                      Thời gian
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="data-[state=active]:bg-white text-xs">
                      Giá cả
                    </TabsTrigger>
                  </TabsList>

                  {/* Fixed Height Container for Tab Content */}
                  <div className="flex-1 overflow-hidden">
                    {/* Tab 1: Học vấn & Chứng chỉ */}
                    <TabsContent value="credentials" className="h-full overflow-y-auto">
                  <div className="space-y-6">
                    {/* Thông tin học vấn */}
                    <Card className="border border-[#FD8B51]">
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
                          <GraduationCap className="h-6 w-6 text-[#257180]" />
                          Thông tin học vấn
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                         {selectedTutor.educationInstitution ? (
                           <div className="space-y-4">
                             <div className="bg-white border border-gray-200 rounded-lg p-4">
                               <div className="flex items-start gap-4">
                                 {/* Thông tin bên trái */}
                                 <div className="flex-1">
                                   <div className="flex items-center gap-2 mb-3">
                                     <GraduationCap className="h-5 w-5 text-[#257180]" />
                                     <h4 className="font-medium text-gray-900">Trường/Đại học</h4>
                                   </div>
                                   <p className="text-sm text-gray-700 mb-2">{selectedTutor.educationInstitution}</p>
                                   {selectedTutor.submittedAt && (
                                     <p className="text-xs text-gray-500">
                                       Ngày cấp: {formatDate(selectedTutor.submittedAt)}
                                     </p>
                                   )}
                                 </div>
                                 
                                 {/* Ảnh bên phải */}
                                 {selectedTutor.educationImages && selectedTutor.educationImages.length > 0 && (
                                   <div className="flex-shrink-0">
                                     <h5 className="text-sm font-medium text-gray-700 mb-2">Bằng cấp</h5>
                                     <div className="grid grid-cols-2 gap-2">
                                       {selectedTutor.educationImages.slice(0, 2).map((image, index) => (
                                         <div
                                           key={index}
                                           className="relative w-24 h-32 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                                           onClick={() => window.open(image, '_blank')}
                                         >
                                           <img
                                             src={image}
                                             alt={`Education certificate ${index + 1}`}
                                             className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                           />
                                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                             <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                           </div>
                                         </div>
                                       ))}
                                       {selectedTutor.educationImages.length > 2 && (
                                         <div className="flex items-center justify-center w-24 h-32 bg-gray-100 rounded-lg border border-gray-200">
                                           <span className="text-xs text-gray-500">+{selectedTutor.educationImages.length - 2}</span>
                                         </div>
                                       )}
                                     </div>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Chưa có thông tin học vấn</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Chứng chỉ */}
                    <Card className="border border-[#FD8B51]">
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
                          <Award className="h-6 w-6 text-[#257180]" />
                          Chứng chỉ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedTutor.certificates && selectedTutor.certificates.length > 0 ? (
                          <div className="space-y-6">
                            {selectedTutor.certificates.map((cert) => (
                              <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Thông tin chứng chỉ */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-gray-900">{cert.name}</h4>
                                    <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <span>Cấp: {formatDate(cert.issueDate)}</span>
                                      {cert.expiryDate && <span>Hết hạn: {formatDate(cert.expiryDate)}</span>}
                                    </div>
                                  </div>
                                  
                                   {/* Ảnh chứng chỉ */}
                                   {cert.certificateImage && (
                                     <div className="flex justify-center">
                                       <div 
                                         className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                                         onClick={() => window.open(cert.certificateImage, '_blank')}
                                       >
                                         <img
                                           src={cert.certificateImage}
                                           alt={cert.name}
                                           className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                         />
                                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                           <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                         </div>
                                       </div>
                                     </div>
                                   )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Chưa có chứng chỉ nào</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                    {/* Tab 5: Mô tả */}
                    <TabsContent value="description" className="h-full overflow-y-auto">
                  <div>
                    <Card className="border border-[#FD8B51]">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-black mb-2">Mô tả bản thân</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-black text-sm sm:text-base">Giới thiệu bản thân</label>
                        <div className="p-3 bg-gray-50 border border-gray-300 rounded-md min-h-[100px]">
                          {selectedTutor.bio || 'Chưa cập nhật'}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-black text-sm sm:text-base">Kinh nghiệm giảng dạy</label>
                        <div className="p-3 bg-gray-50 border border-gray-300 rounded-md min-h-[100px]">
                          {selectedTutor.experience || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                </TabsContent>

                    {/* Tab 6: Video */}
                    <TabsContent value="video" className="h-full overflow-y-auto">
                  <div>
                    <Card className="border border-[#FD8B51]">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-black mb-2">Video giới thiệu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedTutor.introductionVideo ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <video
                            src={selectedTutor.introductionVideo}
                            controls
                            className="w-full h-full object-cover"
                            poster={selectedTutor.avatar}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Chưa có video giới thiệu</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  </div>
                </TabsContent>

                     {/* Tab 4: Thời gian */}
                     <TabsContent value="availability" className="h-full overflow-y-auto">
                   <div>
                     <Card className="border border-[#FD8B51]">
                       <CardHeader>
                         <CardTitle className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
                           <Clock className="h-6 w-6 text-[#257180]" />
                           Lịch khả dụng
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         {(() => {
                           console.log('Selected tutor availability:', selectedTutor.availability);
                           return selectedTutor.availability && selectedTutor.availability.length > 0;
                         })() ? (
                           <div className="space-y-6">
                             {/* Week Navigation - giống become tutor */}
                             <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center gap-4">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className="border-gray-300 hover:bg-[#FD8B51] hover:text-white"
                                   onClick={() => navigateWeek('prev')}
                                 >
                                   <ChevronLeft className="w-4 h-4" />
                                   Tuần trước
                                 </Button>
                                 <div className="text-sm font-medium text-[#257180]">
                                   Tuần này ({formatWeekRange(currentWeek)})
                                 </div>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className="border-gray-300 hover:bg-[#FD8B51] hover:text-white"
                                   onClick={() => navigateWeek('next')}
                                 >
                                   Tuần sau
                                   <ChevronRight className="w-4 h-4" />
                                 </Button>
                               </div>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="border-gray-300/30 hover:bg-[#FD8B51]/10 text-[#FD8B51]"
                                 onClick={() => navigateWeek('today')}
                               >
                                 Hôm nay
                               </Button>
                             </div>

                             {/* Calendar Grid giống become tutor */}
                             <div className="overflow-x-auto">
                               <div className="min-w-full">
                                 <div className="grid grid-cols-8 gap-2 mb-2">
                                   <div className="p-2"></div>
                                   {getWeekDates(currentWeek).map((date, index) => {
                                     const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                     const dayName = dayNames[date.getDay()];
                                     const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
                                     
                                     return (
                                       <div key={index} className="p-2 text-center font-medium text-black bg-[#F2E5BF] rounded border border-gray-300">
                                         <div>{dayName}</div>
                                         <div className="text-xs text-gray-600 mt-1">{dateStr}</div>
                                       </div>
                                     );
                                   })}
                                 </div>
                                 
                                 {/* Time slots */}
                                 {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((time) => (
                                   <div key={time} className="grid grid-cols-8 gap-2 mb-1">
                                     <div className="p-2 text-sm font-medium text-gray-600 flex items-center">
                                       {time}
                                     </div>
                                     {[
                                       { day: 'Thứ 2', date: '16/12' },
                                       { day: 'Thứ 3', date: '17/12' },
                                       { day: 'Thứ 4', date: '18/12' },
                                       { day: 'Thứ 5', date: '19/12' },
                                       { day: 'Thứ 6', date: '20/12' },
                                       { day: 'Thứ 7', date: '21/12' },
                                       { day: 'Chủ nhật', date: '22/12' }
                                     ].map((dayInfo, dayIndex) => {
                                       // Get the actual date for this day
                                       const weekDates = getWeekDates(currentWeek);
                                       const currentDate = weekDates[dayIndex];
                                       
                                       // Check if this time slot is available based on tutorAvailabilities
                                       const isAvailable = selectedTutor.availability?.some(slot => {
                                         // Parse the slot date and time from the availability data
                                         const slotStartDate = new Date(slot.startDate);
                                         const slotEndDate = new Date(slot.endDate);
                                         
                                         // Debug logging
                                         console.log('Checking slot:', {
                                           slotStartDate: slotStartDate.toDateString(),
                                           currentDate: currentDate.toDateString(),
                                           slotStartTime: slot.slot?.startTime,
                                           currentTime: time + ':00',
                                           slot: slot
                                         });
                                         
                                         // Check if the current calendar date matches the slot date
                                         const dateMatch = slotStartDate.toDateString() === currentDate.toDateString();
                                         
                                         // Check if the current time matches the slot time
                                         const slotStartTime = slot.slot?.startTime || '';
                                         const slotEndTime = slot.slot?.endTime || '';
                                         
                                         // Convert time to HH:MM format for comparison
                                         const currentTime = time + ':00';
                                         const timeMatch = slotStartTime === currentTime;
                                         
                                         console.log('Match results:', { dateMatch, timeMatch, isMatch: dateMatch && timeMatch });
                                         
                                         return dateMatch && timeMatch;
                                       }) || false;
                                       
                                       return (
                                         <div key={`${dayInfo.day}-${time}`} className="p-1">
                                           <div className={`w-full h-8 rounded border flex items-center justify-center ${
                                             isAvailable 
                                               ? 'bg-[#FD8B51] text-white border-[#FD8B51]' 
                                               : 'bg-gray-100 border-gray-200'
                                           }`}>
                                             <span className="text-xs">{isAvailable ? '✓' : '-'}</span>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 ))}
                               </div>
                             </div>
                             
                           </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Chưa cập nhật lịch khả dụng</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                    {/* Tab 8: Giá cả */}
                    <TabsContent value="pricing" className="h-full overflow-y-auto">
                  <div>
                    <Card className="border border-[#FD8B51]">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-black mb-2">Mức học phí</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedTutor.hourlyRates && selectedTutor.hourlyRates.length > 0 ? (
                        <div className="space-y-2">
                          {selectedTutor.hourlyRates.map((rate, index) => (
                            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                              <span className="text-sm text-gray-900">{rate.subject}</span>
                              <span className="font-medium text-[#257180]">{formatCurrency(rate.rate)}/giờ</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Chưa cập nhật mức học phí</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}