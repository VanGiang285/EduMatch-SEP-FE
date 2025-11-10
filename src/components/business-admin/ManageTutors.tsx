'use client';
import React, { useState, useMemo } from 'react';
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
import { Separator } from '@/components/ui/layout/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Search, Eye, Ban, CheckCircle, Star, ArrowUpDown, Shield, MapPin, BookOpen, Globe, Users, CheckCircle2, Calendar, FileText, Award } from 'lucide-react';
import { 
  mockTutors, 
  formatCurrency,
  getTutorStatusText,
  getTutorStatusColor,
  getTeachingModeText,
} from '@/data/mockBusinessAdminData';
// Toast: import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'userName' | 'email' | 'rating' | 'totalStudents';
type SortOrder = 'asc' | 'desc';

export function ManageTutors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [tutors, setTutors] = useState(mockTutors);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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
    let filtered = tutors.filter((tutor) => {
      const matchesSearch = tutor.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tutor.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && tutor.isActive) ||
                           (statusFilter === 'inactive' && !tutor.isActive);
      
      return matchesSearch && matchesStatus;
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
  }, [tutors, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTutors = filteredTutors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetail = (tutor: any) => {
    setSelectedTutor(tutor);
    setShowDetailDialog(true);
  };

  const handleToggleStatus = (tutorId: number) => {
    setTutors(prev => prev.map(t => 
      t.id === tutorId ? { ...t, isActive: !t.isActive } : t
    ));
    const tutor = tutors.find(t => t.id === tutorId);
    console.log(tutor?.isActive 
      ? `Đã vô hiệu hóa tài khoản ${tutor.userName}` 
      : `Đã kích hoạt tài khoản ${tutor?.userName}`
    );
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[80px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="h-8 px-2">
                      ID <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('userName')} className="h-8 px-2">
                      Gia sư <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('email')} className="h-8 px-2">
                      Email <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Hình thức</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('rating')} className="h-8 px-2">
                      Đánh giá <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('totalStudents')} className="h-8 px-2">
                      Học viên <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Không tìm thấy gia sư nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTutors.map((tutor) => (
                    <TableRow key={tutor.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{tutor.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={tutor.avatarUrl} alt={tutor.userName} />
                            <AvatarFallback className="bg-[#257180] text-white">
                              {tutor.userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{tutor.userName}</p>
                            <p className="text-xs text-gray-500">
                              {tutor.subjects.length} môn học
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{tutor.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTeachingModeText(tutor.tutorProfile.teachingModes)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{tutor.tutorProfile.rating}</span>
                          <span className="text-xs text-gray-500">({tutor.tutorProfile.totalReviews})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tutor.tutorProfile.totalStudents} HV</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {tutor.subjects.length > 0 ? (
                          <div className="space-y-1">
                            {tutor.subjects.slice(0, 2).map((subject: any, idx: number) => (
                              <div key={idx}>{subject.name} {subject.level}</div>
                            ))}
                            {tutor.subjects.length > 2 && (
                              <span className="text-xs text-gray-500">+{tutor.subjects.length - 2} môn</span>
                            )}
                          </div>
                        ) : 'Chưa có'}
                      </TableCell>
                      <TableCell>
                        <Badge className={tutor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {tutor.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                            onClick={() => handleToggleStatus(tutor.id)}
                            className={tutor.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {tutor.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
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
        </CardContent>
      </Card>

      {/* Detail Dialog - Similar to TutorDetailProfile */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="!max-w-7xl sm:!max-w-7xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Hồ sơ gia sư</DialogTitle>
          </DialogHeader>
          
          {selectedTutor && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content (2/3) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Header */}
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-28 h-28 border-2 border-gray-100">
                      <AvatarImage src={selectedTutor.avatarUrl} alt={selectedTutor.userName} />
                      <AvatarFallback className="bg-[#257180] text-white text-2xl">
                        {selectedTutor.userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedTutor.tutorProfile.status === 1 && (
                      <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{selectedTutor.userName}</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg text-gray-900">{selectedTutor.tutorProfile.rating}</span>
                        <span className="text-sm text-gray-600">({selectedTutor.tutorProfile.totalReviews} đánh giá)</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{selectedTutor.tutorProfile.totalStudents} học viên</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTutor.tutorProfile.status === 1 && (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Đã xác thực
                        </Badge>
                      )}
                      <Badge className={selectedTutor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {selectedTutor.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </Badge>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedTutor.profile.subDistrictName}, {selectedTutor.profile.cityName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>{getTeachingModeText(selectedTutor.tutorProfile.teachingModes)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{selectedTutor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedTutor.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="about" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="about">Giới thiệu</TabsTrigger>
                    <TabsTrigger value="education">Học vấn & Chứng chỉ</TabsTrigger>
                  </TabsList>
                  
                  {/* About Tab */}
                  <TabsContent value="about" className="space-y-4">
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle className="text-gray-900">Về gia sư</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedTutor.tutorProfile.bio}</p>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-semibold mb-3">Hình thức dạy học</h4>
                          <Badge variant="secondary" className="text-sm px-3 py-1">
                            {getTeachingModeText(selectedTutor.tutorProfile.teachingModes)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Education Tab */}
                  <TabsContent value="education" className="space-y-4">
                    {selectedTutor.education && selectedTutor.education.length > 0 && (
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Bằng cấp & Học vấn
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedTutor.education.map((edu: any) => (
                              <div key={edu.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{edu.institutionName}</p>
                                    <p className="text-sm text-gray-600">
                                      {edu.issueDate ? `Tốt nghiệp: ${new Date(edu.issueDate).toLocaleDateString('vi-VN')}` : 'Đang học'}
                                    </p>
                                  </div>
                                  {edu.verified === 1 && (
                                    <Badge className="bg-green-100 text-green-800">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Đã xác minh
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedTutor.certificates && selectedTutor.certificates.length > 0 && (
                      <Card className="bg-white border-gray-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Chứng chỉ
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedTutor.certificates.map((cert: any) => (
                              <div key={cert.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{cert.certificateName}</p>
                                    <p className="text-sm text-gray-600">
                                      Cấp ngày: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                                    </p>
                                  </div>
                                  {cert.verified === 1 && (
                                    <Badge className="bg-green-100 text-green-800">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Đã xác minh
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - Sidebar (1/3) */}
              <div className="space-y-6">
                {/* Subjects Card */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Môn học giảng dạy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTutor.subjects.map((subject: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900">{subject.name}</p>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{subject.level}</p>
                          <p className="font-semibold text-[#257180]">
                            {formatCurrency(subject.hourlyRate)}/giờ
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Thống kê</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Đánh giá trung bình</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{selectedTutor.tutorProfile.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Tổng đánh giá</span>
                      <span className="font-semibold">{selectedTutor.tutorProfile.totalReviews}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Tổng học viên</span>
                      <span className="font-semibold">{selectedTutor.tutorProfile.totalStudents}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
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
                    onClick={() => {
                      handleToggleStatus(selectedTutor.id);
                      setShowDetailDialog(false);
                    }}
                  >
                    {selectedTutor.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
