'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/basic/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/layout/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/feedback/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Search, Eye, Ban, CheckCircle, Star, ArrowUpDown, Shield, MapPin, Globe, Users, CheckCircle2, Loader2, GraduationCap, Medal } from 'lucide-react';
import { 
  getTeachingModeText,
} from '@/data/mockBusinessAdminData';
import { TutorService } from '@/services/tutorService';
import { TutorProfileDto } from '@/types/backend';
import { useCustomToast } from '@/hooks/useCustomToast';
import { TutorStatus, EnumHelpers, TeachingMode } from '@/types/enums';
import { UpdateTutorStatusRequest } from '@/types/requests';
import { LocationService } from '@/services/locationService';
import { Separator } from '@/components/ui/layout/separator';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'userName' | 'email' | 'rating' | 'totalStudents';
type SortOrder = 'asc' | 'desc';

// Interface for UI tutor data
interface UITutor {
  id: number;
  email: string;
  userName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  profile: {
    cityName: string;
    subDistrictName: string;
    addressLine?: string;
  };
  tutorProfile: {
    status: number;
    teachingModes: number;
    bio?: string;
    rating: number;
    totalReviews: number;
    totalStudents: number;
    totalEarnings: number;
  };
  subjects: Array<{
    name: string;
    level: string;
    hourlyRate: number;
  }>;
  education: Array<{
    id: number;
    institutionName: string;
    issueDate?: string;
    verified: number;
  }>;
  certificates: Array<{
    id: number;
    certificateName: string;
    issueDate?: string;
    verified: number;
  }>;
}

// Helper function to map TutorProfileDto to UITutor
const mapTutorProfileToUI = (dto: TutorProfileDto): UITutor => {
  // Parse teaching modes - can be number or string
  const teachingModes = typeof dto.teachingModes === 'string' 
    ? parseInt(dto.teachingModes) || 0 
    : (dto.teachingModes as number) || 0;
  
  // Parse status - can be number or string
  const status = typeof dto.status === 'string'
    ? parseInt(dto.status) || 0
    : (dto.status as number) || 0;

  // Map subjects
  const subjects = (dto.tutorSubjects || []).map(subject => ({
    name: subject.subject?.subjectName || 'Chưa có',
    level: subject.level?.name || (subject.levelId ? `Level ${subject.levelId}` : ''),
    hourlyRate: subject.hourlyRate || 0,
  })).filter(subject => subject.name !== 'Chưa có'); // Filter out invalid subjects

  // Map education
  const education = (dto.tutorEducations || []).map(edu => ({
    id: edu.id,
    institutionName: edu.institution?.name || 'Chưa có',
    issueDate: edu.issueDate,
    verified: edu.verified as number,
  }));

  // Map certificates
  const certificates = (dto.tutorCertificates || []).map(cert => ({
    id: cert.id,
    certificateName: cert.certificateType?.name || 'Chưa có',
    issueDate: cert.issueDate,
    verified: cert.verified as number,
  }));

  // Calculate stats (mock for now - can be enhanced with real data)
  const rating = 4.5; // Default - can be calculated from reviews if available
  const totalReviews = 0; // Can be calculated from reviews
  const totalStudents = 0; // Can be calculated from bookings
  const totalEarnings = 0; // Can be calculated from bookings

  return {
    id: dto.id,
    email: dto.userEmail,
    userName: dto.userName || dto.userEmail,
    phone: dto.phone,
    avatarUrl: dto.avatarUrl,
    isActive: status === 1, // Status 1 = Đã duyệt = Active
    createdAt: dto.createdAt,
    profile: {
      cityName: dto.province?.name || 'Chưa có',
      subDistrictName: dto.subDistrict?.name || 'Chưa có',
      addressLine: dto.addressLine,
    },
    tutorProfile: {
      status,
      teachingModes,
      bio: dto.bio,
      rating,
      totalReviews,
      totalStudents,
      totalEarnings,
    },
    subjects,
    education,
    certificates,
  };
};

export function ManageTutors() {
  const { showSuccess, showError } = useCustomToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTutor, setSelectedTutor] = useState<UITutor | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [tutors, setTutors] = useState<UITutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [provinces, setProvinces] = useState<Array<{ id: number; name: string }>>([]);

  // Load provinces from API
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await LocationService.getAllProvinces();
        if (response.success && response.data) {
          setProvinces(response.data.map(p => ({ id: p.id, name: p.name })));
        }
      } catch (error: any) {
        console.error('Error loading provinces:', error);
      }
    };

    loadProvinces();
  }, []);

  // Load tutors from API
  useEffect(() => {
    const loadTutors = async () => {
      setIsLoading(true);
      try {
        const response = await TutorService.getAllTutors();
        if (response.success && response.data) {
          const mappedTutors = response.data.map(mapTutorProfileToUI);
          setTutors(mappedTutors);
        } else {
          showError('Lỗi', response.message || 'Không thể tải danh sách gia sư');
        }
      } catch (error: any) {
        console.error('Error loading tutors:', error);
        showError('Lỗi', 'Không thể tải danh sách gia sư. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort tutors
  const filteredTutors = useMemo(() => {
    const filtered = tutors.filter((tutor) => {
      const matchesSearch = tutor.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (tutor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && tutor.isActive) ||
                           (statusFilter === 'inactive' && !tutor.isActive);
      const matchesCity = cityFilter === 'all' || tutor.profile.cityName === cityFilter;
      
      return matchesSearch && matchesStatus && matchesCity;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'userName':
          aValue = a.userName.toLowerCase();
          bValue = b.userName.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'rating':
          aValue = a.tutorProfile.rating;
          bValue = b.tutorProfile.rating;
          break;
        case 'totalStudents':
          aValue = a.tutorProfile.totalStudents;
          bValue = b.tutorProfile.totalStudents;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tutors, searchTerm, statusFilter, cityFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTutors = filteredTutors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Use provinces from API for filter
  const cities = provinces.map(p => p.name);

  const handleViewDetail = (tutor: UITutor) => {
    setSelectedTutor(tutor);
    setShowDetailDialog(true);
  };

  const handleToggleStatus = async (tutor: UITutor) => {
    const tutorId = tutor.id;
    
    if (tutor.isActive) {
      // Deactivate - Set status to Rejected
      setIsDeactivating(tutor.email);
      try {
        const request: UpdateTutorStatusRequest = {
          status: TutorStatus.Rejected
        };
        const response = await TutorService.updateTutorStatus(tutorId, request);
        if (response.success && response.data) {
          setTutors(prev => prev.map(t => 
            t.id === tutor.id ? { ...t, isActive: false, tutorProfile: { ...t.tutorProfile, status: TutorStatus.Rejected } } : t
          ));
          showSuccess('Thành công', `Đã vô hiệu hóa tài khoản ${tutor.userName}`);
        } else {
          showError('Lỗi', response.message || 'Không thể vô hiệu hóa tài khoản');
        }
      } catch (error: any) {
        console.error('Error deactivating tutor:', error);
        showError('Lỗi', 'Không thể vô hiệu hóa tài khoản. Vui lòng thử lại.');
      } finally {
        setIsDeactivating(null);
      }
    } else {
      // Activate - Set status to Approved
      setIsActivating(tutor.email);
      try {
        const request: UpdateTutorStatusRequest = {
          status: TutorStatus.Approved
        };
        const response = await TutorService.updateTutorStatus(tutorId, request);
        if (response.success && response.data) {
          setTutors(prev => prev.map(t => 
            t.id === tutor.id ? { ...t, isActive: true, tutorProfile: { ...t.tutorProfile, status: TutorStatus.Approved } } : t
          ));
          showSuccess('Thành công', `Đã kích hoạt tài khoản ${tutor.userName}`);
        } else {
          showError('Lỗi', response.message || 'Không thể kích hoạt tài khoản');
        }
      } catch (error: any) {
        console.error('Error activating tutor:', error);
        showError('Lỗi', 'Không thể kích hoạt tài khoản. Vui lòng thử lại.');
      } finally {
        setIsActivating(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý Gia sư</h1>
        <p className="text-gray-600 mt-1">Quản lý danh sách gia sư trong hệ thống</p>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Đã vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select value={cityFilter} onValueChange={(value) => {
              setCityFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Thành phố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thành phố</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tutors Table */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Danh sách gia sư</CardTitle>
            <Badge variant="outline">{filteredTutors.length} gia sư</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
              <span className="ml-2 text-gray-600">Đang tải danh sách gia sư...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[60px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="h-8 px-2">
                      ID <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('userName')} className="h-8 px-2">
                      Gia sư <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[220px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('email')} className="h-8 px-2">
                      Email <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px]">Hình thức</TableHead>
                  <TableHead className="w-[120px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('rating')} className="h-8 px-2">
                      Đánh giá <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[180px]">Môn học</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="text-right w-[120px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không tìm thấy gia sư nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTutors.map((tutor) => (
                    <TableRow key={tutor.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{tutor.id}</span>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={tutor.avatarUrl} alt={tutor.userName} />
                            <AvatarFallback className="bg-[#257180] text-white">
                              {tutor.userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate" title={tutor.userName}>
                              {tutor.userName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {tutor.subjects.length} môn học
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 w-[220px]">
                        <span className="truncate block min-w-0" title={tutor.email}>
                          {tutor.email}
                        </span>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Badge variant="outline" className="truncate block max-w-full" title={getTeachingModeText(tutor.tutorProfile.teachingModes)}>
                          {getTeachingModeText(tutor.tutorProfile.teachingModes)}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <div className="flex items-center gap-1 min-w-0">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <span className="font-medium truncate">{tutor.tutorProfile.rating}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">({tutor.tutorProfile.totalReviews})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 w-[180px]">
                        {tutor.subjects.length > 0 ? (
                          <div className="space-y-1">
                            {tutor.subjects.slice(0, 2).map((subject: any, idx: number) => (
                              <div key={idx} className="truncate" title={`${subject.name}${subject.level ? ` - ${subject.level}` : ''}`}>
                                <span className="font-medium">{subject.name}</span>
                                {subject.level && <span className="text-gray-500"> - {subject.level}</span>}
                              </div>
                            ))}
                            {tutor.subjects.length > 2 && (
                              <span className="text-xs text-gray-500">+{tutor.subjects.length - 2} môn</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Badge className={tutor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {tutor.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right w-[120px]">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(tutor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(tutor)}
                            disabled={isActivating === tutor.email || isDeactivating === tutor.email}
                            className={tutor.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {(isActivating === tutor.email || isDeactivating === tutor.email) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : tutor.isActive ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        onClick={() => setCurrentPage(idx + 1)}
                        isActive={currentPage === idx + 1}
                        className="cursor-pointer"
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog - Based on TutorDetailProfilePage */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="!max-w-7xl sm:!max-w-7xl max-h-[95vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Hồ sơ gia sư</DialogTitle>
          </DialogHeader>
          
          {selectedTutor && (
            <div className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Profile Header Card */}
                  <Card className="border-[#FD8B51]">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={selectedTutor.avatarUrl || undefined} alt={selectedTutor.userName} className="object-cover" />
                        <AvatarFallback className="text-3xl bg-[#F2E5BF] text-[#257180]">
                          {selectedTutor.userName.split(' ').slice(-2).map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {(selectedTutor.tutorProfile.status === 1 || selectedTutor.tutorProfile.status === 3 || selectedTutor.tutorProfile.status === 4) && (
                        <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${
                          selectedTutor.tutorProfile.status === 1 ? 'bg-blue-600' : 
                          selectedTutor.tutorProfile.status === 3 ? 'bg-orange-600' : 
                          'bg-red-600'
                        }`}>
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h1 className="text-gray-900 text-2xl font-semibold mb-2 truncate" title={selectedTutor.userName}>
                            {selectedTutor.userName}
                          </h1>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              <span className="text-lg text-gray-900">{selectedTutor.tutorProfile.rating}</span>
                              <span className="text-sm text-gray-500">({selectedTutor.tutorProfile.totalReviews} đánh giá)</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{selectedTutor.tutorProfile.totalStudents} học viên</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectedTutor.tutorProfile.status === 1 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Đã xác thực
                              </Badge>
                            )}
                            {selectedTutor.tutorProfile.status === 3 && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                                <Shield className="w-3 h-3 mr-1" />
                                Tạm khóa
                              </Badge>
                            )}
                            {selectedTutor.tutorProfile.status === 4 && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                                <Shield className="w-3 h-3 mr-1" />
                                Ngừng hoạt động
                              </Badge>
                            )}
                            <Badge variant="secondary" className={selectedTutor.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                              {selectedTutor.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 min-w-0">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate" title={`${selectedTutor.profile.subDistrictName}, ${selectedTutor.profile.cityName}`}>
                            {selectedTutor.profile.subDistrictName}, {selectedTutor.profile.cityName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 min-w-0">
                          <GraduationCap className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{selectedTutor.certificates.length} chứng chỉ</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 min-w-0">
                          <Globe className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate" title={getTeachingModeText(selectedTutor.tutorProfile.teachingModes)}>
                            {getTeachingModeText(selectedTutor.tutorProfile.teachingModes)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 min-w-0">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate" title={selectedTutor.email}>
                            {selectedTutor.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-[#F2E5BF]">
                  <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">Giới thiệu</TabsTrigger>
                  <TabsTrigger value="education" className="data-[state=active]:bg-white data-[state=active]:text-[#257180]">Học vấn & Chứng chỉ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-6">
                  <Card className="border-[#FD8B51]">
                    <CardHeader>
                      <CardTitle className="font-bold">Về tôi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                          {selectedTutor.tutorProfile.bio || 'Chưa có thông tin giới thiệu.'}
                        </p>
                      </div>

                      <Separator className="bg-gray-900" />

                      <div>
                        <h3 className="text-gray-900 mb-3 font-bold">Kinh nghiệm giảng dạy</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedTutor.tutorProfile.bio || 'Chưa có thông tin kinh nghiệm giảng dạy.'}
                        </p>
                        {selectedTutor.subjects && selectedTutor.subjects.length > 0 && (
                          <>
                            <p className="text-gray-700 mt-3">
                              Tôi chuyên dạy các môn học sau:
                            </p>
                            <ul className="mt-3 space-y-2 text-gray-700">
                              {selectedTutor.subjects.map((subject: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{subject.name}{subject.level ? ` - ${subject.level}` : ''}</span>
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
                          {(() => {
                            const modeValue = typeof selectedTutor.tutorProfile.teachingModes === 'number' 
                              ? selectedTutor.tutorProfile.teachingModes 
                              : parseInt(String(selectedTutor.tutorProfile.teachingModes)) || 0;
                            
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
                                {EnumHelpers.getTeachingModeLabel(modeValue as TeachingMode)}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#FD8B51]">
                    <CardHeader>
                      <CardTitle className="font-bold">Môn học giảng dạy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedTutor.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTutor.subjects.map((subject: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80">
                              {subject.name}{subject.level ? ` - ${subject.level}` : ''}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Chưa có môn học nào</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education" className="space-y-6">
                  <Card className="border-[#FD8B51]">
                    <CardHeader>
                      <CardTitle className="font-bold">Học vấn & Chứng chỉ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTutor.education && selectedTutor.education.length > 0 && (
                        <>
                          <div>
                            <h4 className="font-bold mb-3">Học vấn</h4>
                            <div className="space-y-3">
                              {selectedTutor.education.map((edu: any) => (
                                <div key={edu.id} className="flex items-start gap-2">
                                  <GraduationCap className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-700 truncate" title={edu.institutionName}>
                                      {edu.institutionName}
                                    </p>
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
                      {selectedTutor.certificates && selectedTutor.certificates.length > 0 && (
                        <div>
                          <h4 className="font-bold mb-3">Chứng chỉ</h4>
                          <div className="space-y-2">
                            {selectedTutor.certificates.map((cert: any) => (
                              <div key={cert.id} className="flex items-start justify-between">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <Medal className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                                  <div className="min-w-0 flex-1">
                                    <span className="text-gray-700 truncate block" title={cert.certificateName}>
                                      {cert.certificateName}
                                    </span>
                                    {cert.issueDate && (
                                      <p className="text-sm text-gray-500">
                                        {new Date(cert.issueDate).getFullYear()}
                                        {cert.expiryDate && (
                                          <span> - {new Date(cert.expiryDate).getFullYear()}</span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {cert.verified === 1 && (
                                  <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                                    Đã xác thực
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(!selectedTutor.education || selectedTutor.education.length === 0) && 
                       (!selectedTutor.certificates || selectedTutor.certificates.length === 0) && (
                        <p className="text-gray-500 text-center py-4">Chưa có thông tin học vấn và chứng chỉ</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
                </div>

                {/* Right Column - Sidebar (1/3) */}
                <div className="lg:col-span-1">
                  <div className="sticky top-20 space-y-6">
                    {/* Quick Info Card */}
                    <Card className="border-[#FD8B51]">
                      <CardHeader>
                        <CardTitle className="text-base font-bold">Thông tin nhanh</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Môn học:</span>
                            <span className="font-medium">{selectedTutor.subjects.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Chứng chỉ:</span>
                            <span className="font-medium">{selectedTutor.certificates.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hình thức:</span>
                            <span className="font-medium truncate" title={getTeachingModeText(selectedTutor.tutorProfile.teachingModes)}>
                              {getTeachingModeText(selectedTutor.tutorProfile.teachingModes)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tham gia:</span>
                            <span className="font-medium">{new Date(selectedTutor.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Đánh giá:</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{selectedTutor.tutorProfile.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card className="border-[#257180]/20 shadow-lg">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setShowDetailDialog(false)}
                          >
                            Đóng
                          </Button>
                          <Button
                            variant={selectedTutor.isActive ? 'destructive' : 'default'}
                            size="lg"
                            className={`w-full ${!selectedTutor.isActive ? 'bg-[#257180] hover:bg-[#257180]/90 text-white' : ''}`}
                            disabled={isActivating === selectedTutor.email || isDeactivating === selectedTutor.email}
                            onClick={() => {
                              handleToggleStatus(selectedTutor);
                              setShowDetailDialog(false);
                            }}
                          >
                            {(isActivating === selectedTutor.email || isDeactivating === selectedTutor.email) ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : selectedTutor.isActive ? (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Vô hiệu hóa tài khoản
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Kích hoạt tài khoản
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
