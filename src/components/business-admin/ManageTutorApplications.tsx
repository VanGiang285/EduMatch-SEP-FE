'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/basic/badge';
import { Textarea } from '@/components/ui/form/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/feedback/alert-dialog';
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
import { Label } from '@/components/ui/form/label';
import { Search, Eye, CheckCircle, XCircle, FileText, ExternalLink, Calendar, ArrowUpDown } from 'lucide-react';
import { 
  mockTutorApplications,
  formatCurrency,
  getVerifyStatusText,
  getVerifyStatusColor,
  getTeachingModeText,
} from '@/data/mockBusinessAdminData';
// Toast: import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'userName' | 'email' | 'appliedAt';
type SortOrder = 'asc' | 'desc';

export function ManageTutorApplications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [applications, setApplications] = useState(mockTutorApplications);
  const [sortField, setSortField] = useState<SortField>('appliedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Reject dialogs
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRejectCertDialog, setShowRejectCertDialog] = useState(false);
  const [showRejectEduDialog, setShowRejectEduDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [selectedEduId, setSelectedEduId] = useState<number | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter((app) => {
      const matchesSearch = app.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && app.tutorProfile.status === 0; // Only pending
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
        case 'appliedAt':
          aValue = new Date(a.appliedAt).getTime();
          bValue = new Date(b.appliedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applications, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetail = (application: any) => {
    setSelectedApplication(application);
    setShowDetailDialog(true);
  };

  // Approve/Reject Application
  const handleApproveApplication = (appId: number) => {
    setApplications(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, tutorProfile: { ...app.tutorProfile, status: 1 } } 
        : app
    ));
    console.log('Success: Đã duyệt đơn đăng ký thành công!');
    setShowDetailDialog(false);
  };

  const handleRejectApplication = () => {
    if (!rejectReason.trim()) {
      console.log('Error: Vui lòng nhập lý do từ chối');
      return;
    }
    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id 
        ? { ...app, tutorProfile: { ...app.tutorProfile, status: 2 } } 
        : app
    ));
    console.log('Success: Đã từ chối đơn đăng ký');
    setShowRejectDialog(false);
    setShowDetailDialog(false);
    setRejectReason('');
  };

  // Approve/Reject Certificate
  const handleApproveCertificate = (certId: number) => {
    setSelectedApplication((prev: any) => ({
      ...prev,
      certificates: prev.certificates.map((cert: any) =>
        cert.id === certId ? { ...cert, verified: 1 } : cert
      )
    }));
    console.log('Success: Đã xác minh chứng chỉ');
  };

  const handleRejectCertificate = () => {
    if (!rejectReason.trim()) {
      console.log('Error: Vui lòng nhập lý do từ chối');
      return;
    }
    setSelectedApplication((prev: any) => ({
      ...prev,
      certificates: prev.certificates.map((cert: any) =>
        cert.id === selectedCertId ? { ...cert, verified: 2, rejectReason } : cert
      )
    }));
    console.log('Success: Đã từ chối chứng chỉ');
    setShowRejectCertDialog(false);
    setSelectedCertId(null);
    setRejectReason('');
  };

  // Approve/Reject Education
  const handleApproveEducation = (eduId: number) => {
    setSelectedApplication((prev: any) => ({
      ...prev,
      education: prev.education.map((edu: any) =>
        edu.id === eduId ? { ...edu, verified: 1 } : edu
      )
    }));
    console.log('Success: Đã xác minh bằng cấp');
  };

  const handleRejectEducation = () => {
    if (!rejectReason.trim()) {
      console.log('Error: Vui lòng nhập lý do từ chối');
      return;
    }
    setSelectedApplication((prev: any) => ({
      ...prev,
      education: prev.education.map((edu: any) =>
        edu.id === selectedEduId ? { ...edu, verified: 2, rejectReason } : edu
      )
    }));
    console.log('Success: Đã từ chối bằng cấp');
    setShowRejectEduDialog(false);
    setSelectedEduId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Đơn đăng ký Gia sư</h1>
        <p className="text-gray-600 mt-1">Duyệt đơn đăng ký trở thành gia sư</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách đơn đăng ký</CardTitle>
            <Badge variant="outline">{filteredApplications.length} đơn chờ duyệt</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[80px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="h-8 px-2">
                      ID <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('userName')} className="h-8 px-2">
                      Người đăng ký <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('email')} className="h-8 px-2">
                      Email <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Hình thức dạy</TableHead>
                  <TableHead>Số môn</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('appliedAt')} className="h-8 px-2">
                      Ngày đăng ký <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Không có đơn đăng ký nào đang chờ duyệt
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{app.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={app.avatarUrl} alt={app.userName} />
                            <AvatarFallback className="bg-[#257180] text-white">
                              {app.userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{app.userName}</p>
                            <p className="text-xs text-gray-500">{app.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{app.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTeachingModeText(app.tutorProfile.teachingModes)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{app.subjects.length} môn</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(app)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết đơn đăng ký gia sư</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedApplication.avatarUrl} alt={selectedApplication.userName} />
                  <AvatarFallback className="bg-[#257180] text-white text-2xl">
                    {selectedApplication.userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedApplication.userName}</h3>
                  <p className="text-gray-600">{selectedApplication.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Đăng ký ngày {new Date(selectedApplication.appliedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày sinh</p>
                  <p className="font-medium">
                    {new Date(selectedApplication.profile.dob).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giới tính</p>
                  <p className="font-medium">
                    {selectedApplication.profile.gender === 1 ? 'Nam' : 'Nữ'}
                  </p>
                </div>
                    <div>
                      <p className="text-sm text-gray-600">Hình thức dạy</p>
                      <Badge variant="outline">
                        {getTeachingModeText(selectedApplication.tutorProfile.teachingModes)}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                      <p className="font-medium">
                        {selectedApplication.profile.addressLine}, {selectedApplication.profile.subDistrictName}, {selectedApplication.profile.cityName}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Giới thiệu bản thân</p>
                    <p className="text-gray-900">{selectedApplication.tutorProfile.bio}</p>
                  </div>

                  {/* Subjects */}
                  <div>
                    <h4 className="font-semibold mb-3">Môn học đăng ký</h4>
                    <div className="space-y-3">
                      {selectedApplication.subjects.map((subject: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{subject.name}</p>
                            <p className="text-sm text-gray-600">{subject.level}</p>
                          </div>
                          <p className="font-semibold text-[#257180]">
                            {formatCurrency(subject.hourlyRate)}/giờ
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h4 className="font-semibold mb-3">Bằng cấp & Học vấn</h4>
                    <div className="space-y-3">
                      {selectedApplication.education.map((edu: any) => (
                        <div key={edu.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{edu.institutionName}</p>
                              <p className="text-sm text-gray-600">
                                {edu.issueDate ? `Tốt nghiệp: ${new Date(edu.issueDate).toLocaleDateString('vi-VN')}` : 'Đang học'}
                              </p>
                            </div>
                            <Badge className={getVerifyStatusColor(edu.verified)}>
                              {getVerifyStatusText(edu.verified)}
                            </Badge>
                          </div>
                          {edu.certificateUrl && (
                            <a href={edu.certificateUrl} target="_blank" rel="noopener noreferrer" 
                               className="text-sm text-[#257180] hover:underline flex items-center gap-1 mt-2">
                              <FileText className="h-4 w-4" />
                              Xem bằng cấp
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {edu.verified === 2 && edu.rejectReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                              <p className="font-medium">Lý do từ chối:</p>
                              <p>{edu.rejectReason}</p>
                            </div>
                          )}
                          {edu.verified === 0 && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApproveEducation(edu.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedEduId(edu.id);
                                  setShowRejectEduDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certificates */}
                  <div>
                    <h4 className="font-semibold mb-3">Chứng chỉ</h4>
                    {selectedApplication.certificates.length === 0 ? (
                      <p className="text-sm text-gray-500">Chưa có chứng chỉ</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedApplication.certificates.map((cert: any) => (
                          <div key={cert.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{cert.typeName}</p>
                                <p className="text-sm text-gray-600">
                                  Cấp ngày: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <Badge className={getVerifyStatusColor(cert.verified)}>
                                {getVerifyStatusText(cert.verified)}
                              </Badge>
                            </div>
                            {cert.certificateUrl && (
                              <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" 
                                 className="text-sm text-[#257180] hover:underline flex items-center gap-1 mt-2">
                                <FileText className="h-4 w-4" />
                                Xem chứng chỉ
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {cert.verified === 2 && cert.rejectReason && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                                <p className="font-medium">Lý do từ chối:</p>
                                <p>{cert.rejectReason}</p>
                              </div>
                            )}
                            {cert.verified === 0 && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleApproveCertificate(cert.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Duyệt
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedCertId(cert.id);
                                    setShowRejectCertDialog(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Từ chối
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Schedule */}
                <div className="space-y-6">
                  {/* Lịch khả dụng */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-5 w-5" />
                        Lịch khả dụng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Thứ 2</span>
                          <span className="text-sm text-gray-600">18:00 - 21:00</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Thứ 4</span>
                          <span className="text-sm text-gray-600">18:00 - 21:00</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Thứ 6</span>
                          <span className="text-sm text-gray-600">18:00 - 21:00</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Thứ 7</span>
                          <span className="text-sm text-gray-600">14:00 - 17:00</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Chủ nhật</span>
                          <span className="text-sm text-gray-600">09:00 - 12:00</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Đóng
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối đơn
                </Button>
                <Button
                  className="bg-[#257180] hover:bg-[#1f5a66]"
                  onClick={() => handleApproveApplication(selectedApplication.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Duyệt đơn
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Application Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối đơn đăng ký</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối đơn đăng ký này
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Lý do từ chối</Label>
            <Textarea
              id="reject-reason"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectApplication} className="bg-red-600 hover:bg-red-700">
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Certificate Dialog */}
      <AlertDialog open={showRejectCertDialog} onOpenChange={setShowRejectCertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối chứng chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối chứng chỉ này
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-cert-reason">Lý do từ chối</Label>
            <Textarea
              id="reject-cert-reason"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectCertificate} className="bg-red-600 hover:bg-red-700">
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Education Dialog */}
      <AlertDialog open={showRejectEduDialog} onOpenChange={setShowRejectEduDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối bằng cấp</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối bằng cấp này
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-edu-reason">Lý do từ chối</Label>
            <Textarea
              id="reject-edu-reason"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectEducation} className="bg-red-600 hover:bg-red-700">
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
